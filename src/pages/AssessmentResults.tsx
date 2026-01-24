import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MedicalCard } from '@/components/MedicalCard';
import { RiskBadge } from '@/components/RiskBadge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertTriangle,
  Brain,
  Lightbulb,
  Pill,
  TrendingUp,
  Eye,
  FileDown,
  ArrowLeft,
  CheckCircle,
  Camera,
  Activity,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import type { PatientAssessment, RiskAssessment, CareRecommendation, MediaAnalysis, TemporalDataPoint } from '@/types/patient';
import {
  calculateRiskScore,
  analyzeMedia,
  generateCareRecommendations,
  generateExplanation,
  generateTemporalData,
} from '@/lib/mockAI';

export default function AssessmentResults() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [assessment, setAssessment] = useState<Partial<PatientAssessment> | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [mediaAnalysis, setMediaAnalysis] = useState<MediaAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<CareRecommendation[]>([]);
  const [temporalData, setTemporalData] = useState<TemporalDataPoint[]>([]);
  const [isSimplifiedView, setIsSimplifiedView] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [humanConfirmed, setHumanConfirmed] = useState(false);

  const processAssessment = useCallback(() => {
    const storedData = sessionStorage.getItem('patientAssessment');
    const storedImage = sessionStorage.getItem('uploadedImage');
    
    if (!storedData) {
      navigate('/assessment');
      return;
    }

    const data = JSON.parse(storedData) as Partial<PatientAssessment>;
    setAssessment(data);
    setUploadedImage(storedImage || null);

    // Simulate AI processing delay
    setTimeout(() => {
      // Generate media analysis if image was uploaded
      const media = storedImage ? analyzeMedia() : null;
      setMediaAnalysis(media);

      // Calculate risk with media data
      const dataWithMedia = media ? { ...data, mediaAnalysis: media } : data;
      const risk = calculateRiskScore(dataWithMedia);
      setRiskAssessment(risk);

      // Generate recommendations
      const recs = generateCareRecommendations(dataWithMedia, risk);
      setRecommendations(recs);

      // Generate temporal data
      const temporal = generateTemporalData(risk.overallRiskScore);
      setTemporalData(temporal);

      setIsLoading(false);
    }, 2000);
  }, [navigate]);

  useEffect(() => {
    processAssessment();
  }, [processAssessment]);

  const handleExport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      assessment,
      riskAssessment,
      mediaAnalysis,
      recommendations,
      humanConfirmed,
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-risk-report-${Date.now()}.json`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
            <Brain className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Analyzing Patient Data...</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Our multimodal AI is processing clinical data, behavioral factors, and visual inputs to generate a comprehensive risk assessment.
          </p>
          <div className="max-w-xs mx-auto space-y-2">
            <Progress value={66} className="h-2" />
            <p className="text-sm text-muted-foreground">Processing clinical indicators...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!riskAssessment) return null;

  const explanation = generateExplanation(riskAssessment, isSimplifiedView);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Risk Assessment Results
          </h1>
          <p className="text-muted-foreground">
            Comprehensive analysis completed at {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/assessment')}>
            <ArrowLeft className="w-4 h-4" />
            New Assessment
          </Button>
          <Button variant="medical" onClick={handleExport}>
            <FileDown className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Risk Score Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <MedicalCard className="md:col-span-2">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                riskAssessment.riskCategory === 'high'
                  ? 'bg-destructive/10'
                  : riskAssessment.riskCategory === 'medium'
                  ? 'bg-warning/10'
                  : 'bg-success/10'
              }`}>
                <div className="text-center">
                  <span className={`text-4xl font-bold ${
                    riskAssessment.riskCategory === 'high'
                      ? 'text-destructive'
                      : riskAssessment.riskCategory === 'medium'
                      ? 'text-warning'
                      : 'text-success'
                  }`}>
                    {riskAssessment.overallRiskScore}%
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">Risk Score</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <RiskBadge level={riskAssessment.riskCategory} size="lg" />
                <span className="text-sm text-muted-foreground">
                  Confidence: {riskAssessment.confidenceLevel}%
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold text-primary">{riskAssessment.clinicalContribution}%</p>
                  <p className="text-xs text-muted-foreground">Clinical Factors</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">{riskAssessment.behavioralContribution}%</p>
                  <p className="text-xs text-muted-foreground">Behavioral Factors</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-chart-3">{riskAssessment.mediaContribution}%</p>
                  <p className="text-xs text-muted-foreground">Media Analysis</p>
                </div>
              </div>
            </div>
          </div>
        </MedicalCard>

        {/* Human Confirmation */}
        <MedicalCard>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-6 h-6 ${humanConfirmed ? 'text-success' : 'text-warning'}`} />
              <h3 className="font-semibold text-foreground">Clinical Review Required</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              AI recommendations require human-in-the-loop confirmation before clinical action.
            </p>
            <Button
              variant={humanConfirmed ? 'success' : 'warning'}
              className="w-full"
              onClick={() => setHumanConfirmed(true)}
            >
              {humanConfirmed ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Clinician Confirmed
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Confirm Review
                </>
              )}
            </Button>
          </div>
        </MedicalCard>
      </div>

      {/* Media Analysis */}
      {mediaAnalysis && uploadedImage && (
        <MedicalCard
          title="Visual AI Analysis"
          icon={<Camera className="w-5 h-5" />}
          className="mb-8"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <img
                src={uploadedImage}
                alt="Post-operative eye"
                className="rounded-lg w-full max-h-64 object-cover"
              />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Redness', value: mediaAnalysis.rednessScore },
                  { label: 'Edema', value: mediaAnalysis.edemaScore },
                  { label: 'Discharge', value: mediaAnalysis.dischargePatternScore },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-3 bg-secondary rounded-lg">
                    <p className="text-2xl font-bold text-foreground">{value}%</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              
              {mediaAnalysis.abnormalCues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Detected Findings:</h4>
                  <ul className="space-y-1">
                    {mediaAnalysis.abnormalCues.map((cue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                        {cue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </MedicalCard>
      )}

      {/* Explainable AI Panel */}
      <MedicalCard
        title="Why is this patient at risk?"
        icon={<Lightbulb className="w-5 h-5" />}
        className="mb-8"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="view-toggle">Clinician View</Label>
            <Switch
              id="view-toggle"
              checked={isSimplifiedView}
              onCheckedChange={setIsSimplifiedView}
            />
            <Label htmlFor="view-toggle">Simplified View</Label>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-foreground whitespace-pre-line">{explanation}</p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Top Risk Contributors</h4>
            <div className="space-y-3">
              {riskAssessment.topRiskFactors.map((factor, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{factor.factor}</span>
                    <span className="text-sm font-medium text-primary">{factor.contribution.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, factor.contribution * 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MedicalCard>

      {/* Care Recommendations */}
      <MedicalCard
        title="AI-Generated Care Guidance"
        icon={<Pill className="w-5 h-5" />}
        className="mb-8"
      >
        <div className="grid md:grid-cols-2 gap-4">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className={`rounded-lg border p-4 ${
                rec.priority === 'urgent'
                  ? 'border-destructive/30 bg-destructive/5'
                  : rec.priority === 'important'
                  ? 'border-warning/30 bg-warning/5'
                  : 'border-border bg-secondary/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  rec.priority === 'urgent'
                    ? 'bg-destructive'
                    : rec.priority === 'important'
                    ? 'bg-warning'
                    : 'bg-muted-foreground'
                }`} />
                <div className="space-y-1">
                  <h4 className="font-semibold text-foreground">{rec.category}</h4>
                  <p className="text-sm text-foreground">{rec.recommendation}</p>
                  <p className="text-xs text-muted-foreground italic">{rec.rationale}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </MedicalCard>

      {/* Temporal Monitoring */}
      <MedicalCard
        title="Temporal Risk Monitoring"
        icon={<TrendingUp className="w-5 h-5" />}
        className="mb-8"
      >
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Projected risk trajectory based on typical post-operative recovery patterns.
          </p>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={temporalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  tickFormatter={(v) => `Day ${v}`}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Risk Score']}
                  labelFormatter={(label) => `Day ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="riskScore"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="clinicalContribution"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-6 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-primary" />
              <span className="text-muted-foreground">Overall Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-chart-2" style={{ borderStyle: 'dashed' }} />
              <span className="text-muted-foreground">Clinical Contribution</span>
            </div>
          </div>
        </div>
      </MedicalCard>

      {/* Audit Trail */}
      <MedicalCard
        title="Assessment Audit Trail"
        icon={<Clock className="w-5 h-5" />}
      >
        <div className="space-y-3">
          {[
            { time: '0:00', action: 'Assessment initiated', status: 'complete' },
            { time: '0:15', action: 'Demographics captured', status: 'complete' },
            { time: '0:45', action: 'Clinical data processed', status: 'complete' },
            { time: '1:30', action: 'Media analysis completed', status: mediaAnalysis ? 'complete' : 'skipped' },
            { time: '2:00', action: 'Risk calculation executed', status: 'complete' },
            { time: '2:05', action: 'Recommendations generated', status: 'complete' },
            { time: 'Current', action: 'Awaiting clinical confirmation', status: humanConfirmed ? 'complete' : 'pending' },
          ].map((entry, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground w-16">{entry.time}</span>
              <div className={`w-2 h-2 rounded-full ${
                entry.status === 'complete'
                  ? 'bg-success'
                  : entry.status === 'pending'
                  ? 'bg-warning animate-pulse'
                  : 'bg-muted'
              }`} />
              <span className="text-sm text-foreground">{entry.action}</span>
            </div>
          ))}
        </div>
      </MedicalCard>
    </div>
  );
}
