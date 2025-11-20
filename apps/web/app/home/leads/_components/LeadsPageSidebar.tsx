'use client';

import { useState } from 'react';

import { ChevronRight, Filter, List, Plus, Users } from 'lucide-react';

import { useLeadLists } from '@kit/supabase/hooks/leads/use-leads';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@kit/ui/collapsible';
import { ScrollArea } from '@kit/ui/scroll-area';
import { Separator } from '@kit/ui/separator';

interface LeadsPageSidebarProps {
  selectedListId: string | null;
  onSelectList: (listId: string | null) => void;
  onCreateList: () => void;
}

export function LeadsPageSidebar({
  selectedListId,
  onSelectList,
  onCreateList,
}: LeadsPageSidebarProps) {
  const { data: leadLists = [], isLoading } = useLeadLists();
  const [listsExpanded, setListsExpanded] = useState(true);

  // Group lists by type
  const staticLists = leadLists.filter((list) => list.list_type === 'static');
  const dynamicLists = leadLists.filter((list) => list.list_type === 'dynamic');
  const smartLists = leadLists.filter((list) => list.list_type === 'smart');

  const ListItem = ({
    id,
    name,
    color,
    leadCount,
  }: {
    id: string;
    name: string;
    color?: string;
    leadCount?: number;
  }) => (
    <button
      onClick={() => onSelectList(id === selectedListId ? null : id)}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
        selectedListId === id
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted text-foreground'
      }`}
    >
      {color && (
        <div
          className="h-3 w-3 flex-shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      <span className="flex-1 truncate text-left">{name}</span>
      {leadCount !== undefined && (
        <Badge
          variant={selectedListId === id ? 'secondary' : 'outline'}
          className="text-xs"
        >
          {leadCount}
        </Badge>
      )}
    </button>
  );

  return (
    <div className="bg-card hidden h-full w-64 flex-col border-r md:flex">
      <div className="border-b p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Filter className="h-5 w-5" />
          Filter Leads
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {/* All Leads */}
          <div>
            <button
              onClick={() => onSelectList(null)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                selectedListId === null
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              <Users className="h-4 w-4" />
              <span className="flex-1 text-left">All Leads</span>
            </button>
          </div>

          <Separator />

          {/* Lists Section */}
          <Collapsible open={listsExpanded} onOpenChange={setListsExpanded}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <CollapsibleTrigger className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors">
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      listsExpanded ? 'rotate-90' : ''
                    }`}
                  />
                  <List className="h-4 w-4" />
                  Lead Lists
                </CollapsibleTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCreateList}
                  className="h-7 w-7 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <CollapsibleContent className="space-y-1">
                {isLoading ? (
                  <div className="text-muted-foreground px-3 py-2 text-sm">
                    Loading lists...
                  </div>
                ) : leadLists.length === 0 ? (
                  <div className="text-muted-foreground px-3 py-2 text-sm">
                    No lists yet. Create your first list!
                  </div>
                ) : (
                  <>
                    {/* Static Lists */}
                    {staticLists.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-muted-foreground px-3 py-1 text-xs font-medium">
                          Static Lists
                        </div>
                        {staticLists.map((list) => (
                          <ListItem
                            key={list.id}
                            id={list.id}
                            name={list.name}
                            color={list.color ?? undefined}
                            leadCount={list.lead_count ?? undefined}
                          />
                        ))}
                      </div>
                    )}

                    {/* Dynamic Lists */}
                    {dynamicLists.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="text-muted-foreground px-3 py-1 text-xs font-medium">
                          Dynamic Lists
                        </div>
                        {dynamicLists.map((list) => (
                          <ListItem
                            key={list.id}
                            id={list.id}
                            name={list.name}
                            color={list.color ?? undefined}
                            leadCount={list.lead_count ?? undefined}
                          />
                        ))}
                      </div>
                    )}

                    {/* Smart Lists */}
                    {smartLists.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="text-muted-foreground px-3 py-1 text-xs font-medium">
                          Smart Lists
                        </div>
                        {smartLists.map((list) => (
                          <ListItem
                            key={list.id}
                            id={list.id}
                            name={list.name}
                            color={list.color ?? undefined}
                            leadCount={list.lead_count ?? undefined}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
}
