// lib/notifications.js
import { db } from './db';
import {
  sendIssueAssignedEmail,
  sendCommentAddedEmail,
  sendDueDateSoonEmail,
  sendDueDateTodayEmail,
  sendRoleChangedEmail
} from './email';

export const NOTIFICATION_TYPES = {
  ISSUE_ASSIGNED: 'issue_assigned',
  COMMENT_ADDED: 'comment_added',
  DUE_DATE_SOON: 'due_date_soon',
  DUE_DATE_TODAY: 'due_date_today',
  TEAM_INVITED: 'team_invited',
  ROLE_CHANGED: 'role_changed'
};

/**
 * 알림 생성
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  entityId,
  entityType
}) {
  try {
    const notification = await db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        entityId,
        entityType,
        isRead: false
      }
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

/**
 * 이슈 담당자 지정 알림
 */
export async function notifyIssueAssigned(issueId, assigneeId, assignerName, issueTitle) {
  if (!assigneeId) return;
  
  // 데이터베이스 알림 생성
  const notification = await createNotification({
    userId: assigneeId,
    type: NOTIFICATION_TYPES.ISSUE_ASSIGNED,
    title: '이슈 담당자로 지정되었습니다',
    message: `${assignerName}님이 "${issueTitle}" 이슈의 담당자로 지정했습니다.`,
    entityId: issueId,
    entityType: 'issue'
  });

  // 이메일 알림 전송
  try {
    const assignee = await db.user.findUnique({
      where: { id: assigneeId },
      select: { email: true }
    });
    
    if (assignee?.email) {
      const issueLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/issues/${issueId}`;
      await sendIssueAssignedEmail(assignee.email, issueTitle, issueLink, assignerName);
    }
  } catch (error) {
    console.error('Failed to send email notification for issue assignment:', error);
    // 이메일 전송 실패해도 앱 알림은 유지
  }

  return notification;
}

/**
 * 댓글 작성 알림
 */
export async function notifyCommentAdded(issueId, commentAuthorId, commentAuthorName, issueTitle, issueCreatorId, issueAssigneeId) {
  const recipients = new Set();
  
  // 이슈 소유자에게 알림
  if (issueCreatorId && issueCreatorId !== commentAuthorId) {
    recipients.add(issueCreatorId);
  }
  
  // 담당자에게 알림
  if (issueAssigneeId && issueAssigneeId !== commentAuthorId) {
    recipients.add(issueAssigneeId);
  }
  
  // 알림 생성 및 이메일 전송
  const notifications = [];
  const issueLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/issues/${issueId}`;
  
  for (const userId of recipients) {
    // 데이터베이스 알림 생성
    const notification = await createNotification({
      userId,
      type: NOTIFICATION_TYPES.COMMENT_ADDED,
      title: '새 댓글이 작성되었습니다',
      message: `${commentAuthorName}님이 "${issueTitle}" 이슈에 댓글을 작성했습니다.`,
      entityId: issueId,
      entityType: 'issue'
    });
    notifications.push(notification);

    // 이메일 알림 전송
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });
      
      if (user?.email) {
        await sendCommentAddedEmail(user.email, issueTitle, issueLink, commentAuthorName);
      }
    } catch (error) {
      console.error(`Failed to send email notification to user ${userId}:`, error);
      // 이메일 전송 실패해도 앱 알림은 유지
    }
  }
  
  return notifications;
}

/**
 * 마감일 임박 알림 (1일 전)
 */
export async function notifyDueDateSoon(issueId, assigneeId, issueTitle, dueDate) {
  if (!assigneeId) return;
  
  // 데이터베이스 알림 생성
  const notification = await createNotification({
    userId: assigneeId,
    type: NOTIFICATION_TYPES.DUE_DATE_SOON,
    title: '마감일이 임박했습니다',
    message: `"${issueTitle}" 이슈의 마감일이 내일입니다.`,
    entityId: issueId,
    entityType: 'issue'
  });

  // 이메일 알림 전송
  try {
    const assignee = await db.user.findUnique({
      where: { id: assigneeId },
      select: { email: true }
    });
    
    if (assignee?.email) {
      const issueLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/issues/${issueId}`;
      await sendDueDateSoonEmail(assignee.email, issueTitle, issueLink, dueDate);
    }
  } catch (error) {
    console.error('Failed to send email notification for due date soon:', error);
    // 이메일 전송 실패해도 앱 알림은 유지
  }

  return notification;
}

/**
 * 마감일 당일 알림
 */
export async function notifyDueDateToday(issueId, assigneeId, issueTitle) {
  if (!assigneeId) return;
  
  // 데이터베이스 알림 생성
  const notification = await createNotification({
    userId: assigneeId,
    type: NOTIFICATION_TYPES.DUE_DATE_TODAY,
    title: '오늘 마감일입니다',
    message: `"${issueTitle}" 이슈의 마감일이 오늘입니다.`,
    entityId: issueId,
    entityType: 'issue'
  });

  // 이메일 알림 전송
  try {
    const assignee = await db.user.findUnique({
      where: { id: assigneeId },
      select: { email: true }
    });
    
    if (assignee?.email) {
      const issueLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/issues/${issueId}`;
      await sendDueDateTodayEmail(assignee.email, issueTitle, issueLink);
    }
  } catch (error) {
    console.error('Failed to send email notification for due date today:', error);
    // 이메일 전송 실패해도 앱 알림은 유지
  }

  return notification;
}

/**
 * 팀 초대 알림
 */
export async function notifyTeamInvited(userId, teamName, inviterName) {
  return await createNotification({
    userId,
    type: NOTIFICATION_TYPES.TEAM_INVITED,
    title: '팀 초대가 도착했습니다',
    message: `${inviterName}님이 "${teamName}" 팀에 초대했습니다.`,
    entityId: null,
    entityType: 'team'
  });
}

/**
 * 멤버 역할 변경 알림
 */
export async function notifyRoleChanged(userId, teamName, newRole, changerName) {
  const roleNames = {
    'OWNER': '소유자',
    'ADMIN': '관리자',
    'MEMBER': '멤버'
  };
  
  // 데이터베이스 알림 생성
  const notification = await createNotification({
    userId,
    type: NOTIFICATION_TYPES.ROLE_CHANGED,
    title: '역할이 변경되었습니다',
    message: `${changerName}님이 "${teamName}" 팀에서 귀하의 역할을 ${roleNames[newRole] || newRole}로 변경했습니다.`,
    entityId: null,
    entityType: 'team'
  });

  // 이메일 알림 전송
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    
    if (user?.email) {
      await sendRoleChangedEmail(user.email, teamName, newRole, changerName);
    }
  } catch (error) {
    console.error('Failed to send email notification for role change:', error);
    // 이메일 전송 실패해도 앱 알림은 유지
  }

  return notification;
}

/**
 * 마감일 알림 체크 (스케줄러용)
 */
export async function checkDueDateNotifications() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  // 내일 마감인 이슈들
  const issuesDueTomorrow = await db.issue.findMany({
    where: {
      assigneeId: { not: null },
      dueDate: {
        gte: tomorrow,
        lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
      },
      deletedAt: null
    },
    include: {
      assignee: true
    }
  });
  
  // 오늘 마감인 이슈들
  const issuesDueToday = await db.issue.findMany({
    where: {
      assigneeId: { not: null },
      dueDate: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      deletedAt: null
    },
    include: {
      assignee: true
    }
  });
  
  const notifications = [];
  
  // 내일 마감 알림 생성
  for (const issue of issuesDueTomorrow) {
    // 이미 오늘 같은 알림이 있는지 확인
    const existing = await db.notification.findFirst({
      where: {
        userId: issue.assigneeId,
        type: NOTIFICATION_TYPES.DUE_DATE_SOON,
        entityId: issue.id,
        createdAt: {
          gte: today
        }
      }
    });
    
    if (!existing) {
      const notification = await notifyDueDateSoon(
        issue.id,
        issue.assigneeId,
        issue.title,
        issue.dueDate
      );
      if (notification) notifications.push(notification);
    }
  }
  
  // 오늘 마감 알림 생성
  for (const issue of issuesDueToday) {
    // 이미 오늘 같은 알림이 있는지 확인
    const existing = await db.notification.findFirst({
      where: {
        userId: issue.assigneeId,
        type: NOTIFICATION_TYPES.DUE_DATE_TODAY,
        entityId: issue.id,
        createdAt: {
          gte: today
        }
      }
    });
    
    if (!existing) {
      const notification = await notifyDueDateToday(
        issue.id,
        issue.assigneeId,
        issue.title
      );
      if (notification) notifications.push(notification);
    }
  }
  
  return notifications;
}

