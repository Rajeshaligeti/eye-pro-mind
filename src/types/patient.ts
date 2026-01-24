export interface PatientDemographics {
  age: number;
  gender: 'male' | 'female' | 'other';
  smokingStatus: 'never' | 'former' | 'current';
  occupationalExposure: string;
  residence: 'urban' | 'rural';
}

export interface SystemicHistory {
  diabetesDuration: number;
  diabetesControl: 'well-controlled' | 'moderate' | 'poor';
  hypertensionSeverity: 'none' | 'mild' | 'moderate' | 'severe';
  autoimmune: boolean;
  immunocompromised: boolean;
  steroidUse: boolean;
}

export interface OcularHistory {
  previousSurgeries: number;
  chronicConditions: string[];
  previousComplications: boolean;
  contactLensUse: boolean;
}

export interface SurgeryDetails {
  surgeryType: 'cataract' | 'lasik' | 'glaucoma' | 'retinal';
  complexity: 'routine' | 'moderate' | 'complex';
  duration: number;
  surgeonExperience: 'junior' | 'experienced' | 'expert';
  intraoperativeIssues: boolean;
}

export interface PostOperativeSymptoms {
  painLevel: number;
  rednessLevel: number;
  swellingLevel: number;
  visualBlur: boolean;
  discharge: boolean;
  photophobia: boolean;
}

export interface ClinicalMeasurements {
  intraocularPressure: number;
  cornealClarity: 'clear' | 'mild-haze' | 'moderate-haze' | 'opaque';
  woundIntegrity: 'intact' | 'minor-issue' | 'concern';
  anteriorChamberReaction: 'none' | 'trace' | 'mild' | 'moderate' | 'severe';
}

export interface MediaAnalysis {
  rednessScore: number;
  edemaScore: number;
  dischargePatternScore: number;
  abnormalCues: string[];
  overallMediaRisk: number;
}

export interface RiskAssessment {
  overallRiskScore: number;
  riskCategory: 'low' | 'medium' | 'high';
  confidenceLevel: number;
  clinicalContribution: number;
  behavioralContribution: number;
  mediaContribution: number;
  topRiskFactors: { factor: string; contribution: number; }[];
}

export interface CareRecommendation {
  category: string;
  recommendation: string;
  rationale: string;
  priority: 'routine' | 'important' | 'urgent';
}

export interface PatientAssessment {
  id: string;
  createdAt: Date;
  demographics: PatientDemographics;
  systemicHistory: SystemicHistory;
  ocularHistory: OcularHistory;
  surgeryDetails: SurgeryDetails;
  postOperativeSymptoms: PostOperativeSymptoms;
  clinicalMeasurements: ClinicalMeasurements;
  mediaAnalysis?: MediaAnalysis;
  riskAssessment?: RiskAssessment;
  careRecommendations?: CareRecommendation[];
}

export interface TemporalDataPoint {
  day: number;
  riskScore: number;
  clinicalContribution: number;
  mediaContribution: number;
  symptoms: PostOperativeSymptoms;
}
