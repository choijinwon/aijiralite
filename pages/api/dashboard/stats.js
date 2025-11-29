// pages/api/dashboard/stats.js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authenticate(req, authOptions);
    const { type = 'personal' } = req.query; // 'personal' or 'team'

    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (type === 'personal') {
      // Personal dashboard stats
      const myIssues = await db.issue.findMany({
        where: {
          assigneeId: user.id,
          deletedAt: null
        }
      });

      const myProjects = await db.project.findMany({
        where: {
          OR: [
            { ownerId: user.id },
            { team: { members: { some: { userId: user.id } } } }
          ],
          deletedAt: null
        }
      });

      // Status breakdown
      const statusCounts = {
        'Backlog': 0,
        'In Progress': 0,
        'Done': 0
      };
      myIssues.forEach(issue => {
        statusCounts[issue.status] = (statusCounts[issue.status] || 0) + 1;
      });

      // Priority breakdown
      const priorityCounts = {
        'HIGH': 0,
        'MEDIUM': 0,
        'LOW': 0
      };
      myIssues.forEach(issue => {
        priorityCounts[issue.priority] = (priorityCounts[issue.priority] || 0) + 1;
      });

      // Recent activity (last 7 days)
      const recentIssues = await db.issue.findMany({
        where: {
          assigneeId: user.id,
          createdAt: { gte: last7Days },
          deletedAt: null
        },
        orderBy: { createdAt: 'desc' }
      });

      // Daily trend for last 7 days
      const dailyTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const created = await db.issue.count({
          where: {
            assigneeId: user.id,
            createdAt: {
              gte: startOfDay,
              lt: endOfDay
            },
            deletedAt: null
          }
        });

        const completed = await db.issue.count({
          where: {
            assigneeId: user.id,
            status: 'Done',
            updatedAt: {
              gte: startOfDay,
              lt: endOfDay
            },
            deletedAt: null
          }
        });

        dailyTrend.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          created,
          completed
        });
      }

      res.status(200).json({
        totalIssues: myIssues.length,
        totalProjects: myProjects.length,
        statusCounts,
        priorityCounts,
        recentIssues: recentIssues.length,
        dailyTrend,
        overdueIssues: myIssues.filter(i => i.dueDate && new Date(i.dueDate) < now && i.status !== 'Done').length
      });
    } else {
      // Team dashboard stats
      const userTeams = await db.team.findMany({
        where: {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } }
          ],
          deletedAt: null
        },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });

      const teamProjects = await db.project.findMany({
        where: {
          teamId: { in: userTeams.map(t => t.id) },
          deletedAt: null
        }
      });

      const teamIssues = await db.issue.findMany({
        where: {
          projectId: { in: teamProjects.map(p => p.id) },
          deletedAt: null
        }
      });

      // Status breakdown
      const statusCounts = {
        'Backlog': 0,
        'In Progress': 0,
        'Done': 0
      };
      teamIssues.forEach(issue => {
        statusCounts[issue.status] = (statusCounts[issue.status] || 0) + 1;
      });

      // Priority breakdown
      const priorityCounts = {
        'HIGH': 0,
        'MEDIUM': 0,
        'LOW': 0
      };
      teamIssues.forEach(issue => {
        priorityCounts[issue.priority] = (priorityCounts[issue.priority] || 0) + 1;
      });

      // Daily trend for last 7 days
      const dailyTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const created = await db.issue.count({
          where: {
            projectId: { in: teamProjects.map(p => p.id) },
            createdAt: {
              gte: startOfDay,
              lt: endOfDay
            },
            deletedAt: null
          }
        });

        const completed = await db.issue.count({
          where: {
            projectId: { in: teamProjects.map(p => p.id) },
            status: 'Done',
            updatedAt: {
              gte: startOfDay,
              lt: endOfDay
            },
            deletedAt: null
          }
        });

        dailyTrend.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          created,
          completed
        });
      }

      res.status(200).json({
        totalTeams: userTeams.length,
        totalProjects: teamProjects.length,
        totalIssues: teamIssues.length,
        totalMembers: userTeams.reduce((sum, team) => sum + team.members.length, 0),
        statusCounts,
        priorityCounts,
        dailyTrend,
        overdueIssues: teamIssues.filter(i => i.dueDate && new Date(i.dueDate) < now && i.status !== 'Done').length
      });
    }
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: error.message || 'Failed to load dashboard stats' });
  }
}

