import type { User } from '@supabase/supabase-js';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNavigation,
} from '@kit/ui/shadcn-sidebar';

import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import { navigationConfig } from '~/config/navigation.config';
import pathsConfig from '~/config/paths.config';
import { Tables } from '~/lib/database.types';

export function HomeSidebar(props: {
  account?: Tables<'accounts'>;
  user: User;
}) {
  // Filter navigation routes based on user's email domain
  const isCallHenkUser = props.user.email?.endsWith('@callhenk.com') ?? false;

  const filteredConfig = {
    ...navigationConfig,
    routes: navigationConfig.routes.map((section) => {
      if ('children' in section) {
        return {
          ...section,
          children: section.children.filter((route) => {
            // Hide Calls route for non-callhenk.com users
            if (route.path === pathsConfig.app.calls && !isCallHenkUser) {
              return false;
            }
            return true;
          }),
        };
      }
      return section;
    }),
  };

  return (
    <Sidebar collapsible={'icon'} variant={'floating'}>
      <SidebarHeader className={'h-16 border-b px-4'}>
        <div className={'flex h-full items-center justify-center'}>
          <AppLogo className={'max-w-[64px]'} />
        </div>
      </SidebarHeader>

      <SidebarContent className={'flex-1'}>
        <div className={'p-4'}>
          <SidebarNavigation config={filteredConfig} />
        </div>
      </SidebarContent>

      <SidebarFooter className={'border-t p-4'}>
        <ProfileAccountDropdownContainer
          user={props.user}
          account={
            props.account
              ? {
                  id: props.account.id,
                  name: props.account.name,
                  picture_url: props.account.picture_url,
                }
              : undefined
          }
        />
      </SidebarFooter>
    </Sidebar>
  );
}
