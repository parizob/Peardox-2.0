// Edge Function for sending contact emails via Resend API
// This function runs in Deno runtime on Supabase Edge Functions

// TypeScript declarations for Deno environment
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

// Import serve function for Deno HTTP server
// @ts-ignore - Deno import that won't resolve in Node.js linter
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { name, email, subject, message } = await req.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Resend API key from environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY environment variable not set')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Sanitize inputs
    const sanitizedData = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim()
    }

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: ['pearadoxapp@gmail.com'],
        subject: `Contact Form: ${sanitizedData.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #3b82f6; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Name:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${sanitizedData.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${sanitizedData.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Subject:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${sanitizedData.subject}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #374151;">Message:</h3>
              <p style="white-space: pre-wrap; line-height: 1.6; color: #1f2937;">${sanitizedData.message}</p>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #6b7280; font-size: 14px;">
              <p>This email was sent from the Pearadox contact form.</p>
              <p>Timestamp: ${new Date().toLocaleString()}</p>
              <p>Reply directly to: ${sanitizedData.email}</p>
            </div>
          </div>
        `,
        text: `
          New Contact Form Submission

          Name: ${sanitizedData.name}
          Email: ${sanitizedData.email}
          Subject: ${sanitizedData.subject}

          Message:
          ${sanitizedData.message}

          Sent at: ${new Date().toLocaleString()}
        `
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email',
          details: resendData.message || 'Unknown error'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Email sent successfully:', resendData.id)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email sent successfully!',
        id: resendData.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 