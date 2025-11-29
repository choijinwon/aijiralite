// lib/auth.js
import jwt from 'jsonwebtoken';
import { db } from './db';
import { createServerClient } from './supabase';

export async function authenticate(req, authOptions = null, res = null) {
  // Check JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    console.error('❌ [AUTH] JWT_SECRET is not configured');
  }

  // Get token from various sources
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;
  const cookieToken = req.cookies?.token ||
                      req.cookies?.['next-auth.session-token'] ||
                      req.cookies?.['__Secure-next-auth.session-token'];

  // Try JWT token FIRST (fastest, no external calls, no database queries for session)
  const jwtToken = token || cookieToken;
  if (jwtToken && process.env.JWT_SECRET) {
    try {
      const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
      const user = await db.user.findUnique({
        where: { id: decoded.userId, deletedAt: null },
        select: { id: true, email: true, name: true, avatar: true, provider: true, providerId: true, deletedAt: true }
      });
      if (user) return user;
    } catch (jwtError) {
      // JWT invalid, continue to other methods
      if (process.env.NODE_ENV === 'development') {
        console.log('JWT verification failed:', jwtError.message);
      }
    }
  }

  // Try NextAuth session (fast, but requires session lookup)
  if (authOptions) {
    try {
      // Use Promise.race to timeout NextAuth session check
      const sessionPromise = (async () => {
        const { getServerSession } = await import('next-auth/next');
        // Pass req and res properly for NextAuth
        // If res is not provided, try with just req (for compatibility)
        if (res) {
          return await getServerSession(req, res, authOptions);
        } else {
          return await getServerSession(req, authOptions);
        }
      })();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('NextAuth timeout')), 2000) // Increased timeout
      );
      
      const session = await Promise.race([sessionPromise, timeoutPromise]);
      
      if (session?.user?.id) {
        const user = await db.user.findUnique({
          where: { id: session.user.id, deletedAt: null },
          select: { id: true, email: true, name: true, avatar: true, provider: true, providerId: true, deletedAt: true }
        });
        if (user) {
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ [AUTH] Authenticated via NextAuth session:', user.email);
          }
          return user;
        }
      } else if (session?.user?.email) {
        // Fallback: try to find user by email if ID is not available
        const user = await db.user.findUnique({
          where: { email: session.user.email, deletedAt: null },
          select: { id: true, email: true, name: true, avatar: true, provider: true, providerId: true, deletedAt: true }
        });
        if (user) {
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ [AUTH] Authenticated via NextAuth session (by email):', user.email);
          }
          return user;
        }
      }
    } catch (error) {
      // Timeout or error, continue to Supabase check
      if (process.env.NODE_ENV === 'development') {
        console.log('NextAuth session check failed:', error.message);
      }
    }
  }

  // Try Supabase only if we have a Bearer token and Supabase is configured
  if (token && authHeader?.startsWith('Bearer ')) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      // Quick validation - skip if not configured
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      // Validate URL format
      const isValidUrl = supabaseUrl.startsWith('http') && 
                        !supabaseUrl.includes('placeholder') &&
                        supabaseUrl.includes('.supabase.co');
      
      if (!isValidUrl) {
        throw new Error('Invalid Supabase URL');
      }
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      
      // Reduced timeout to 500ms for faster failure
      const getUserPromise = supabase.auth.getUser(token);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 500)
      );
      
      let result;
      try {
        result = await Promise.race([getUserPromise, timeoutPromise]);
      } catch (timeoutError) {
        throw new Error('Supabase timeout');
      }
      
      const { data: { user: supabaseUser }, error } = result;
      
      if (!error && supabaseUser) {
        // Find or create user in database
        let user = await db.user.findUnique({
          where: { email: supabaseUser.email, deletedAt: null },
          select: { id: true, email: true, name: true, avatar: true, provider: true, providerId: true, deletedAt: true }
        });

        if (!user) {
          user = await db.user.create({
            data: {
              email: supabaseUser.email,
              name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
              avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
              provider: 'supabase',
              providerId: supabaseUser.id,
            }
          });
        } else if (!user.providerId || user.provider !== 'supabase') {
          user = await db.user.update({
            where: { id: user.id },
            data: {
              provider: 'supabase',
              providerId: supabaseUser.id,
              ...(supabaseUser.user_metadata?.avatar_url && !user.avatar && { avatar: supabaseUser.user_metadata.avatar_url }),
            }
          });
        }

        if (user) return user;
      }
    } catch (supabaseError) {
      // Silently fail - already tried other methods
    }
  }

  // All methods failed
  if (!jwtToken && !authOptions) {
    throw new Error('No token provided');
  }
  throw new Error('Invalid token');
}

export function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
}

