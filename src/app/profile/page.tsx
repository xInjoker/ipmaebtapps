
'use client';

import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Camera, Upload, Signature, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getInitials, getAvatarColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, roles, branches, updateUser } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(user?.name || '');
  const [selectedBranch, setSelectedBranch] = useState(user?.branchId || '');
  const [bio, setBio] = useState(
    'I am a Project Manager with over 5 years of experience in the tech industry.'
  );
  const [signature, setSignature] = useState<string | null>(user?.signatureUrl || null);

  useEffect(() => {
    if (user) {
      setFullName(user.name);
      setSelectedBranch(user.branchId);
      setSignature(user.signatureUrl || null);
    }
  }, [user]);
  
  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignature(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeSignature = () => {
      setSignature(null);
  }

  if (!user) {
    return null; // Or a loading state
  }

  const handleSaveChanges = () => {
    if (user) {
      updateUser(user.id, { name: fullName, branchId: selectedBranch, signatureUrl: signature || '' });
      // Note: 'bio' is not part of the User model in AuthContext, so changes to it are not persisted.
      toast({
        title: 'Profile Updated',
        description: 'Your personal information has been saved.',
      });
    }
  };

  const userRole = roles.find((r) => r.id === user.roleId);
  const avatarColor = getAvatarColor(user.name);

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <svg
            className="absolute -right-16 -top-24 text-amber-500"
            fill="currentColor"
            width="400"
            height="400"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
            d="M51.9,-54.9C64.6,-45.5,71.2,-28.9,72,-12.3C72.8,4.2,67.7,20.8,58.3,34.5C48.9,48.2,35.1,59.1,20,64.2C4.9,69.3,-11.5,68.6,-26.4,62.8C-41.2,57,-54.6,46,-61.7,31.7C-68.9,17.4,-70,-0.1,-64.7,-14.8C-59.4,-29.4,-47.8,-41.3,-35,-50.7C-22.3,-60,-8.4,-67,5.5,-69.6C19.4,-72.2,39.1,-70.4,51.9,-54.9Z"
            transform="translate(100 100)"
            />
        </svg>
        <svg
            className="absolute -left-20 -bottom-24 text-primary-foreground/10"
            fill="currentColor"
            width="400"
            height="400"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
            d="M51.9,-54.9C64.6,-45.5,71.2,-28.9,72,-12.3C72.8,4.2,67.7,20.8,58.3,34.5C48.9,48.2,35.1,59.1,20,64.2C4.9,69.3,-11.5,68.6,-26.4,62.8C-41.2,57,-54.6,46,-61.7,31.7C-68.9,17.4,-70,-0.1,-64.7,-14.8C-59.4,-29.4,-47.8,-41.3,-35,-50.7C-22.3,-60,-8.4,-67,5.5,-69.6C19.4,-72.2,39.1,-70.4,51.9,-54.9Z"
            transform="translate(100 100)"
            />
        </svg>
        <div className="z-10 relative">
          <CardHeader>
            <CardTitle className="font-headline">My Profile</CardTitle>
            <CardDescription className="text-primary-foreground/90">
              Manage your profile settings and personal information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                  ) : null}
                  <AvatarFallback
                    className="text-3xl"
                    style={{
                      backgroundColor: avatarColor.background,
                      color: avatarColor.color,
                    }}
                  >
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Change photo</span>
                </Button>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-primary-foreground/90">{user.email}</p>
                {userRole && (
                  <Badge
                    variant='secondary'
                    className="mt-2"
                  >
                    {userRole.name}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details here. Click "Save Changes" at the bottom to apply.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user.email}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" defaultValue={userRole?.name} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="officeLocation">Office Location</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger id="officeLocation">
                  <SelectValue placeholder="Select your branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a little about yourself."
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </CardFooter>
        </Card>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Digital Signature</CardTitle>
                    <CardDescription>
                    Upload an image of your signature. This will be used on reports you approve.
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
      </div>
    </div>
  );
}
