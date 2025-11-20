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
    <div className="flex w-full justify-center px-4 pt-2 pb-8 lg:px-6 xl:px-8">
      <div className="flex w-full max-w-[1400px] gap-8">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-24 hidden h-fit w-56 shrink-0 rounded-lg border-2 border-border bg-card p-2 lg:block">
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
          {/* Mobile top nav - sticky */}
          <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-14 z-10 -mx-4 -mt-2 mb-0 block backdrop-blur lg:hidden">
            <div className="snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth border-b px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex flex-nowrap gap-2 pr-4">
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
          </div>

          {/* Page content with top padding on mobile */}
          <div className="pt-6 lg:pt-0">{props.children}</div>
        </div>
      </div>
    </div>
  );
}

export default UserSettingsLayout;
