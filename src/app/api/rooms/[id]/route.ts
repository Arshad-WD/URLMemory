
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/db'

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

        // Check membership
        const membership = await prisma.roomMember.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId: session.user.id,
                },
            },
            include: {
                room: true
            }
        })

        if (!membership) {
            return new NextResponse('Room not found or unauthorized', { status: 404 })
        }

        return NextResponse.json({
            ...membership.room,
            currentUserRole: membership.role
        })
    } catch (error) {
        console.error('Failed to fetch room:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function PATCH(
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
        const { name, description } = await req.json()

        // Check ownership/admin logic
        const membership = await prisma.roomMember.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId: session.user.id,
                },
            },
        })

        if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
            return new NextResponse('Unauthorized', { status: 403 })
        }

        const updatedRoom = await prisma.room.update({
            where: { id: roomId },
            data: {
                name,
                description,
            },
        })

        return NextResponse.json(updatedRoom)
    } catch (error) {
        console.error('Failed to update room:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function DELETE(
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

        // Check ownership - Only OWNER can delete?
        const membership = await prisma.roomMember.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId: session.user.id,
                },
            },
        })

        if (!membership || membership.role !== 'OWNER') {
            return new NextResponse('Unauthorized', { status: 403 })
        }

        await prisma.room.delete({
            where: { id: roomId },
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Failed to delete room:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
