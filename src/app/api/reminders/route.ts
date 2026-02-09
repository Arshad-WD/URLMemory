import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { bookmarkId, scheduledAt, message } = await req.json()

        if (!bookmarkId || !scheduledAt) {
            return NextResponse.json({ error: 'Bookmark ID and scheduled time are required' }, { status: 400 })
        }

        // Verify bookmark belongs to user
        const bookmark = await prisma.bookmark.findFirst({
            where: { id: bookmarkId, userId: session.userId }
        })

        if (!bookmark) {
            return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
        }

        // Check if reminder already exists
        const existingReminder = await prisma.reminder.findUnique({
            where: { bookmarkId }
        })

        let reminder
        if (existingReminder) {
            // Update existing reminder
            reminder = await prisma.reminder.update({
                where: { bookmarkId },
                data: {
                    scheduledAt: new Date(scheduledAt),
                    message,
                    status: 'PENDING'
                }
            })
        } else {
            // Create new reminder
            reminder = await prisma.reminder.create({
                data: {
                    bookmarkId,
                    scheduledAt: new Date(scheduledAt),
                    message
                }
            })
        }

        return NextResponse.json(reminder, { status: 201 })
    } catch (error) {
        console.error('Reminder creation error:', error)
        return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 })
    }
}

export async function GET() {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const reminders = await prisma.reminder.findMany({
            where: {
                bookmark: { userId: session.userId }
            },
            include: { bookmark: true },
            orderBy: { scheduledAt: 'asc' }
        })

        return NextResponse.json(reminders)
    } catch (error) {
        console.error('Fetch reminders error:', error)
        return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 })
    }
}
