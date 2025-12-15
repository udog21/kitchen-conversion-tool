// Supabase Edge Function: smooth-action
// This function handles feedback submission, stores it in the database, and sends email notifications
// Deploy this to Supabase: Dashboard -> Edge Functions -> Create Function -> smooth-action

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@^4.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, email, rating, page, sessionId, deviceId } = await req.json()

    if (!message || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Message and sessionId are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Prepare feedback data
    const feedbackData = {
      submitted_at: new Date().toISOString(),
      message: message.trim(),
      page: page || null,
      rating: rating || null,
      contact_email: email?.trim() || null,
    }

    // Update session with feedback
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ 
        feedback: feedbackData,
        updated_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)

    if (updateError) {
      console.error('Failed to store feedback:', updateError)
      // Continue to send email even if DB update fails
    }

    // Send email notification
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const feedbackEmail = Deno.env.get('FEEDBACK_EMAIL')
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev'

    if (resendApiKey && feedbackEmail) {
      try {
        const resend = new Resend(resendApiKey)
        
        const ratingText = rating 
          ? rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : 'Good'
          : 'Not provided'
        
        const emailBody = `
New feedback submitted for Cup to Grams:

Rating: ${ratingText}
Page: ${page || 'Unknown'}

Message:
${message.trim()}

${email ? `Contact Email: ${email}` : 'No contact email provided'}

Session ID: ${sessionId}
Device ID: ${deviceId || 'Unknown'}
Submitted at: ${new Date().toISOString()}
        `.trim()

        await resend.emails.send({
          from: fromEmail,
          to: feedbackEmail,
          subject: `Feedback for Cup to Grams${rating ? ` (${ratingText})` : ''}`,
          text: emailBody,
        })
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error processing feedback:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

