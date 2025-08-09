import { use } from 'react';

import { AlertTriangle, Bell, Mail, MessageSquare } from 'lucide-react';

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
    title: 'Notification Settings',
  };
};

function NotificationSettingsPage() {
  const _user = use(requireUserInServerComponent());

  return (
    <>
      <PageHeader
        title="Notification Settings"
        description="Manage your notification preferences and communication settings"
      />
      <PageBody>
        <div className="w-full max-w-3xl space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notification Overview</CardTitle>
              </div>
              <CardDescription>
                Current notification status and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Email Notifications
                  </p>
                  <Badge variant="default" className="mt-1">
                    Enabled
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Push Notifications
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    Disabled
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Campaign Alerts
                  </p>
                  <Badge variant="default" className="mt-1">
                    Enabled
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Weekly Reports
                  </p>
                  <Badge variant="default" className="mt-1">
                    Enabled
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <CardTitle>Email Notifications</CardTitle>
              </div>
              <CardDescription>
                Configure email notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">Configure Email Settings</Button>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <CardTitle>Campaign Notifications</CardTitle>
              </div>
              <CardDescription>
                Manage notifications for campaign events and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">Configure Campaign Alerts</Button>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <CardTitle>System Alerts</CardTitle>
              </div>
              <CardDescription>
                Configure system and security notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">Configure System Alerts</Button>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(NotificationSettingsPage);
