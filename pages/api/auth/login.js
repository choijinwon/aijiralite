// pages/api/auth/login.js
import { db } from '../../../lib/db';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../../lib/auth';
import { loginSchema } from '../../../lib/validations';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await db.user.findUnique({
      where: { 
        email,
        deletedAt: null 
      }
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    // Also set a cookie for NextAuth compatibility
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax`);

    res.status(200).json({
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

    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

