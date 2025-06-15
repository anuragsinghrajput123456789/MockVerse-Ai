
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
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.json();

    const requirements = [
      `- Total marks: ${formData.totalMarks}`,
      `- Difficulty level: ${formData.difficulty}`,
      `- Board/Book type: ${formData.board}`,
      `- Pattern: ${formData.pattern}`,
    ];

    if (formData.pattern === 'Custom' && formData.customPatternDetails) {
      requirements.push(`- Custom Pattern Details: ${formData.customPatternDetails}`);
    }
    if (formData.instructions) {
      requirements.push(`- Additional instructions: ${formData.instructions}`);
    }

    const prompt = `Generate a ${formData.subject} question paper for class ${formData.class} based on chapters: ${formData.chapters.join(', ')}${formData.topics ? ` with focus on: ${formData.topics}` : ''}. 

Requirements:
${requirements.join('\n')}

Please format the question paper with:
1. Proper header with subject, class, time, and marks
2. Clear section divisions
3. Proper question numbering
4. Mark allocation for each question
5. Instructions for students

Make it look professional and exam-ready.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate question paper');
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
