'use client';

import Link from 'next/link';

import { LogOut, Menu } from 'lucide-react';

import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { useUser } from '@kit/supabase/hooks/use-user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Trans } from '@kit/ui/trans';

import { navigationConfig } from '~/config/navigation.config';
import pathsConfig from '~/config/paths.config';

/**
 * Mobile navigation for the home page
 * @constructor
 */
export function HomeMobileNavigation() {
  const signOut = useSignOut();
  const { data: user } = useUser();

  // Filter navigation routes based on user's email domain
  const isCallHenkUser = user?.email?.endsWith('@callhenk.com') ?? false;

  const Links = navigationConfig.routes.map((item, index) => {
    if ('children' in item) {
      const filteredChildren = item.children.filter((child) => {
        // Hide Calls route for non-callhenk.com users
        if (child.path === pathsConfig.app.calls && !isCallHenkUser) {
          return false;
        }
        return true;
      });

      return filteredChildren.map((child) => {
        return (
          <DropdownLink
            key={child.path}
            Icon={child.Icon}
            path={child.path}
            label={child.label}
          />
        );
      });
    }

    if ('divider' in item) {
      return <DropdownMenuSeparator key={index} />;
    }
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={'Open menu'}>
        <Menu className={'h-7 w-7'} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        sideOffset={10}
        className={'glass-panel mx-2 !w-[calc(100vw-16px)] p-1'}
      >
        <DropdownMenuGroup>{Links}</DropdownMenuGroup>

        <DropdownMenuSeparator />

        <SignOutDropdownItem onSignOut={() => signOut.mutateAsync()} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DropdownLink(
  props: React.PropsWithChildren<{
    path: string;
    label: string;
    Icon: React.ReactNode;
  }>,
) {
  return (
    <DropdownMenuItem asChild key={props.path}>
      <Link
        href={props.path}
        className={'flex h-10 w-full items-center space-x-3'}
      >
        {props.Icon}

        <span>
          <Trans i18nKey={props.label} defaults={props.label} />
        </span>
      </Link>
    </DropdownMenuItem>
  );
}

function SignOutDropdownItem(
  props: React.PropsWithChildren<{
    onSignOut: () => unknown;
  }>,
) {
  return (
    <DropdownMenuItem
      className={'flex h-10 w-full items-center space-x-3'}
      onClick={props.onSignOut}
    >
      <LogOut className={'h-6'} />

      <span>
        <Trans i18nKey={'common:signOut'} defaults={'Sign out'} />
      </span>
    </DropdownMenuItem>
  );
}
