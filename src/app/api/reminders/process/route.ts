import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { sendReminderEmail } from '@/lib/email'

// This endpoint processes due reminders
// Call via cron job or Vercel Cron in production
export async function GET(req: Request) {
    // Verify cron secret in production
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const now = new Date()

        // Find all due reminders
        const dueReminders = await prisma.reminder.findMany({
            where: {
                scheduledAt: { lte: now },
                status: 'PENDING'
            },
            include: {
                bookmark: {
                    include: { user: true }
                }
            }
        })

        console.log(`Processing ${dueReminders.length} due reminders...`)

        const results = []

        for (const reminder of dueReminders) {
            try {
                // Send email
                const emailResult = await sendReminderEmail({
                    to: reminder.bookmark.user.email,
                    bookmarkTitle: reminder.bookmark.title,
                    bookmarkUrl: reminder.bookmark.url,
                    message: reminder.message
                })

                // Update status to COMPLETED
                await prisma.reminder.update({
                    where: { id: reminder.id },
                    data: { status: 'COMPLETED' }
                })

                results.push({
                    id: reminder.id,
                    status: 'sent',
                    email: reminder.bookmark.user.email
                })
            } catch (error) {
                console.error(`Failed to process reminder ${reminder.id}:`, error)

                // Mark as failed
                await prisma.reminder.update({
                    where: { id: reminder.id },
                    data: { status: 'FAILED' }
                })

                results.push({
                    id: reminder.id,
                    status: 'failed',
                    error: String(error)
                })
            }
        }

        // Cleanup: Delete completed reminders older than 7 days
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const deleted = await prisma.reminder.deleteMany({
            where: {
                status: 'COMPLETED',
                updatedAt: { lt: sevenDaysAgo }
            }
        })

        return NextResponse.json({
            processed: results.length,
            results,
            cleaned: deleted.count,
            timestamp: now.toISOString()
        })
    } catch (error) {
        console.error('Reminder processing error:', error)
        return NextResponse.json({ error: 'Failed to process reminders' }, { status: 500 })
    }
}

// Manual trigger for testing
export async function POST(req: Request) {
    return GET(req)
}
