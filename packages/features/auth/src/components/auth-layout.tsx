export function AuthLayoutShell({
  children,
  Logo,
}: React.PropsWithChildren<{
  Logo?: React.ComponentType;
}>) {
  return (
    <div
      className={
        // Container: use min-h-screen (not h-screen) to allow natural scroll on mobile,
        // add responsive paddings, and reduce heavy effects on small screens
        'relative min-h-screen w-full px-4 py-8 md:px-6 md:py-12' +
        ' flex flex-col items-center justify-center gap-y-8 bg-transparent lg:gap-y-10' +
        ' animate-in fade-in zoom-in-95 md:slide-in-from-top-16 duration-700'
      }
    >
      {Logo ? (
        <div className="mb-4 flex w-full items-center justify-center md:mb-6">
          {/* Slightly smaller logo on mobile for better vertical spacing */}
          <div className="scale-90 md:scale-100">
            <Logo />
          </div>
        </div>
      ) : null}

      <div
        className={
          // Card: full-width on mobile with comfortable paddings,
          // smooth readability, and toned-down effects for performance
          'relative flex w-full max-w-md flex-col gap-y-5 rounded-2xl' +
          ' bg-white/85 px-5 py-5 shadow-xl ring-1 ring-black/10 backdrop-blur-md backdrop-saturate-150' +
          ' md:gap-y-6 md:px-8 md:py-6 lg:max-w-lg lg:px-8 xl:max-w-xl xl:gap-y-8 xl:py-8' +
          ' dark:bg-neutral-900/70 dark:ring-white/10'
        }
      >
        {children}
      </div>
    </div>
  );
}
