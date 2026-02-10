
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/db'

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

        const { title, content } = await req.json()
        const noteId = params.id

        const note = await prisma.note.findUnique({
            where: { id: noteId },
        })

        if (!note) {
            return new NextResponse('Note not found', { status: 404 })
        }

        // Check permission
        if (note.userId !== session.user.id) {
            // If it's a room note, check if user is a member
            if (note.roomId) {
                const membership = await prisma.roomMember.findUnique({
                    where: {
                        roomId_userId: {
                            roomId: note.roomId,
                            userId: session.user.id,
                        },
                    },
                })
                if (!membership) {
                    return new NextResponse('Unauthorized', { status: 403 })
                }
            } else {
                return new NextResponse('Unauthorized', { status: 403 })
            }
        }

        const updatedNote = await prisma.note.update({
            where: { id: noteId },
            data: {
                title,
                content,
            },
        })

        return NextResponse.json(updatedNote)
    } catch (error) {
        console.error('Failed to update note:', error)
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

        const noteId = params.id

        const note = await prisma.note.findUnique({
            where: { id: noteId },
        })

        if (!note) {
            return new NextResponse('Note not found', { status: 404 })
        }

        // Only creator or room owner should delete? 
        // For now, let's allow creator.
        // Ideally room logic would be more complex (admins/owners can delete any note in room).
        // Let's implement: if room note, check if user is owner/admin of room OR creator of note.

        let hasPermission = note.userId === session.user.id

        if (!hasPermission && note.roomId) {
            const membership = await prisma.roomMember.findUnique({
                where: {
                    roomId_userId: {
                        roomId: note.roomId,
                        userId: session.user.id
                    }
                }
            })
            if (membership && (membership.role === 'OWNER' || membership.role === 'ADMIN')) {
                hasPermission = true
            }
        }

        if (!hasPermission) {
            return new NextResponse('Unauthorized', { status: 403 })
        }

        await prisma.note.delete({
            where: { id: noteId },
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Failed to delete note:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
