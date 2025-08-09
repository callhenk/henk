'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Bell, Building2, CreditCard, Shield, User, Users } from 'lucide-react';

import { Button } from '@kit/ui/button';

const settingsNavItems = [
  {
    title: 'Account',
    href: '/home/settings',
    icon: User,
  },
  {
    title: 'Business',
    href: '/home/settings/business',
    icon: Building2,
  },
  {
    title: 'Team',
    href: '/home/settings/team',
    icon: Users,
  },
  {
    title: 'Security',
    href: '/home/settings/security',
    icon: Shield,
  },
  {
    title: 'Notifications',
    href: '/home/settings/notifications',
    icon: Bell,
  },
  {
    title: 'Billing',
    href: '/home/settings/billing',
    icon: CreditCard,
  },
];

function UserSettingsLayout(props: React.PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="flex w-full gap-5 px-3 pt-2 pb-4 lg:px-4 xl:px-6">
      {/* Sidebar (desktop) */}
      <aside className="glass-panel sticky top-24 hidden h-fit w-60 shrink-0 rounded-md border p-1.5 lg:block">
        <nav className="flex flex-col gap-1">
          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.href}
                variant={isActive ? 'secondary' : 'ghost'}
                className="justify-start"
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top nav */}
        <div className="glass-panel -mx-2 mb-3 block snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth rounded-md border p-1.5 pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max flex-nowrap gap-2">
            {settingsNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'outline'}
                  size="sm"
                  className="shrink-0 snap-start"
                  asChild
                >
                  <Link href={item.href} className="whitespace-nowrap">
                    <Icon className="mr-1.5 h-3.5 w-3.5" />
                    {item.title}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Page content */}
        {props.children}
      </div>
    </div>
  );
}

export default UserSettingsLayout;
