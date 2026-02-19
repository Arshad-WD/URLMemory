
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { bookmarkIds } = await req.json()
        if (!Array.isArray(bookmarkIds)) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }

        // Perform batch update - transaction is safer
        await prisma.$transaction(
            bookmarkIds.map((id, index) =>
                prisma.bookmark.update({
                    where: { id, userId: session.userId },
                    data: { position: index }
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Reorder bookmarks error:', error)
        return NextResponse.json({ error: 'Failed to reorder bookmarks' }, { status: 500 })
    }
}
