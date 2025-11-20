'use client';

import { Bell, Mail, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

import {
  useBusinessContext,
  useNotificationSettings,
  useUpdateNotificationSettings,
} from '@kit/supabase/hooks';
import { Badge } from '@kit/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Label } from '@kit/ui/label';
import { Separator } from '@kit/ui/separator';
import { Switch } from '@kit/ui/switch';

interface NotificationSettingsFormProps {
  userId: string;
}

export function NotificationSettingsForm({
  userId,
}: NotificationSettingsFormProps) {
  const { data: businessContext } = useBusinessContext();

  const { settings, isLoading } = useNotificationSettings({
    userId,
    businessId: businessContext?.business_id ?? '',
  });
  const updateSettings = useUpdateNotificationSettings();

  const handleToggle = async (
    field:
      | 'email_notifications'
      | 'push_notifications'
      | 'campaign_alerts'
      | 'weekly_reports',
    value: boolean,
  ) => {
    if (!businessContext) {
      toast.error('Unable to update settings');
      return;
    }

    try {
      await updateSettings.mutateAsync({
        userId,
        businessId: businessContext.business_id,
        updates: { [field]: value },
      });
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
      console.error('Error updating notification settings:', error);
    }
  };

  if (isLoading || !businessContext) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <CardTitle className="text-lg font-semibold tracking-tight">
              Notification Overview
            </CardTitle>
          </div>
          <CardDescription className="text-sm leading-relaxed">
            Current notification status and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Email Notifications
              </p>
              <Badge
                data-testid="email-notification-badge"
                variant={
                  settings?.email_notifications ? 'default' : 'secondary'
                }
                className="mt-1.5 font-medium"
              >
                {settings?.email_notifications ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Push Notifications
              </p>
              <Badge
                data-testid="push-notification-badge"
                variant={settings?.push_notifications ? 'default' : 'secondary'}
                className="mt-1.5 font-medium"
              >
                {settings?.push_notifications ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Campaign Alerts
              </p>
              <Badge
                data-testid="campaign-alerts-badge"
                variant={settings?.campaign_alerts ? 'default' : 'secondary'}
                className="mt-1.5 font-medium"
              >
                {settings?.campaign_alerts ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Weekly Reports
              </p>
              <Badge
                data-testid="weekly-reports-badge"
                variant={settings?.weekly_reports ? 'default' : 'secondary'}
                className="mt-1.5 font-medium"
              >
                {settings?.weekly_reports ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <CardTitle className="text-lg font-semibold tracking-tight">
              Email Notifications
            </CardTitle>
          </div>
          <CardDescription className="text-sm leading-relaxed">
            Configure email notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
          <p className="text-muted-foreground mb-5 text-sm leading-relaxed">
            Control which email notifications you receive for account activity,
            campaigns, and system updates.
          </p>
          <div className="flex items-center justify-between space-x-2">
            <Label
              htmlFor="email-notifications"
              className="flex flex-1 cursor-pointer flex-col space-y-1"
            >
              <span className="font-medium">Email Notifications</span>
              <span className="text-muted-foreground text-xs font-normal">
                Receive email updates about your account and campaigns
              </span>
            </Label>
            <Switch
              id="email-notifications"
              checked={settings?.email_notifications ?? true}
              onCheckedChange={(checked) =>
                handleToggle('email_notifications', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle className="text-lg font-semibold tracking-tight">
              Campaign Notifications
            </CardTitle>
          </div>
          <CardDescription className="text-sm leading-relaxed">
            Manage notifications for campaign events and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
          <p className="text-muted-foreground mb-5 text-sm leading-relaxed">
            Get notified about campaign starts, completions, and important
            milestones.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label
                htmlFor="campaign-alerts"
                className="flex flex-1 cursor-pointer flex-col space-y-1"
              >
                <span className="font-medium">Campaign Alerts</span>
                <span className="text-muted-foreground text-xs font-normal">
                  Get alerts for campaign starts, completions, and milestones
                </span>
              </Label>
              <Switch
                id="campaign-alerts"
                checked={settings?.campaign_alerts ?? true}
                onCheckedChange={(checked) =>
                  handleToggle('campaign_alerts', checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between space-x-2">
              <Label
                htmlFor="weekly-reports"
                className="flex flex-1 cursor-pointer flex-col space-y-1"
              >
                <span className="font-medium">Weekly Reports</span>
                <span className="text-muted-foreground text-xs font-normal">
                  Receive weekly summary reports of your campaigns
                </span>
              </Label>
              <Switch
                id="weekly-reports"
                checked={settings?.weekly_reports ?? true}
                onCheckedChange={(checked) =>
                  handleToggle('weekly_reports', checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <CardTitle className="text-lg font-semibold tracking-tight">
              Push Notifications
            </CardTitle>
          </div>
          <CardDescription className="text-sm leading-relaxed">
            Configure browser push notification settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
          <p className="text-muted-foreground mb-5 text-sm leading-relaxed">
            Enable push notifications to receive real-time updates in your
            browser.
          </p>
          <div className="flex items-center justify-between space-x-2">
            <Label
              htmlFor="push-notifications"
              className="flex flex-1 cursor-pointer flex-col space-y-1"
            >
              <span className="font-medium">Push Notifications</span>
              <span className="text-muted-foreground text-xs font-normal">
                Receive browser notifications for important updates
              </span>
            </Label>
            <Switch
              id="push-notifications"
              checked={settings?.push_notifications ?? false}
              onCheckedChange={(checked) =>
                handleToggle('push_notifications', checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
