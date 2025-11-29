// pages/api/issues/index.js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';
import { checkProjectAccess } from '../../../lib/permissions';
import { issueSchema } from '../../../lib/validations';
import { sendIssueAssignedEmail } from '../../../lib/email';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    const user = await authenticate(req, authOptions, res);
    const { projectId } = req.query;

    if (req.method === 'GET') {
      const where = {
        deletedAt: null
      };

      if (projectId) {
        await checkProjectAccess(user.id, projectId);
        where.projectId = projectId;
      } else {
        // Optimize: Use subquery instead of separate query
        where.project = {
          deletedAt: null,
          OR: [
            { ownerId: user.id },
            { team: { members: { some: { userId: user.id } } } }
          ]
        };
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

      // Set cache headers to prevent 304 caching issues
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Last-Modified', new Date().toUTCString());
      res.setHeader('ETag', `"${Date.now()}"`);

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
            await sendIssueAssignedEmail(
              assignee.email, 
              title, 
              `${process.env.NEXTAUTH_URL}/issues/${newIssue.id}`,
              user.name
            );
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
    console.error('Issues API error:', error);
    
    // Handle authentication errors
    if (error.message?.includes('token') || error.message?.includes('No token') || error.message?.includes('Invalid token')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    
    // Handle permission errors
    if (error.message?.includes('permission') || error.message?.includes('access')) {
      return res.status(403).json({ error: error.message || 'Access denied' });
    }
    
    // Handle database errors
    if (error.code === 'P2002' || error.code?.startsWith('P')) {
      return res.status(400).json({ error: 'Database constraint violation' });
    }
    
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

