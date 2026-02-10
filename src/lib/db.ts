import { PrismaClient } from '@prisma/client'

// Force type refresh
const prismaClientSingleton = () => {
    return new PrismaClient()
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ID !== 'production') globalThis.prisma = prisma
