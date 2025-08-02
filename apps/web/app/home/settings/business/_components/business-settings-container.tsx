'use client';

import { useState } from 'react';

import { useUserBusinesses } from '@kit/supabase/hooks/businesses/use-businesses';
import { useCreateBusiness, useUpdateBusiness, useDeleteBusiness } from '@kit/supabase/hooks/businesses/use-business-mutations';
import { useTeamMembersByBusiness } from '@kit/supabase/hooks/team-members/use-team-members';
import { useCreateTeamMember, useUpdateTeamMember, useDeleteTeamMember } from '@kit/supabase/hooks/team-members/use-team-member-mutations';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
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
import { Badge } from '@kit/ui/badge';
import { Separator } from '@kit/ui/separator';

import type { Tables } from '@kit/supabase/database';

type Business = Tables<'businesses'>;
type TeamMember = Tables<'team_members'>;

interface BusinessSettingsContainerProps {
  userId: string;
}

export function BusinessSettingsContainer({ userId }: BusinessSettingsContainerProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Hooks
  const { data: businesses, isLoading: businessesLoading } = useUserBusinesses();
  const createBusinessMutation = useCreateBusiness();
  const updateBusinessMutation = useUpdateBusiness();
  const deleteBusinessMutation = useDeleteBusiness();

  const { data: teamMembers, isLoading: teamMembersLoading } = useTeamMembersByBusiness(
    selectedBusiness?.id || ''
  );
  const createTeamMemberMutation = useCreateTeamMember();
  const updateTeamMemberMutation = useUpdateTeamMember();
  const deleteTeamMemberMutation = useDeleteTeamMember();

  // Form states
  const [businessForm, setBusinessForm] = useState({
    name: '',
    description: '',
  });

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member' as const,
  });

  const handleCreateBusiness = async () => {
    try {
      await createBusinessMutation.mutateAsync({
        name: businessForm.name,
        description: businessForm.description,
        account_id: userId,
        status: 'active',
      });
      setBusinessForm({ name: '', description: '' });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create business:', error);
    }
  };

  const handleUpdateBusiness = async () => {
    if (!selectedBusiness) return;
    
    try {
      await updateBusinessMutation.mutateAsync({
        id: selectedBusiness.id,
        name: businessForm.name,
        description: businessForm.description,
      });
      setBusinessForm({ name: '', description: '' });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update business:', error);
    }
  };

  const handleDeleteBusiness = async () => {
    if (!selectedBusiness) return;
    
    try {
      await deleteBusinessMutation.mutateAsync(selectedBusiness.id);
      setSelectedBusiness(null);
    } catch (error) {
      console.error('Failed to delete business:', error);
    }
  };

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
        role: role as any,
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

  const openEditDialog = (business: Business) => {
    setSelectedBusiness(business);
    setBusinessForm({
      name: business.name,
      description: business.description || '',
    });
    setIsEditDialogOpen(true);
  };

  if (businessesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Business Settings</h1>
          <p className="text-muted-foreground">
            Manage your businesses and team members
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Business</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Business</DialogTitle>
              <DialogDescription>
                Create a new business to organize your campaigns and team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Business Name</Label>
                <Input
                  id="name"
                  value={businessForm.name}
                  onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={businessForm.description}
                  onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })}
                  placeholder="Enter business description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBusiness} disabled={!businessForm.name}>
                Create Business
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Businesses List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {businesses?.map((business) => (
          <Card key={business.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{business.name}</CardTitle>
                <Badge variant={business.status === 'active' ? 'default' : 'secondary'}>
                  {business.status}
                </Badge>
              </div>
              <CardDescription>
                {business.description || 'No description'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedBusiness(business);
                    setIsInviteDialogOpen(true);
                  }}
                >
                  Invite Member
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(business)}
                >
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Business</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{business.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          setSelectedBusiness(business);
                          handleDeleteBusiness();
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Members Section */}
      {selectedBusiness && (
        <div className="space-y-4">
          <Separator />
          <div>
            <h2 className="text-xl font-semibold">Team Members - {selectedBusiness.name}</h2>
            <p className="text-muted-foreground">
              Manage team members and their roles
            </p>
          </div>

          {teamMembersLoading ? (
            <div>Loading team members...</div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  {teamMembers?.length || 0} member(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers?.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.user_id}</TableCell>
                        <TableCell>
                          <Select
                            value={member.role}
                            onValueChange={(value) => handleUpdateMemberRole(member.id, value)}
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
                          <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                            {member.status}
                          </Badge>
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
                                <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove this team member?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveMember(member.id)}
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
          )}
        </div>
      )}

      {/* Edit Business Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Business</DialogTitle>
            <DialogDescription>
              Update your business information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Business Name</Label>
              <Input
                id="edit-name"
                value={businessForm.name}
                onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                placeholder="Enter business name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={businessForm.description}
                onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })}
                placeholder="Enter business description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBusiness} disabled={!businessForm.name}>
              Update Business
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Invite a new member to your business.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="invite-role">Role</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(value) => setInviteForm({ ...inviteForm, role: value as any })}
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
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteMember} disabled={!inviteForm.email}>
              Invite Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 