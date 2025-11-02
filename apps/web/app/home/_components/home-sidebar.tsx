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
import { Tables } from '~/lib/database.types';

export function HomeSidebar(props: {
  account?: Tables<'accounts'>;
  user: User;
}) {
  return (
    <Sidebar collapsible={'icon'} variant={'floating'}>
      <SidebarHeader className={'h-16 border-b px-4'}>
        <div className={'flex h-full items-center justify-center'}>
          <AppLogo className={'max-w-[64px]'} />
        </div>
      </SidebarHeader>

      <SidebarContent className={'flex-1'}>
        <div className={'p-4'}>
          <SidebarNavigation config={navigationConfig} />
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
