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
} from 'lucide-react';
import type { PatientAssessment } from '@/types/patient';

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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Store form data and navigate to results
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

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Demographics
        return (
          <div className="space-y-6">
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
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="intraoperativeIssues"
                checked={formData.surgeryDetails?.intraoperativeIssues}
                onCheckedChange={(checked) =>
                  updateFormData('surgeryDetails', 'intraoperativeIssues', checked)
                }
              />
              <Label htmlFor="intraoperativeIssues">
                Intraoperative Issues Encountered
              </Label>
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
            </div>
          </div>
        );

      case 6: // Media Upload
        return (
          <div className="space-y-6">
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
          Complete the multi-layer assessment for comprehensive complication risk analysis.
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
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
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
