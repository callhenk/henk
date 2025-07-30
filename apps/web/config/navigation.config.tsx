import {
  BarChart3,
  Database,
  Home,
  MessageSquare,
  Phone,
  User,
  Users,
} from 'lucide-react';
import { z } from 'zod';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import pathsConfig from '~/config/paths.config';

const iconClasses = 'w-4';

const routes = [
  {
    label: 'common:routes.application',
    children: [
      {
        label: 'Dashboard',
        path: pathsConfig.app.home,
        Icon: <Home className={iconClasses} />,
        end: true,
      },
      {
        label: 'Campaigns',
        path: '/campaigns',
        Icon: <Phone className={iconClasses} />,
        badge: '4 Active',
      },
      {
        label: 'Agents',
        path: '/agents',
        Icon: <Users className={iconClasses} />,
      },
      {
        label: 'Conversations',
        path: '/conversations',
        Icon: <MessageSquare className={iconClasses} />,
        badge: '124 Today',
      },
      {
        label: 'Integrations',
        path: '/integrations',
        Icon: <Database className={iconClasses} />,
      },
      {
        label: 'Analytics',
        path: '/analytics',
        Icon: <BarChart3 className={iconClasses} />,
      },
    ],
  },
  {
    label: 'common:routes.settings',
    children: [
      {
        label: 'common:routes.profile',
        path: pathsConfig.app.profileSettings,
        Icon: <User className={iconClasses} />,
      },
    ],
  },
] satisfies z.infer<typeof NavigationConfigSchema>['routes'];

export const navigationConfig = NavigationConfigSchema.parse({
  routes,
  style: process.env.NEXT_PUBLIC_NAVIGATION_STYLE,
  sidebarCollapsed: process.env.NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED,
});
