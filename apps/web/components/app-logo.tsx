import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@kit/ui/utils';

function LogoImage({
  className,
  width = 105,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <Image
      src="/images/logo-clear.png"
      alt="Henk AI"
      width={width}
      height={width * 0.3} // Assuming aspect ratio of roughly 3:1
      className={cn('h-auto object-contain', className)}
      priority
    />
  );
}

export function AppLogo({
  href,
  label,
  className,
}: {
  href?: string | null;
  className?: string;
  label?: string;
}) {
  if (href === null) {
    return <LogoImage className={cn('w-16 sm:w-20 md:w-auto', className)} />;
  }

  return (
    <Link aria-label={label ?? 'Home Page'} href={href ?? '/'}>
      <LogoImage className={cn('w-16 sm:w-20 md:w-auto', className)} />
    </Link>
  );
}
