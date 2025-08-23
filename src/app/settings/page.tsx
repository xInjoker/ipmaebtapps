
'use client';

import { useTheme } from 'next-themes';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataInjectionForm } from '@/components/data-injection-form';
import { useAuth } from '@/context/AuthContext';


export default function SettingsPage() {
  const { theme: mode, setTheme: setMode } = useTheme();
  const { userHasPermission } = useAuth();
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
        <Tabs defaultValue="appearance">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                {userHasPermission('super-admin') && (
                  <TabsTrigger value="data-injection">Data Injection</TabsTrigger>
                )}
            </TabsList>
            <TabsContent value="appearance">
                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>
                            Manage your application theme preferences.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="notifications">
                 <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>
                            Configure how you receive notifications from the app.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent>
                </Card>
            </TabsContent>
            {userHasPermission('super-admin') && (
                <TabsContent value="data-injection">
                   <DataInjectionForm />
                </TabsContent>
            )}
        </Tabs>
    </div>
  );
}
