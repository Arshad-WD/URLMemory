import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const tags = await prisma.tag.findMany({
            where: { userId: session.userId },
            orderBy: { name: 'asc' }
        })
        return NextResponse.json(tags)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { name, color } = await req.json()
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

        const tag = await prisma.tag.create({
            data: {
                name,
                color,
                userId: session.userId
            }
        })

        return NextResponse.json(tag, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 })

        const tag = await prisma.tag.findFirst({
            where: { id, userId: session.userId }
        })

        if (!tag) return NextResponse.json({ error: 'Tag not found' }, { status: 404 })

        await prisma.tag.delete({ where: { id } })

        return NextResponse.json({ message: 'Tag deleted' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 })
    }
}
