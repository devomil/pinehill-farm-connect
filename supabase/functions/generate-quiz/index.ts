
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    // Mock quiz questions for development - this avoids using the OpenAI API which is hitting quota limits
    const mockQuestions = [
      {
        question: "What kind of products require special training for retail employees?",
        options: [
          "High-value electronics",
          "CBD and hemp products",
          "Organic produce",
          "Imported goods"
        ],
        correctAnswer: 1
      },
      {
        question: "How often should employees complete safety compliance training?",
        options: [
          "Once when hired",
          "Every 5 years",
          "Annually",
          "Every other month"
        ],
        correctAnswer: 2
      },
      {
        question: "Which of these is NOT typically covered in HIPAA training?",
        options: [
          "Patient information confidentiality",
          "Secure document disposal",
          "Cash handling procedures",
          "Electronic health record access"
        ],
        correctAnswer: 2
      },
      {
        question: "What is the primary purpose of product knowledge training?",
        options: [
          "To improve employee morale",
          "To help employees better assist customers",
          "To reduce product returns",
          "To qualify for promotional pricing"
        ],
        correctAnswer: 1
      },
      {
        question: "Which department would typically require specialized inventory management training?",
        options: [
          "Human Resources",
          "Customer Service",
          "Operations",
          "Marketing"
        ],
        correctAnswer: 2
      }
    ];

    return new Response(JSON.stringify({ questions: mockQuestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error generating quiz:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      questions: [] // Return empty questions array on error
    }), {
      status: 200, // Return 200 even on error to prevent client errors
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
