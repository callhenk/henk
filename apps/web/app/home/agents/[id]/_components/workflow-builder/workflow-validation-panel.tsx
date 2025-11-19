'use client';

import { useState } from 'react';

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';

import type { ValidationResult } from './workflow-validation';

interface WorkflowValidationPanelProps {
  validation: ValidationResult;
  onHighlightNodes?: (nodeIds: string[]) => void;
}

export function WorkflowValidationPanel({
  validation,
  onHighlightNodes,
}: WorkflowValidationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const errorCount = validation.issues.filter((i) => i.type === 'error').length;
  const warningCount = validation.issues.filter(
    (i) => i.type === 'warning',
  ).length;

  if (validation.isValid && validation.issues.length === 0) {
    return (
      <div
        data-testid="workflow-validation-success"
        className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950"
      >
        <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
        <span className="text-sm font-medium text-green-800 dark:text-green-200">
          Workflow is valid and ready to save
        </span>
      </div>
    );
  }

  return (
    <div
      data-testid="workflow-validation-panel"
      className={`mb-4 rounded-lg border ${
        errorCount > 0
          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
          : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-3 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
      >
        <div className="flex items-center gap-2">
          {errorCount > 0 ? (
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
          )}
          <span
            className={
              errorCount > 0
                ? 'text-red-800 dark:text-red-200'
                : 'text-yellow-800 dark:text-yellow-200'
            }
          >
            Workflow Validation Issues
          </span>
          <div className="flex gap-2">
            {errorCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errorCount} error{errorCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge
                variant="outline"
                className="border-yellow-600 text-xs text-yellow-600 dark:border-yellow-400 dark:text-yellow-400"
              >
                {warningCount} warning{warningCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-2 border-t p-3">
          {validation.issues.map((issue, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-md bg-white/50 p-2 dark:bg-black/20"
            >
              {issue.type === 'error' ? (
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm ${issue.type === 'error' ? 'text-red-800 dark:text-red-200' : 'text-yellow-800 dark:text-yellow-200'}`}
                >
                  {issue.message}
                </p>
                {issue.nodeIds &&
                  issue.nodeIds.length > 0 &&
                  onHighlightNodes && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => onHighlightNodes(issue.nodeIds!)}
                    >
                      Highlight affected nodes
                    </Button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
