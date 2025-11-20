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
    <Card className="glass-panel border-0 shadow-sm sm:border sm:shadow-none">
      <CardHeader className="space-y-1 px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">Role Permissions</CardTitle>
        <CardDescription className="text-sm">
          Understanding different team member roles and their permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {ROLE_PERMISSIONS.map((item, index) => (
            <div key={item.role} className={index < 2 ? 'space-y-4' : ''}>
              <div>
                <Badge className={item.colorClass}>{item.role}</Badge>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
