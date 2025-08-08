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
            // Base glass container
            'relative overflow-hidden rounded-2xl border shadow-lg backdrop-blur-xl backdrop-saturate-150',
            // Light mode glass
            'border-white/30 bg-white/40',
            // Dark mode glass
            'dark:border-white/10 dark:bg-neutral-900/50',
            // Subtle ambient glow and highlight (mobile focused)
            "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-[linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0)_40%)] before:opacity-70 before:mix-blend-screen before:content-['']",
            "after:pointer-events-none after:absolute after:inset-[-32px] after:rounded-[24px] after:bg-[radial-gradient(100%_60%_at_50%_-20%,rgba(255,255,255,0.5),rgba(255,255,255,0))] after:opacity-40 after:blur-2xl after:content-['']",
            // Desktop: tone down effects
            'md:rounded-xl md:bg-white/50 md:backdrop-blur-md md:backdrop-saturate-100 md:before:opacity-40 md:after:opacity-20 md:after:blur-xl dark:md:bg-neutral-900/40',
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
