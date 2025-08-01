import { PageBody, PageHeader } from '@kit/ui/page';

import { AnalyticsDashboard } from './_components/analytics-dashboard';

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Track campaign performance, agent efficiency, and donor engagement with real-time insights"
      />
      <PageBody>
        <AnalyticsDashboard />
      </PageBody>
    </>
  );
}
