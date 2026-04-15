import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const body = await request.json()
  const { stage_name, fansly_url, email, club_names } = body

  try {
    await resend.emails.send({
      from: 'TittyMaps <info@tittymaps.com>',
      to: 'info@tittymaps.com',
      subject: `New dancer application — ${stage_name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #0D0F1E; color: white; border-radius: 12px;">
          <h2 style="color: #FF2D78; margin-bottom: 16px;">New Dancer Application</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="color: #8890c0; padding: 8px 0; width: 140px;">Stage name</td><td style="color: white; padding: 8px 0;">${stage_name}</td></tr>
            <tr><td style="color: #8890c0; padding: 8px 0;">Fansly</td><td style="color: white; padding: 8px 0;"><a href="${fansly_url}" style="color: #FF2D78;">${fansly_url}</a></td></tr>
            <tr><td style="color: #8890c0; padding: 8px 0;">Email</td><td style="color: white; padding: 8px 0;">${email}</td></tr>
            <tr><td style="color: #8890c0; padding: 8px 0;">Clubs</td><td style="color: white; padding: 8px 0;">${club_names?.join(', ')}</td></tr>
          </table>
          <a href="https://tittymaps.com/admin" style="display: inline-block; margin-top: 20px; background: #FF2D78; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Review in Admin</a>
        </div>
      `
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
