
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Image as ImageIcon
} from 'lucide-react';
import { Suspense, useMemo, useState, useEffect } from 'react';
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
  
  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
    }
  }, [profileData]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (err) {
      console.error("Logout failed", err);
      setIsLoggingOut(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!authUser || !userRef) return;
    setIsSaving(true);
    
    try {
      // Update Firebase Auth Profile info
      await updateProfile(authUser, { 
        displayName: editName,
        photoURL: editPhotoURL || null
      });
      
      // Update Firestore Profile
      updateDocumentNonBlocking(userRef, {
        name: editName,
        phone: editPhone,
        address: editAddress,
        gender: editGender,
        photoURL: editPhotoURL
      });

      toast({
        title: "Profile Updated",
        description: "Your personal information has been saved successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update profile information.",
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

  const toggleNotifications = (enabled: boolean) => {
    if (!userRef) return;
    
    if (enabled) {
      toast({
        title: "Notifications Enabled",
        description: "You will receive real-time updates for your requests.",
      });
    } else {
      updateDocumentNonBlocking(userRef, { fcmToken: null });
      toast({
        title: "Notifications Disabled",
        description: "You will no longer receive push alerts.",
      });
    }
  };

  const roleIcon = useMemo(() => {
    const role = profileData?.role || 'elderly';
    if (role === 'admin') return ShieldCheck;
    if (role === 'volunteer') return GraduationCap;
    return UserIcon;
  }, [profileData?.role]);

  const RoleIcon = roleIcon;

  if (!mounted || isAuthLoading || isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Loading Profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">Profile not found.</p>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </div>
    );
  }

  const formattedDate = profileData.createdAt 
    ? new Date(profileData.createdAt).toLocaleDateString('en-MY', { year: 'numeric', month: 'long' })
    : 'Recently';

  const getDisplayRole = (role: string) => {
    if (role === 'elderly') return 'Elderly';
    if (role === 'volunteer') return 'Volunteer';
    if (role === 'admin') return 'Admin';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const avatarSrc = profileData.photoURL || `https://picsum.photos/seed/${profileData.id}/200/200`;

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
            {getDisplayRole(profileData.role)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Profile Info Card */}
        <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Settings2 className="h-4 w-4" /> Personal Details
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditing(!isEditing)}
              className="text-accent font-bold h-7 px-2"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {isEditing ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="edit-photo">Profile Picture URL</Label>
                  <div className="relative">
                    <Input 
                      id="edit-photo" 
                      placeholder="https://example.com/photo.jpg"
                      value={editPhotoURL} 
                      onChange={(e) => setEditPhotoURL(e.target.value)}
                      className="h-12 rounded-xl pl-10"
                    />
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-[10px] text-muted-foreground px-1 italic">Paste an image link to change your profile picture.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input 
                    id="edit-name" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-12 rounded-xl"
                  />
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
                  <Input 
                    id="edit-phone" 
                    value={editPhone} 
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Address / Room No</Label>
                  <Input 
                    id="edit-address" 
                    value={editAddress} 
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isSaving}
                  className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 gap-2"
                >
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
                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Email Address</Label>
                    <p className="text-primary font-medium">{profileData.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-slate-50 text-slate-400">
                    <UserCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Gender</Label>
                    <p className="text-primary font-medium">{profileData.gender || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-slate-50 text-slate-400">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Phone Number</Label>
                    <p className="text-primary font-medium">{profileData.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-slate-50 text-slate-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Address</Label>
                    <p className="text-primary font-medium">{profileData.address || 'Not provided'}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Bell className="h-4 w-4" /> Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-primary">Push Notifications</p>
                <p className="text-[10px] text-muted-foreground">Get alerted for new messages</p>
              </div>
              <Switch 
                defaultChecked={!!profileData.fcmToken}
                onCheckedChange={toggleNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Support */}
        <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Lock className="h-4 w-4" /> Account Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full h-14 rounded-2xl border-dashed border-2 text-primary font-bold gap-2">
                  <Lock className="h-4 w-4" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl max-w-[90vw] mx-auto">
                <DialogHeader>
                  <DialogTitle>Update Password</DialogTitle>
                  <DialogDescription>
                    Enter your new password below. Ensure it contains letters and numbers.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-pass">New Password</Label>
                    <div className="relative">
                      <Input 
                        id="new-pass" 
                        type={showNewPassword ? "text" : "password"} 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-12 rounded-xl pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-pass">Confirm Password</Label>
                    <div className="relative">
                      <Input 
                        id="confirm-pass" 
                        type={showConfirmPassword ? "text" : "password"} 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 rounded-xl pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleChangePassword} 
                    disabled={isChangingPassword || !newPassword}
                    className="w-full h-12 rounded-xl bg-primary font-bold"
                  >
                    {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium px-4">
              <Calendar className="h-3 w-3 text-accent" />
              Member since {formattedDate}
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full h-16 rounded-[2rem] font-bold gap-3 text-lg shadow-xl shadow-destructive/10 mt-6"
              disabled={isLoggingOut}
            >
              <LogOut className="h-6 w-6" />
              Sign Out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-[2.5rem] max-w-[90vw] mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold">Sign Out?</AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Are you sure you want to log out of your ElderCare Connect account?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col gap-3 mt-6">
              <AlertDialogAction 
                onClick={handleLogout}
                className="bg-destructive hover:bg-destructive/90 h-14 rounded-2xl font-bold text-lg shadow-lg shadow-destructive/20"
              >
                {isLoggingOut ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                Yes, Sign Out
              </AlertDialogAction>
              <AlertDialogCancel className="h-14 rounded-2xl font-bold border-none bg-slate-100 hover:bg-slate-200 transition-colors text-lg">
                Stay Signed In
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Loading Profile...</p>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
