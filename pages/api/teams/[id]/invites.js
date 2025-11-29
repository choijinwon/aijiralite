// pages/api/teams/[id]/invites.js
import { db } from '../../../../lib/db';
import { authenticate } from '../../../../lib/auth';
import { checkTeamRole } from '../../../../lib/permissions';
import { sendTeamInvite } from '../../../../lib/email';
import { notifyTeamInvited } from '../../../../lib/notifications';
import { authOptions } from '../../auth/[...nextauth]';
import crypto from 'crypto';

export default async function handler(req, res) {
  try {
    const user = await authenticate(req, authOptions);
    const { id } = req.query;

    if (req.method === 'GET') {
      await checkTeamRole(user.id, id, ['OWNER', 'ADMIN']);

      const invites = await db.teamInvite.findMany({
        where: {
          teamId: id,
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Set cache headers to prevent 304 caching issues
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Last-Modified', new Date().toUTCString());
      res.setHeader('ETag', `"${Date.now()}"`);

      res.status(200).json(invites);
    }
    else if (req.method === 'POST') {
      await checkTeamRole(user.id, id, ['OWNER', 'ADMIN']);

      const { email, role } = req.body;

      console.log('📧 [TEAM INVITE] POST 요청:', {
        teamId: id,
        email: email,
        role: role,
        userId: user.id,
        userEmail: user.email
      });

      if (!email) {
        console.error('❌ [TEAM INVITE] 이메일이 없습니다.');
        return res.status(400).json({ error: '이메일 주소를 입력해주세요.' });
      }

      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();

      // Check if user is already a member
      const existingUser = await db.user.findUnique({
        where: { email: normalizedEmail }
      });

      if (existingUser) {
        const existingMember = await db.teamMember.findUnique({
          where: {
            teamId_userId: { teamId: id, userId: existingUser.id }
          }
        });

        if (existingMember) {
          console.warn('⚠️ [TEAM INVITE] 이미 팀 멤버입니다:', {
            email: normalizedEmail,
            userId: existingUser.id,
            teamId: id
          });
          return res.status(400).json({ error: `${normalizedEmail}은(는) 이미 팀 멤버입니다.` });
        }
      }

      // Check for existing pending invite (case-insensitive)
      const existingInvites = await db.teamInvite.findMany({
        where: {
          teamId: id,
          expiresAt: { gt: new Date() }
        }
      });

      const existingInvite = existingInvites.find(
        inv => inv.email.toLowerCase() === normalizedEmail
      );

      if (existingInvite) {
        console.warn('⚠️ [TEAM INVITE] 이미 초대가 발송되었습니다:', {
          email: normalizedEmail,
          inviteId: existingInvite.id,
          expiresAt: existingInvite.expiresAt,
          teamId: id
        });
        return res.status(400).json({ error: `${normalizedEmail}로 이미 초대가 발송되었습니다.` });
      }

      // Generate invite token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      // Get team info first
      const team = await db.team.findUnique({
        where: { id }
      });

      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      // Create invite
      const invite = await db.teamInvite.create({
        data: {
          email: normalizedEmail,
          teamId: id,
          role: role || 'MEMBER',
          token,
          expiresAt
        },
        include: {
          team: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      console.log('Team invite created successfully:', { 
        inviteId: invite.id, 
        email: normalizedEmail, 
        teamId: id,
        token: token.substring(0, 8) + '...' // Log partial token for debugging
      });

      const inviteLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/teams/invite/${token}`;
      console.log('Invite link generated:', inviteLink);

      // Send invitation email (don't fail if email is not configured)
      let emailSent = false;
      let emailError = null;
      try {
        console.log('📧 [TEAM INVITE] Starting email send process:', {
          to: normalizedEmail,
          team: team.name,
          inviteLink: inviteLink.substring(0, 50) + '...'
        });
        
        emailSent = await sendTeamInvite(normalizedEmail, team.name, inviteLink);
        
        if (emailSent === true) {
          console.log('✅ [TEAM INVITE] ✅ 이메일 발송 성공!', {
            to: normalizedEmail,
            team: team.name,
            timestamp: new Date().toISOString()
          });
        } else {
          console.error('❌ [TEAM INVITE] ❌ 이메일 발송 실패:', {
            to: normalizedEmail,
            reason: 'Email service returned false',
            inviteLink: inviteLink.substring(0, 50) + '...',
            checkConfig: {
              hasSMTP: !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS,
              hasResend: !!process.env.RESEND_API_KEY,
              hasSupabase: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            }
          });
          
          // 더 구체적인 에러 메시지 생성
          const hasSMTP = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
          const hasResend = !!process.env.RESEND_API_KEY;
          const hasSupabase = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
          
          if (!hasSMTP && !hasResend && !hasSupabase) {
            emailError = '이메일 서비스가 설정되지 않았습니다. SMTP, Resend, 또는 Supabase Edge Function을 설정해주세요.';
          } else if (hasSMTP) {
            emailError = 'SMTP 이메일 발송에 실패했습니다. Gmail 앱 비밀번호를 확인하세요.';
          } else {
            emailError = '이메일 발송에 실패했습니다. 이메일 서비스 설정을 확인하세요.';
          }
        }
      } catch (error) {
        console.error('❌ [TEAM INVITE] ❌ 이메일 발송 중 오류 발생:', {
          to: normalizedEmail,
          error: error.message,
          code: error.code,
          responseCode: error.responseCode,
          command: error.command,
          stack: error.stack?.substring(0, 200),
          inviteLink: inviteLink.substring(0, 50) + '...'
        });
        
        // Gmail 인증 실패인 경우 구체적인 메시지
        if (error.code === 'EAUTH' || error.responseCode === 535) {
          emailError = 'Gmail 인증 실패: 앱 비밀번호가 올바르지 않습니다. Google 계정에서 앱 비밀번호를 확인하세요.';
        } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
          emailError = 'Gmail 연결 실패: 네트워크 연결을 확인하세요.';
        } else {
          emailError = error.message || '이메일 발송 중 오류가 발생했습니다.';
        }
        // Continue even if email fails - invite is still created
      }
      
      // 최종 상태 로그
      console.log('📊 [TEAM INVITE] 최종 결과:', {
        inviteId: invite.id,
        email: normalizedEmail,
        emailSent: emailSent ? '✅ 성공' : '❌ 실패',
        emailError: emailError || '없음',
        timestamp: new Date().toISOString()
      });

      // Create notification if user exists
      if (existingUser) {
        try {
          // 알림에 teamId 포함하여 초대 링크 확인 가능하도록
          await db.notification.create({
            data: {
              userId: existingUser.id,
              type: 'team_invited',
              title: '팀 초대가 도착했습니다',
              message: `${user.name}님이 "${team.name}" 팀에 초대했습니다.`,
              entityId: id, // teamId 저장
              entityType: 'team'
            }
          });
          console.log('Notification created for existing user:', existingUser.id);
        } catch (notifError) {
          console.warn('Failed to create notification:', notifError);
          // Continue even if notification fails
        }
      }

      // Set cache headers
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Return invite with token and email status
      res.status(201).json({
        id: invite.id,
        email: invite.email,
        teamId: invite.teamId,
        role: invite.role,
        token: invite.token, // Include token for client-side link generation
        expiresAt: invite.expiresAt,
        createdAt: invite.createdAt,
        team: invite.team,
        emailSent, // Include email status in response
        emailError, // Include error message if email failed
        inviteLink // Include invite link for convenience
      });
    }
    else if (req.method === 'DELETE') {
      await checkTeamRole(user.id, id, ['OWNER', 'ADMIN']);

      const { inviteId } = req.body;

      await db.teamInvite.delete({
        where: { id: inviteId }
      });

      res.status(200).json({ message: 'Invitation cancelled successfully' });
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ [TEAM INVITE] API 에러:', {
      message: error.message,
      code: error.code,
      stack: error.stack?.substring(0, 300),
      method: req.method,
      teamId: req.query.id
    });
    
    // Handle authentication errors
    if (error.message?.includes('token') || error.message?.includes('No token') || error.message?.includes('Invalid token')) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }
    
    // Handle permission errors
    if (error.message?.includes('permission') || error.message?.includes('access') || error.message?.includes('role')) {
      return res.status(403).json({ error: error.message || '접근 권한이 없습니다.' });
    }
    
    // Handle database errors
    if (error.code === 'P2002' || error.code?.startsWith('P')) {
      console.error('❌ [TEAM INVITE] 데이터베이스 제약 조건 위반:', error.code);
      return res.status(400).json({ error: '데이터베이스 제약 조건 위반: 중복된 데이터가 있습니다.' });
    }
    
    res.status(500).json({ error: error.message || '서버 오류가 발생했습니다.' });
  }
}

