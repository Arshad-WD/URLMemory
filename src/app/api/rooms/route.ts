
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

        const { name, description } = await req.json()

        if (!name) {
            return new NextResponse('Room name is required', { status: 400 })
        }

        // Create room and add creator as OWNER
        const room = await prisma.$transaction(async (tx) => {
            const newRoom = await tx.room.create({
                data: {
                    name,
                    description,
                    ownerId: userId
                }
            })

            await tx.roomMember.create({
                data: {
                    roomId: newRoom.id,
                    userId: userId,
                    role: 'OWNER'
                }
            })

            return newRoom
        })

        return NextResponse.json(room)
    } catch (error) {
        console.error('Failed to create room:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Get rooms where user is a member
        const memberships = await prisma.roomMember.findMany({
            where: { userId: session.user.id },
            include: {
                room: {
                    include: {
                        _count: {
                            select: { members: true }
                        }
                    }
                }
            },
            orderBy: { joinedAt: 'desc' }
        })

        const rooms = memberships.map(m => ({
            ...m.room,
            role: m.role,
            memberCount: m.room._count.members
        }))

        return NextResponse.json(rooms)
    } catch (error) {
        console.error('Failed to fetch rooms:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
