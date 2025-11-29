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
      // Personal dashboard stats - optimized parallel queries
      const [myIssues, myProjects] = await Promise.all([
        db.issue.findMany({
          where: {
            assigneeId: user.id,
            deletedAt: null
          },
          select: {
            status: true,
            priority: true,
            dueDate: true,
            createdAt: true,
            updatedAt: true
          }
        }),
        db.project.findMany({
          where: {
            OR: [
              { ownerId: user.id },
              { team: { members: { some: { userId: user.id } } } }
            ],
            deletedAt: null
          },
          select: {
            id: true
          }
        })
      ]);

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

      // Recent activity (last 7 days) - only count needed
      const recentIssuesCount = await db.issue.count({
        where: {
          assigneeId: user.id,
          createdAt: { gte: last7Days },
          deletedAt: null
        }
      });

      // Daily trend for last 7 days - optimized with single aggregated query
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      
      // Get all issues created/updated in last 7 days in one query
      const recentIssues = await db.issue.findMany({
        where: {
          assigneeId: user.id,
          deletedAt: null,
          OR: [
            { createdAt: { gte: startDate } },
            { updatedAt: { gte: startDate }, status: 'Done' }
          ]
        },
        select: {
          createdAt: true,
          updatedAt: true,
          status: true
        }
      });

      // Group by day
      const dailyTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const created = recentIssues.filter(i => 
          i.createdAt >= startOfDay && i.createdAt <= endOfDay
        ).length;
        
        const completed = recentIssues.filter(i => 
          i.status === 'Done' && i.updatedAt >= startOfDay && i.updatedAt <= endOfDay
        ).length;
        
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
        recentIssues: recentIssuesCount,
        dailyTrend,
        overdueIssues: myIssues.filter(i => i.dueDate && new Date(i.dueDate) < now && i.status !== 'Done').length
      });
    } else {
      // Team dashboard stats - optimized parallel queries
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

      const teamProjectIds = userTeams.length > 0 
        ? (await db.project.findMany({
            where: {
              teamId: { in: userTeams.map(t => t.id) },
              deletedAt: null
            },
            select: { id: true }
          })).map(p => p.id)
        : [];

      const teamIssues = teamProjectIds.length > 0
        ? await db.issue.findMany({
            where: {
              projectId: { in: teamProjectIds },
              deletedAt: null
            },
            select: {
              status: true,
              priority: true,
              dueDate: true,
              createdAt: true,
              updatedAt: true
            }
          })
        : [];

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

      // Daily trend for last 7 days - optimized with single aggregated query
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      
      // Get all team issues created/updated in last 7 days in one query
      const recentTeamIssues = teamProjectIds.length > 0
        ? await db.issue.findMany({
            where: {
              projectId: { in: teamProjectIds },
              deletedAt: null,
              OR: [
                { createdAt: { gte: startDate } },
                { updatedAt: { gte: startDate }, status: 'Done' }
              ]
            },
            select: {
              createdAt: true,
              updatedAt: true,
              status: true
            }
          })
        : [];

      // Group by day
      const dailyTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const created = recentTeamIssues.filter(i => 
          i.createdAt >= startOfDay && i.createdAt <= endOfDay
        ).length;
        
        const completed = recentTeamIssues.filter(i => 
          i.status === 'Done' && i.updatedAt >= startOfDay && i.updatedAt <= endOfDay
        ).length;
        
        dailyTrend.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          created,
          completed
        });
      }

      const teamProjects = await db.project.findMany({
        where: {
          teamId: { in: userTeams.map(t => t.id) },
          deletedAt: null
        },
        select: { id: true }
      });

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
    
    // Handle authentication errors
    if (error.message?.includes('token') || error.message?.includes('No token') || error.message?.includes('Invalid token')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Handle database errors
    if (error.code === 'P2002' || error.code?.startsWith('P')) {
      return res.status(400).json({ error: 'Database error occurred' });
    }
    
    // Handle timeout or connection errors
    if (error.message?.includes('timeout') || error.message?.includes('connection')) {
      return res.status(503).json({ error: 'Service temporarily unavailable. Please try again.' });
    }
    
    res.status(500).json({ error: error.message || 'Failed to load dashboard stats' });
  }
}

