// lib/auth.js
import jwt from 'jsonwebtoken';
import { db } from './db';

export async function authenticate(req, authOptions = null) {
  // First try NextAuth session if authOptions provided
  if (authOptions) {
    try {
      const { getServerSession } = await import('next-auth/next');
      const session = await getServerSession(req, authOptions);
      if (session?.user?.id) {
        const user = await db.user.findUnique({
          where: { id: session.user.id, deletedAt: null }
        });
        if (user) return user;
      }
    } catch (error) {
      // Continue to JWT check if NextAuth fails
      console.log('NextAuth session check failed, trying JWT:', error.message);
    }
  }

  // Fallback to JWT token
  const token = req.headers.authorization?.replace('Bearer ', '') || 
                req.cookies?.token ||
                req.cookies?.['next-auth.session-token'] ||
                req.cookies?.['__Secure-next-auth.session-token'];
  
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    // Try JWT first
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.user.findUnique({
      where: { id: decoded.userId, deletedAt: null }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (jwtError) {
    // If JWT fails, try to get session from NextAuth cookie
    if (authOptions) {
      try {
        const { getServerSession } = await import('next-auth/next');
        const session = await getServerSession(req, authOptions);
        if (session?.user?.id) {
          const user = await db.user.findUnique({
            where: { id: session.user.id, deletedAt: null }
          });
          if (user) return user;
        }
      } catch (sessionError) {
        // Both failed
      }
    }
    throw new Error('Invalid token');
  }
}

export function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
}

