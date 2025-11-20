'use client';

import { useState } from 'react';

import {
  Calendar,
  DollarSign,
  FileText,
  Phone,
  Settings,
  TrendingUp,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';

import {
  type WorkflowTemplate,
  workflowTemplates,
} from '../workflow-templates';

interface TemplateSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: WorkflowTemplate) => void;
}

export function TemplateSelectionDialog({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplateSelectionDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates =
    selectedCategory === 'all'
      ? workflowTemplates
      : workflowTemplates.filter(
          (template) => template.category === selectedCategory,
        );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fundraising':
        return <DollarSign className="h-4 w-4" />;
      case 'support':
        return <Phone className="h-4 w-4" />;
      case 'survey':
        return <FileText className="h-4 w-4" />;
      case 'sales':
        return <TrendingUp className="h-4 w-4" />;
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-3xl overflow-hidden p-0 sm:w-full">
        <div className="flex max-h-[90vh] flex-col">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="text-xl sm:text-2xl">
              Select Workflow Template
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Choose a template to start building your workflow, or start from
              scratch
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 border-b pb-4">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm"
              >
                All Templates
              </Button>
              <Button
                variant={
                  selectedCategory === 'fundraising' ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedCategory('fundraising')}
                className="h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm"
              >
                <DollarSign className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Fundraising</span>
                <span className="sm:hidden">Fund</span>
              </Button>
              <Button
                variant={selectedCategory === 'sales' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('sales')}
                className="h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm"
              >
                <TrendingUp className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                Sales
              </Button>
              <Button
                variant={selectedCategory === 'support' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('support')}
                className="h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm"
              >
                <Phone className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                Support
              </Button>
              <Button
                variant={selectedCategory === 'survey' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('survey')}
                className="h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm"
              >
                <FileText className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                Survey
              </Button>
              <Button
                variant={
                  selectedCategory === 'appointment' ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedCategory('appointment')}
                className="h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm"
              >
                <Calendar className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Appointments</span>
                <span className="sm:hidden">Appts</span>
              </Button>
            </div>

            {/* Template Grid */}
            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="group hover:border-primary cursor-pointer border-2 transition-all hover:shadow-md"
                  onClick={() => onSelectTemplate(template)}
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="bg-muted group-hover:bg-primary/10 mt-0.5 rounded-lg p-1.5 transition-colors sm:p-2">
                            {getCategoryIcon(template.category)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <h4 className="text-sm leading-tight font-semibold sm:text-base">
                              {template.name}
                            </h4>
                            <p className="text-muted-foreground text-xs leading-snug sm:text-sm">
                              {template.description}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="shrink-0 text-xs font-medium"
                        >
                          {template.nodes.length}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Start from scratch option */}
            <Card className="group hover:border-primary hover:bg-muted/30 cursor-pointer border-2 border-dashed transition-all">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="bg-muted group-hover:bg-primary/10 mt-0.5 rounded-lg p-1.5 transition-colors sm:p-2">
                    <Settings className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm leading-tight font-semibold sm:text-base">
                      Start from Scratch
                    </h4>
                    <p className="text-muted-foreground text-xs leading-snug sm:text-sm">
                      Create a custom workflow from the beginning
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 border-t px-6 py-3 sm:gap-3 sm:py-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-4 sm:px-6"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
