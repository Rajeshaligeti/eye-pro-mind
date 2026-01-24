import { MedicalCard } from '@/components/MedicalCard';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  FileSearch,
  UserCheck,
  Lock,
  Eye,
  Scale,
  History,
} from 'lucide-react';

const principles = [
  {
    icon: UserCheck,
    title: 'Human-in-the-Loop',
    description:
      'All AI-generated recommendations require explicit clinician confirmation before any clinical action is taken. The system assists but never replaces human judgment.',
  },
  {
    icon: AlertTriangle,
    title: 'Bias Awareness',
    description:
      'We acknowledge potential biases in training data and model outputs. Regular audits are conducted to identify and mitigate algorithmic bias across demographic groups.',
  },
  {
    icon: FileSearch,
    title: 'Transparency & Explainability',
    description:
      'Every risk assessment includes detailed explanations of contributing factors, enabling clinicians to understand and validate AI reasoning.',
  },
  {
    icon: Lock,
    title: 'Data Privacy',
    description:
      'Patient data is processed in compliance with HIPAA and other healthcare regulations. No patient identifiable information is stored permanently.',
  },
  {
    icon: History,
    title: 'Audit Trail',
    description:
      'Complete logging of all system interactions, predictions, and clinical decisions for accountability and quality improvement.',
  },
  {
    icon: Scale,
    title: 'Regulatory Compliance',
    description:
      'The system is designed to meet FDA guidelines for clinical decision support software and follows IEC 62304 software lifecycle requirements.',
  },
];

const limitations = [
  'AI predictions are based on statistical patterns and may not capture all individual patient nuances',
  'Media analysis accuracy depends on image quality and proper capture technique',
  'The system has not been validated for pediatric populations',
  'Risk scores should be interpreted alongside complete clinical evaluation',
  'Real-time symptom changes may not be reflected until reassessment',
  'Cultural and socioeconomic factors may not be fully represented in the model',
];

export default function AIGovernance() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              AI Safety, Ethics & Governance
            </h1>
            <p className="text-muted-foreground">
              Our commitment to responsible AI in healthcare
            </p>
          </div>
        </div>
      </div>

      {/* Core Principles */}
      <MedicalCard title="Core Principles" className="mb-8">
        <div className="grid md:grid-cols-2 gap-6">
          {principles.map((principle, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <principle.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{principle.title}</h3>
                <p className="text-sm text-muted-foreground">{principle.description}</p>
              </div>
            </div>
          ))}
        </div>
      </MedicalCard>

      {/* Limitations */}
      <MedicalCard
        title="Known Limitations"
        icon={<Eye className="w-5 h-5" />}
        className="mb-8"
      >
        <p className="text-muted-foreground mb-4">
          We believe in transparent communication about system limitations:
        </p>
        <ul className="space-y-3">
          {limitations.map((limitation, i) => (
            <li key={i} className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">{limitation}</span>
            </li>
          ))}
        </ul>
      </MedicalCard>

      {/* Quality Assurance */}
      <MedicalCard title="Quality Assurance Process" className="mb-8">
        <div className="space-y-4">
          {[
            { step: 1, title: 'Data Validation', description: 'Input data is validated against clinical standards before processing' },
            { step: 2, title: 'Model Inference', description: 'AI models process validated data through ensemble learning approach' },
            { step: 3, title: 'Uncertainty Quantification', description: 'Confidence intervals are calculated for all predictions' },
            { step: 4, title: 'Clinical Review', description: 'Recommendations are presented for clinician review and confirmation' },
            { step: 5, title: 'Outcome Tracking', description: 'Actual outcomes are monitored to continuously improve model accuracy' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h4 className="font-medium text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </MedicalCard>

      {/* Disclaimer */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground mb-2">Important Disclaimer</h3>
            <p className="text-sm text-muted-foreground">
              This system is intended for clinical decision support only and should not be used as the sole basis for diagnosis or treatment decisions. All AI-generated recommendations must be reviewed and validated by qualified healthcare professionals. This platform is designed for demonstration purposes and has not received regulatory clearance for clinical use. The predictions and recommendations do not constitute medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
