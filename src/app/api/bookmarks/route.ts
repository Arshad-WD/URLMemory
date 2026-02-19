import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'
import { fetchMetadata } from '@/lib/metadata'

export async function GET(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const tagId = searchParams.get('tagId')
    const query = searchParams.get('query')

    try {
        const bookmarks = await (prisma.bookmark as any).findMany({
            where: {
                userId: session.userId,
                ...(status && { status }),
                ...(tagId && { tags: { some: { id: tagId } } }),
                ...(query && {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { url: { contains: query, mode: 'insensitive' } },
                        { note: { contains: query, mode: 'insensitive' } },
                        { domain: { contains: query, mode: 'insensitive' } },
                    ]
                })
            },
            include: {
                reminder: true,
                tags: true
            },
            orderBy: [
                { position: 'asc' },
                { isPinned: 'desc' },
                { isFavorite: 'desc' },
                { createdAt: 'desc' }
            ] as any
        })
        return NextResponse.json(bookmarks)
    } catch (error) {
        console.error('Fetch bookmarks error:', error)
        return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { url, note, reminderAt } = await req.json()
        if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

        const metadata = await fetchMetadata(url)

        const bookmark = await prisma.bookmark.create({
            data: {
                url,
                note,
                domain: metadata.domain,
                title: metadata.title,
                faviconUrl: metadata.favicon,
                userId: session.userId,
                ...(reminderAt && {
                    reminder: {
                        create: {
                            scheduledAt: new Date(reminderAt),
                        }
                    }
                })
            },
            include: { reminder: true }
        })

        return NextResponse.json(bookmark, { status: 201 })
    } catch (error) {
        console.error('Bookmark creation error:', error)
        return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id, isFavorite, isPinned, isReadLater, status, note, tagIds } = await req.json()

        if (!id) {
            return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 })
        }

        const bookmark = await (prisma.bookmark as any).findFirst({
            where: { id, userId: session.userId }
        }) as any

        if (!bookmark) {
            return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
        }

        const data: any = {}
        if (isFavorite !== undefined) data.isFavorite = isFavorite
        if (isPinned !== undefined) data.isPinned = isPinned
        if (isReadLater !== undefined) data.isReadLater = isReadLater
        if (status !== undefined) data.status = status
        if (note !== undefined) data.note = note
        if (tagIds !== undefined) {
            data.tags = {
                set: tagIds.map((tid: string) => ({ id: tid }))
            }
        }

        const updated = await (prisma.bookmark.update as any)({
            where: { id },
            data,
            include: {
                reminder: true,
                tags: true
            }
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Bookmark update error:', error)
        return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 })
        }

        const bookmark = await prisma.bookmark.findFirst({
            where: { id, userId: session.userId }
        }) as any

        if (!bookmark) {
            return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
        }

        await prisma.bookmark.delete({ where: { id } })

        return NextResponse.json({ message: 'Bookmark deleted' }, { status: 200 })
    } catch (error) {
        console.error('Bookmark deletion error:', error)
        return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 })
    }
}
