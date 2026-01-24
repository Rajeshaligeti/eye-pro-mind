import { useState } from 'react';
import { MedicalCard } from '@/components/MedicalCard';
import { Button } from '@/components/ui/button';
import { RiskBadge } from '@/components/RiskBadge';
import {
  FileText,
  Download,
  Calendar,
  User,
  Clock,
  Search,
  Filter,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock report data
const mockReports = [
  {
    id: 'RPT-001',
    patientId: 'P-2024-0156',
    date: '2024-01-24T10:30:00',
    surgeryType: 'Cataract',
    riskScore: 72,
    riskLevel: 'high' as const,
    status: 'confirmed',
  },
  {
    id: 'RPT-002',
    patientId: 'P-2024-0157',
    date: '2024-01-24T09:15:00',
    surgeryType: 'LASIK',
    riskScore: 28,
    riskLevel: 'low' as const,
    status: 'confirmed',
  },
  {
    id: 'RPT-003',
    patientId: 'P-2024-0158',
    date: '2024-01-23T16:45:00',
    surgeryType: 'Glaucoma',
    riskScore: 55,
    riskLevel: 'medium' as const,
    status: 'pending',
  },
  {
    id: 'RPT-004',
    patientId: 'P-2024-0159',
    date: '2024-01-23T14:20:00',
    surgeryType: 'Retinal',
    riskScore: 81,
    riskLevel: 'high' as const,
    status: 'confirmed',
  },
  {
    id: 'RPT-005',
    patientId: 'P-2024-0160',
    date: '2024-01-23T11:00:00',
    surgeryType: 'Cataract',
    riskScore: 35,
    riskLevel: 'medium' as const,
    status: 'confirmed',
  },
];

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch =
      report.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'all' || report.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const handleDownload = (reportId: string) => {
    // Mock download
    const report = mockReports.find((r) => r.id === reportId);
    if (report) {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportId}-report.json`;
      a.click();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Assessment Reports
        </h1>
        <p className="text-muted-foreground">
          View and download patient risk assessment reports.
        </p>
      </div>

      {/* Filters */}
      <MedicalCard className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by Patient ID or Report ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </MedicalCard>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <MedicalCard key={report.id} className="hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{report.id}</span>
                    <RiskBadge level={report.riskLevel} score={report.riskScore} size="sm" />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {report.patientId}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(report.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(report.date).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Surgery Type: <span className="text-foreground">{report.surgeryType}</span>
                    {' · '}
                    Status:{' '}
                    <span
                      className={
                        report.status === 'confirmed' ? 'text-success' : 'text-warning'
                      }
                    >
                      {report.status === 'confirmed' ? 'Clinician Confirmed' : 'Pending Review'}
                    </span>
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => handleDownload(report.id)}>
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </MedicalCard>
        ))}

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No reports found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
