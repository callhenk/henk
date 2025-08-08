import * as React from 'react';

import { cn } from '../lib/utils';
import { Separator } from '../shadcn/separator';
import { SidebarTrigger } from '../shadcn/sidebar';
import { If } from './if';

export type PageLayoutStyle = 'sidebar' | 'header' | 'custom';

type PageProps = React.PropsWithChildren<{
  style?: PageLayoutStyle;
  contentContainerClassName?: string;
  className?: string;
  sticky?: boolean;
}>;

const ENABLE_SIDEBAR_TRIGGER = process.env.NEXT_PUBLIC_ENABLE_SIDEBAR_TRIGGER
  ? process.env.NEXT_PUBLIC_ENABLE_SIDEBAR_TRIGGER === 'true'
  : true;

export function Page(props: PageProps) {
  switch (props.style) {
    case 'header':
      return <PageWithHeader {...props} />;

    case 'custom':
      return props.children;

    default:
      return <PageWithSidebar {...props} />;
  }
}

function PageWithSidebar(props: PageProps) {
  const { Navigation, Children, MobileNavigation } = getSlotsFromPage(props);

  return (
    <div className={cn('flex min-w-0 flex-1', props.className)}>
      {Navigation}

      <div
        className={
          props.contentContainerClassName ??
          'mx-auto flex min-h-screen w-full flex-col overflow-y-auto bg-transparent'
        }
      >
        {MobileNavigation}

        <div className={'flex flex-1 flex-col'}>{Children}</div>
      </div>
    </div>
  );
}

export function PageMobileNavigation(
  props: React.PropsWithChildren<{
    className?: string;
  }>,
) {
  return (
    <div className={cn('lg:hidden', props.className)}>{props.children}</div>
  );
}

function PageWithHeader(props: PageProps) {
  const { Navigation, Children, MobileNavigation } = getSlotsFromPage(props);

  return (
    <div className={cn('flex h-screen flex-1 flex-col', props.className)}>
      <div
        className={
          props.contentContainerClassName ?? 'flex flex-1 flex-col space-y-4'
        }
      >
        <div
          className={cn(
            // Mobile: floating glass header (Big Sur/iOS-style)
            'relative mx-2 mt-2 flex h-12 items-center justify-between overflow-hidden rounded-2xl border border-white/30 bg-white/40 px-3 shadow-lg backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-neutral-900/50',
            // Highlights and ambient glow for depth
            "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-[linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0)_40%)] before:opacity-70 before:mix-blend-screen before:content-['']",
            "after:pointer-events-none after:absolute after:inset-[-32px] after:rounded-[24px] after:bg-[radial-gradient(100%_60%_at_50%_-20%,rgba(255,255,255,0.5),rgba(255,255,255,0))] after:opacity-40 after:blur-2xl after:content-['']",
            // Desktop: align and flatten
            'md:h-14 md:px-4 md:before:opacity-40 md:after:opacity-20 md:after:blur-xl lg:mx-0 lg:mt-0 lg:justify-start lg:rounded-none lg:border-0 lg:bg-transparent lg:shadow-xs',
            {
              'sticky top-2 z-40': props.sticky ?? true,
            },
          )}
        >
          <div
            className={'hidden w-full flex-1 items-center space-x-8 lg:flex'}
          >
            {Navigation}
          </div>

          {MobileNavigation}
        </div>

        <div className={'flex flex-1 flex-col'}>{Children}</div>
      </div>
    </div>
  );
}

export function PageBody(
  props: React.PropsWithChildren<{
    className?: string;
  }>,
) {
  const className = cn(
    'flex w-full flex-1 flex-col px-4 lg:px-6 xl:px-8',
    props.className,
  );

  return <div className={className}>{props.children}</div>;
}

export function PageNavigation(props: React.PropsWithChildren) {
  return <div className={'flex-1 bg-inherit'}>{props.children}</div>;
}

export function PageDescription(props: React.PropsWithChildren) {
  return (
    <div className={'flex h-6 items-center'}>
      <div className={'text-muted-foreground text-xs leading-none font-normal'}>
        {props.children}
      </div>
    </div>
  );
}

export function PageTitle(props: React.PropsWithChildren) {
  return (
    <h1
      className={
        'font-heading text-base leading-none font-bold tracking-tight dark:text-white'
      }
    >
      {props.children}
    </h1>
  );
}

export function PageHeaderActions(props: React.PropsWithChildren) {
  return <div className={'flex items-center space-x-2'}>{props.children}</div>;
}

export function PageHeader({
  children,
  title,
  description,
  className,
  displaySidebarTrigger = ENABLE_SIDEBAR_TRIGGER,
}: React.PropsWithChildren<{
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  displaySidebarTrigger?: boolean;
}>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-6 lg:px-6 xl:px-8',
        className,
      )}
    >
      <div className={'flex flex-col gap-y-2'}>
        <div className="flex items-center gap-x-2.5">
          {displaySidebarTrigger ? (
            <SidebarTrigger className="text-muted-foreground hover:text-secondary-foreground hidden h-4.5 w-4.5 cursor-pointer lg:inline-flex" />
          ) : null}

          <If condition={description}>
            <If condition={displaySidebarTrigger}>
              <Separator
                orientation="vertical"
                className="hidden h-4 w-px lg:group-data-[minimized]:block"
              />
            </If>

            <PageDescription>{description}</PageDescription>
          </If>
        </div>

        <If condition={title}>
          <PageTitle>{title}</PageTitle>
        </If>
      </div>

      {children}
    </div>
  );
}

function getSlotsFromPage(props: React.PropsWithChildren) {
  return React.Children.toArray(props.children).reduce<{
    Children: React.ReactElement | null;
    Navigation: React.ReactElement | null;
    MobileNavigation: React.ReactElement | null;
  }>(
    (acc, child) => {
      if (!React.isValidElement(child)) {
        return acc;
      }

      if (child.type === PageNavigation) {
        return {
          ...acc,
          Navigation: child,
        };
      }

      if (child.type === PageMobileNavigation) {
        return {
          ...acc,
          MobileNavigation: child,
        };
      }

      return {
        ...acc,
        Children: child,
      };
    },
    {
      Children: null,
      Navigation: null,
      MobileNavigation: null,
    },
  );
}
