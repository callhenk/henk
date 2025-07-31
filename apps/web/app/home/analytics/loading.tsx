import { Card, CardContent, CardHeader } from '@kit/ui/card';

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Loading Filters */}
      <Card>
        <CardHeader>
          <div className="bg-muted h-6 w-32 animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                <div className="bg-muted h-10 w-full animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading Metrics */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-muted h-24 animate-pulse rounded-lg" />
        ))}
      </div>

      {/* Loading Performance Chart */}
      <Card>
        <CardHeader>
          <div className="bg-muted h-6 w-48 animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="bg-muted h-64 animate-pulse rounded-lg" />
        </CardContent>
      </Card>

      {/* Loading Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="bg-muted h-6 w-40 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="bg-muted h-48 animate-pulse rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading Funnel Analysis */}
      <Card>
        <CardHeader>
          <div className="bg-muted h-6 w-36 animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                  <div className="bg-muted h-4 w-16 animate-pulse rounded" />
                </div>
                <div className="bg-muted h-8 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading Export Controls */}
      <Card>
        <CardHeader>
          <div className="bg-muted h-6 w-32 animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                  <div className="bg-muted h-10 w-full animate-pulse rounded" />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-muted h-9 w-32 animate-pulse rounded"
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
