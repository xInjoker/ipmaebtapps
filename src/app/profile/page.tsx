
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
import { Camera, Upload, Signature, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getInitials, getAvatarColor } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, roles, updateUser } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(user?.name || '');
  const [signature, setSignature] = useState<string | null>(user?.signatureUrl || null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      if (document.activeElement !== document.getElementById('fullName')) {
        setFullName(user.name);
      }
      if (!isEditing) {
          setSignature(user.signatureUrl || null);
      }
    }
  }, [user, isEditing]);
  
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    setIsEditing(true);
  }, []);

  const handleSignatureUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignature(reader.result as string);
        setIsEditing(true); 
      };
      reader.readAsDataURL(file);
    }
  }, []);
  
  const removeSignature = useCallback(() => {
      setSignature(null);
      setIsEditing(true);
  }, []);

  const handleSaveChanges = useCallback(() => {
    if (user) {
      updateUser(user.id, { name: fullName, signatureUrl: signature || undefined });
      toast({
        title: 'Profile Updated',
        description: 'Your personal information has been saved.',
      });
      setIsEditing(false);
    }
  }, [user, fullName, signature, updateUser, toast]);
  
  const handleCancel = useCallback(() => {
    if (user) {
        setFullName(user.name);
        setSignature(user.signatureUrl || null);
        setIsEditing(false);
    }
  }, [user]);

  if (!user) {
    return null; // Or a loading state
  }

  const userRole = roles.find((r) => r.id === user.roleId);
  const avatarColor = getAvatarColor(user.name);

  return (
    <div className="space-y-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Digital Signature</CardTitle>
                    <CardDescription>
                    Upload an image of your signature for reports.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-40 w-full items-center justify-center rounded-md border-2 border-dashed">
                    {signature ? (
                        <div className="relative group">
                            <Image src={signature} alt="User signature" width={200} height={100} className="max-h-32 w-auto object-contain" />
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
                        <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" />
                    </div>
                    <div className="flex justify-end">
                        <Button variant="secondary">Update Password</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
         {isEditing && (
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
         )}
    </div>
  );
}
