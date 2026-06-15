import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function test() {
  try {
    console.log('Successfully imported PrismaClient')
    const count = await prisma.user.count()
    console.log('Successfully queried database! User count:', count)
    process.exit(0)
  } catch (err) {
    console.error('Database query failed:', err)
    process.exit(1)
  }
}

test()
