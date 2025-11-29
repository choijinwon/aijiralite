// pages/api/auth/register.js
import { db } from '../../../lib/db';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../../lib/auth';
import { registerSchema } from '../../../lib/validations';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, password, name } = validatedData;

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        provider: 'email',
      }
    });

    // Generate token
    const token = generateToken(user.id);

    // Also set a cookie for NextAuth compatibility
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax`);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }

    console.error('Registration error:', error);
    
    // Prisma unique constraint error
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }

    res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

