import type { User } from '@supabase/supabase-js';

import {
  BorderedNavigationMenu,
  BorderedNavigationMenuItem,
} from '@kit/ui/bordered-navigation-menu';

import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import { navigationConfig } from '~/config/navigation.config';
import pathsConfig from '~/config/paths.config';

export function HomeMenuNavigation({ user }: { user: User }) {
  // Filter navigation routes based on user's email domain
  const isCallHenkUser = user.email?.endsWith('@callhenk.com') ?? false;

  const routes = navigationConfig.routes.reduce<
    Array<{
      path: string;
      label: string;
      Icon?: React.ReactNode;
      end?: boolean | ((path: string) => boolean);
    }>
  >((acc, item) => {
    if ('children' in item) {
      const filteredChildren = item.children.filter((route) => {
        // Hide Calls route for non-callhenk.com users
        if (route.path === pathsConfig.app.calls && !isCallHenkUser) {
          return false;
        }
        return true;
      });
      return [...acc, ...filteredChildren];
    }

    if ('divider' in item) {
      return acc;
    }

    return [...acc, item];
  }, []);

  return (
    <div className={'flex w-full flex-1 justify-between'}>
      <div className={'flex items-center space-x-8'}>
        <AppLogo size="small" />

        <BorderedNavigationMenu>
          {routes.map((route) => (
            <BorderedNavigationMenuItem {...route} key={route.path} />
          ))}
        </BorderedNavigationMenu>
      </div>

      <div className={'flex justify-end space-x-2.5'}>
        <div>
          <ProfileAccountDropdownContainer showProfileName={false} />
        </div>
      </div>
    </div>
  );
}
