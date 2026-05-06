import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/db'
import { fetchMetadata } from '@/lib/metadata'
import { enrichBookmark } from '@/lib/ai'

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }
        const roomId = params.id

        // Auth check
        const membership = await prisma.roomMember.findUnique({
            where: { roomId_userId: { roomId, userId: session.user.id } }
        })
        if (!membership) return new NextResponse('Unauthorized', { status: 403 })

        const bookmarks = await prisma.roomBookmark.findMany({
            where: { roomId },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(bookmarks)
    } catch (error) {
        return new NextResponse('Error fetching bookmarks', { status: 500 })
    }
}

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }
        const roomId = params.id
        const { url, note } = await req.json()

        // Auth check
        const membership = await prisma.roomMember.findUnique({
            where: { roomId_userId: { roomId, userId: session.user.id } }
        })
        if (!membership) return new NextResponse('Unauthorized', { status: 403 })

        const metadata = await fetchMetadata(url)
        
        let aiSummary = null
        let aiTags: string[] = []
        let aiInsight = null

        if (metadata.textContent) {
            const enrichment = await enrichBookmark(url, metadata.title, metadata.textContent)
            if (enrichment) {
                aiSummary = enrichment.summary
                aiTags = enrichment.tags
                aiInsight = enrichment.insight
            }
        }

        const bookmark = await prisma.roomBookmark.create({
            data: {
                url,
                note,
                title: metadata.title,
                roomId,
                addedById: session.user.id,
                aiSummary,
                aiTags,
                aiInsight
            } as any
        })

        return NextResponse.json(bookmark)

    } catch (error) {
        console.error('Error creating room bookmark', error)
        return new NextResponse('Error creating bookmark', { status: 500 })
    }
}
