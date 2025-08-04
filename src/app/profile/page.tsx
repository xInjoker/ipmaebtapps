
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
import { useEmployees } from '@/context/EmployeeContext';
import { useInspectors } from '@/context/InspectorContext';
import { EmployeeDetails } from '@/components/employee-details';
import { InspectorDetails } from '@/components/inspector-details';

export default function ProfilePage() {
  const { user, roles, updateUser } = useAuth();
  const { employees } = useEmployees();
  const { inspectors } = useInspectors();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(user?.name || '');
  const [signature, setSignature] = useState<string | null>(user?.signatureUrl || null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.name);
      setSignature(user.signatureUrl || null);
    }
  }, [user]);

  const handleSignatureUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignature(reader.result as string);
        setIsEditing(true); // Mark as editing when a new signature is uploaded
      };
      reader.readAsDataURL(file);
    }
  }, []);
  
  const removeSignature = useCallback(() => {
      setSignature(null);
      setIsEditing(true); // Mark as editing when signature is removed
  }, []);

  const handleSaveChanges = useCallback(() => {
    if (user) {
      updateUser(user.id, { name: fullName, signatureUrl: signature || '' });
      toast({
        title: 'Profile Updated',
        description: 'Your personal information has been saved.',
      });
      setIsEditing(false);
    }
  }, [user, fullName, signature, updateUser, toast]);

  if (!user) {
    return null; // Or a loading state
  }

  const userRole = roles.find((r) => r.id === user.roleId);
  const avatarColor = getAvatarColor(user.name);

  // --- Logic for Smart Profile ---
  const employeeProfile = employees.find(e => e.email === user.email);
  const inspectorProfile = inspectors.find(i => i.email === user.email);

  const renderProfileDetails = () => {
    if (userRole?.id === 'employee' && employeeProfile) {
      return <EmployeeDetails employee={employeeProfile} />;
    }
    if (userRole?.id === 'inspector' && inspectorProfile) {
      return <InspectorDetails inspector={inspectorProfile} />;
    }
    
    // --- Default Profile Page for other roles ---
    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                Update your personal details here. Click "Save Changes" to apply.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setIsEditing(true); }}
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
            </CardContent>
            {(isEditing) && (
                <CardFooter className="flex justify-end">
                <Button onClick={handleSaveChanges}>Save Changes</Button>
                </CardFooter>
            )}
        </Card>
    );
  };
  
  const isDetailedProfile = (userRole?.id === 'employee' && employeeProfile) || (userRole?.id === 'inspector' && inspectorProfile);

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={isDetailedProfile ? 'lg:col-span-3' : 'lg:col-span-2'}>
          {renderProfileDetails()}
        </div>
        
        <div className={isDetailedProfile ? 'lg:col-span-1' : 'lg:col-span-1'}>
          <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Digital Signature</CardTitle>
                    <CardDescription>
                    Upload an image of your signature.
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
                 {(isEditing) && (
                    <CardFooter className="flex justify-end">
                        <Button onClick={handleSaveChanges}>Save Changes</Button>
                    </CardFooter>
                 )}
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
    </div>
  );
}
