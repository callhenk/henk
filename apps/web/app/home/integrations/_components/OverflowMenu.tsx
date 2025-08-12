import { EllipsisVertical, Link2, Play, PlugZap, Power, ScrollText } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';

export function OverflowMenu({
  onTest,
  onSync,
  onDisconnect,
  onLogs,
  disabled,
}: {
  onTest: () => void;
  onSync: () => void;
  onDisconnect: () => void;
  onLogs: () => void;
  disabled?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="More actions" disabled={disabled}>
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={onTest} disabled={disabled}>
          <PlugZap className="mr-2 h-4 w-4" /> Test connection
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSync} disabled={disabled}>
          <Play className="mr-2 h-4 w-4" /> Sync now
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onLogs} disabled={disabled}>
          <ScrollText className="mr-2 h-4 w-4" /> View logs
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDisconnect} className="text-red-600" disabled={disabled}>
          <Power className="mr-2 h-4 w-4" /> Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


