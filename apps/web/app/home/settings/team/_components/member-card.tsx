import type { Tables } from '@kit/supabase/database';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader } from '@kit/ui/card';

import { getRoleColor } from '../_lib/role-utils';

type TeamMember = Tables<'team_members'>;

interface MemberCardProps {
  member: TeamMember;
  dateLabel?: string;
}

export function MemberCard({ member, dateLabel = 'Joined' }: MemberCardProps) {
  return (
    <Card className="border-2 transition-all duration-200 hover:border-primary/50 hover:shadow-md">
      <CardHeader className="space-y-4 p-5">
        <div className="flex items-center space-x-3">
          <Avatar className="h-11 w-11 shrink-0">
            <AvatarImage src="" />
            <AvatarFallback className="text-base font-semibold">
              {member.user_id.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="truncate text-sm font-semibold leading-tight">
              {member.user_id}
            </p>
            <Badge
              className={`${getRoleColor(member.role)} text-xs font-medium`}
            >
              {member.role}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pt-0 pb-5">
        <p className="text-muted-foreground text-xs">
          {dateLabel}{' '}
          {member.created_at
            ? new Date(member.created_at).toLocaleDateString()
            : 'Unknown'}
        </p>
      </CardContent>
    </Card>
  );
}
