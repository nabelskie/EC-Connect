
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { LogOut, User, Phone, Mail, MapPin, ShieldCheck, GraduationCap, Loader2 } from 'lucide-react';
import { Suspense, useMemo, useState } from 'react';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const role = searchParams.get('role') || 'elderly';

  const userData = useMemo(() => {
    if (role === 'volunteer') {
      return {
        name: "Ahmad Bin Zulkifli",
        role: "Student Volunteer",
        email: "ahmad.z@student.pks.edu.my",
        phone: "019-8765432",
        address: "Kolej Kediaman Siswa, PKS",
        joinDate: "September 2024",
        avatar: "https://picsum.photos/seed/volunteer1/200/200",
        icon: GraduationCap
      };
    } else if (role === 'admin') {
      return {
        name: "Siti Nurhaliza",
        role: "Staff Admin",
        email: "siti.n@pks.edu.my",
        phone: "013-1122334",
        address: "Admin Building, PKS",
        joinDate: "January 2022",
        avatar: "https://picsum.photos/seed/admin/200/200",
        icon: ShieldCheck
      };
    } else {
      return {
        name: "Hapsah Binti Ahmad",
        role: "Elderly Resident",
        email: "capsah@example.com",
        phone: "012-3456789",
        address: "Block C, Room 102, PKS Residential",
        joinDate: "October 2024",
        avatar: "https://picsum.photos/seed/user/200/200",
        icon: User
      };
    }
  }, [role]);

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

  const RoleIcon = userData.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
            <AvatarImage src={userData.avatar} />
            <AvatarFallback>{userData.name[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-headline font-bold text-primary">{userData.name}</h1>
          <div className="flex items-center justify-center gap-1 mt-1 text-accent font-bold uppercase text-[10px] tracking-widest">
            <RoleIcon className="h-3 w-3" />
            {userData.role}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-50 text-slate-400">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Email Address</Label>
                <p className="text-primary font-medium">{userData.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-50 text-slate-400">
                <Phone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Phone Number</Label>
                <p className="text-primary font-medium">{userData.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-50 text-slate-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Address</Label>
                <p className="text-primary font-medium">{userData.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">System Info</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-primary font-medium">Member since {userData.joinDate}</p>
          </CardContent>
        </Card>

        <Button 
          variant="destructive" 
          className="w-full h-14 rounded-2xl font-bold gap-2 text-lg shadow-lg shadow-destructive/10"
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
    <Suspense fallback={<div className="flex items-center justify-center py-20">Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
