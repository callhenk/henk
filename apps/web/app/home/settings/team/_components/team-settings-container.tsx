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
      <div className="space-y-6">
        <BusinessSelectionSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Business Selection */}
      <Card className="shadow-sm">
        <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
          <CardTitle className="text-lg font-semibold tracking-tight">
            Select Business
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Choose a business to manage its team members and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
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
        <div className="space-y-5 sm:space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <h2 className="text-foreground text-lg font-semibold tracking-tight">
                Team Members
              </h2>
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <span className="font-medium">{selectedBusiness.name}</span>
                <span>•</span>
                <span>Manage team members and their roles</span>
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <InviteMemberDialog
                businessName={selectedBusiness.name}
                isOpen={isInviteDialogOpen}
                onOpenChange={setIsInviteDialogOpen}
                onInvite={handleInviteMember}
              />
            </div>
          </div>

          {teamMembersLoading ? (
            <TeamMembersTableSkeleton />
          ) : (
            <Tabs defaultValue="all" className="space-y-5">
              <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
                <TabsTrigger value="all" className="gap-1.5">
                  <span>All Members</span>
                  <span className="text-muted-foreground">
                    ({teamMembers?.length || 0})
                  </span>
                </TabsTrigger>
                <TabsTrigger value="active" className="gap-1.5">
                  <span>Active</span>
                  <span className="text-muted-foreground">
                    (
                    {teamMembers?.filter((m) => m.status === 'active').length ||
                      0}
                    )
                  </span>
                </TabsTrigger>
                <TabsTrigger value="invited" className="gap-1.5">
                  <span>Invited</span>
                  <span className="text-muted-foreground">
                    (
                    {teamMembers?.filter((m) => m.status === 'invited')
                      .length || 0}
                    )
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-5">
                <TeamMembersTable
                  members={teamMembers || []}
                  onUpdateRole={handleUpdateMemberRole}
                  onRemoveMember={handleRemoveMember}
                />
              </TabsContent>

              <TabsContent value="active" className="space-y-5">
                <Card className="shadow-sm">
                  <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
                    <CardTitle className="text-xl font-semibold tracking-tight">
                      Active Members
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Team members with active status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
                    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {teamMembers
                        ?.filter((m) => m.status === 'active')
                        .map((member) => (
                          <MemberCard key={member.id} member={member} />
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="invited" className="space-y-5">
                <Card className="shadow-sm">
                  <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
                    <CardTitle className="text-xl font-semibold tracking-tight">
                      Invited Members
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      Pending invitations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
                    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
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
