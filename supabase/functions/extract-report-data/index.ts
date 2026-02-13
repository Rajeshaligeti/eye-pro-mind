import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXTRACTION_PROMPT = `You are a medical data extraction assistant. Analyze the provided medical report (image or document) and extract post-operative ophthalmological clinical data.

Extract any available values and return them in this exact JSON format. Use null for any value you cannot find or are unsure about:

{
  "demographics": {
    "age": <number|null>,
    "gender": <"male"|"female"|"other"|null>,
    "smokingStatus": <"never"|"former"|"current"|null>,
    "residence": <"urban"|"rural"|null>
  },
  "systemicHistory": {
    "diabetesDuration": <number|null>,
    "diabetesControl": <"well-controlled"|"moderate"|"poor"|null>,
    "hypertensionSeverity": <"none"|"mild"|"moderate"|"severe"|null>,
    "autoimmune": <boolean|null>,
    "immunocompromised": <boolean|null>,
    "steroidUse": <boolean|null>
  },
  "ocularHistory": {
    "previousSurgeries": <number|null>,
    "previousComplications": <boolean|null>,
    "contactLensUse": <boolean|null>,
    "chronicConditions": <string[]|null>
  },
  "surgeryDetails": {
    "surgeryType": <"cataract"|"lasik"|"glaucoma"|"retinal"|null>,
    "complexity": <"routine"|"moderate"|"complex"|null>,
    "duration": <number in minutes|null>,
    "surgeonExperience": <"junior"|"experienced"|"expert"|null>,
    "intraoperativeComplicationType": <"none"|"posterior-capsule-rupture"|"zonular-weakness"|"vitreous-loss"|null>
  },
  "postOperativeSymptoms": {
    "painLevel": <number 0-10|null>,
    "rednessLevel": <number 0-10|null>,
    "swellingLevel": <number 0-10|null>,
    "visualBlur": <boolean|null>,
    "discharge": <boolean|null>,
    "photophobia": <boolean|null>
  },
  "clinicalMeasurements": {
    "intraocularPressure": <number|null>,
    "cornealClarity": <"clear"|"mild-haze"|"moderate-haze"|"opaque"|null>,
    "woundIntegrity": <"intact"|"minor-issue"|"concern"|null>,
    "anteriorChamberReaction": <"none"|"trace"|"mild"|"moderate"|"severe"|null>,
    "inflammationGrade": <"0"|"1+"|"2+"|"3+"|null>,
    "cornealEdemaSeverity": <"none"|"mild"|"moderate"|"severe"|null>
  },
  "additionalInputs": {
    "bloodPressureSystolic": <number|null>,
    "bloodPressureDiastolic": <number|null>,
    "bloodSugar": <number|null>
  },
  "complianceScore": <"good"|"moderate"|"poor"|null>,
  "timeSinceSurgery": { "value": <number|null>, "unit": <"hours"|"days"|null> },
  "followUpTrend": <"improving"|"stable"|"worsening"|null>,
  "extractionConfidence": <number 0-100>,
  "extractionNotes": "<brief note about what was found/missing>"
}

IMPORTANT:
- Only extract values you can clearly identify in the report
- Use null for anything uncertain or not present
- Be conservative - do not guess values
- The extractionConfidence should reflect how much data you could reliably extract`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileBase64, fileType } = await req.json();

    if (!fileBase64) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Extracting clinical data from report...", fileType);

    const mimeType = fileType === "pdf" ? "application/pdf" : "image/jpeg";
    const dataUrl = fileBase64.startsWith("data:") ? fileBase64 : `data:${mimeType};base64,${fileBase64}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: EXTRACTION_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Please extract all available clinical data from this medical report." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        max_tokens: 3000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `AI extraction failed [${response.status}]` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      return new Response(
        JSON.stringify({ error: "No extraction result" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Extraction response:", aiResponse);

    let extractedData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      extractedData = {
        extractionConfidence: 0,
        extractionNotes: "Could not parse report. Please enter data manually.",
      };
    }

    return new Response(
      JSON.stringify(extractedData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in extract-report-data:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
