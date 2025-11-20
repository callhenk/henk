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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

import { BusinessCard } from './business-card';
import { InviteMemberDialog } from './invite-member-dialog';
import { MemberCard } from './member-card';
import { RolePermissionsCard } from './role-permissions-card';
import {
  BusinessSelectionSkeleton,
  TeamMembersTableSkeleton,
} from './skeletons';
import { TeamMembersTable } from './team-members-table';

type Business = Tables<'businesses'>;

interface TeamSettingsContainerProps {
  _userId: string;
  hideHeader?: boolean;
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

  const handleInviteMember = async (
    email: string,
    role: 'owner' | 'admin' | 'member' | 'viewer',
  ) => {
    if (!selectedBusiness) return;

    try {
      await createTeamMemberMutation.mutateAsync({
        business_id: selectedBusiness.id,
        user_id: email,
        role,
        status: 'invited',
      });
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

  if (businessesLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {!hideHeader && (
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-7 w-48 sm:h-8" />
              <Skeleton className="mt-2 h-3 w-64 sm:h-4" />
            </div>
          </div>
        )}
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
              <BusinessCard
                key={business.id}
                business={business}
                isSelected={selectedBusiness?.id === business.id}
                onClick={() => setSelectedBusiness(business)}
              />
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
            <InviteMemberDialog
              businessName={selectedBusiness.name}
              isOpen={isInviteDialogOpen}
              onOpenChange={setIsInviteDialogOpen}
              onInvite={handleInviteMember}
            />
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
                <TeamMembersTable
                  members={teamMembers || []}
                  onUpdateRole={handleUpdateMemberRole}
                  onRemoveMember={handleRemoveMember}
                />
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
                          <MemberCard key={member.id} member={member} />
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="invited" className="space-y-4">
                <Card className="glass-panel border-0 shadow-sm sm:border sm:shadow-none">
                  <CardHeader className="space-y-1 px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-xl">
                      Invited Members
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Pending invitations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {teamMembers
                        ?.filter((m) => m.status === 'invited')
                        .map((member) => (
                          <MemberCard
                            key={member.id}
                            member={member}
                            dateLabel="Invited"
                          />
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
      {selectedBusiness && <RolePermissionsCard />}
    </div>
  );
}
