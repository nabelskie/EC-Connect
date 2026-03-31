"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Heart, User, GraduationCap, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [role, setRole] = useState('elderly');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update display name
      await updateProfile(user, { displayName: name });

      // 3. Create UserProfile in Firestore
      const userProfile = {
        id: user.uid,
        name,
        email,
        role,
        phone,
        address,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      toast({
        title: "Registration Successful",
        description: `Welcome to ElderCare Connect, ${name}!`,
      });

      router.push(`/dashboard/${role}?role=${role}`);
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: err.message || "An error occurred during registration.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background py-12">
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <Heart className="h-8 w-8 text-accent fill-accent transition-transform group-hover:scale-110" />
        <span className="text-2xl font-headline font-bold text-primary">ElderCare Connect</span>
      </Link>
      
      <Card className="w-full max-w-2xl border-none shadow-xl">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-headline font-bold text-primary">Join the Community</CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            Tell us who you are and how we can connect you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-8">
            <div className="space-y-4">
              <Label className="text-lg font-bold text-primary block text-center mb-4">Choose Your Role</Label>
              <RadioGroup 
                defaultValue="elderly" 
                value={role}
                onValueChange={setRole}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem value="elderly" id="elderly" className="sr-only" />
                  <Label
                    htmlFor="elderly"
                    className={`flex flex-col items-center justify-between rounded-xl border-2 bg-white p-6 hover:bg-accent/5 hover:border-accent cursor-pointer transition-all ${
                      role === 'elderly' ? 'border-accent ring-2 ring-accent ring-offset-2' : 'border-muted'
                    }`}
                  >
                    <User className={`h-12 w-12 mb-4 ${role === 'elderly' ? 'text-accent' : 'text-muted-foreground'}`} />
                    <span className="font-bold text-lg">Elderly / Caregiver</span>
                    <span className="text-xs text-center text-muted-foreground mt-2">I need assistance with daily tasks</span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="volunteer" id="volunteer" className="sr-only" />
                  <Label
                    htmlFor="volunteer"
                    className={`flex flex-col items-center justify-between rounded-xl border-2 bg-white p-6 hover:bg-accent/5 hover:border-accent cursor-pointer transition-all ${
                      role === 'volunteer' ? 'border-accent ring-2 ring-accent ring-offset-2' : 'border-muted'
                    }`}
                  >
                    <GraduationCap className={`h-12 w-12 mb-4 ${role === 'volunteer' ? 'text-accent' : 'text-muted-foreground'}`} />
                    <span className="font-bold text-lg">Student Volunteer</span>
                    <span className="text-xs text-center text-muted-foreground mt-2">I want to help elderly residents</span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="admin" id="admin" className="sr-only" />
                  <Label
                    htmlFor="admin"
                    className={`flex flex-col items-center justify-between rounded-xl border-2 bg-white p-6 hover:bg-accent/5 hover:border-accent cursor-pointer transition-all ${
                      role === 'admin' ? 'border-accent ring-2 ring-accent ring-offset-2' : 'border-muted'
                    }`}
                  >
                    <ShieldCheck className={`h-12 w-12 mb-4 ${role === 'admin' ? 'text-accent' : 'text-muted-foreground'}`} />
                    <span className="font-bold text-lg">Staff Admin</span>
                    <span className="text-xs text-center text-muted-foreground mt-2">I manage the platform operations</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="012-3456789" required className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address / Room No (Politeknik Dorm)</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Block A, Room 102 / No 12, Taman..." required className="h-12" />
              </div>
            </div>

            <Button type="submit" className="w-full h-14 text-xl bg-primary hover:bg-primary/90 mt-4" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Creating Account...
                </>
              ) : 'Complete Registration'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <div className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-accent hover:underline">
              Log in instead
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
