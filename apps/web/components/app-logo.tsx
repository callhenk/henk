import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@kit/ui/utils';

function LogoImage({
  className,
  width = 60,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <Image
      src="/images/favicon/apple-touch-icon.png"
      alt="Henk"
      width={width}
      height={width}
      className={cn('rounded-xl', className)}
      priority
      quality={95}
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
    small: 'w-10 sm:w-8 md:w-8',
    default: 'w-12 sm:w-12 md:w-12 lg:w-12',
    large: 'w-14 sm:w-14 md:w-14 lg:w-14',
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
