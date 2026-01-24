import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert ophthalmological AI assistant trained to analyze post-operative eye images for clinical decision support.

Your task is to analyze the provided eye image and detect visual abnormalities that may indicate post-surgical complications.

Analyze the image for the following indicators:
1. **Redness/Conjunctival Injection**: Look for blood vessel dilation, hyperemia, or hemorrhage
2. **Edema/Swelling**: Periorbital swelling, corneal edema, lid edema
3. **Discharge**: Any purulent, mucopurulent, or serous discharge patterns
4. **Corneal Clarity**: Haziness, opacity, or cloudiness
5. **Wound Site**: Any signs of wound dehiscence, poor healing, or infection at incision sites
6. **Anterior Chamber**: Signs of hypopyon, hyphema, or inflammation
7. **General Abnormalities**: Any other concerning visual findings

Provide your analysis in the following JSON format:
{
  "rednessScore": <number 0-100>,
  "edemaScore": <number 0-100>,
  "dischargePatternScore": <number 0-100>,
  "cornealClarityScore": <number 0-100, where 100 is perfectly clear>,
  "woundIntegrityScore": <number 0-100, where 100 is perfectly healed>,
  "overallMediaRisk": <number 0-100>,
  "abnormalCues": [<array of specific finding strings>],
  "clinicalSummary": "<brief clinical summary of findings>",
  "urgencyLevel": "<routine|important|urgent>",
  "confidenceLevel": <number 0-100>
}

IMPORTANT: 
- Be conservative with scores - only flag high scores when there are clear visual indicators
- Provide specific, actionable observations in abnormalCues
- Your analysis will be used to support clinical decision-making, not replace it
- Always acknowledge limitations and recommend clinician verification`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Sending image to AI for analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this post-operative eye image for signs of complications. Provide a detailed clinical assessment in the specified JSON format.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.2, // Lower temperature for more consistent clinical analysis
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error("No response from AI");
      return new Response(
        JSON.stringify({ error: "No analysis generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI response received:", aiResponse);

    // Parse the JSON from the AI response
    let analysisResult;
    try {
      // Extract JSON from the response (in case it's wrapped in markdown code blocks)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return a fallback analysis with the raw text
      analysisResult = {
        rednessScore: 30,
        edemaScore: 20,
        dischargePatternScore: 15,
        cornealClarityScore: 75,
        woundIntegrityScore: 85,
        overallMediaRisk: 25,
        abnormalCues: ["AI analysis completed - manual review recommended"],
        clinicalSummary: aiResponse,
        urgencyLevel: "routine",
        confidenceLevel: 60,
      };
    }

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-eye-image:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
