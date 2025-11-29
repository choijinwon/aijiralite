// lib/email.js
import nodemailer from 'nodemailer';

// Resend API를 사용할 수 있는지 확인
const isResendConfigured = () => {
  return !!process.env.RESEND_API_KEY;
};

// Supabase Edge Function을 사용할 수 있는지 확인
const isSupabaseEmailConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && 
            process.env.SUPABASE_SERVICE_ROLE_KEY &&
            process.env.SUPABASE_EDGE_FUNCTION_URL);
};

// SMTP 설정이 없으면 이메일 전송을 건너뜀
const isEmailConfigured = () => {
  const hasHost = !!process.env.SMTP_HOST;
  const hasUser = !!process.env.SMTP_USER;
  const hasPass = !!process.env.SMTP_PASS;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 SMTP Configuration Check:', {
      SMTP_HOST: hasHost ? '✅' : '❌',
      SMTP_USER: hasUser ? '✅' : '❌',
      SMTP_PASS: hasPass ? '✅' : '❌',
      host: process.env.SMTP_HOST,
      user: process.env.SMTP_USER,
      port: process.env.SMTP_PORT,
      hasSupabaseEmail: isSupabaseEmailConfigured() ? '✅' : '❌'
    });
  }
  
  return !!(hasHost && hasUser && hasPass);
};

// SMTP transporter 생성
const createTransporter = () => {
  if (!isEmailConfigured()) return null;
  
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const isGmail = host?.includes('gmail.com');
  
  // Gmail의 경우 service 옵션 사용 (더 안정적)
  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  // 다른 SMTP 서버의 경우
  return nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465, // 465는 SSL, 587은 STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // 개발 환경에서 필요할 수 있음
    },
  });
};

const transporter = createTransporter();

// Resend API를 통한 이메일 발송 (추천: 무료 플랜에서 월 3,000건)
async function sendEmailViaResend(to, subject, html) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Jira Lite <onboarding@resend.dev>';
    
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY is not set');
      return false;
    }

    console.log('📧 Attempting to send email via Resend:', {
      to,
      from: fromEmail,
      subject,
      hasApiKey: !!apiKey
    });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html,
      }),
    });

    const responseData = await response.json().catch(() => ({}));

    if (response.ok) {
      console.log('✅ [EMAIL] ✅ Resend를 통한 이메일 발송 성공!', {
        emailId: responseData.id,
        to,
        subject,
        timestamp: new Date().toISOString()
      });
      return true;
    } else {
      console.error('❌ [EMAIL] ❌ Resend API 오류:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
        to,
        subject,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  } catch (error) {
    console.error('❌ Resend email send exception:', {
      message: error.message,
      stack: error.stack,
      to,
      subject
    });
    return false;
  }
}

// Supabase Edge Function을 통한 이메일 발송
async function sendEmailViaSupabase(to, subject, html) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const edgeFunctionUrl = process.env.SUPABASE_EDGE_FUNCTION_URL || 
      (supabaseUrl ? `${supabaseUrl}/functions/v1/send-email` : null);
    
    if (!supabaseUrl) {
      console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
      return false;
    }
    
    if (!serviceRoleKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
      console.error('   Supabase Edge Function을 사용하려면 SUPABASE_SERVICE_ROLE_KEY가 필요합니다.');
      return false;
    }
    
    if (!edgeFunctionUrl) {
      console.error('❌ Supabase Edge Function URL is not set');
      return false;
    }

    console.log('📧 Attempting to send email via Supabase Edge Function:', {
      to,
      from: process.env.SUPABASE_FROM_EMAIL || 'noreply@supabase.co',
      subject,
      edgeFunctionUrl,
      hasServiceRoleKey: !!serviceRoleKey
    });

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        from: process.env.SUPABASE_FROM_EMAIL || 'Jira Lite <noreply@supabase.co>',
      }),
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    if (response.ok) {
      console.log('✅ [EMAIL] ✅ Supabase Edge Function을 통한 이메일 발송 성공!', {
        to,
        subject,
        response: responseData,
        timestamp: new Date().toISOString()
      });
      return true;
    } else {
      console.error('❌ [EMAIL] ❌ Supabase Edge Function 오류:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
        responseText: responseText,
        to,
        subject,
        edgeFunctionUrl,
        timestamp: new Date().toISOString()
      });
      
      if (response.status === 404) {
        console.error('   Edge Function이 존재하지 않습니다. Supabase Dashboard에서 Edge Function을 생성하세요.');
      } else if (response.status === 401 || response.status === 403) {
        console.error('   인증 실패. SUPABASE_SERVICE_ROLE_KEY가 올바른지 확인하세요.');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ [EMAIL] ❌ Supabase 이메일 발송 예외 발생:', {
      message: error.message,
      stack: error.stack,
      to,
      subject,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

export async function sendEmail(to, subject, html) {
  console.log('📧 sendEmail called:', {
    to,
    subject,
    hasResend: isResendConfigured(),
    hasSupabase: isSupabaseEmailConfigured(),
    hasSMTP: isEmailConfigured(),
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌',
    edgeFunctionUrl: process.env.SUPABASE_EDGE_FUNCTION_URL || 'auto'
  });

  // 1. Supabase Edge Function 시도 (우선순위 1)
  if (isSupabaseEmailConfigured()) {
    try {
      console.log('📧 Trying Supabase Edge Function first...');
      const result = await sendEmailViaSupabase(to, subject, html);
      if (result) {
        return true;
      }
      console.warn('⚠️ Supabase email failed, falling back to Resend/SMTP');
    } catch (error) {
      console.warn('⚠️ Supabase email error, falling back to Resend/SMTP:', error.message);
      console.warn('   Error details:', {
        message: error.message,
        stack: error.stack?.substring(0, 200)
      });
    }
  } else {
    console.log('ℹ️ Supabase Edge Function not configured. Skipping...');
    console.log('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    console.log('   Optional: SUPABASE_EDGE_FUNCTION_URL (defaults to /functions/v1/send-email)');
  }

  // 2. Resend API 시도 (우선순위 2 - 가장 간단하고 안정적)
  if (isResendConfigured()) {
    try {
      const result = await sendEmailViaResend(to, subject, html);
      if (result) {
        return true;
      }
      console.warn('⚠️ Resend email failed, falling back to SMTP');
    } catch (error) {
      console.warn('⚠️ Resend email error, falling back to SMTP:', error.message);
    }
  }

  // 3. SMTP (Nodemailer) 시도 (우선순위 3)
  if (isEmailConfigured()) {
    try {
      console.log('📧 Attempting to send email via SMTP:', {
        to,
        from: process.env.SMTP_USER,
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || '587',
        hasTransporter: !!transporter
      });
      
      if (!transporter) {
        console.error('❌ SMTP transporter is null. Check SMTP configuration.');
        return false;
      }
      
      // Verify connection first (skip for faster sending, verify can be slow)
      // Uncomment if you want to verify connection before sending
      /*
      try {
        console.log('🔍 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection verified');
      } catch (verifyError) {
        console.error('❌ SMTP connection verification failed:', {
          message: verifyError.message,
          code: verifyError.code
        });
        // Continue anyway, sometimes verify fails but send works
      }
      */
      
      const mailOptions = {
        from: `"Jira Lite" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      };
      
      console.log('📧 Sending email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        hasHtml: !!mailOptions.html
      });
      
      const result = await transporter.sendMail(mailOptions);
      console.log('✅ [EMAIL] ✅ 이메일 발송 성공!', {
        messageId: result.messageId,
        response: result.response,
        accepted: result.accepted,
        rejected: result.rejected,
        to,
        subject,
        timestamp: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('❌ [EMAIL] ❌ 이메일 발송 실패:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        to,
        subject,
        host: process.env.SMTP_HOST,
        user: process.env.SMTP_USER,
        port: process.env.SMTP_PORT,
        timestamp: new Date().toISOString()
      });
      
      // Gmail 특정 에러 메시지
      if (error.code === 'EAUTH' || error.responseCode === 535) {
        console.error('🔐 Gmail 인증 실패. 다음을 확인하세요:');
        console.error('   1. Gmail 앱 비밀번호가 올바른지 확인 (공백 없이)');
        console.error('   2. Gmail 계정에서 2단계 인증이 활성화되어 있는지 확인');
        console.error('   3. 앱 비밀번호를 새로 생성했는지 확인');
        console.error('   4. .env.local 파일의 SMTP_PASS에 따옴표가 올바르게 있는지 확인');
      } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        console.error('🌐 Gmail 연결 실패. 다음을 확인하세요:');
        console.error('   1. 인터넷 연결 확인');
        console.error('   2. 방화벽이 SMTP 포트 587을 차단하지 않는지 확인');
        console.error('   3. SMTP_HOST가 올바른지 확인 (smtp.gmail.com)');
      } else if (error.code === 'EENVELOPE') {
        console.error('✉️ 이메일 주소 오류. 다음을 확인하세요:');
        console.error('   1. 받는 사람 이메일 주소가 올바른지 확인');
        console.error('   2. 보내는 사람 이메일 주소가 올바른지 확인');
      }
      
      return false;
    }
  }

  // 4. 모두 실패
  console.error('❌ Email not configured. Configure one of:');
  console.error('   1. Supabase Edge Function: SUPABASE_EDGE_FUNCTION_URL, SUPABASE_SERVICE_ROLE_KEY 설정');
  console.error('      - 현재 상태:', isSupabaseEmailConfigured() ? '✅ 설정됨' : '❌ 미설정');
  console.error('   2. Resend (추천): RESEND_API_KEY 환경변수 설정');
  console.error('      - 무료: https://resend.com (월 3,000건)');
  console.error('      - 현재 상태:', isResendConfigured() ? '✅ 설정됨' : '❌ 미설정');
  console.error('   3. SMTP: SMTP_HOST, SMTP_USER, SMTP_PASS 환경변수 설정');
  console.error('      - Gmail, Outlook 등 SMTP 서버 사용');
  console.error('      - 현재 상태:', isEmailConfigured() ? '✅ 설정됨' : '❌ 미설정');
  return false;
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
