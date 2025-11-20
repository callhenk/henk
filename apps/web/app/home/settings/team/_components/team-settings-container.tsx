'use client';

import { useState } from 'react';

import type { Tables } from '@kit/supabase/database';
import { useUserBusinesses } from '@kit/supabase/hooks/businesses/use-businesses';
import {
  useCreateTeamMember,
  useDeleteTeamMember,
  useUpdateTeamMember,
} from '@kit/supabase/hooks/team-members/use-team-member-mutations';
import { useTeamMembersByBusiness } from '@kit/supabase/hooks/team-members/use-team-members';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Skeleton } from '@kit/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

type Business = Tables<'businesses'>;

interface TeamSettingsContainerProps {
  _userId: string;
  hideHeader?: boolean;
}

function BusinessSelectionSkeleton() {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>Select Business</CardTitle>
        <CardDescription>
          Choose a business to manage its team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={index}
              className="glass-panel cursor-pointer transition-all"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-48" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembersTableSkeleton() {
  return (
    <Tabs defaultValue="all" className="space-y-4">
      <TabsList>
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-28" />
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>All Team Members</CardTitle>
            <CardDescription>
              Complete list of team members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
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

export function TeamSettingsContainer({
  _userId,
  hideHeader = false,
}: TeamSettingsContainerProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null,
  );
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Hooks
  const { data: businesses, isLoading: businessesLoading } =
    useUserBusinesses();
  const { data: teamMembers, isLoading: teamMembersLoading } =
    useTeamMembersByBusiness(selectedBusiness?.id || '');
  const createTeamMemberMutation = useCreateTeamMember();
  const updateTeamMemberMutation = useUpdateTeamMember();
  const deleteTeamMemberMutation = useDeleteTeamMember();

  // Form states
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member' as 'owner' | 'admin' | 'member' | 'viewer',
  });

  const handleInviteMember = async () => {
    if (!selectedBusiness) return;

    try {
      await createTeamMemberMutation.mutateAsync({
        business_id: selectedBusiness.id,
        user_id: inviteForm.email, // This should be a user ID, but for now we'll use email
        role: inviteForm.role,
        status: 'invited',
      });
      setInviteForm({ email: '', role: 'member' });
      setIsInviteDialogOpen(false);
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, role: string) => {
    try {
      await updateTeamMemberMutation.mutateAsync({
        id: memberId,
        role: role as 'owner' | 'admin' | 'member' | 'viewer',
      });
    } catch (error) {
      console.error('Failed to update member role:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await deleteTeamMemberMutation.mutateAsync(memberId);
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'member':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'invited':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'left':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (businessesLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        {!hideHeader && (
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="mt-2 h-4 w-64" />
            </div>
          </div>
        )}

        {/* Business Selection Skeleton */}
        <BusinessSelectionSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Team Management</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage team members, roles, and permissions across your businesses
            </p>
          </div>
        </div>
      )}

      {/* Business Selection */}
      <Card className="glass-panel border-0 shadow-sm sm:border sm:shadow-none">
        <CardHeader className="space-y-1 px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Select Business</CardTitle>
          <CardDescription className="text-sm">
            Choose a business to manage its team members
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {businesses?.map((business) => (
              <Card
                key={business.id}
                className={`glass-panel cursor-pointer border transition-all hover:shadow-md ${
                  selectedBusiness?.id === business.id
                    ? 'ring-primary ring-2'
                    : ''
                }`}
                onClick={() => setSelectedBusiness(business)}
              >
                <CardHeader className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">
                      {business.name}
                    </CardTitle>
                    <Badge
                      variant={
                        business.status === 'active' ? 'default' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {business.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs sm:text-sm">
                    {business.description || 'No description'}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Members Section */}
      {selectedBusiness && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold sm:text-xl">
                Team Members - {selectedBusiness.name}
              </h2>
              <p className="text-muted-foreground text-sm">
                Manage team members and their roles
              </p>
            </div>
            <Dialog
              open={isInviteDialogOpen}
              onOpenChange={setIsInviteDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>Invite Member</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Invite a new member to {selectedBusiness.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="invite-email">Email</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) =>
                        setInviteForm({ ...inviteForm, email: e.target.value })
                      }
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="invite-role">Role</Label>
                    <Select
                      value={inviteForm.role}
                      onValueChange={(value) =>
                        setInviteForm({
                          ...inviteForm,
                          role: value as
                            | 'owner'
                            | 'admin'
                            | 'member'
                            | 'viewer',
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInviteMember}
                    disabled={!inviteForm.email}
                  >
                    Invite Member
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {teamMembersLoading ? (
            <TeamMembersTableSkeleton />
          ) : (
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">
                  All Members ({teamMembers?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active (
                  {teamMembers?.filter((m) => m.status === 'active').length ||
                    0}
                  )
                </TabsTrigger>
                <TabsTrigger value="invited">
                  Invited (
                  {teamMembers?.filter((m) => m.status === 'invited').length ||
                    0}
                  )
                </TabsTrigger>
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
                        {teamMembers?.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src="" />
                                  <AvatarFallback>
                                    {member.user_id.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {member.user_id}
                                  </p>
                                  <p className="text-muted-foreground text-sm">
                                    User ID
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={member.role}
                                onValueChange={(value) =>
                                  handleUpdateMemberRole(member.id, value)
                                }
                              >
                                <SelectTrigger className="w-32">
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
                              <Badge className={getStatusColor(member.status)}>
                                {member.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {member.created_at
                                ? new Date(
                                    member.created_at,
                                  ).toLocaleDateString()
                                : 'Unknown'}
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    Remove
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Remove Team Member
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove this team
                                      member? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleRemoveMember(member.id)
                                      }
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="active" className="space-y-4">
                <Card className="glass-panel border-0 shadow-sm sm:border sm:shadow-none">
                  <CardHeader className="space-y-1 px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-xl">
                      Active Members
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Team members with active status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {teamMembers
                        ?.filter((m) => m.status === 'active')
                        .map((member) => (
                          <Card
                            key={member.id}
                            className="glass-panel border transition-all hover:shadow-md"
                          >
                            <CardHeader className="space-y-3 p-4">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src="" />
                                  <AvatarFallback>
                                    {member.user_id.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                  <p className="text-sm font-medium">
                                    {member.user_id}
                                  </p>
                                  <Badge
                                    className={`${getRoleColor(member.role)} text-xs`}
                                  >
                                    {member.role}
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="px-4 pt-0 pb-4">
                              <p className="text-muted-foreground text-xs">
                                Joined{' '}
                                {member.created_at
                                  ? new Date(
                                      member.created_at,
                                    ).toLocaleDateString()
                                  : 'Unknown'}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="invited" className="space-y-4">
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle>Invited Members</CardTitle>
                    <CardDescription>Pending invitations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {teamMembers
                        ?.filter((m) => m.status === 'invited')
                        .map((member) => (
                          <Card key={member.id} className="glass-panel">
                            <CardHeader className="pb-3">
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarImage src="" />
                                  <AvatarFallback>
                                    {member.user_id.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {member.user_id}
                                  </p>
                                  <Badge className={getRoleColor(member.role)}>
                                    {member.role}
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground text-sm">
                                Invited{' '}
                                {member.created_at
                                  ? new Date(
                                      member.created_at,
                                    ).toLocaleDateString()
                                  : 'Unknown'}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}

      {/* Role Permissions Guide */}
      {selectedBusiness && (
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>
              Understanding different team member roles and their permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <Badge className="bg-purple-100 text-purple-800">Owner</Badge>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Full access to all features, can manage team members and
                    business settings
                  </p>
                </div>
                <div>
                  <Badge className="bg-red-100 text-red-800">Admin</Badge>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Can manage campaigns, agents, and team members, but cannot
                    delete the business
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Badge className="bg-blue-100 text-blue-800">Member</Badge>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Can create and manage campaigns and agents, limited team
                    management
                  </p>
                </div>
                <div>
                  <Badge className="bg-gray-100 text-gray-800">Viewer</Badge>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Read-only access to campaigns and agents, cannot make
                    changes
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
