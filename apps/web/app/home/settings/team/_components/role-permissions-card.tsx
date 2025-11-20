import { Badge } from '@kit/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

const ROLE_PERMISSIONS = [
  {
    role: 'Owner',
    colorClass: 'bg-purple-100 text-xs text-purple-800',
    description:
      'Full access to all features, can manage team members and business settings',
  },
  {
    role: 'Admin',
    colorClass: 'bg-red-100 text-xs text-red-800',
    description:
      'Can manage campaigns, agents, and team members, but cannot delete the business',
  },
  {
    role: 'Member',
    colorClass: 'bg-blue-100 text-xs text-blue-800',
    description:
      'Can create and manage campaigns and agents, limited team management',
  },
  {
    role: 'Viewer',
    colorClass: 'bg-gray-100 text-xs text-gray-800',
    description:
      'Read-only access to campaigns and agents, cannot make changes',
  },
];

export function RolePermissionsCard() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
        <CardTitle className="text-xl font-semibold tracking-tight">
          Role Permissions
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          Understanding different team member roles and their permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {ROLE_PERMISSIONS.map((item) => (
            <div key={item.role} className="space-y-2.5">
              <Badge className={`${item.colorClass} font-medium`}>
                {item.role}
              </Badge>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
