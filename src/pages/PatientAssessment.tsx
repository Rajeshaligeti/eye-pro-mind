import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MedicalCard } from '@/components/MedicalCard';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Heart,
  Eye,
  Scissors,
  Thermometer,
  Activity,
  ArrowLeft,
  ArrowRight,
  Upload,
  Camera,
  FileImage,
  FileText,
  PenLine,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { PatientAssessment } from '@/types/patient';

type InputMethod = 'none' | 'upload' | 'manual';

const steps = [
  { id: 'demographics', label: 'Demographics', icon: User },
  { id: 'systemic', label: 'Systemic History', icon: Heart },
  { id: 'ocular', label: 'Ocular History', icon: Eye },
  { id: 'surgery', label: 'Surgery Details', icon: Scissors },
  { id: 'symptoms', label: 'Post-Op Symptoms', icon: Thermometer },
  { id: 'clinical', label: 'Clinical Measurements', icon: Activity },
  { id: 'media', label: 'Visual Analysis', icon: Camera },
];

export default function PatientAssessment() {
  const navigate = useNavigate();
  const [inputMethod, setInputMethod] = useState<InputMethod>('none');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionNotes, setExtractionNotes] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<PatientAssessment>>({
    demographics: {
      age: 65,
      gender: 'male',
      smokingStatus: 'never',
      occupationalExposure: '',
      residence: 'urban',
    },
    systemicHistory: {
      diabetesDuration: 0,
      diabetesControl: 'well-controlled',
      hypertensionSeverity: 'none',
      autoimmune: false,
      immunocompromised: false,
      steroidUse: false,
    },
    ocularHistory: {
      previousSurgeries: 0,
      chronicConditions: [],
      previousComplications: false,
      contactLensUse: false,
    },
    surgeryDetails: {
      surgeryType: 'cataract',
      complexity: 'routine',
      duration: 30,
      surgeonExperience: 'experienced',
      intraoperativeComplicationType: 'none',
    },
    postOperativeSymptoms: {
      painLevel: 2,
      rednessLevel: 3,
      swellingLevel: 2,
      visualBlur: false,
      discharge: false,
      photophobia: false,
    },
    clinicalMeasurements: {
      intraocularPressure: 16,
      cornealClarity: 'clear',
      woundIntegrity: 'intact',
      anteriorChamberReaction: 'trace',
      inflammationGrade: '0',
      cornealEdemaSeverity: 'none',
    },
    complianceScore: 'good',
    timeSinceSurgery: { value: 1, unit: 'days' },
    followUpTrend: 'stable',
    doctorRiskOverride: 'accept',
    additionalInputs: {},
  });

  const updateFormData = (section: string, field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof PatientAssessment] as object),
        [field]: value,
      },
    }));
  };

  const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    if (!isPdf && !isImage) {
      toast.error('Unsupported file type', { description: 'Please upload a PDF or image file.' });
      return;
    }

    setIsExtracting(true);
    setExtractionNotes(null);

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('extract-report-data', {
        body: { fileBase64: base64, fileType: isPdf ? 'pdf' : 'image' },
      });

      if (error) throw new Error(error.message);

      // Merge extracted values into formData (only non-null values)
      setFormData((prev) => {
        const merged = { ...prev };
        const sections = ['demographics', 'systemicHistory', 'ocularHistory', 'surgeryDetails', 'postOperativeSymptoms', 'clinicalMeasurements'] as const;
        
        for (const section of sections) {
          if (data[section]) {
            const existing = (merged[section] || {}) as Record<string, unknown>;
            const extracted = data[section] as Record<string, unknown>;
            for (const [key, val] of Object.entries(extracted)) {
              if (val !== null && val !== undefined) {
                existing[key] = val;
              }
            }
            (merged as Record<string, unknown>)[section] = existing;
          }
        }

        // Top-level fields
        if (data.complianceScore) merged.complianceScore = data.complianceScore;
        if (data.followUpTrend) merged.followUpTrend = data.followUpTrend;
        if (data.timeSinceSurgery?.value != null && data.timeSinceSurgery?.unit) {
          merged.timeSinceSurgery = data.timeSinceSurgery;
        }

        // Additional inputs (BP/BS)
        if (data.additionalInputs) {
          const ai = data.additionalInputs;
          merged.additionalInputs = {
            ...merged.additionalInputs,
            ...(ai.bloodPressureSystolic != null ? { bloodPressureSystolic: ai.bloodPressureSystolic } : {}),
            ...(ai.bloodPressureDiastolic != null ? { bloodPressureDiastolic: ai.bloodPressureDiastolic } : {}),
            ...(ai.bloodSugar != null ? { bloodSugar: ai.bloodSugar } : {}),
          };
        }

        return merged;
      });

      const confidence = data.extractionConfidence ?? 0;
      const notes = data.extractionNotes || '';
      setExtractionNotes(notes);

      toast.success(`Report extracted (${confidence}% confidence)`, {
        description: 'Review and complete any missing fields below.',
      });

      // Move to step 0 so user can review
      setCurrentStep(0);
    } catch (err) {
      console.error('Extraction failed:', err);
      toast.error('Report extraction failed', {
        description: 'You can still enter data manually below.',
      });
      setCurrentStep(0);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      sessionStorage.setItem('patientAssessment', JSON.stringify(formData));
      sessionStorage.setItem('uploadedImage', uploadedImage || '');
      navigate('/results');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Input method selection screen
  if (inputMethod === 'none') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Patient Risk Assessment
          </h1>
          <p className="text-muted-foreground">
            Choose how you'd like to enter clinical data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button onClick={() => setInputMethod('upload')} className="text-left">
            <MedicalCard className="cursor-pointer hover:border-primary/50 transition-colors h-full">
              <div className="flex flex-col items-center text-center space-y-4 py-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Upload Medical Report</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a PDF or image-based post-operative report. AI will extract clinical values and pre-fill the form.
                </p>
                <div className="text-xs text-muted-foreground">Supports PDF, JPEG, PNG</div>
              </div>
            </MedicalCard>
          </button>

          <button onClick={() => setInputMethod('manual')} className="text-left">
            <MedicalCard className="cursor-pointer hover:border-primary/50 transition-colors h-full">
              <div className="flex flex-col items-center text-center space-y-4 py-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <PenLine className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Manual Data Entry</h3>
                <p className="text-sm text-muted-foreground">
                  Enter all clinical data manually using the step-by-step assessment form.
                </p>
                <div className="text-xs text-muted-foreground">7 assessment steps</div>
              </div>
            </MedicalCard>
          </button>
        </div>
      </div>
    );
  }

  // Report upload screen (before entering form steps)
  if (inputMethod === 'upload' && isExtracting) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Extracting Clinical Data...</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            AI is reading your medical report and extracting clinical values. This may take a few seconds.
          </p>
          <Progress value={50} className="h-2 max-w-xs mx-auto" />
        </div>
      </div>
    );
  }

  if (inputMethod === 'upload' && currentStep === 0 && !extractionNotes && !isExtracting) {
    // Show upload area first before extraction
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button variant="outline" onClick={() => setInputMethod('none')} className="mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Selection
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Upload Medical Report
          </h1>
          <p className="text-muted-foreground">
            Upload a post-operative report and AI will extract available clinical data.
          </p>
        </div>

        <MedicalCard title="Upload Report" icon={<FileText className="w-5 h-5" />}>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Drag & drop your report here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
              </div>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleReportUpload}
                className="hidden"
                id="report-upload"
              />
              <Button asChild variant="outline">
                <label htmlFor="report-upload" className="cursor-pointer">
                  <FileImage className="w-4 h-4 mr-2" />
                  Browse Files
                </label>
              </Button>
              <p className="text-xs text-muted-foreground">Supported: PDF, JPEG, PNG</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Or{' '}
              <button
                className="text-primary underline hover:text-primary/80"
                onClick={() => { setInputMethod('manual'); setCurrentStep(0); }}
              >
                skip and enter data manually
              </button>
            </p>
          </div>
        </MedicalCard>
      </div>
    );
  }

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderAdditionalInputs = () => (
    <div className="space-y-4 p-4 bg-secondary/30 rounded-lg mt-6">
      <h4 className="text-sm font-semibold text-foreground">Additional Clinical Inputs (Optional)</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Blood Pressure - Systolic (mmHg)</Label>
          <Input
            type="number"
            placeholder="e.g. 120"
            value={formData.additionalInputs?.bloodPressureSystolic ?? ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value) : undefined;
              setFormData((prev) => ({
                ...prev,
                additionalInputs: { ...prev.additionalInputs, bloodPressureSystolic: val },
              }));
            }}
            min={60}
            max={250}
          />
        </div>
        <div className="space-y-2">
          <Label>Blood Pressure - Diastolic (mmHg)</Label>
          <Input
            type="number"
            placeholder="e.g. 80"
            value={formData.additionalInputs?.bloodPressureDiastolic ?? ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value) : undefined;
              setFormData((prev) => ({
                ...prev,
                additionalInputs: { ...prev.additionalInputs, bloodPressureDiastolic: val },
              }));
            }}
            min={30}
            max={150}
          />
        </div>
        <div className="space-y-2">
          <Label>Blood Sugar (mg/dL)</Label>
          <Input
            type="number"
            placeholder="e.g. 110"
            value={formData.additionalInputs?.bloodSugar ?? ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value) : undefined;
              setFormData((prev) => ({
                ...prev,
                additionalInputs: { ...prev.additionalInputs, bloodSugar: val },
              }));
            }}
            min={30}
            max={600}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        These are supplementary inputs and will not replace any existing clinical parameters.
      </p>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Demographics
        return (
          <div className="space-y-6">
            {extractionNotes && (
              <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg text-sm text-primary">
                📄 <strong>Report extracted.</strong> {extractionNotes} — Review and correct values below.
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Patient Age</Label>
                <Input
                  type="number"
                  value={formData.demographics?.age}
                  onChange={(e) =>
                    updateFormData('demographics', 'age', parseInt(e.target.value))
                  }
                  min={1}
                  max={120}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={formData.demographics?.gender}
                  onValueChange={(v) => updateFormData('demographics', 'gender', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Smoking Status</Label>
                <RadioGroup
                  value={formData.demographics?.smokingStatus}
                  onValueChange={(v) => updateFormData('demographics', 'smokingStatus', v)}
                  className="flex flex-wrap gap-4"
                >
                  {['never', 'former', 'current'].map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <RadioGroupItem value={status} id={`smoking-${status}`} />
                      <Label htmlFor={`smoking-${status}`} className="capitalize">
                        {status}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Residence Type</Label>
                <RadioGroup
                  value={formData.demographics?.residence}
                  onValueChange={(v) => updateFormData('demographics', 'residence', v)}
                  className="flex gap-4"
                >
                  {['urban', 'rural'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={`residence-${type}`} />
                      <Label htmlFor={`residence-${type}`} className="capitalize">
                        {type}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label>Occupational Exposure</Label>
                <Input
                  placeholder="e.g., dust, chemicals, UV light"
                  value={formData.demographics?.occupationalExposure}
                  onChange={(e) =>
                    updateFormData('demographics', 'occupationalExposure', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        );

      case 1: // Systemic History
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Diabetes Duration (years)</Label>
                <Input
                  type="number"
                  value={formData.systemicHistory?.diabetesDuration}
                  onChange={(e) =>
                    updateFormData('systemicHistory', 'diabetesDuration', parseInt(e.target.value))
                  }
                  min={0}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Diabetes Control</Label>
                <Select
                  value={formData.systemicHistory?.diabetesControl}
                  onValueChange={(v) => updateFormData('systemicHistory', 'diabetesControl', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="well-controlled">Well Controlled</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Hypertension Severity</Label>
                <Select
                  value={formData.systemicHistory?.hypertensionSeverity}
                  onValueChange={(v) => updateFormData('systemicHistory', 'hypertensionSeverity', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Additional Conditions</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { field: 'autoimmune', label: 'Autoimmune Disorder' },
                  { field: 'immunocompromised', label: 'Immunocompromised' },
                  { field: 'steroidUse', label: 'Long-term Steroid Use' },
                ].map(({ field, label }) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={formData.systemicHistory?.[field as keyof typeof formData.systemicHistory] as boolean}
                      onCheckedChange={(checked) =>
                        updateFormData('systemicHistory', field, checked)
                      }
                    />
                    <Label htmlFor={field}>{label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2: // Ocular History
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Previous Eye Surgeries</Label>
                <Input
                  type="number"
                  value={formData.ocularHistory?.previousSurgeries}
                  onChange={(e) =>
                    updateFormData('ocularHistory', 'previousSurgeries', parseInt(e.target.value))
                  }
                  min={0}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>History & Conditions</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { field: 'previousComplications', label: 'Previous Post-Operative Complications' },
                  { field: 'contactLensUse', label: 'Contact Lens Use' },
                ].map(({ field, label }) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={formData.ocularHistory?.[field as keyof typeof formData.ocularHistory] as boolean}
                      onCheckedChange={(checked) =>
                        updateFormData('ocularHistory', field, checked)
                      }
                    />
                    <Label htmlFor={field}>{label}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Chronic Eye Conditions</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Glaucoma', 'Dry Eye', 'Uveitis', 'Macular Degeneration', 'Diabetic Retinopathy', 'Keratitis'].map(
                  (condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        id={condition}
                        checked={formData.ocularHistory?.chronicConditions?.includes(condition)}
                        onCheckedChange={(checked) => {
                          const current = formData.ocularHistory?.chronicConditions || [];
                          const updated = checked
                            ? [...current, condition]
                            : current.filter((c) => c !== condition);
                          updateFormData('ocularHistory', 'chronicConditions', updated);
                        }}
                      />
                      <Label htmlFor={condition} className="text-sm">
                        {condition}
                      </Label>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        );

      case 3: // Surgery Details
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Surgery Type</Label>
                <Select
                  value={formData.surgeryDetails?.surgeryType}
                  onValueChange={(v) => updateFormData('surgeryDetails', 'surgeryType', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cataract">Cataract Surgery</SelectItem>
                    <SelectItem value="lasik">LASIK</SelectItem>
                    <SelectItem value="glaucoma">Glaucoma Surgery</SelectItem>
                    <SelectItem value="retinal">Retinal Surgery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Surgery Complexity</Label>
                <Select
                  value={formData.surgeryDetails?.complexity}
                  onValueChange={(v) => updateFormData('surgeryDetails', 'complexity', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="complex">Complex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Surgery Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.surgeryDetails?.duration}
                  onChange={(e) =>
                    updateFormData('surgeryDetails', 'duration', parseInt(e.target.value))
                  }
                  min={10}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Surgeon Experience</Label>
                <Select
                  value={formData.surgeryDetails?.surgeonExperience}
                  onValueChange={(v) => updateFormData('surgeryDetails', 'surgeonExperience', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior (&lt;5 years)</SelectItem>
                    <SelectItem value="experienced">Experienced (5-15 years)</SelectItem>
                    <SelectItem value="expert">Expert (&gt;15 years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label>Intraoperative Complication Type</Label>
              <Select
                value={formData.surgeryDetails?.intraoperativeComplicationType}
                onValueChange={(v) => updateFormData('surgeryDetails', 'intraoperativeComplicationType', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="posterior-capsule-rupture">Posterior Capsule Rupture</SelectItem>
                  <SelectItem value="zonular-weakness">Zonular Weakness</SelectItem>
                  <SelectItem value="vitreous-loss">Vitreous Loss</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4: // Post-Op Symptoms
        return (
          <div className="space-y-8">
            <p className="text-sm text-muted-foreground">
              Rate the severity of symptoms observed in the first 72 hours post-surgery.
            </p>
            
            {[
              { field: 'painLevel', label: 'Pain Level' },
              { field: 'rednessLevel', label: 'Redness Level' },
              { field: 'swellingLevel', label: 'Swelling Level' },
            ].map(({ field, label }) => (
              <div key={field} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{label}</Label>
                  <span className="text-lg font-semibold text-primary">
                    {formData.postOperativeSymptoms?.[field as keyof typeof formData.postOperativeSymptoms] as number}/10
                  </span>
                </div>
                <Slider
                  value={[formData.postOperativeSymptoms?.[field as keyof typeof formData.postOperativeSymptoms] as number || 0]}
                  onValueChange={(v) =>
                    updateFormData('postOperativeSymptoms', field, v[0])
                  }
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>None</span>
                  <span>Severe</span>
                </div>
              </div>
            ))}
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {[
                { field: 'visualBlur', label: 'Visual Blur' },
                { field: 'discharge', label: 'Ocular Discharge' },
                { field: 'photophobia', label: 'Photophobia' },
              ].map(({ field, label }) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={formData.postOperativeSymptoms?.[field as keyof typeof formData.postOperativeSymptoms] as boolean}
                    onCheckedChange={(checked) =>
                      updateFormData('postOperativeSymptoms', field, checked)
                    }
                  />
                  <Label htmlFor={field}>{label}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 5: // Clinical Measurements
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Intraocular Pressure (mmHg)</Label>
                <Input
                  type="number"
                  value={formData.clinicalMeasurements?.intraocularPressure}
                  onChange={(e) =>
                    updateFormData('clinicalMeasurements', 'intraocularPressure', parseInt(e.target.value))
                  }
                  min={5}
                  max={60}
                />
                <p className="text-xs text-muted-foreground">Normal range: 10-21 mmHg</p>
              </div>
              
              <div className="space-y-2">
                <Label>Corneal Clarity</Label>
                <Select
                  value={formData.clinicalMeasurements?.cornealClarity}
                  onValueChange={(v) => updateFormData('clinicalMeasurements', 'cornealClarity', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clear">Clear</SelectItem>
                    <SelectItem value="mild-haze">Mild Haze</SelectItem>
                    <SelectItem value="moderate-haze">Moderate Haze</SelectItem>
                    <SelectItem value="opaque">Opaque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Wound Integrity</Label>
                <Select
                  value={formData.clinicalMeasurements?.woundIntegrity}
                  onValueChange={(v) => updateFormData('clinicalMeasurements', 'woundIntegrity', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intact">Intact</SelectItem>
                    <SelectItem value="minor-issue">Minor Issue</SelectItem>
                    <SelectItem value="concern">Concern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Anterior Chamber Reaction</Label>
                <Select
                  value={formData.clinicalMeasurements?.anteriorChamberReaction}
                  onValueChange={(v) => updateFormData('clinicalMeasurements', 'anteriorChamberReaction', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="trace">Trace</SelectItem>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Inflammation Grade (AC Cells & Flare)</Label>
                <Select
                  value={formData.clinicalMeasurements?.inflammationGrade}
                  onValueChange={(v) => updateFormData('clinicalMeasurements', 'inflammationGrade', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Grade 0</SelectItem>
                    <SelectItem value="1+">Grade 1+</SelectItem>
                    <SelectItem value="2+">Grade 2+</SelectItem>
                    <SelectItem value="3+">Grade 3+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Corneal Edema Severity</Label>
                <Select
                  value={formData.clinicalMeasurements?.cornealEdemaSeverity}
                  onValueChange={(v) => updateFormData('clinicalMeasurements', 'cornealEdemaSeverity', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Time Since Surgery</Label>
                <div className="flex gap-3">
                  <Input
                    type="number"
                    value={formData.timeSinceSurgery?.value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        timeSinceSurgery: { ...prev.timeSinceSurgery!, value: parseInt(e.target.value) || 0 },
                      }))
                    }
                    min={0}
                    className="flex-1"
                  />
                  <Select
                    value={formData.timeSinceSurgery?.unit}
                    onValueChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        timeSinceSurgery: { ...prev.timeSinceSurgery!, unit: v as 'hours' | 'days' },
                      }))
                    }
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Clinical Inputs - BP & BS */}
            {renderAdditionalInputs()}
          </div>
        );

      case 6: // Media Upload
        return (
          <div className="space-y-6">
            {/* Compliance & Follow-Up Trend */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-secondary/30 rounded-lg">
              <div className="space-y-3">
                <Label className="font-medium">Patient Compliance Score</Label>
                <RadioGroup
                  value={formData.complianceScore}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, complianceScore: v as 'good' | 'moderate' | 'poor' }))
                  }
                  className="flex flex-wrap gap-4"
                >
                  {(['good', 'moderate', 'poor'] as const).map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <RadioGroupItem value={level} id={`compliance-${level}`} />
                      <Label htmlFor={`compliance-${level}`} className="capitalize">{level}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {formData.complianceScore === 'poor' && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                    ⚠️ Low compliance can worsen outcomes even in otherwise low-risk patients.
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="font-medium">Follow-Up Trend</Label>
                <RadioGroup
                  value={formData.followUpTrend}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, followUpTrend: v as 'improving' | 'stable' | 'worsening' }))
                  }
                  className="flex flex-wrap gap-4"
                >
                  {(['improving', 'stable', 'worsening'] as const).map((trend) => (
                    <div key={trend} className="flex items-center space-x-2">
                      <RadioGroupItem value={trend} id={`trend-${trend}`} />
                      <Label htmlFor={`trend-${trend}`} className="capitalize">{trend}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <p className="text-muted-foreground">
              Upload post-operative eye images for AI visual analysis. The system will analyze
              for signs of redness, edema, discharge patterns, and other visual abnormalities.
            </p>
            
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              {uploadedImage ? (
                <div className="space-y-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded eye"
                    className="max-w-full max-h-64 mx-auto rounded-lg"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setUploadedImage(null)}
                  >
                    Remove & Upload Different Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Drag & drop eye images here
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click to browse files
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <div className="flex items-center justify-center gap-4">
                    <Button asChild variant="outline">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <FileImage className="w-4 h-4 mr-2" />
                        Browse Files
                      </label>
                    </Button>
                    <Button variant="outline">
                      <Camera className="w-4 h-4 mr-2" />
                      Use Camera
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-secondary/50 rounded-lg p-4 text-sm text-muted-foreground">
              <strong className="text-foreground">Supported formats:</strong> JPEG, PNG, HEIC
              <br />
              <strong className="text-foreground">For best results:</strong> Ensure good lighting and focus on the affected eye area.
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Patient Risk Assessment
        </h1>
        <p className="text-muted-foreground">
          {inputMethod === 'upload'
            ? 'Review extracted data and complete any missing fields.'
            : 'Complete the multi-layer assessment for comprehensive complication risk analysis.'}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
        
        {/* Step indicators */}
        <div className="hidden md:flex items-center justify-between mt-4">
          {steps.map((step, i) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(i)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                i === currentStep
                  ? 'text-primary'
                  : i < currentStep
                  ? 'text-success'
                  : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  i === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : i < currentStep
                    ? 'bg-success text-success-foreground'
                    : 'bg-secondary'
                }`}
              >
                <step.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium hidden lg:block">{step.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <MedicalCard
        title={steps[currentStep].label}
        icon={(() => {
          const Icon = steps[currentStep].icon;
          return <Icon className="w-5 h-5" />;
        })()}
      >
        {renderStepContent()}
      </MedicalCard>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? () => setInputMethod('none') : handleBack}
        >
          <ArrowLeft className="w-4 h-4" />
          {currentStep === 0 ? 'Change Method' : 'Back'}
        </Button>
        
        <Button variant="medical" onClick={handleNext}>
          {currentStep === steps.length - 1 ? (
            <>
              Analyze Risk
              <Activity className="w-4 h-4" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
