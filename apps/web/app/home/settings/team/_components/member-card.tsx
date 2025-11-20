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
    <Card className="glass-panel border transition-all hover:shadow-md">
      <CardHeader className="space-y-3 p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" />
            <AvatarFallback>
              {member.user_id.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">{member.user_id}</p>
            <Badge className={`${getRoleColor(member.role)} text-xs`}>
              {member.role}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-0 pb-4">
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
