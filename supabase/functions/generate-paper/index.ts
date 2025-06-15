
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Generate paper function called with method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const formData = await req.json();
    console.log('Received form data:', JSON.stringify(formData, null, 2));

    // Validate required fields
    if (!formData.subject || !formData.class || !formData.chapters || !Array.isArray(formData.chapters)) {
      throw new Error('Missing required fields: subject, class, or chapters');
    }

    const requirements = [
      `- Total marks: ${formData.totalMarks || 100}`,
      `- Difficulty level: ${formData.difficulty || 'Medium'}`,
      `- Board/Book type: ${formData.board || 'NCERT'}`,
      `- Pattern: ${formData.pattern || 'Board-style'}`,
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

Make it look professional and exam-ready. Use proper markdown formatting for better readability.`;

    console.log('Sending request to Gemini API...');

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
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response received successfully');

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid response structure from Gemini:', JSON.stringify(data));
      throw new Error('Invalid response from Gemini API');
    }

    const content = data.candidates[0].content.parts[0].text;
    console.log('Generated content length:', content.length);
    
    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-paper function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
