try {
  console.log('CWD:', process.cwd());
  console.log('Resolving @prisma/client...');
  const path = require.resolve('@prisma/client');
  console.log('Resolved to:', path);
  const { PrismaClient } = require('@prisma/client');
  console.log('Imported PrismaClient');
  const prisma = new PrismaClient();
  console.log('Instantiated PrismaClient');
} catch (e) {
  console.error('Error:', e);
}
