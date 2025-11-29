// pages/api/issues/index.js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';
import { checkProjectAccess } from '../../../lib/permissions';
import { issueSchema } from '../../../lib/validations';
import { sendIssueNotification } from '../../../lib/email';

export default async function handler(req, res) {
  try {
    const user = await authenticate(req);
    const { projectId } = req.query;

    if (req.method === 'GET') {
      const where = {
        deletedAt: null
      };

      if (projectId) {
        await checkProjectAccess(user.id, projectId);
        where.projectId = projectId;
      } else {
        // Get issues from projects user has access to
        const projects = await db.project.findMany({
          where: {
            deletedAt: null,
            OR: [
              { ownerId: user.id },
              { team: { members: { some: { userId: user.id } } } }
            ]
          },
          select: { id: true }
        });
        where.projectId = { in: projects.map(p => p.id) };
      }

      const issues = await db.issue.findMany({
        where,
        include: {
          creator: {
            select: { id: true, name: true, avatar: true }
          },
          assignee: {
            select: { id: true, name: true, avatar: true }
          },
          project: {
            select: { id: true, name: true }
          },
          labelIssues: {
            include: {
              label: true
            }
          },
          _count: {
            select: { comments: true, subtasks: true }
          }
        },
        orderBy: [
          { position: 'asc' },
          { createdAt: 'desc' }
        ]
      });

      res.status(200).json(issues);
    }
    else if (req.method === 'POST') {
      const validatedData = issueSchema.parse(req.body);
      const { title, description, status, priority, assigneeId, dueDate, projectId: issueProjectId, labelIds } = validatedData;

      await checkProjectAccess(user.id, issueProjectId);

      const maxPosition = await db.issue.findFirst({
        where: { projectId: issueProjectId, status: status || 'Backlog' },
        orderBy: { position: 'desc' },
        select: { position: true }
      });

      const issue = await db.$transaction(async (tx) => {
        const newIssue = await tx.issue.create({
          data: {
            title,
            description,
            status: status || 'Backlog',
            priority: priority || 'MEDIUM',
            assigneeId: assigneeId || null,
            dueDate: dueDate ? new Date(dueDate) : null,
            projectId: issueProjectId,
            creatorId: user.id,
            position: (maxPosition?.position || 0) + 1
          },
          include: {
            creator: {
              select: { id: true, name: true, avatar: true }
            },
            assignee: {
              select: { id: true, name: true, avatar: true }
            },
            project: {
              select: { id: true, name: true }
            },
            labelIssues: {
              include: {
                label: true
              }
            }
          }
        });

        // Add labels
        if (labelIds && labelIds.length > 0) {
          await tx.labelIssue.createMany({
            data: labelIds.map(labelId => ({
              issueId: newIssue.id,
              labelId
            }))
          });
        }

        // Create notification if assigned
        if (assigneeId && assigneeId !== user.id) {
          const assignee = await tx.user.findUnique({
            where: { id: assigneeId }
          });

          if (assignee) {
            await tx.notification.create({
              data: {
                userId: assigneeId,
                type: 'issue_assigned',
                title: 'New issue assigned',
                message: `${user.name} assigned "${title}" to you`,
                entityId: newIssue.id,
                entityType: 'issue'
              }
            });

            // Send email notification
            sendIssueNotification(assignee.email, title, `${process.env.NEXTAUTH_URL}/issues/${newIssue.id}`);
          }
        }

        return newIssue;
      });

      res.status(201).json(issue);
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

