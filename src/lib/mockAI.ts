import type {
  PatientAssessment,
  RiskAssessment,
  CareRecommendation,
  MediaAnalysis,
  TemporalDataPoint,
} from '@/types/patient';

// Simulated AI risk calculation
export function calculateRiskScore(assessment: Partial<PatientAssessment>): RiskAssessment {
  let clinicalScore = 0;
  let behavioralScore = 0;
  const riskFactors: { factor: string; contribution: number }[] = [];

  // Demographics scoring
  if (assessment.demographics) {
    const { age, smokingStatus } = assessment.demographics;
    if (age > 70) {
      clinicalScore += 15;
      riskFactors.push({ factor: 'Advanced age (>70)', contribution: 15 });
    } else if (age > 60) {
      clinicalScore += 8;
      riskFactors.push({ factor: 'Age 60-70', contribution: 8 });
    }
    if (smokingStatus === 'current') {
      behavioralScore += 12;
      riskFactors.push({ factor: 'Active smoking', contribution: 12 });
    }
  }

  // Systemic history scoring
  if (assessment.systemicHistory) {
    const { diabetesControl, hypertensionSeverity, immunocompromised, steroidUse } = assessment.systemicHistory;
    if (diabetesControl === 'poor') {
      clinicalScore += 20;
      riskFactors.push({ factor: 'Poorly controlled diabetes', contribution: 20 });
    } else if (diabetesControl === 'moderate') {
      clinicalScore += 10;
      riskFactors.push({ factor: 'Moderately controlled diabetes', contribution: 10 });
    }
    if (hypertensionSeverity === 'severe') {
      clinicalScore += 12;
      riskFactors.push({ factor: 'Severe hypertension', contribution: 12 });
    }
    if (immunocompromised) {
      clinicalScore += 18;
      riskFactors.push({ factor: 'Immunocompromised status', contribution: 18 });
    }
    if (steroidUse) {
      clinicalScore += 10;
      riskFactors.push({ factor: 'Long-term steroid use', contribution: 10 });
    }
  }

  // Ocular history scoring
  if (assessment.ocularHistory) {
    const { previousComplications, previousSurgeries } = assessment.ocularHistory;
    if (previousComplications) {
      clinicalScore += 15;
      riskFactors.push({ factor: 'Previous post-operative complications', contribution: 15 });
    }
    if (previousSurgeries > 2) {
      clinicalScore += 8;
      riskFactors.push({ factor: 'Multiple previous eye surgeries', contribution: 8 });
    }
  }

  // Surgery details scoring
  if (assessment.surgeryDetails) {
    const { complexity, intraoperativeIssues, surgeonExperience } = assessment.surgeryDetails;
    if (complexity === 'complex') {
      clinicalScore += 15;
      riskFactors.push({ factor: 'Complex surgical procedure', contribution: 15 });
    }
    if (intraoperativeIssues) {
      clinicalScore += 20;
      riskFactors.push({ factor: 'Intraoperative complications', contribution: 20 });
    }
    if (surgeonExperience === 'junior') {
      clinicalScore += 5;
      riskFactors.push({ factor: 'Junior surgeon', contribution: 5 });
    }
  }

  // Post-operative symptoms scoring
  if (assessment.postOperativeSymptoms) {
    const { painLevel, rednessLevel, swellingLevel, visualBlur, discharge } = assessment.postOperativeSymptoms;
    if (painLevel > 7) {
      clinicalScore += 15;
      riskFactors.push({ factor: 'Severe post-operative pain', contribution: 15 });
    } else if (painLevel > 4) {
      clinicalScore += 8;
      riskFactors.push({ factor: 'Moderate post-operative pain', contribution: 8 });
    }
    if (rednessLevel > 6) {
      clinicalScore += 12;
      riskFactors.push({ factor: 'Significant ocular redness', contribution: 12 });
    }
    if (swellingLevel > 6) {
      clinicalScore += 10;
      riskFactors.push({ factor: 'Notable periocular swelling', contribution: 10 });
    }
    if (visualBlur) {
      clinicalScore += 8;
      riskFactors.push({ factor: 'Visual blur reported', contribution: 8 });
    }
    if (discharge) {
      clinicalScore += 12;
      riskFactors.push({ factor: 'Ocular discharge present', contribution: 12 });
    }
  }

  // Clinical measurements scoring
  if (assessment.clinicalMeasurements) {
    const { intraocularPressure, cornealClarity, woundIntegrity, anteriorChamberReaction } = assessment.clinicalMeasurements;
    if (intraocularPressure > 25) {
      clinicalScore += 18;
      riskFactors.push({ factor: 'Elevated intraocular pressure', contribution: 18 });
    } else if (intraocularPressure > 21) {
      clinicalScore += 10;
      riskFactors.push({ factor: 'Borderline IOP', contribution: 10 });
    }
    if (cornealClarity === 'opaque') {
      clinicalScore += 15;
      riskFactors.push({ factor: 'Opaque cornea', contribution: 15 });
    }
    if (woundIntegrity === 'concern') {
      clinicalScore += 20;
      riskFactors.push({ factor: 'Wound integrity concern', contribution: 20 });
    }
    if (anteriorChamberReaction === 'severe' || anteriorChamberReaction === 'moderate') {
      clinicalScore += 15;
      riskFactors.push({ factor: 'Significant anterior chamber reaction', contribution: 15 });
    }
  }

  // Media analysis contribution
  const mediaContribution = assessment.mediaAnalysis?.overallMediaRisk || 0;
  if (mediaContribution > 50) {
    riskFactors.push({ factor: 'Visual AI detected abnormalities', contribution: mediaContribution * 0.3 });
  }

  // Calculate total
  const totalScore = Math.min(100, clinicalScore + behavioralScore + mediaContribution * 0.3);
  
  // Sort and get top factors
  const topFactors = riskFactors
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 5);

  return {
    overallRiskScore: Math.round(totalScore),
    riskCategory: totalScore < 30 ? 'low' : totalScore < 60 ? 'medium' : 'high',
    confidenceLevel: Math.round(75 + Math.random() * 20),
    clinicalContribution: Math.round(clinicalScore),
    behavioralContribution: Math.round(behavioralScore),
    mediaContribution: Math.round(mediaContribution * 0.3),
    topRiskFactors: topFactors,
  };
}

// Simulated media analysis
export function analyzeMedia(): MediaAnalysis {
  const rednessScore = Math.round(20 + Math.random() * 60);
  const edemaScore = Math.round(15 + Math.random() * 50);
  const dischargePatternScore = Math.round(10 + Math.random() * 40);
  
  const abnormalCues: string[] = [];
  if (rednessScore > 50) abnormalCues.push('Significant conjunctival injection detected');
  if (edemaScore > 40) abnormalCues.push('Periorbital edema identified');
  if (dischargePatternScore > 30) abnormalCues.push('Discharge pattern analysis flagged');
  if (Math.random() > 0.6) abnormalCues.push('Anterior chamber cloudiness detected');
  if (Math.random() > 0.7) abnormalCues.push('Wound edge irregularity noted');

  return {
    rednessScore,
    edemaScore,
    dischargePatternScore,
    abnormalCues,
    overallMediaRisk: Math.round((rednessScore + edemaScore + dischargePatternScore) / 3),
  };
}

// Generate AI care recommendations
export function generateCareRecommendations(
  assessment: Partial<PatientAssessment>,
  riskAssessment: RiskAssessment
): CareRecommendation[] {
  const recommendations: CareRecommendation[] = [];
  const { riskCategory, topRiskFactors } = riskAssessment;

  // Base recommendations based on risk level
  if (riskCategory === 'high') {
    recommendations.push({
      category: 'Antibiotic Prophylaxis',
      recommendation: 'Consider broad-spectrum topical antibiotic therapy (e.g., fluoroquinolone class) to prevent endophthalmitis risk.',
      rationale: 'Elevated risk profile warrants prophylactic antimicrobial coverage to prevent bacterial colonization.',
      priority: 'urgent',
    });
    recommendations.push({
      category: 'Follow-up Schedule',
      recommendation: 'Schedule daily follow-up examinations for the first 72 hours post-operatively.',
      rationale: 'High-risk patients require close monitoring to detect early signs of complications.',
      priority: 'urgent',
    });
  }

  // Factor-specific recommendations
  topRiskFactors.forEach(factor => {
    if (factor.factor.includes('diabetes')) {
      recommendations.push({
        category: 'Glycemic Optimization',
        recommendation: 'Coordinate with endocrinology for perioperative glycemic control optimization.',
        rationale: 'Poor glycemic control significantly increases infection risk and impairs wound healing.',
        priority: riskCategory === 'high' ? 'urgent' : 'important',
      });
    }
    if (factor.factor.includes('pressure') || factor.factor.includes('IOP')) {
      recommendations.push({
        category: 'IOP Management',
        recommendation: 'Initiate topical IOP-lowering agents (prostaglandin analog or beta-blocker class).',
        rationale: 'Elevated intraocular pressure requires pharmacological management to prevent optic nerve damage.',
        priority: 'urgent',
      });
    }
    if (factor.factor.includes('pain')) {
      recommendations.push({
        category: 'Pain Management',
        recommendation: 'Prescribe topical NSAID drops for inflammation and pain control.',
        rationale: 'Severe pain may indicate significant inflammation requiring anti-inflammatory intervention.',
        priority: 'important',
      });
    }
    if (factor.factor.includes('discharge') || factor.factor.includes('redness')) {
      recommendations.push({
        category: 'Anti-inflammatory Therapy',
        recommendation: 'Consider topical corticosteroid therapy to manage post-operative inflammation.',
        rationale: 'Clinical signs suggest inflammatory response requiring targeted intervention.',
        priority: 'important',
      });
    }
  });

  // General supportive care
  recommendations.push({
    category: 'Lubricating Therapy',
    recommendation: 'Prescribe preservative-free artificial tears for ocular surface protection.',
    rationale: 'Post-operative ocular surface requires lubrication to promote healing and comfort.',
    priority: 'routine',
  });

  if (assessment.surgeryDetails?.complexity === 'complex') {
    recommendations.push({
      category: 'Activity Restrictions',
      recommendation: 'Advise strict activity limitations: no heavy lifting, bending, or strenuous exercise for 2 weeks.',
      rationale: 'Complex surgery requires extended healing time with minimized physical stress.',
      priority: 'important',
    });
  }

  return recommendations.slice(0, 6);
}

// Generate natural language explanation
export function generateExplanation(riskAssessment: RiskAssessment, isSimplified: boolean): string {
  const { riskCategory, overallRiskScore, topRiskFactors } = riskAssessment;
  
  if (isSimplified) {
    const riskText = riskCategory === 'high' 
      ? 'higher than normal' 
      : riskCategory === 'medium' 
      ? 'moderate' 
      : 'relatively low';
    
    const mainFactors = topRiskFactors.slice(0, 3).map(f => f.factor.toLowerCase()).join(', ');
    
    return `This patient has a ${riskText} chance of developing complications after surgery. The main concerns are: ${mainFactors}. ${riskCategory === 'high' ? 'Close monitoring and preventive measures are recommended.' : 'Standard follow-up care is advised.'}`;
  }
  
  let explanation = `Based on multimodal analysis integrating clinical parameters, behavioral risk factors, and visual assessment data, this patient demonstrates a ${riskCategory}-risk profile with an aggregate complication probability of ${overallRiskScore}%.\n\n`;
  
  explanation += `Primary Risk Contributors:\n`;
  topRiskFactors.forEach((factor, index) => {
    explanation += `${index + 1}. ${factor.factor} (${factor.contribution.toFixed(1)}% contribution)\n`;
  });
  
  explanation += `\nThe predictive model incorporates weighted contributions from clinical history (${riskAssessment.clinicalContribution}%), behavioral factors (${riskAssessment.behavioralContribution}%), and media-derived indicators (${riskAssessment.mediaContribution}%). `;
  
  if (riskCategory === 'high') {
    explanation += `Immediate clinical attention and enhanced monitoring protocols are strongly recommended.`;
  } else if (riskCategory === 'medium') {
    explanation += `Vigilant observation with scheduled follow-ups is advised to monitor for early complication indicators.`;
  } else {
    explanation += `Standard post-operative care protocols are appropriate for this risk profile.`;
  }
  
  return explanation;
}

// Generate temporal risk data
export function generateTemporalData(baseRiskScore: number): TemporalDataPoint[] {
  const data: TemporalDataPoint[] = [];
  let currentRisk = baseRiskScore;
  
  [0, 1, 3, 7, 14].forEach((day) => {
    // Risk generally decreases over time with proper care
    const modifier = day === 0 ? 1 : day === 1 ? 0.95 : day === 3 ? 0.85 : day === 7 ? 0.7 : 0.5;
    const variance = (Math.random() - 0.5) * 10;
    const riskScore = Math.max(5, Math.min(95, currentRisk * modifier + variance));
    
    data.push({
      day,
      riskScore: Math.round(riskScore),
      clinicalContribution: Math.round(riskScore * (0.5 + Math.random() * 0.3)),
      mediaContribution: Math.round(riskScore * (0.1 + Math.random() * 0.2)),
      symptoms: {
        painLevel: Math.max(0, Math.round(5 * modifier + Math.random() * 2)),
        rednessLevel: Math.max(0, Math.round(6 * modifier + Math.random() * 2)),
        swellingLevel: Math.max(0, Math.round(4 * modifier + Math.random() * 2)),
        visualBlur: day < 3,
        discharge: day < 2,
        photophobia: day < 7,
      },
    });
    currentRisk = riskScore;
  });
  
  return data;
}

// Hospital analytics mock data
export function getHospitalAnalytics() {
  return {
    totalAssessments: 1247,
    highRiskPercentage: 18,
    averageRiskScore: 42,
    surgeryTypeDistribution: [
      { type: 'Cataract', count: 623, avgRisk: 35 },
      { type: 'LASIK', count: 312, avgRisk: 28 },
      { type: 'Glaucoma', count: 198, avgRisk: 52 },
      { type: 'Retinal', count: 114, avgRisk: 61 },
    ],
    topRiskFactors: [
      { factor: 'Poorly controlled diabetes', frequency: 234 },
      { factor: 'Previous complications', frequency: 189 },
      { factor: 'Advanced age', frequency: 167 },
      { factor: 'Immunocompromised', frequency: 98 },
      { factor: 'Complex surgery', frequency: 87 },
    ],
    mediaDetectedTrends: [
      { week: 'W1', detections: 45 },
      { week: 'W2', detections: 52 },
      { week: 'W3', detections: 38 },
      { week: 'W4', detections: 61 },
    ],
    monthlyTrend: [
      { month: 'Jan', assessments: 98, highRisk: 15 },
      { month: 'Feb', assessments: 112, highRisk: 22 },
      { month: 'Mar', assessments: 105, highRisk: 18 },
      { month: 'Apr', assessments: 134, highRisk: 25 },
      { month: 'May', assessments: 128, highRisk: 21 },
      { month: 'Jun', assessments: 145, highRisk: 28 },
    ],
  };
}
