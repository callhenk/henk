'use client';

import { useState } from 'react';

import {
  Archive,
  ChevronRight,
  Clock,
  Filter,
  Folder,
  Hash,
  List,
  Plus,
  Star,
  Users,
} from 'lucide-react';

import { useLeadLists } from '@kit/supabase/hooks/leads/use-leads';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { ScrollArea } from '@kit/ui/scroll-area';
import { Skeleton } from '@kit/ui/skeleton';
import { cn } from '@kit/ui/utils';

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
  const [expandedSection, setExpandedSection] = useState<string>('lists');
  const { data: leadLists = [], isLoading } = useLeadLists();

  // Categorize lists
  const staticLists = leadLists.filter(
    (list) => list.list_type === 'static' && !list.is_archived,
  );
  const dynamicLists = leadLists.filter(
    (list) => list.list_type === 'dynamic' && !list.is_archived,
  );
  const smartLists = leadLists.filter(
    (list) => list.list_type === 'smart' && !list.is_archived,
  );
  const archivedLists = leadLists.filter((list) => list.is_archived);

  const totalLeads = leadLists.reduce(
    (acc, list) => acc + (list.lead_count || 0),
    0,
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Lists</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCreateList}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4 px-4 pb-4">
            {/* Quick Filters */}
            <div className="space-y-1">
              <Button
                variant={selectedListId === null ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                size="sm"
                onClick={() => onSelectList(null)}
              >
                <Users className="mr-2 h-4 w-4" />
                All Leads
                <Badge variant="secondary" className="ml-auto">
                  {totalLeads}
                </Badge>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
                onClick={() => onSelectList('recent')}
              >
                <Clock className="mr-2 h-4 w-4" />
                Recently Added
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
                onClick={() => onSelectList('starred')}
              >
                <Star className="mr-2 h-4 w-4" />
                Starred
              </Button>
            </div>

            <div className="bg-border h-px" />

            {/* Lead Lists */}
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <>
                {/* Static Lists */}
                {staticLists.length > 0 && (
                  <div className="space-y-1">
                    <button
                      onClick={() =>
                        setExpandedSection(
                          expandedSection === 'static' ? '' : 'static',
                        )
                      }
                      className="text-muted-foreground hover:text-foreground flex w-full items-center gap-1 text-xs font-medium transition-colors"
                    >
                      <ChevronRight
                        className={cn(
                          'h-3 w-3 transition-transform',
                          expandedSection === 'static' && 'rotate-90',
                        )}
                      />
                      <Folder className="h-3 w-3" />
                      <span>Static Lists</span>
                      <Badge
                        variant="outline"
                        className="ml-auto px-1 py-0 text-xs"
                      >
                        {staticLists.length}
                      </Badge>
                    </button>
                    {expandedSection === 'static' && (
                      <div className="ml-3 space-y-1">
                        {staticLists.map((list) => (
                          <Button
                            key={list.id}
                            variant={
                              selectedListId === list.id ? 'secondary' : 'ghost'
                            }
                            className="w-full justify-start pl-3"
                            size="sm"
                            onClick={() => onSelectList(list.id)}
                          >
                            {list.color && (
                              <div
                                className="mr-2 h-2 w-2 rounded-full"
                                style={{ backgroundColor: list.color }}
                              />
                            )}
                            <span className="truncate">{list.name}</span>
                            {(list.lead_count ?? 0) > 0 && (
                              <Badge variant="secondary" className="ml-auto">
                                {list.lead_count}
                              </Badge>
                            )}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Dynamic Lists */}
                {dynamicLists.length > 0 && (
                  <div className="space-y-1">
                    <button
                      onClick={() =>
                        setExpandedSection(
                          expandedSection === 'dynamic' ? '' : 'dynamic',
                        )
                      }
                      className="text-muted-foreground hover:text-foreground flex w-full items-center gap-1 text-xs font-medium transition-colors"
                    >
                      <ChevronRight
                        className={cn(
                          'h-3 w-3 transition-transform',
                          expandedSection === 'dynamic' && 'rotate-90',
                        )}
                      />
                      <Filter className="h-3 w-3" />
                      <span>Dynamic Lists</span>
                      <Badge
                        variant="outline"
                        className="ml-auto px-1 py-0 text-xs"
                      >
                        {dynamicLists.length}
                      </Badge>
                    </button>
                    {expandedSection === 'dynamic' && (
                      <div className="ml-3 space-y-1">
                        {dynamicLists.map((list) => (
                          <Button
                            key={list.id}
                            variant={
                              selectedListId === list.id ? 'secondary' : 'ghost'
                            }
                            className="w-full justify-start pl-3"
                            size="sm"
                            onClick={() => onSelectList(list.id)}
                          >
                            {list.color && (
                              <div
                                className="mr-2 h-2 w-2 rounded-full"
                                style={{ backgroundColor: list.color }}
                              />
                            )}
                            <span className="truncate">{list.name}</span>
                            {(list.lead_count ?? 0) > 0 && (
                              <Badge variant="secondary" className="ml-auto">
                                {list.lead_count}
                              </Badge>
                            )}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Smart Lists */}
                {smartLists.length > 0 && (
                  <div className="space-y-1">
                    <button
                      onClick={() =>
                        setExpandedSection(
                          expandedSection === 'smart' ? '' : 'smart',
                        )
                      }
                      className="text-muted-foreground hover:text-foreground flex w-full items-center gap-1 text-xs font-medium transition-colors"
                    >
                      <ChevronRight
                        className={cn(
                          'h-3 w-3 transition-transform',
                          expandedSection === 'smart' && 'rotate-90',
                        )}
                      />
                      <Hash className="h-3 w-3" />
                      <span>Smart Lists</span>
                      <Badge
                        variant="outline"
                        className="ml-auto px-1 py-0 text-xs"
                      >
                        {smartLists.length}
                      </Badge>
                    </button>
                    {expandedSection === 'smart' && (
                      <div className="ml-3 space-y-1">
                        {smartLists.map((list) => (
                          <Button
                            key={list.id}
                            variant={
                              selectedListId === list.id ? 'secondary' : 'ghost'
                            }
                            className="w-full justify-start pl-3"
                            size="sm"
                            onClick={() => onSelectList(list.id)}
                          >
                            {list.color && (
                              <div
                                className="mr-2 h-2 w-2 rounded-full"
                                style={{ backgroundColor: list.color }}
                              />
                            )}
                            <span className="truncate">{list.name}</span>
                            {(list.lead_count ?? 0) > 0 && (
                              <Badge variant="secondary" className="ml-auto">
                                {list.lead_count}
                              </Badge>
                            )}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Archived Lists */}
                {archivedLists.length > 0 && (
                  <div className="space-y-1">
                    <button
                      onClick={() =>
                        setExpandedSection(
                          expandedSection === 'archived' ? '' : 'archived',
                        )
                      }
                      className="text-muted-foreground hover:text-foreground flex w-full items-center gap-1 text-xs font-medium transition-colors"
                    >
                      <ChevronRight
                        className={cn(
                          'h-3 w-3 transition-transform',
                          expandedSection === 'archived' && 'rotate-90',
                        )}
                      />
                      <Archive className="h-3 w-3" />
                      <span>Archived</span>
                      <Badge
                        variant="outline"
                        className="ml-auto px-1 py-0 text-xs"
                      >
                        {archivedLists.length}
                      </Badge>
                    </button>
                    {expandedSection === 'archived' && (
                      <div className="ml-3 space-y-1 opacity-60">
                        {archivedLists.map((list) => (
                          <Button
                            key={list.id}
                            variant={
                              selectedListId === list.id ? 'secondary' : 'ghost'
                            }
                            className="w-full justify-start pl-3"
                            size="sm"
                            onClick={() => onSelectList(list.id)}
                          >
                            {list.color && (
                              <div
                                className="mr-2 h-2 w-2 rounded-full"
                                style={{ backgroundColor: list.color }}
                              />
                            )}
                            <span className="truncate">{list.name}</span>
                            {(list.lead_count ?? 0) > 0 && (
                              <Badge variant="secondary" className="ml-auto">
                                {list.lead_count}
                              </Badge>
                            )}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Empty State */}
                {leadLists.length === 0 && (
                  <div className="py-4 text-center">
                    <List className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                    <p className="text-muted-foreground text-sm">
                      No lists yet
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={onCreateList}
                      className="mt-2"
                    >
                      Create your first list
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
