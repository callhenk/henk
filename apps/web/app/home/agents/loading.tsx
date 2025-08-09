import { Card, CardContent, CardHeader } from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';

export default function AgentsLoading() {
  return (
    <div className="space-y-6">
      {/* Loading Stats (match campaigns) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* Loading Agents List */}
      <Card className={'glass-panel'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading Search and Filters */}
          <div className="mb-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Loading Tabs (match campaigns) */}
          <div className="mb-6">
            <div className="grid w-full grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          </div>

          {/* Loading Table (match campaigns) */}
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 border-b pb-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4" />
              ))}
            </div>

            {/* Table Rows */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 py-4">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-4" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
