import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'json'

    try {
        const bookmarks = await (prisma.bookmark as any).findMany({
            where: { userId: session.userId },
            include: {
                reminder: true,
                tags: true
            },
            orderBy: { createdAt: 'desc' }
        })

        if (format === 'csv') {
            const headers = ['URL', 'Title', 'Domain', 'Note', 'IsFavorite', 'IsPinned', 'Status', 'CreatedAt']
            const rows = bookmarks.map((b: any) => [
                b.url,
                b.title || '',
                b.domain,
                (b.note || '').replace(/"/g, '""'),
                b.isFavorite,
                b.isPinned,
                b.status,
                b.createdAt.toISOString()
            ])
            const csv = [headers.join(','), ...rows.map((r: any[]) => r.map((v: any) => `"${v}"`).join(','))].join('\n')

            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="bookmarks_export_${new Date().toISOString().split('T')[0]}.csv"`
                }
            })
        }

        return NextResponse.json(bookmarks)
    } catch (error) {
        console.error('Export error:', error)
        return NextResponse.json({ error: 'Failed to export bookmarks' }, { status: 500 })
    }
}
