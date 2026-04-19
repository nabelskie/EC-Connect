
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  LogOut, 
  User as UserIcon, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  GraduationCap, 
  Loader2, 
  Calendar, 
  Bell, 
  Settings2, 
  Lock,
  Save,
  Eye,
  EyeOff,
  UserCircle,
  Image as ImageIcon,
  Upload,
  Type,
  Hash
} from 'lucide-react';
import { Suspense, useMemo, useState, useEffect, useRef } from 'react';
import { useAuth, useUser, useDoc, useMemoFirebase, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { signOut, updatePassword, updateProfile } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const db = useFirestore();
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const { toast } = useToast();
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Form states
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editPhotoURL, setEditPhotoURL] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editMatrixNumber, setEditMatrixNumber] = useState('');
  const [tempPhotoPreview, setTempPhotoPreview] = useState<string | null>(null);
  
  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRef = useMemoFirebase(() => {
    if (!authUser || !db) return null;
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);

  const { data: profileData, isLoading: isProfileLoading } = useDoc(userRef);

  // Initialize form when profile data loads
  useEffect(() => {
    if (profileData) {
      setEditName(profileData.name || '');
      setEditPhone(profileData.phone || '');
      setEditAddress(profileData.address || '');
      setEditGender(profileData.gender || '');
      setEditPhotoURL(profileData.photoURL || '');
      setEditAge(profileData.age || '');
      setEditMatrixNumber(profileData.matrixNumber || '');
    }
  }, [profileData]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (err) {
      setIsLoggingOut(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setTempPhotoPreview(compressedBase64);
          setEditPhotoURL(compressedBase64);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!authUser || !userRef) return;
    setIsSaving(true);
    
    try {
      await updateProfile(authUser, { 
        displayName: editName
      });
      
      const updates: any = {
        name: editName,
        phone: editPhone,
        address: editAddress,
        gender: editGender,
        age: editAge,
        photoURL: editPhotoURL
      };

      if (profileData?.role === 'volunteer') {
        updates.matrixNumber = editMatrixNumber.toUpperCase().trim();
      }

      updateDocumentNonBlocking(userRef, updates);

      toast({
        title: "Profile Updated",
        description: "Your personal information has been saved successfully.",
      });
      setIsEditing(false);
      setTempPhotoPreview(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update profile information. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!authUser) return;
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "New passwords do not match.",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await updatePassword(authUser, newPassword);
      toast({
        title: "Password Changed",
        description: "Your account security has been updated.",
      });
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      let msg = "Failed to update password. You may need to re-login first.";
      if (error.code === 'auth/requires-recent-login') {
        msg = "For security reasons, please log out and log back in before changing your password.";
      }
      toast({
        variant: "destructive",
        title: "Change Failed",
        description: msg,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const roleIcon = useMemo(() => {
    const role = profileData?.role || 'elderly';
    if (role === 'admin') return ShieldCheck;
    if (role === 'volunteer') return GraduationCap;
    return UserIcon;
  }, [profileData?.role]);

  const RoleIcon = roleIcon;

  if (!mounted || isAuthLoading || isProfileLoading || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Loading Profile...</p>
      </div>
    );
  }

  const avatarSrc = tempPhotoPreview || profileData?.photoURL || `https://picsum.photos/seed/${profileData?.id || 'default'}/200/200`;

  const toggleNotifications = (enabled: boolean) => {
    if (!userRef) return;
    updateDocumentNonBlocking(userRef, { notificationsEnabled: enabled });
    toast({ title: enabled ? "Notifications Enabled" : "Notifications Disabled" });
  };

  const toggleLargeText = (enabled: boolean) => {
    if (!userRef) return;
    updateDocumentNonBlocking(userRef, { largeTextEnabled: enabled });
    toast({ title: enabled ? "Large Text Enabled" : "Text Size Reset" });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
            <AvatarImage src={avatarSrc} className="object-cover" />
            <AvatarFallback>{profileData.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-headline font-bold text-primary">{profileData.name}</h1>
          <div className="flex items-center justify-center gap-1 mt-1 text-accent font-bold uppercase text-[10px] tracking-widest">
            <RoleIcon className="h-3 w-3" />
            {profileData.role === 'admin' ? 'Admin' : profileData.role === 'volunteer' ? 'Volunteer' : 'Elderly'}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Settings2 className="h-4 w-4" /> Personal Details
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setIsEditing(!isEditing);
                setTempPhotoPreview(null);
              }}
              className="text-accent font-bold h-7 px-2"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {isEditing ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <Button type="button" variant="outline" className="w-full h-12 rounded-xl border-dashed" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" /> Upload Image
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} className="h-12 rounded-xl" />
                </div>
                {profileData.role === 'volunteer' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-matrix">Matrix Number</Label>
                    <Input id="edit-matrix" value={editMatrixNumber} onChange={(e) => setEditMatrixNumber(e.target.value)} className="h-12 rounded-xl uppercase" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="edit-age">Age</Label>
                  <Input id="edit-age" type="number" value={editAge} onChange={(e) => setEditAge(e.target.value)} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Select value={editGender} onValueChange={setEditGender}>
                    <SelectTrigger id="edit-gender" className="h-12 rounded-xl">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input id="edit-phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Address</Label>
                  <Input id="edit-address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="h-12 rounded-xl" />
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 gap-2">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-slate-50 text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Email</Label>
                    <p className="text-primary font-medium">{profileData.email}</p>
                  </div>
                </div>
                {profileData.role === 'volunteer' && profileData.matrixNumber && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-slate-50 text-accent">
                      <Hash className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-[10px] text-muted-foreground uppercase font-bold">Matrix Number</Label>
                      <p className="text-primary font-black uppercase">{profileData.matrixNumber}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-slate-50 text-slate-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Age</Label>
                    <p className="text-primary font-medium">{profileData.age || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-slate-50 text-slate-400">
                    <UserCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Gender</Label>
                    <p className="text-primary font-medium">{profileData.gender || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-slate-50 text-slate-400">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Phone</Label>
                    <p className="text-primary font-medium">{profileData.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-slate-50 text-slate-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Address</Label>
                    <p className="text-primary font-medium">{profileData.address || 'N/A'}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Type className="h-4 w-4" /> Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-primary">Large Text Mode</p>
                <p className="text-[10px] text-muted-foreground">Better visibility for elders</p>
              </div>
              <Switch checked={profileData.largeTextEnabled === true} onCheckedChange={toggleLargeText} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Bell className="h-4 w-4" /> Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-primary">Notifications</p>
                <p className="text-[10px] text-muted-foreground">Alerts for new messages</p>
              </div>
              <Switch checked={profileData.notificationsEnabled !== false} onCheckedChange={toggleNotifications} />
            </div>
          </CardContent>
        </Card>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full h-16 rounded-[2rem] font-bold gap-3 text-lg shadow-xl shadow-destructive/10 mt-6" disabled={isLoggingOut}>
              <LogOut className="h-6 w-6" /> Sign Out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-[2.5rem] max-w-[90vw] mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold">Sign Out?</AlertDialogTitle>
              <AlertDialogDescription className="text-base">Are you sure you want to log out?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col gap-3 mt-6">
              <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90 h-14 rounded-2xl font-bold text-lg shadow-lg shadow-destructive/20">
                Yes, Sign Out
              </AlertDialogAction>
              <AlertDialogCancel className="h-14 rounded-2xl font-bold border-none bg-slate-100 hover:bg-slate-200 transition-colors text-lg">Stay Signed In</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center py-20 gap-3"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Loading Profile...</p></div>}>
      <ProfileContent />
    </Suspense>
  );
}
