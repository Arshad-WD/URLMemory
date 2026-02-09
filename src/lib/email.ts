import { Resend } from 'resend'

interface ReminderEmailProps {
  to: string
  bookmarkTitle: string | null
  bookmarkUrl: string
  message?: string | null
}

export async function sendReminderEmail({ to, bookmarkTitle, bookmarkUrl, message }: ReminderEmailProps) {
  if (!process.env.RESEND_API_KEY) {
    console.log('📧 Email would be sent to:', to)
    console.log('   Bookmark:', bookmarkTitle || bookmarkUrl)
    return { success: true, mock: true }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const { data, error } = await resend.emails.send({
      from: 'Memory <reminders@resend.dev>',
      to: [to],
      subject: `🔔 Reminder: ${bookmarkTitle || 'Your saved link'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 480px; margin: 40px auto; padding: 32px; background: white; border-radius: 24px; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 24px;">🔔</span>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1e293b;">Time to revisit!</h1>
            </div>
            
            <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8;">Your saved link</p>
              <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">${bookmarkTitle || 'Untitled'}</p>
              ${message ? `<p style="margin: 12px 0 0; color: #64748b; font-size: 14px;">${message}</p>` : ''}
            </div>
            
            <a href="${bookmarkUrl}" style="display: block; text-align: center; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 16px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Open Link →
            </a>
            
            <p style="margin: 24px 0 0; text-align: center; font-size: 12px; color: #94a3b8;">
              Sent from Memory - Your Personal URL Library
            </p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email service error:', error)
    return { success: false, error }
  }
}
