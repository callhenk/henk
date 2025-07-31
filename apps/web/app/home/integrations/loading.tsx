import { Card, CardContent, CardHeader } from '@kit/ui/card';

export default function IntegrationsLoading() {
  return (
    <div className="space-y-6">
      {/* Loading Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted h-24 animate-pulse rounded-lg" />
        ))}
      </div>

      {/* Loading Integrations List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="bg-muted h-6 w-48 animate-pulse rounded" />
              <div className="bg-muted h-4 w-64 animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-muted h-9 w-9 animate-pulse rounded" />
              <div className="bg-muted h-9 w-32 animate-pulse rounded" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading Category Filter */}
          <div className="mb-6">
            <div className="bg-muted h-10 w-48 animate-pulse rounded" />
          </div>

          {/* Loading Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <div className="bg-muted h-4 w-32 animate-pulse rounded" />
            <div className="bg-muted h-8 w-20 animate-pulse rounded" />
          </div>

          {/* Loading Integration Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-muted h-12 w-12 animate-pulse rounded" />
                      <div className="space-y-2">
                        <div className="bg-muted h-5 w-24 animate-pulse rounded" />
                        <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="bg-muted h-6 w-16 animate-pulse rounded" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="bg-muted h-4 w-full animate-pulse rounded" />
                    <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-muted h-8 flex-1 animate-pulse rounded" />
                    <div className="bg-muted h-8 flex-1 animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
