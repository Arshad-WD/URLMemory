import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to dashboard - in a real app, you'd check auth status first
  redirect('/dashboard')
}
