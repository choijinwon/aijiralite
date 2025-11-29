// pages/api/issues/[id].js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';
import { checkProjectAccess } from '../../../lib/permissions';
import { notifyIssueAssigned } from '../../../lib/notifications';

export default async function handler(req, res) {
  try {
    const user = await authenticate(req);
    const { id } = req.query;

    if (req.method === 'GET') {
      const issue = await db.issue.findUnique({
        where: { id, deletedAt: null },
        include: {
          creator: { select: { id: true, name: true, avatar: true } },
          assignee: { select: { id: true, name: true, avatar: true } },
          project: { select: { id: true, name: true, teamId: true } },
          comments: {
            where: { deletedAt: null },
            include: {
              author: { select: { id: true, name: true, avatar: true } }
            },
            orderBy: { createdAt: 'asc' }
          },
          subtasks: {
            orderBy: { position: 'asc' }
          },
          labelIssues: {
            include: {
              label: true
            }
          },
          history: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          aiCache: true
        }
      });

      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      await checkProjectAccess(user.id, issue.projectId);

      res.status(200).json(issue);
    }
    else if (req.method === 'PUT') {
      const { title, description, status, priority, assigneeId, dueDate, labelIds } = req.body;

      const issue = await db.issue.findUnique({
        where: { id, deletedAt: null },
        include: { project: true }
      });

      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      await checkProjectAccess(user.id, issue.projectId);

      // Track changes for history
      const changes = [];
      if (status !== undefined && status !== issue.status) {
        changes.push({ field: 'status', oldValue: issue.status, newValue: status });
      }
      if (priority !== undefined && priority !== issue.priority) {
        changes.push({ field: 'priority', oldValue: issue.priority, newValue: priority });
      }
      if (assigneeId !== undefined && assigneeId !== issue.assigneeId) {
        changes.push({ field: 'assigneeId', oldValue: issue.assigneeId, newValue: assigneeId });
      }

      const updatedIssue = await db.$transaction(async (tx) => {
        // Update issue
        const updated = await tx.issue.update({
          where: { id },
          data: {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(status !== undefined && { status: status || 'Backlog' }),
            ...(priority !== undefined && { priority }),
            ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
            ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
          },
          include: {
            creator: { select: { id: true, name: true, avatar: true } },
            assignee: { select: { id: true, name: true, avatar: true } },
            project: { select: { id: true, name: true } },
            labelIssues: {
              include: {
                label: true
              }
            }
          }
        });

        // Update labels
        if (labelIds !== undefined) {
          await tx.labelIssue.deleteMany({ where: { issueId: id } });
          if (labelIds.length > 0) {
            await tx.labelIssue.createMany({
              data: labelIds.map(labelId => ({ issueId: id, labelId }))
            });
          }
        }

        // Record history
        if (changes.length > 0) {
          await tx.issueHistory.createMany({
            data: changes.map(change => ({
              issueId: id,
              field: change.field,
              oldValue: change.oldValue?.toString() || null,
              newValue: change.newValue?.toString() || null,
              changedBy: user.id
            }))
          });
        }

        // Invalidate AI cache if description changed
        if (description !== undefined && description !== issue.description) {
          await tx.issueAICache.updateMany({
            where: { issueId: id },
            data: { 
              summary: null,
              suggestions: null,
              lastDescriptionHash: null
            }
          });
        }

        // Create notification if assignee changed
        if (assigneeId !== undefined && assigneeId && assigneeId !== issue.assigneeId) {
          await notifyIssueAssigned(id, assigneeId, user.name, updated.title || issue.title);
        }

        return updated;
      });

      res.status(200).json(updatedIssue);
    }
    else if (req.method === 'DELETE') {
      const issue = await db.issue.findUnique({
        where: { id, deletedAt: null },
        include: { project: true }
      });

      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      await checkProjectAccess(user.id, issue.projectId);

      // Check if user has permission to delete
      const canDelete = issue.creatorId === user.id || 
        issue.project.ownerId === user.id || 
        await db.teamMember.findFirst({
          where: { 
            userId: user.id, 
            teamId: issue.project.teamId,
            role: { in: ['OWNER', 'ADMIN'] }
          }
        });

      if (!canDelete) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      await db.issue.update({
        where: { id },
        data: { deletedAt: new Date() }
      });

      res.status(200).json({ message: 'Issue deleted successfully' });
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

