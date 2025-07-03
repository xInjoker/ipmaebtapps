
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Settings</CardTitle>
          <CardDescription>
            Manage your application settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Appearance Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Appearance</h3>
            <Separator />
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="theme-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes.
                </p>
              </div>
              <Switch id="theme-mode" />
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notifications</h3>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important updates.
                  </p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get push notifications on your devices.
                  </p>
                </div>
                <Switch id="push-notifications" />
              </div>
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="project-updates">Project Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify me about updates on my projects.
                  </p>
                </div>
                <Switch id="project-updates" defaultChecked />
              </div>
            </div>
          </div>

           {/* Account Settings */}
           <div className="space-y-4">
            <h3 className="text-lg font-medium">Account</h3>
            <Separator />
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Export Data</p>
                <p className="text-sm text-muted-foreground">
                  Download all your project and user data.
                </p>
              </div>
              <Button variant="outline">Export</Button>
            </div>
             <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
              <div>
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button variant="destructive">Delete</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
