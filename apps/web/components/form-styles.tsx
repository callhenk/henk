import { ReactNode } from 'react';

import { Badge } from '@kit/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

interface FormSectionProps {
  title: string;
  description: string;
  icon: ReactNode;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'red';
  children: ReactNode;
  infoBox?: {
    title: string;
    description: string;
    badge?: string;
  };
}

const colorConfig = {
  blue: {
    border: 'border-blue-200 dark:border-blue-700',
    bg: 'bg-blue-100 dark:bg-blue-900',
    icon: 'text-blue-600 dark:text-blue-400',
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950',
      text: 'text-blue-700 dark:text-blue-300',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    },
  },
  purple: {
    border: 'border-purple-200 dark:border-purple-700',
    bg: 'bg-purple-100 dark:bg-purple-900',
    icon: 'text-purple-600 dark:text-purple-400',
    info: {
      bg: 'bg-purple-50 dark:bg-purple-950',
      text: 'text-purple-700 dark:text-purple-300',
      badge:
        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    },
  },
  green: {
    border: 'border-green-200 dark:border-green-700',
    bg: 'bg-green-100 dark:bg-green-900',
    icon: 'text-green-600 dark:text-green-400',
    info: {
      bg: 'bg-green-50 dark:bg-green-950',
      text: 'text-green-700 dark:text-green-300',
      badge:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    },
  },
  orange: {
    border: 'border-orange-200 dark:border-orange-700',
    bg: 'bg-orange-100 dark:bg-orange-900',
    icon: 'text-orange-600 dark:text-orange-400',
    info: {
      bg: 'bg-orange-50 dark:bg-orange-950',
      text: 'text-orange-700 dark:text-orange-300',
      badge:
        'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    },
  },
  red: {
    border: 'border-red-200 dark:border-red-700',
    bg: 'bg-red-100 dark:bg-red-900',
    icon: 'text-red-600 dark:text-red-400',
    info: {
      bg: 'bg-red-50 dark:bg-red-950',
      text: 'text-red-700 dark:text-red-300',
      badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    },
  },
};

export function FormSection({
  title,
  description,
  icon,
  color,
  children,
  infoBox,
}: FormSectionProps) {
  const config = colorConfig[color];

  return (
    <Card className={`border-2 border-dashed ${config.border}`}>
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${config.bg}`}
          >
            <div className={config.icon}>{icon}</div>
          </div>
          {title}
        </CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {infoBox && (
          <div className={`rounded-lg p-4 ${config.info.bg}`}>
            {infoBox.badge && (
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline" className={config.info.badge}>
                  {infoBox.badge}
                </Badge>
                <span className={`text-sm ${config.info.text}`}>
                  {infoBox.title}
                </span>
              </div>
            )}
            <p className={`text-sm ${config.info.text}`}>
              {infoBox.description}
            </p>
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

// Common form field styles
export const formFieldStyles = {
  label: 'text-base font-medium mb-2',
  input: 'h-12 text-base',
  textarea: 'min-h-[160px] text-base resize-none',
  select: 'h-12 text-base',
  description: 'text-sm text-muted-foreground mt-2',
};

// Common button styles
export const buttonStyles = {
  primary: 'px-8',
  size: 'lg',
};

// Common page header styles
export const pageHeaderStyles = {
  title: 'text-3xl font-bold tracking-tight',
  description: 'text-muted-foreground mt-2',
  container: 'mb-10 flex items-center justify-between',
  backButton: 'gap-4',
};

// Common form container styles
export const formContainerStyles = {
  container: 'mx-auto max-w-4xl space-y-8',
  form: 'space-y-10',
  buttons:
    'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-6',
  buttonGroup: 'flex gap-4',
};
