'use client';

import { ArrowLeft, ChevronRight } from 'lucide-react';

import { Button } from '@kit/ui/button';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description: string;
  onBack: () => void;
  backLabel?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

export function PageHeader({
  title,
  description,
  onBack,
  backLabel = 'Back',
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div className={`mb-8 ${className || ''}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4 flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
              )}
              {item.href ? (
                <a
                  href={item.href}
                  className="hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-gray-600 dark:text-gray-300">
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      )}

      <div className="flex flex-col space-y-6 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div className="flex items-start space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
            size="sm"
            className="group relative mt-1 -ml-2 flex-shrink-0 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="sr-only">{backLabel}</span>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl dark:text-gray-100">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-400">
              {description}
            </p>
          </div>
        </div>

        {actions && (
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
