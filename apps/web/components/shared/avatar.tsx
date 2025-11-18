import { User } from 'lucide-react';

interface AvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'active' | 'inactive' | 'online' | 'offline';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
} as const;

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
} as const;

const statusColors = {
  active: 'bg-green-500',
  inactive: 'bg-gray-400',
  online: 'bg-green-500',
  offline: 'bg-gray-400',
} as const;

export function Avatar({ name, size = 'md', status, className }: AvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative ${className || ''}`}>
      <div
        className={`bg-muted flex ${sizeClasses[size]} items-center justify-center rounded-full`}
      >
        {name ? (
          <span
            className={`text-muted-foreground font-medium ${iconSizes[size]}`}
          >
            {getInitials(name)}
          </span>
        ) : (
          <User className={`text-muted-foreground ${iconSizes[size]}`} />
        )}
      </div>
      {status && (
        <div
          className={`absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white ${
            statusColors[status]
          }`}
        />
      )}
    </div>
  );
}
