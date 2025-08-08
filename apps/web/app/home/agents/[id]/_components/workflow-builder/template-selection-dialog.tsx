'use client';

import { useState } from 'react';

import { DollarSign, FileText, Phone, Settings } from 'lucide-react';

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
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Workflow Template</DialogTitle>
          <DialogDescription>
            Choose a template to start building your workflow, or start from
            scratch
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Templates
            </Button>
            <Button
              variant={
                selectedCategory === 'fundraising' ? 'default' : 'outline'
              }
              size="sm"
              onClick={() => setSelectedCategory('fundraising')}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Fundraising
            </Button>
            <Button
              variant={selectedCategory === 'support' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('support')}
            >
              <Phone className="mr-2 h-4 w-4" />
              Support
            </Button>
            <Button
              variant={selectedCategory === 'survey' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('survey')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Survey
            </Button>
          </div>

          {/* Template Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer transition-all hover:opacity-90"
                onClick={() => onSelectTemplate(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-muted-foreground text-sm">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {template.nodes.length} nodes
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Start from scratch option */}
          <Card className="cursor-pointer transition-all hover:opacity-90">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <div>
                  <h4 className="font-medium">Start from Scratch</h4>
                  <p className="text-muted-foreground text-sm">
                    Create a custom workflow from the beginning
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
