
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/db'

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const userId = session.user.id
        const { title, content, roomId } = await req.json()

        if (!content) {
            return new NextResponse('Content is required', { status: 400 })
        }

        const note = await prisma.note.create({
            data: {
                title,
                content,
                userId: userId,
                roomId: roomId || null,
            },
        })

        return NextResponse.json(note)
    } catch (error) {
        console.error('Failed to create note:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const roomId = searchParams.get('roomId')

        const where = roomId
            ? { roomId } // Fetch notes for a specific room
            : { userId: session.user.id, roomId: null } // Fetch personal notes only

        // If fetching room notes, verify membership
        if (roomId) {
            const membership = await prisma.roomMember.findUnique({
                where: {
                    roomId_userId: {
                        roomId,
                        userId: session.user.id,
                    },
                },
            })

            if (!membership) {
                return new NextResponse('Unauthorized access to room', { status: 403 })
            }
        }

        const notes = await prisma.note.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
        })

        return NextResponse.json(notes)
    } catch (error) {
        console.error('Failed to fetch notes:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
