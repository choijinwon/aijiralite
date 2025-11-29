// pages/api/issues/[id]/comments.js
import { db } from '../../../../lib/db';
import { authenticate } from '../../../../lib/auth';
import { checkProjectAccess } from '../../../../lib/permissions';
import { commentSchema } from '../../../../lib/validations';
import { notifyCommentAdded } from '../../../../lib/notifications';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    const user = await authenticate(req, authOptions, res);
    const { id } = req.query;

    const issue = await db.issue.findUnique({
      where: { id, deletedAt: null }
    });

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    await checkProjectAccess(user.id, issue.projectId);

    if (req.method === 'GET') {
      const comments = await db.comment.findMany({
        where: {
          issueId: id,
          deletedAt: null
        },
        include: {
          author: {
            select: { id: true, name: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      res.status(200).json(comments);
    }
    else if (req.method === 'POST') {
      const validatedData = commentSchema.parse(req.body);
      const { content } = validatedData;

      const comment = await db.$transaction(async (tx) => {
        const newComment = await tx.comment.create({
          data: {
            content,
            issueId: id,
            authorId: user.id
          },
          include: {
            author: {
              select: { id: true, name: true, avatar: true }
            }
          }
        });

        // Create notification for issue creator and assignee
        await notifyCommentAdded(
          id,
          user.id,
          user.name,
          issue.title,
          issue.creatorId,
          issue.assigneeId
        );

        return newComment;
      });

      res.status(201).json(comment);
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

