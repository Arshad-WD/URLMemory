
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
        const { task, roomId, priority, tagIds } = await req.json()

        if (!task) {
            return new NextResponse('Task is required', { status: 400 })
        }

        const todo = await prisma.todo.create({
            data: {
                task,
                userId: userId,
                roomId: roomId || null,
                priority: priority || 'MEDIUM',
                tags: tagIds && tagIds.length > 0 ? {
                    connect: tagIds.map((id: string) => ({ id }))
                } : undefined,
            },
            include: {
                tags: true
            }
        })

        return NextResponse.json(todo)
    } catch (error) {
        console.error('Failed to create todo:', error)
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
            ? { roomId }
            : { userId: session.user.id, roomId: null }

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

        const todos = await prisma.todo.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true
                    }
                },
                tags: true
            }
        })

        return NextResponse.json(todos)
    } catch (error) {
        console.error('Failed to fetch todos:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
