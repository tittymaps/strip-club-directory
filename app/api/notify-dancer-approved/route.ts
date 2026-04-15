import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { stage_name, email, is_featured, dancer_id } = body
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TittyMaps <info@tittymaps.com>',
        to: email,
        subject: `You are live on TittyMaps! 💃`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #0D0F1E; color: white; border-radius: 12px;">
            <h2 style="color: #FF2D78; margin-bottom: 8px;">You are live on TittyMaps!</h2>
            <p style="color: #8890c0; margin-bottom: 20px;">Hey ${stage_name}, your profile has been approved and is now live on TittyMaps.com!</p>
            ${is_featured ? `
              <div style="background: #1a1200; border: 1px solid #FFD700; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
                <p style="color: #FFD700; font-weight: bold; margin: 0 0 6px;">★ You are a Featured Dancer!</p>
                <p style="color: #8890c0; font-size: 13px; margin: 0;">Your profile has priority placement and your Fansly link is live for fans to find you.</p>
              </div>
            ` : `
              <div style="background: #131629; border: 1px solid #1e2140; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
                <p style="color: white; margin: 0 0 6px;">Your profile is live!</p>
                <p style="color: #8890c0; font-size: 13px; margin: 0;">Want to become a Featured Dancer and get priority placement? Sign up for Fansly through our link.</p>
              </div>
            `}
            <a href="https://tittymaps.com/dancers/${dancer_id}" style="display: inline-block; background: #FF2D78; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-bottom: 16px;">View your profile</a>
            <p style="color: #555; font-size: 12px; margin-top: 20px;">TittyMaps.com — The strip club directory</p>
          </div>
        `
      })
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
