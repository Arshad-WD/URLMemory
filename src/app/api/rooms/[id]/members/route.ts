
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

        // Check membership first
        const currentUserMembership = await prisma.roomMember.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId: session.user.id,
                },
            },
        })

        if (!currentUserMembership) {
            return new NextResponse('Unauthorized', { status: 403 })
        }

        const members = await prisma.roomMember.findMany({
            where: { roomId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            },
            orderBy: { role: 'asc' } // OWNER, ADMIN, MEMBER, VIEWER
        })

        // Mask emails for non-admins? Optional. For now let's return it.

        return NextResponse.json(members)
    } catch (error) {
        console.error('Failed to fetch members:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
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
        const { email, userId, role } = await req.json() // Can add by email or userId check

        // Check current user role
        const currentUserMembership = await prisma.roomMember.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId: session.user.id
                }
            }
        })

        if (!currentUserMembership || (currentUserMembership.role !== 'OWNER' && currentUserMembership.role !== 'ADMIN')) {
            return new NextResponse('Unauthorized', { status: 403 })
        }

        let targetUserId = userId

        if (!targetUserId && email) {
            const user = await prisma.user.findUnique({
                where: { email }
            })
            if (!user) {
                return new NextResponse('User not found', { status: 404 })
            }
            targetUserId = user.id
        }

        if (!targetUserId) {
            return new NextResponse('User ID or Email required', { status: 400 })
        }

        // Check if already member
        const existingMember = await prisma.roomMember.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId: targetUserId
                }
            }
        })

        if (existingMember) {
            return new NextResponse('User is already a member', { status: 409 })
        }

        const newMember = await prisma.roomMember.create({
            data: {
                roomId,
                userId: targetUserId,
                role: role || 'MEMBER'
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                        email: true
                    }
                }
            }
        })

        return NextResponse.json(newMember)

    } catch (error) {
        console.error('Failed to add member:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
