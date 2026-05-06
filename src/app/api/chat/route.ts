import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export async function POST(req: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { message } = await req.json()
        if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 })

        // Fetch user's bookmarks to give context to the AI
        const bookmarks = await (prisma.bookmark as any).findMany({
            where: { userId: session.userId },
            select: { title: true, domain: true, aiSummary: true },
            take: 10,
            orderBy: { createdAt: 'desc' }
        })

        const context = bookmarks.map((b: any) => `- ${b.title} (${b.domain}): ${b.aiSummary || 'No summary'}`).join('\n')

        const prompt = `
            You are "Nexus AI", the sovereign intelligence of the user's knowledge base.
            The user has bookmarked the following recent resources:
            ${context}

            User Question: ${message}

            Respond in a professional, tactical, and helpful tone. Keep it concise.
            Use technical jargon like "uplink", "neural sync", "data stream" sparingly for flavor.
        `

        const result = await model.generateContent(prompt)
        const response = result.response.text()

        return NextResponse.json({ response })
    } catch (error) {
        console.error('Chat error:', error)
        return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
    }
}
