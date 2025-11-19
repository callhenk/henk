'use client';

import { useState } from 'react';

import { Calendar, DollarSign, FileText, Phone, Settings, TrendingUp } from 'lucide-react';

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
      <DialogContent className="max-w-3xl">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl">Select Workflow Template</DialogTitle>
          <DialogDescription className="text-base">
            Choose a template to start building your workflow, or start from
            scratch
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 border-b pb-4">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="h-9 px-4"
            >
              All Templates
            </Button>
            <Button
              variant={
                selectedCategory === 'fundraising' ? 'default' : 'outline'
              }
              size="sm"
              onClick={() => setSelectedCategory('fundraising')}
              className="h-9 px-4"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Fundraising
            </Button>
            <Button
              variant={selectedCategory === 'sales' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('sales')}
              className="h-9 px-4"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Sales
            </Button>
            <Button
              variant={selectedCategory === 'support' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('support')}
              className="h-9 px-4"
            >
              <Phone className="mr-2 h-4 w-4" />
              Support
            </Button>
            <Button
              variant={selectedCategory === 'survey' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('survey')}
              className="h-9 px-4"
            >
              <FileText className="mr-2 h-4 w-4" />
              Survey
            </Button>
            <Button
              variant={selectedCategory === 'appointment' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('appointment')}
              className="h-9 px-4"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Appointments
            </Button>
          </div>

          {/* Template Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="group cursor-pointer border-2 transition-all hover:border-primary hover:shadow-md"
                onClick={() => onSelectTemplate(template)}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-muted group-hover:bg-primary/10 mt-0.5 rounded-lg p-2 transition-colors">
                          {getCategoryIcon(template.category)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-semibold leading-tight">
                            {template.name}
                          </h4>
                          <p className="text-muted-foreground text-sm leading-snug">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-xs font-medium">
                        {template.nodes.length} nodes
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Start from scratch option */}
          <Card className="group cursor-pointer border-2 border-dashed transition-all hover:border-primary hover:bg-muted/30">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="bg-muted group-hover:bg-primary/10 mt-0.5 rounded-lg p-2 transition-colors">
                  <Settings className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold leading-tight">Start from Scratch</h4>
                  <p className="text-muted-foreground text-sm leading-snug">
                    Create a custom workflow from the beginning
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4 mt-2">
          <Button variant="outline" onClick={onClose} className="px-6">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
