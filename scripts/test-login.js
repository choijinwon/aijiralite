// scripts/test-login.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@test.com' }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User exists:', user.email);
    console.log('   Name:', user.name);
    console.log('   Has password:', !!user.password);

    if (user.password) {
      const isValid = await bcrypt.compare('1234', user.password);
      console.log('   Password "1234" matches:', isValid);
      
      if (!isValid) {
        console.log('\n⚠️  Password mismatch. Updating password...');
        const hashed = await bcrypt.hash('1234', 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashed }
        });
        console.log('✅ Password updated to "1234"');
      }
    } else {
      console.log('⚠️  User has no password. Setting password...');
      const hashed = await bcrypt.hash('1234', 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed }
      });
      console.log('✅ Password set to "1234"');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();

