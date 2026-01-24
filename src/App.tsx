import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import LandingPage from "@/pages/LandingPage";
import PatientAssessment from "@/pages/PatientAssessment";
import AssessmentResults from "@/pages/AssessmentResults";
import AnalyticsDashboard from "@/pages/AnalyticsDashboard";
import Reports from "@/pages/Reports";
import AIGovernance from "@/pages/AIGovernance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/assessment" element={<PatientAssessment />} />
            <Route path="/results" element={<AssessmentResults />} />
            <Route path="/dashboard" element={<AnalyticsDashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/governance" element={<AIGovernance />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
