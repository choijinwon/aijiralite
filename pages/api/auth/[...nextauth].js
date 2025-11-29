// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '../../../lib/db';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            return null;
          }

          const user = await db.user.findUnique({
            where: { 
              email: credentials.email,
              deletedAt: null 
            }
          });

          if (!user) {
            console.log('User not found:', credentials.email);
            return null;
          }

          if (!user.password) {
            console.log('User has no password');
            return null;
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password, 
            user.password
          );

          if (!isValidPassword) {
            console.log('Invalid password for user:', credentials.email);
            return null;
          }

          console.log('Login successful for user:', user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar,
          };
        } catch (error) {
          console.error('Authorize error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        try {
          // DATABASE_URL 체크
          if (!process.env.DATABASE_URL) {
            console.error('❌ [NextAuth] DATABASE_URL is not set. Cannot create user.');
            return false;
          }

          const existingUser = await db.user.findUnique({
            where: { email: user.email }
          });

          if (existingUser) {
            return true;
          }

          // 새 사용자 생성
          await db.user.create({
            data: {
              email: user.email,
              name: user.name || user.email.split('@')[0],
              avatar: user.image,
              provider: 'google',
              providerId: account.providerAccountId,
            }
          });

          console.log('✅ [NextAuth] Google user created:', user.email);
          return true;
        } catch (error) {
          console.error('❌ [NextAuth] Error during Google sign in:', error);
          
          // DATABASE_URL 관련 에러인지 확인
          if (error.message?.includes('DATABASE_URL') || error.message?.includes('Environment variable')) {
            console.error('   → DATABASE_URL environment variable is not configured');
            console.error('   → Please set DATABASE_URL in Netlify environment variables');
          }
          
          return false;
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      // Google OAuth 정보 추가
      if (token?.email) {
        session.user.email = token.email;
      }
      if (token?.name) {
        session.user.name = token.name;
      }
      if (token?.picture) {
        session.user.image = token.picture;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }
      // Google OAuth 사용자 정보 저장
      if (account?.provider === 'google' && user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// Error handling wrapper with cache headers
const handler = async (req, res) => {
  try {
    // Check if NEXTAUTH_SECRET is set
    if (!process.env.NEXTAUTH_SECRET) {
      console.error('NEXTAUTH_SECRET is not set');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'NEXTAUTH_SECRET is not configured'
      });
    }

    // Check if NEXTAUTH_URL is set
    if (!process.env.NEXTAUTH_URL) {
      console.error('NEXTAUTH_URL is not set');
      // In production, try to get from request
      if (process.env.NODE_ENV === 'production') {
        const url = req.headers.host 
          ? `https://${req.headers.host}` 
          : 'https://aijiralite.netlify.app';
        process.env.NEXTAUTH_URL = url;
      }
    }

    // Set cache headers for all NextAuth endpoints to prevent 304 responses
    // This includes /api/auth/providers, /api/auth/session, etc.
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Last-Modified', new Date().toUTCString());
    res.setHeader('ETag', `"${Date.now()}"`);

    return NextAuth(authOptions)(req, res);
  } catch (error) {
    console.error('NextAuth error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

export default handler;

