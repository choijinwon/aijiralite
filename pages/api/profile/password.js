// pages/api/profile/password.js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authenticate(req, authOptions, res);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get user with password
    const userWithPassword = await db.user.findUnique({
      where: { id: user.id }
    });

    if (!userWithPassword || !userWithPassword.password) {
      return res.status(400).json({ error: 'Password cannot be changed for OAuth accounts' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, userWithPassword.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

