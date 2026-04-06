
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Heart, User, GraduationCap, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdminEmail = email.toLowerCase().trim() === 'admineld@gmail.com';

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const targetEmail = email.toLowerCase().trim();
    // Strictly force 'admin' role if the email matches the provided admin address
    const finalRole = isAdminEmail ? 'admin' : role;

    createUserWithEmailAndPassword(auth, targetEmail, password)
      .then((userCredential) => {
        const user = userCredential.user;
        
        // 1. Update display name
        updateProfile(user, { displayName: name });

        // 2. Create UserProfile in Firestore
        const userProfile = {
          id: user.uid,
          name,
          email: targetEmail,
          role: finalRole,
          phone,
          address,
          createdAt: new Date().toISOString()
        };

        setDoc(doc(db, 'users', user.uid), userProfile)
          .then(() => {
            toast({
              title: "Registration Successful",
              description: `Welcome to ElderCare Connect, ${name}!`,
            });
            // Direct redirection to the appropriate dashboard
            router.push(`/dashboard/${finalRole}?role=${finalRole}`);
          });
      })
      .catch((err: any) => {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: err.message || "An error occurred during registration.",
        });
      });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            {isAdminEmail ? "Setting up Administrator Account" : "Choose your role and get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-8">
            {!isAdminEmail ? (
              <div className="space-y-4">
                <Label className="text-lg font-bold text-primary block text-center mb-4">Choose Your Role</Label>
                <RadioGroup 
                  defaultValue="elderly" 
                  value={role}
                  onValueChange={setRole}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
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
                      <span className="font-bold text-lg">Resident</span>
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
                      <span className="font-bold text-lg">Volunteer</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            ) : (
              <div className="p-6 bg-primary/5 rounded-2xl border-2 border-primary/20 border-dashed flex items-center gap-4 text-primary">
                <div className="p-3 bg-primary/10 rounded-full">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Administrator Detected</h3>
                  <p className="text-xs opacity-70">This account will be granted system-wide management access.</p>
                </div>
              </div>
            )}

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
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="john@example.com" 
                  required 
                  className="h-12" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address / Room No</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Block A, Room 102" required className="h-12" />
              </div>
            </div>

            <Button type="submit" className="w-full h-14 text-xl bg-primary hover:bg-primary/90 mt-4" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : 'Complete Registration'}
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
