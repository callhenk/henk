import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';

export function BusinessSelectionSkeleton() {
  return (
    <Card className="glass-panel border-0 shadow-sm sm:border sm:shadow-none">
      <CardHeader className="space-y-1 px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">Select Business</CardTitle>
        <CardDescription className="text-sm">
          Choose a business to manage its team members
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={index}
              className="glass-panel cursor-pointer border transition-all"
            >
              <CardHeader className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-3 w-48" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamMembersTableSkeleton() {
  return (
    <Tabs defaultValue="all" className="space-y-4">
      <TabsList>
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-28" />
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        <Card className="glass-panel border-0 shadow-sm sm:border sm:shadow-none">
          <CardHeader className="space-y-1 px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">
              All Team Members
            </CardTitle>
            <CardDescription className="text-sm">
              Complete list of team members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-16" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
