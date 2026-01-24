import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Activity,
  LayoutDashboard,
  Brain,
  Shield,
  TrendingUp,
  FileCheck,
  Stethoscope,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Multimodal AI Analysis',
    description: 'Combines clinical data, behavioral inputs, and visual analysis for comprehensive risk assessment.',
  },
  {
    icon: TrendingUp,
    title: 'Predictive Intelligence',
    description: 'Advanced algorithms predict post-operative complications before they manifest clinically.',
  },
  {
    icon: FileCheck,
    title: 'Explainable Decisions',
    description: 'Transparent AI explanations help clinicians understand and trust the recommendations.',
  },
  {
    icon: Stethoscope,
    title: 'Personalized Care Plans',
    description: 'AI-generated, patient-specific care guidance and medication category suggestions.',
  },
];

const capabilities = [
  'Adaptive multi-layer patient assessment',
  'Visual AI analysis of post-operative images',
  'Real-time risk scoring (0-100%)',
  'Temporal monitoring across follow-ups',
  'Hospital-wide analytics dashboard',
  'Comprehensive audit trail',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Eye className="w-4 h-4" />
              AI-Powered Clinical Decision Support
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Post-Surgery Eye Complication{' '}
              <span className="text-primary">Risk Intelligence</span> Platform
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Transform reactive treatment into proactive care. Our multimodal AI system predicts, explains, and helps prevent post-operative complications in eye surgery patients.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild variant="medical" size="xl">
                <Link to="/assessment">
                  <Activity className="w-5 h-5" />
                  Start Patient Assessment
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="medicalOutline" size="xl">
                <Link to="/dashboard">
                  <LayoutDashboard className="w-5 h-5" />
                  Hospital Analytics
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="container mx-auto px-4 pb-12">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '95%', label: 'Prediction Accuracy' },
              { value: '40%', label: 'Earlier Detection' },
              { value: '1,247', label: 'Patients Assessed' },
              { value: '24/7', label: 'Real-time Monitoring' },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border p-4 text-center shadow-sm"
              >
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">The Challenge</h2>
                <p className="text-muted-foreground">
                  Post-operative complications in eye surgery can lead to vision loss, extended recovery, and increased healthcare costs. Traditional monitoring relies on scheduled follow-ups, often detecting complications too late for optimal intervention.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                    Delayed detection of endophthalmitis and infection
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                    Inconsistent risk stratification across patients
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                    Reactive rather than preventive care approaches
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Our Solution</h2>
                <p className="text-muted-foreground">
                  Our AI platform integrates clinical data, patient history, and visual analysis to provide real-time risk assessment and personalized care recommendations, enabling early intervention before complications escalate.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    Continuous multimodal risk monitoring
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    Explainable AI for transparent decisions
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    Personalized, evidence-based interventions
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Intelligent Clinical Decision Support
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powered by advanced machine learning models trained on comprehensive ophthalmological data.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Comprehensive Platform Capabilities
              </h2>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {capabilities.map((capability, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-card rounded-lg border border-border p-4"
                >
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">{capability}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Governance */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-card rounded-2xl border border-border p-8 md:p-12">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Shield className="w-8 h-8" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">
                  AI Safety, Ethics & Governance
                </h2>
                <p className="text-muted-foreground">
                  Our platform is built with patient safety and ethical AI principles at its core. All recommendations require human-in-the-loop confirmation, with transparent explanations and comprehensive audit trails.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Human-in-the-loop', 'Bias Awareness', 'Audit Trail', 'HIPAA Compliant'].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to Transform Post-Operative Care?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Begin your first patient assessment and experience the power of predictive AI in ophthalmology.
          </p>
          <Button asChild variant="secondary" size="xl">
            <Link to="/assessment">
              <Activity className="w-5 h-5" />
              Start Patient Assessment
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
