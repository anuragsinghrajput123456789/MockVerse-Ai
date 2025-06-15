
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { questionPaper, answers } = await req.json();

    const prompt = `Evaluate the following answers for the given question paper and provide detailed feedback:

Question Paper:
${questionPaper}

Student Answers:
${answers.map((answer: string, index: number) => `Question ${index + 1}: ${answer}`).join('\n')}

Please provide:
1. Marks for each question
2. Total marks obtained
3. Percentage
4. Grade (A+/A/B+/B/C+/C/D/F)
5. Overall feedback
6. Specific feedback for each answer
7. Areas for improvement
8. Suggestions for better performance

Format the response as a structured evaluation report.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to evaluate answers');
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
