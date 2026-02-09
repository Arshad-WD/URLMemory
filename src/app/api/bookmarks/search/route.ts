import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')

    if (!query) return NextResponse.json([])

    try {
        // Simple context-based search Logic
        // In a real app, this could be more sophisticated (e.g., using vector search or full-text search)
        const bookmarks = await (prisma.bookmark as any).findMany({
            where: {
                userId: session.userId,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { url: { contains: query, mode: 'insensitive' } },
                    { note: { contains: query, mode: 'insensitive' } },
                    { domain: { contains: query, mode: 'insensitive' } },
                ]
            },
            include: { tags: true, reminder: true },
            take: 20
        })

        return NextResponse.json(bookmarks)
    } catch (error) {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }
}
