
'use client';

import { useTheme } from 'next-themes';
import { useColorTheme } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';
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
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const themes = [
  { name: 'indigo', color: 'hsl(271 100% 25.1%)' },
  { name: 'green', color: 'hsl(142.1 76.2% 36.3%)' },
  { name: 'rose', color: 'hsl(346.8 77.2% 49.8%)' },
];

export default function SettingsPage() {
  const { theme: mode, setTheme: setMode } = useTheme();
  const { theme: colorTheme, setTheme: setColorTheme } = useColorTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render skeleton or null to avoid hydration mismatch
    return null; 
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
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
              <Switch 
                id="theme-mode" 
                checked={mode === 'dark'}
                onCheckedChange={(checked) => setMode(checked ? 'dark' : 'light')}
              />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label>Theme Color</Label>
                <p className="text-sm text-muted-foreground">
                  Select a color scheme for the application.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {themes.map((theme) => (
                  <Button
                    key={theme.name}
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-full",
                      colorTheme === theme.name && "border-2 border-primary"
                    )}
                    onClick={() => setColorTheme(theme.name as any)}
                  >
                    <div
                      className="flex h-5 w-5 items-center justify-center rounded-full"
                      style={{ backgroundColor: theme.color }}
                    >
                      {colorTheme === theme.name && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="sr-only">{theme.name}</span>
                  </Button>
                ))}
              </div>
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
