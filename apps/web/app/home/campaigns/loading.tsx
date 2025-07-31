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
          <div className="mb-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                  <div className="bg-muted h-10 w-full animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Loading Tabs */}
          <div className="mb-6">
            <div className="grid w-full grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-muted h-10 animate-pulse rounded" />
              ))}
            </div>
          </div>

          {/* Loading Campaign Table */}
          <div className="space-y-4">
            {/* Loading Table Header */}
            <div className="grid grid-cols-6 gap-4 border-b pb-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-muted h-4 animate-pulse rounded" />
              ))}
            </div>

            {/* Loading Table Rows */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 py-4">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="bg-muted h-4 animate-pulse rounded" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
