import { auth } from "@/auth"

export interface Session {
    userId: string
    email: string
}

export async function getSession(): Promise<Session | null> {
    const session = await auth()

    if (!session?.user?.id) return null

    return {
        userId: session.user.id,
        email: session.user.email || ""
    }
}


