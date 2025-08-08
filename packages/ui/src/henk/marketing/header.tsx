import { cn } from '../../lib/utils';

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  logo?: React.ReactNode;
  navigation?: React.ReactNode;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = function ({
  className,
  logo,
  navigation,
  actions,
  ...props
}) {
  return (
    <div
      className={cn(
        'site-header sticky top-2 z-40 w-full px-2 pt-2 pb-0',
        className,
      )}
      {...props}
    >
      <div className="container">
        <div
          className={cn(
            'glass-panel',
            // Desktop: tone down effects
            'md:rounded-xl md:bg-white/50 md:backdrop-blur-md md:backdrop-saturate-100 dark:md:bg-neutral-900/40',
          )}
        >
          <div className="grid h-12 grid-cols-3 items-center px-3 py-2 md:h-14 md:px-4 md:py-0">
            <div className={'mx-auto md:mx-0'}>{logo}</div>
            <div className="order-first md:order-none">{navigation}</div>
            <div className="flex items-center justify-end gap-x-2">
              {actions}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
