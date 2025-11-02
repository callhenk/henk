'use client';

import { useState } from 'react';
import { Users, Plus, List, Filter, ChevronRight } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { ScrollArea } from '@kit/ui/scroll-area';
import { Separator } from '@kit/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@kit/ui/collapsible';

import { useLeadLists } from '@kit/supabase/hooks/leads/use-leads';

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
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
        selectedListId === id
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted text-foreground'
      }`}
    >
      {color && (
        <div
          className="h-3 w-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      <span className="flex-1 text-left truncate">{name}</span>
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
    <div className="w-64 border-r bg-card h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Leads
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* All Leads */}
          <div>
            <button
              onClick={() => onSelectList(null)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
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
                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
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
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Loading lists...
                  </div>
                ) : leadLists.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No lists yet. Create your first list!
                  </div>
                ) : (
                  <>
                    {/* Static Lists */}
                    {staticLists.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-3 py-1 text-xs font-medium text-muted-foreground">
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
                      <div className="space-y-1 mt-2">
                        <div className="px-3 py-1 text-xs font-medium text-muted-foreground">
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
                      <div className="space-y-1 mt-2">
                        <div className="px-3 py-1 text-xs font-medium text-muted-foreground">
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
