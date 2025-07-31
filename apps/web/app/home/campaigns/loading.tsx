import { Card, CardContent, CardHeader } from '@kit/ui/card';

export default function CampaignsLoading() {
  return (
    <div className="space-y-6">
      {/* Loading Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted h-24 animate-pulse rounded-lg" />
        ))}
      </div>

      {/* Loading Campaigns List */}
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
          {/* Loading Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                  <div className="bg-muted h-10 w-full animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Loading Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <div className="bg-muted h-4 w-32 animate-pulse rounded" />
            <div className="bg-muted h-8 w-20 animate-pulse rounded" />
          </div>

          {/* Loading Campaign Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="bg-muted h-5 w-32 animate-pulse rounded" />
                      <div className="bg-muted h-4 w-48 animate-pulse rounded" />
                    </div>
                    <div className="bg-muted h-8 w-8 animate-pulse rounded" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="bg-muted h-5 w-16 animate-pulse rounded" />
                    <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="bg-muted mx-auto mb-1 h-6 w-8 animate-pulse rounded" />
                      <div className="bg-muted mx-auto h-3 w-12 animate-pulse rounded" />
                    </div>
                    <div className="text-center">
                      <div className="bg-muted mx-auto mb-1 h-6 w-8 animate-pulse rounded" />
                      <div className="bg-muted mx-auto h-3 w-12 animate-pulse rounded" />
                    </div>
                    <div className="text-center">
                      <div className="bg-muted mx-auto mb-1 h-6 w-8 animate-pulse rounded" />
                      <div className="bg-muted mx-auto h-3 w-12 animate-pulse rounded" />
                    </div>
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
