import { useCallback, useState } from 'react';

import { cn } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../shadcn/avatar';

type SessionProps = {
  displayName: string | null;
  pictureUrl?: string | null;
};

type TextProps = {
  text: string;
};

type ProfileAvatarProps = (SessionProps | TextProps) & {
  className?: string;
  fallbackClassName?: string;
  onImageError?: () => void;
};

export function ProfileAvatar(props: ProfileAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(
    'pictureUrl' in props ? props.pictureUrl : undefined,
  );

  const avatarClassName = cn(
    props.className,
    'mx-auto h-9 w-9 transition-transform duration-200 group-focus:ring-2 hover:scale-105',
  );

  const handleImageError = useCallback(() => {
    setImageError(true);
    props.onImageError?.();
  }, [props]);

  // Reset image error state when pictureUrl changes
  if ('pictureUrl' in props && imageSrc !== props.pictureUrl) {
    setImageSrc(props.pictureUrl);
    setImageError(false);
  }

  if ('text' in props) {
    return (
      <Avatar className={avatarClassName}>
        <AvatarFallback
          className={cn(
            props.fallbackClassName,
            'animate-in fade-in uppercase',
          )}
        >
          {props.text.slice(0, 1)}
        </AvatarFallback>
      </Avatar>
    );
  }

  const initials = props.displayName?.slice(0, 1);

  return (
    <Avatar className={avatarClassName}>
      {!imageError && imageSrc && (
        <AvatarImage
          src={imageSrc}
          onError={handleImageError}
          alt={`${props.displayName || 'User'} profile picture`}
        />
      )}

      <AvatarFallback
        className={cn(props.fallbackClassName, 'animate-in fade-in')}
      >
        <span suppressHydrationWarning className={'uppercase'}>
          {initials}
        </span>
      </AvatarFallback>
    </Avatar>
  );
}
