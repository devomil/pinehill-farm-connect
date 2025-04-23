
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import OpenAI from "https://esm.sh/openai@4.20.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { attachments } = await req.json()
    
    if (!attachments || attachments.length === 0) {
      throw new Error('No attachments provided')
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    })

    // Analyze documents and generate quiz questions
    const systemPrompt = `You are a professional educator who creates multiple choice quiz questions. 
    Based on the provided training material, generate 5 quiz questions. 
    Each question should:
    - Test understanding of key concepts
    - Have 4 possible answers with only one correct answer
    - Be challenging but fair
    Return the questions in this JSON format:
    {
      "questions": [{
        "question": "question text",
        "options": ["option1", "option2", "option3", "option4"],
        "correctAnswer": 0 // index of correct answer
      }]
    }`

    const documentContent = attachments.map(a => {
      // In a real implementation, we would parse different document types
      // For now, we'll assume text content is directly available
      return a.content || ''
    }).join('\n\n')

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: documentContent }
      ]
    })

    const generatedQuestions = JSON.parse(completion.choices[0].message.content)

    return new Response(JSON.stringify(generatedQuestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error generating quiz:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
