
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { LogOut, User, Phone, Mail, MapPin, ShieldCheck, GraduationCap, Loader2, Calendar } from 'lucide-react';
import { Suspense, useMemo, useState, useEffect } from 'react';
import { useAuth, useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const db = useFirestore();
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use memoized doc reference for the current user's profile
  const userRef = useMemoFirebase(() => {
    if (!authUser || !db) return null;
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);

  const { data: profileData, isLoading: isProfileLoading } = useDoc(userRef);

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

  const roleIcon = useMemo(() => {
    const role = profileData?.role || 'elderly';
    if (role === 'admin') return ShieldCheck;
    if (role === 'volunteer') return GraduationCap;
    return User;
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

  const displayRole = profileData.role === 'elderly' ? 'Resident' : 
                    profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
            <AvatarImage src={`https://picsum.photos/seed/${profileData.id}/200/200`} />
            <AvatarFallback>{profileData.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-headline font-bold text-primary">{profileData.name}</h1>
          <div className="flex items-center justify-center gap-1 mt-1 text-accent font-bold uppercase text-[10px] tracking-widest">
            <RoleIcon className="h-3 w-3" />
            {displayRole}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-50 text-slate-400">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Email Address</Label>
                <p className="text-primary font-medium">{profileData.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-50 text-slate-400">
                <Phone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Phone Number</Label>
                <p className="text-primary font-medium">{profileData.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-50 text-slate-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Address / Room</Label>
                <p className="text-primary font-medium">{profileData.address || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Community Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <Calendar className="h-4 w-4 text-accent" />
              Member since {formattedDate}
            </div>
          </CardContent>
        </Card>

        <Button 
          variant="destructive" 
          className="w-full h-14 rounded-2xl font-bold gap-2 text-lg shadow-lg shadow-destructive/10 mt-4"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5" />
          )}
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
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
