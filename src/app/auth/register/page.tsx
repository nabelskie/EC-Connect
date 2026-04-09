
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Heart, User, GraduationCap, Loader2, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const ADMIN_EMAIL = 'adminkn@gmail.com';

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdminEmail = email.toLowerCase().trim() === ADMIN_EMAIL;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // 1. Password Matching Validation
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Passwords do not match.",
      });
      return;
    }

    // 2. Password Complexity Validation (Letter and Number)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (!passwordRegex.test(password)) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Password must contain a combination of letters and numbers.",
      });
      return;
    }

    // 3. Phone Number Validation (10-11 digits)
    if (!isAdminEmail) {
      const numericPhone = phone.replace(/\D/g, '');
      if (numericPhone.length < 10 || numericPhone.length > 11) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "Phone number must be between 10 and 11 digits long.",
        });
        return;
      }
    }

    setIsLoading(true);

    const targetEmail = email.toLowerCase().trim();
    const finalRole = isAdminEmail ? 'admin' : role;

    createUserWithEmailAndPassword(auth, targetEmail, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: isAdminEmail ? "System Administrator" : name });

        const userProfile = {
          id: user.uid,
          name: isAdminEmail ? "System Administrator" : name,
          email: targetEmail,
          role: finalRole,
          phone: isAdminEmail ? "N/A" : phone,
          address: isAdminEmail ? "System Console" : address,
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', user.uid), userProfile);
        
        toast({
          title: "Registration Successful",
          description: `Welcome to ElderCare Connect!`,
        });
        
        router.push(`/dashboard/${finalRole}?role=${finalRole}`);
      })
      .catch((err: any) => {
        setIsLoading(false);
        
        let errorMessage = "An error occurred during registration.";
        if (err.code === 'auth/email-already-in-use') {
          errorMessage = "This email is already registered. Please log in instead.";
        } else if (err.code === 'auth/weak-password') {
          errorMessage = "Password is too weak. Please use at least 6 characters.";
        }

        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: errorMessage,
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
              <div className="p-6 bg-primary/5 rounded-2xl border-2 border-primary/20 border-dashed flex items-center gap-4 text-primary animate-in fade-in zoom-in duration-300">
                <div className="p-3 bg-primary/10 rounded-full">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Administrator Detected</h3>
                  <p className="text-xs opacity-70">This account will be granted full system-wide management access.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isAdminEmail && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input id="full-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="012-3456789" required className="h-12" />
                    <p className="text-[10px] text-muted-foreground">Length must be 10-11 digits.</p>
                  </div>
                </>
              )}
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
                  suppressHydrationWarning
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="h-12 pr-10" 
                    placeholder="Min. 6 chars (A-z, 0-9)"
                    suppressHydrationWarning 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input 
                    id="confirm-password" 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    className="h-12 pr-10" 
                    placeholder="Repeat password"
                    suppressHydrationWarning 
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
              {!isAdminEmail && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Block A, Room 102" required className="h-12" />
                </div>
              )}
            </div>

            <Button type="submit" className="w-full h-14 text-xl bg-primary hover:bg-primary/90 mt-4 shadow-lg" disabled={isLoading} suppressHydrationWarning>
              {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : 'Complete Registration'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center flex-col gap-4">
          <div className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-accent hover:underline">
              Log in instead
            </Link>
          </div>
          
          {isAdminEmail && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-muted-foreground italic max-w-sm text-center">
              <AlertCircle className="h-3 w-3 text-accent shrink-0" />
              Note: The system administrator password is set to "knadmin123".
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
