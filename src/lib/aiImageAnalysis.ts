import { supabase } from '@/integrations/supabase/client';
import type { MediaAnalysis } from '@/types/patient';

export interface AIAnalysisResult {
  rednessScore: number;
  edemaScore: number;
  dischargePatternScore: number;
  cornealClarityScore?: number;
  woundIntegrityScore?: number;
  overallMediaRisk: number;
  abnormalCues: string[];
  clinicalSummary?: string;
  urgencyLevel?: 'routine' | 'important' | 'urgent';
  confidenceLevel?: number;
}

export async function analyzeEyeImage(imageBase64: string): Promise<AIAnalysisResult> {
  console.log('Sending image for AI analysis...');
  
  const { data, error } = await supabase.functions.invoke('analyze-eye-image', {
    body: { imageBase64 },
  });

  if (error) {
    console.error('AI analysis error:', error);
    throw new Error(error.message || 'Failed to analyze image');
  }

  if (data.error) {
    console.error('AI analysis returned error:', data.error);
    throw new Error(data.error);
  }

  console.log('AI analysis result:', data);
  return data as AIAnalysisResult;
}

export function convertAIResultToMediaAnalysis(aiResult: AIAnalysisResult): MediaAnalysis {
  return {
    rednessScore: aiResult.rednessScore,
    edemaScore: aiResult.edemaScore,
    dischargePatternScore: aiResult.dischargePatternScore,
    abnormalCues: aiResult.abnormalCues,
    overallMediaRisk: aiResult.overallMediaRisk,
  };
}
