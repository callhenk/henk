import {
  Bell,
  Building2,
  ChevronRight,
  CreditCard,
  Shield,
  User,
  Users,
} from 'lucide-react';

import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { Button } from '@kit/ui/button';
import { PageHeader } from '@kit/ui/page';

import { withI18n } from '~/lib/i18n/with-i18n';

const settingsNavItems = [
  {
    title: 'Account',
    href: '/home/settings',
    icon: User,
    description: 'Personal account settings',
  },
  {
    title: 'Business',
    href: '/home/settings/business',
    icon: Building2,
    description: 'Manage businesses and teams',
  },
  {
    title: 'Team',
    href: '/home/settings/team',
    icon: Users,
    description: 'Team member management',
  },
  {
    title: 'Security',
    href: '/home/settings/security',
    icon: Shield,
    description: 'Security and privacy settings',
  },
  {
    title: 'Notifications',
    href: '/home/settings/notifications',
    icon: Bell,
    description: 'Notification preferences',
  },
  {
    title: 'Billing',
    href: '/home/settings/billing',
    icon: CreditCard,
    description: 'Billing and subscription',
  },
];

function UserSettingsLayout(props: React.PropsWithChildren) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 w-64 border-r backdrop-blur">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Settings
            </h2>
            <div className="space-y-1">
              {settingsNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href={item.href}>
                      <Icon className="mr-2 h-4 w-4" />
                      {item.title}
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <PageHeader description={<AppBreadcrumbs />} />
        <div className="p-6">{props.children}</div>
      </div>
    </div>
  );
}

export default withI18n(UserSettingsLayout);
