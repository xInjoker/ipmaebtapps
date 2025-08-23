
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, Signature, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getInitials, getAvatarColor, fileToBase64 } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/context/NotificationContext';

export default function ProfilePage() {
  const { user, roles, updateUser, updatePassword } = useAuth();
  const { toast } = useToast();
  const { notifications } = useNotifications();

  // State for profile editing
  const [fullName, setFullName] = useState(user?.name || '');
  const [newSignatureFile, setNewSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(user?.signatureUrl || null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);


  useEffect(() => {
    if (user) {
      if (!isEditing) {
        setFullName(user.name);
        setSignaturePreview(user.signatureUrl || null);
      }
    }
  }, [user, isEditing]);
  
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    setIsEditing(true);
  }, []);

  const handleSignatureUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewSignatureFile(file);
      const previewUrl = await fileToBase64(file) as string;
      setSignaturePreview(previewUrl);
      setIsEditing(true); 
    }
  }, []);
  
  const removeSignature = useCallback(() => {
      setNewSignatureFile(null);
      setSignaturePreview(null);
      setIsEditing(true);
  }, []);

  const handleSaveChanges = useCallback(async () => {
    if (!user) return;
    setIsSaving(true);
    
    let updatedData: { name: string; signatureUrl?: string } = { name: fullName };

    if (newSignatureFile) {
        // This is handled in the context now
    } else if (!signaturePreview) {
        // This means the signature was removed
        updatedData.signatureUrl = '';
    }

    try {
        await updateUser(user.uid, updatedData, newSignatureFile);
        toast({
            title: 'Profile Updated',
            description: 'Your personal information has been saved.',
        });
        setNewSignatureFile(null);
        setIsEditing(false);
    } catch (error) {
        console.error("Profile update failed", error);
        toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save profile changes.' });
    } finally {
        setIsSaving(false);
    }
  }, [user, fullName, newSignatureFile, signaturePreview, updateUser, toast]);

  const handlePasswordUpdate = useCallback(async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill all password fields.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Passwords do not match', description: 'Please re-enter your new password.' });
      return;
    }
    setIsChangingPassword(true);
    try {
      await updatePassword(currentPassword, newPassword);
      toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Password Update Failed', description: error.message });
    } finally {
      setIsChangingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword, updatePassword, toast]);
  
  const handleCancel = useCallback(() => {
    if (user) {
        setFullName(user.name);
        setSignaturePreview(user.signatureUrl || null);
        setNewSignatureFile(null);
        setIsEditing(false);
    }
  }, [user]);

  if (!user) {
    return null; // Or a loading state
  }

  const userRole = roles.find((r) => r.id === user.roleId);
  const avatarColor = getAvatarColor(user.name);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarFallback style={{ backgroundColor: avatarColor.background, color: avatarColor.color }} className="text-2xl">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>My Profile</CardTitle>
                            <CardDescription>
                                Update your personal details here.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" value={fullName} onChange={handleNameChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={user.email} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" value={userRole?.name || 'N/A'} disabled />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Digital Signature</CardTitle>
                        <CardDescription>
                        Upload an image of your signature for reports.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-40 w-full items-center justify-center rounded-md border-2 border-dashed">
                        {signaturePreview ? (
                            <div className="relative group">
                                <Image src={signaturePreview} alt="User signature" width={200} height={100} className="max-h-32 w-auto object-contain" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={removeSignature}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground">
                                <Signature className="mx-auto h-10 w-10" />
                                <p className="mt-2 text-sm">No signature uploaded</p>
                            </div>
                        )}
                        </div>
                        <label htmlFor="signature-upload" className="mt-4 w-full">
                            <Button variant="outline" asChild className="w-full cursor-pointer">
                                <span>
                                    <Upload className="mr-2 h-4 w-4" /> Upload Signature
                                </span>
                            </Button>
                            <Input id="signature-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleSignatureUpload} />
                        </label>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>
                        Update your password. Make sure it's a strong one.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}/>
                        </div>
                        <div className="flex justify-end">
                            <Button variant="secondary" onClick={handlePasswordUpdate} disabled={isChangingPassword}>
                                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Password
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {isEditing && (
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSaveChanges} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            )}
        </div>
        <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">                  
                        {notifications.map((item, index) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="relative">
                                    <div className={`absolute left-1/2 top-5 h-full w-0.5 -translate-x-1/2 ${index === notifications.length - 1 ? 'hidden' : ''} bg-gray-200 dark:bg-gray-700`} />
                                    <span className={`relative z-10 flex items-center justify-center w-3 h-3 rounded-full ring-8 ring-card bg-primary`}>
                                    </span>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-baseline justify-between">
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                                        <p className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</p>
                                    </div>
                                    <p className="mb-2 text-sm font-normal text-gray-500 dark:text-gray-400">{item.description}</p>
                                </div>
                            </div>
                        ))}
                         {notifications.length === 0 && (
                            <div className="text-center text-muted-foreground p-8">
                                No recent activity.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
