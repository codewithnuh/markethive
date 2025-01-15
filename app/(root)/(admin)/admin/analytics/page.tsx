import { AnalyticsDashboard } from "@/components/admin/analytics/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border">
        <div className="flex h-16 items-center px-4">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        </div>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
