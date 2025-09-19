import { Loader2 } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';

import { OauthProviderLogoImage } from './oauth-provider-logo-image';

export function AuthProviderButton({
  providerId,
  onClick,
  children,
  loading = false,
  disabled = false,
}: React.PropsWithChildren<{
  providerId: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}>) {
  return (
    <Button
      className={
        'relative flex w-full space-x-2 overflow-hidden text-center transition-all duration-200'
      }
      data-provider={providerId}
      data-test={'auth-provider-button'}
      variant={'outline'}
      onClick={onClick}
      disabled={loading || disabled}
    >
      <If
        condition={loading}
        fallback={<OauthProviderLogoImage providerId={providerId} />}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </If>

      <span className={loading ? 'opacity-75' : ''}>{children}</span>
    </Button>
  );
}
