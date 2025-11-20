import { useState } from 'react';

import { Button } from '@kit/ui/button';
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

interface InviteMemberDialogProps {
  businessName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (
    email: string,
    role: 'owner' | 'admin' | 'member' | 'viewer',
  ) => void;
}

export function InviteMemberDialog({
  businessName,
  isOpen,
  onOpenChange,
  onInvite,
}: InviteMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'owner' | 'admin' | 'member' | 'viewer'>(
    'member',
  );

  const handleInvite = () => {
    onInvite(email, role);
    setEmail('');
    setRole('member');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-10 w-full min-w-[140px] sm:w-auto">
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Invite Team Member</DialogTitle>
          <DialogDescription className="text-sm">
            Invite a new member to {businessName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@example.com"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role" className="text-sm font-medium">
              Role
            </Label>
            <Select
              value={role}
              onValueChange={(value) =>
                setRole(value as 'owner' | 'admin' | 'member' | 'viewer')
              }
            >
              <SelectTrigger className="h-10">
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
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            disabled={!email}
            className="h-10 w-full sm:w-auto"
          >
            Invite Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
