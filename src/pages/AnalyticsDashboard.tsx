import { MedicalCard } from '@/components/MedicalCard';
import { StatCard } from '@/components/StatCard';
import {
  Activity,
  Users,
  AlertTriangle,
  TrendingUp,
  Eye,
  Brain,
  Scissors,
  Camera,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { getHospitalAnalytics } from '@/lib/mockAI';

const COLORS = ['hsl(217, 91%, 40%)', 'hsl(199, 89%, 48%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

export default function AnalyticsDashboard() {
  const analytics = getHospitalAnalytics();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Hospital Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Aggregated insights from patient risk assessments across the healthcare system.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Assessments"
          value={analytics.totalAssessments.toLocaleString()}
          subtitle="All time"
          icon={Activity}
          variant="primary"
        />
        <StatCard
          title="High-Risk Patients"
          value={`${analytics.highRiskPercentage}%`}
          subtitle="Of total assessments"
          icon={AlertTriangle}
          variant="danger"
        />
        <StatCard
          title="Average Risk Score"
          value={analytics.averageRiskScore}
          subtitle="Across all patients"
          icon={TrendingUp}
        />
        <StatCard
          title="Media Detections"
          value="196"
          subtitle="Visual AI findings this month"
          icon={Camera}
          variant="warning"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Surgery Type vs Risk */}
        <MedicalCard
          title="Risk Score by Surgery Type"
          icon={<Scissors className="w-5 h-5" />}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.surgeryTypeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="avgRisk" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Avg Risk %" />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Patient Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MedicalCard>

        {/* Top Risk Factors */}
        <MedicalCard
          title="Most Influential Risk Factors"
          icon={<Brain className="w-5 h-5" />}
        >
          <div className="space-y-4">
            {analytics.topRiskFactors.map((factor, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{factor.factor}</span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {factor.frequency} patients
                  </span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(factor.frequency / analytics.topRiskFactors[0].frequency) * 100}%`,
                      backgroundColor: COLORS[i % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </MedicalCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Trend */}
        <MedicalCard
          title="Monthly Assessment Trend"
          icon={<TrendingUp className="w-5 h-5" />}
          className="lg:col-span-2"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="assessments"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Total Assessments"
                />
                <Line
                  type="monotone"
                  dataKey="highRisk"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  name="High Risk"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MedicalCard>

        {/* Surgery Distribution Pie */}
        <MedicalCard
          title="Surgery Type Distribution"
          icon={<Eye className="w-5 h-5" />}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.surgeryTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="type"
                >
                  {analytics.surgeryTypeDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {analytics.surgeryTypeDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-1 text-xs">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-muted-foreground">{item.type}</span>
              </div>
            ))}
          </div>
        </MedicalCard>
      </div>

      {/* Media Detection Trend */}
      <MedicalCard
        title="Visual AI Detection Trend"
        subtitle="Weekly media-detected abnormalities"
        icon={<Camera className="w-5 h-5" />}
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.mediaDetectedTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar
                dataKey="detections"
                fill="hsl(var(--warning))"
                radius={[4, 4, 0, 0]}
                name="Abnormalities Detected"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </MedicalCard>
    </div>
  );
}
