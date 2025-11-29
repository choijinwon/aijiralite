// lib/email.js
import nodemailer from 'nodemailer';

// SMTP 설정이 없으면 이메일 전송을 건너뜀
const isEmailConfigured = () => {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
};

const transporter = isEmailConfigured() ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}) : null;

export async function sendEmail(to, subject, html) {
  if (!isEmailConfigured()) {
    console.log('Email not configured, skipping email send');
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"Jira Lite" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

// 공통 이메일 템플릿
function getEmailTemplate(title, content, actionText, actionUrl) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 2px solid #3B82F6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #3B82F6;
      margin: 0;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #3B82F6;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      margin-top: 10px;
    }
    .button:hover {
      background-color: #2563EB;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">Jira Lite</h1>
    </div>
    <div class="content">
      <h2 style="color: #1f2937; margin-top: 0;">${title}</h2>
      ${content}
      ${actionUrl ? `<p><a href="${actionUrl}" class="button">${actionText}</a></p>` : ''}
    </div>
    <div class="footer">
      <p>이 이메일은 Jira Lite에서 자동으로 발송되었습니다.</p>
      <p>알림 설정을 변경하려면 <a href="${baseUrl}/profile">프로필 설정</a>을 확인하세요.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendTeamInvite(email, teamName, inviteLink) {
  const html = getEmailTemplate(
    `팀 초대: ${teamName}`,
    `
      <p>${teamName} 팀에 초대되었습니다.</p>
      <p>아래 링크를 클릭하여 초대를 수락하세요.</p>
      <p><strong>이 링크는 7일 후에 만료됩니다.</strong></p>
    `,
    '초대 수락하기',
    inviteLink
  );
  return sendEmail(email, `[Jira Lite] ${teamName} 팀 초대`, html);
}

export async function sendIssueAssignedEmail(email, issueTitle, issueLink, assignerName) {
  const html = getEmailTemplate(
    '이슈 담당자로 지정되었습니다',
    `
      <p><strong>${assignerName}</strong>님이 다음 이슈의 담당자로 지정했습니다:</p>
      <p style="font-size: 18px; font-weight: 600; color: #3B82F6;">${issueTitle}</p>
      <p>이슈를 확인하고 작업을 시작하세요.</p>
    `,
    '이슈 보기',
    issueLink
  );
  return sendEmail(email, `[Jira Lite] 이슈 담당자 지정: ${issueTitle}`, html);
}

export async function sendCommentAddedEmail(email, issueTitle, issueLink, commentAuthorName) {
  const html = getEmailTemplate(
    '새 댓글이 작성되었습니다',
    `
      <p><strong>${commentAuthorName}</strong>님이 다음 이슈에 댓글을 작성했습니다:</p>
      <p style="font-size: 18px; font-weight: 600; color: #3B82F6;">${issueTitle}</p>
      <p>댓글을 확인하고 답변하세요.</p>
    `,
    '댓글 보기',
    issueLink
  );
  return sendEmail(email, `[Jira Lite] 새 댓글: ${issueTitle}`, html);
}

export async function sendDueDateSoonEmail(email, issueTitle, issueLink, dueDate) {
  const formattedDate = new Date(dueDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const html = getEmailTemplate(
    '마감일이 임박했습니다',
    `
      <p>다음 이슈의 마감일이 <strong>내일(${formattedDate})</strong>입니다:</p>
      <p style="font-size: 18px; font-weight: 600; color: #F59E0B;">${issueTitle}</p>
      <p>마감일 전에 작업을 완료하세요.</p>
    `,
    '이슈 보기',
    issueLink
  );
  return sendEmail(email, `[Jira Lite] 마감일 임박: ${issueTitle}`, html);
}

export async function sendDueDateTodayEmail(email, issueTitle, issueLink) {
  const html = getEmailTemplate(
    '오늘 마감일입니다',
    `
      <p>다음 이슈의 마감일이 <strong style="color: #EF4444;">오늘</strong>입니다:</p>
      <p style="font-size: 18px; font-weight: 600; color: #EF4444;">${issueTitle}</p>
      <p>즉시 확인하고 작업을 완료하세요.</p>
    `,
    '이슈 보기',
    issueLink
  );
  return sendEmail(email, `[Jira Lite] 오늘 마감일: ${issueTitle}`, html);
}

export async function sendRoleChangedEmail(email, teamName, newRole, changerName) {
  const roleNames = {
    'OWNER': '소유자',
    'ADMIN': '관리자',
    'MEMBER': '멤버'
  };
  
  const html = getEmailTemplate(
    '역할이 변경되었습니다',
    `
      <p><strong>${changerName}</strong>님이 <strong>${teamName}</strong> 팀에서 귀하의 역할을 변경했습니다.</p>
      <p style="font-size: 18px; font-weight: 600; color: #3B82F6;">새 역할: ${roleNames[newRole] || newRole}</p>
      <p>팀 페이지에서 변경 사항을 확인하세요.</p>
    `,
    '팀 보기',
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/teams`
  );
  return sendEmail(email, `[Jira Lite] 역할 변경: ${teamName}`, html);
}
