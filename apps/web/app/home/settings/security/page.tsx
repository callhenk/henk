import { use } from 'react';

import { Eye, Key, Lock, Shield } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { PageBody, PageHeader } from '@kit/ui/page';
import { Separator } from '@kit/ui/separator';

import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

export const generateMetadata = async () => {
  return {
    title: 'Security Settings',
  };
};

function SecuritySettingsPage() {
  const _user = use(requireUserInServerComponent());

  return (
    <>
      <PageHeader
        title="Security Settings"
        description="Manage your account security and privacy settings"
      />
      <PageBody>
        <div className="w-full max-w-3xl space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Security Overview</CardTitle>
              </div>
              <CardDescription>
                Current security status and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Two-Factor Auth
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    Not Enabled
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Last Login
                  </p>
                  <p className="text-sm">Today at 2:30 PM</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Password Strength
                  </p>
                  <Badge variant="default" className="mt-1">
                    Strong
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Active Sessions
                  </p>
                  <p className="text-sm">2 devices</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <CardTitle>Two-Factor Authentication</CardTitle>
              </div>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button>Enable 2FA</Button>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <CardTitle>Password</CardTitle>
              </div>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">Change Password</Button>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <CardTitle>Privacy Settings</CardTitle>
              </div>
              <CardDescription>
                Control your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">Manage Privacy</Button>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(SecuritySettingsPage);
