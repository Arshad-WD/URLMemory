
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

        const { task, isDone } = await req.json()
        const todoId = params.id

        const todo = await prisma.todo.findUnique({
            where: { id: todoId },
        })

        if (!todo) {
            return new NextResponse('Todo not found', { status: 404 })
        }

        // Permission check
        if (todo.userId !== session.user.id) {
            if (todo.roomId) {
                const membership = await prisma.roomMember.findUnique({
                    where: {
                        roomId_userId: {
                            roomId: todo.roomId,
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

        const updatedTodo = await prisma.todo.update({
            where: { id: todoId },
            data: {
                task,
                isDone,
            },
        })

        return NextResponse.json(updatedTodo)
    } catch (error) {
        console.error('Failed to update todo:', error)
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

        const todoId = params.id

        const todo = await prisma.todo.findUnique({
            where: { id: todoId },
        })

        if (!todo) {
            return new NextResponse('Todo not found', { status: 404 })
        }

        let hasPermission = todo.userId === session.user.id

        if (!hasPermission && todo.roomId) {
            const membership = await prisma.roomMember.findUnique({
                where: {
                    roomId_userId: {
                        roomId: todo.roomId,
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

        await prisma.todo.delete({
            where: { id: todoId },
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Failed to delete todo:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
