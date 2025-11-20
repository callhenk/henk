import type { Tables } from '@kit/supabase/database';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@kit/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';

import { getStatusColor } from '../_lib/role-utils';

type TeamMember = Tables<'team_members'>;

interface TeamMembersTableProps {
  members: TeamMember[];
  onUpdateRole: (memberId: string, role: string) => void;
  onRemoveMember: (memberId: string) => void;
}

export function TeamMembersTable({
  members,
  onUpdateRole,
  onRemoveMember,
}: TeamMembersTableProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
        <CardTitle className="text-xl font-semibold tracking-tight">
          All Team Members
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          Complete list of team members and their roles
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-5 sm:px-6 sm:pb-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Member</TableHead>
                <TableHead className="min-w-[150px]">Role</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Joined</TableHead>
                <TableHead className="min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-sm font-medium">
                          {member.user_id.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{member.user_id}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          User ID
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={member.role}
                      onValueChange={(value) => onUpdateRole(member.id, value)}
                    >
                      <SelectTrigger className="h-9 w-full min-w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${getStatusColor(member.status)} font-medium`}
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {member.created_at
                      ? new Date(member.created_at).toLocaleDateString()
                      : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-9 min-w-[80px]"
                        >
                          Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove Team Member
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this team member?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                          <AlertDialogCancel className="m-0">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onRemoveMember(member.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 m-0"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
