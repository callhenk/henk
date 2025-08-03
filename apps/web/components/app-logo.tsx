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
      alt="Henk"
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
  size = 'default',
}: {
  href?: string | null;
  className?: string;
  label?: string;
  size?: 'small' | 'default' | 'large';
}) {
  const sizeClasses = {
    small: 'w-12 sm:w-14 md:w-16',
    default: 'w-16 sm:w-20 md:w-24 lg:w-28',
    large: 'w-20 sm:w-24 md:w-28 lg:w-32',
  };

  if (href === null) {
    return <LogoImage className={cn(sizeClasses[size], className)} />;
  }

  return (
    <Link aria-label={label ?? 'Home Page'} href={href ?? '/'}>
      <LogoImage className={cn(sizeClasses[size], className)} />
    </Link>
  );
}
