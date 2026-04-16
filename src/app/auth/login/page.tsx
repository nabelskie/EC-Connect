
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Heart, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const ADMIN_EMAIL = 'adminkn@gmail.com';

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Manual Login Handler
   * This function now handles both authentication AND the role-based redirection logic.
   * Auto-login (session detection redirect) has been removed to ensure manual entry.
   */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const targetEmail = email.toLowerCase().trim();

    signInWithEmailAndPassword(auth, targetEmail, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        
        try {
          const userEmail = user.email?.toLowerCase().trim();
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          let role = 'elderly';

          // 1. Check if the account was deleted/disabled by an admin
          if (!userDoc.exists() && userEmail !== ADMIN_EMAIL) {
            await signOut(auth);
            setIsSubmitting(false);
            toast({
              variant: "destructive",
              title: "Account Disabled",
              description: "This account has been removed by an administrator and can no longer access the system.",
            });
            return;
          }

          // 2. Determine Role and handle self-healing for Admin
          if (userDoc.exists()) {
            role = userDoc.data().role;
            
            if (userEmail === ADMIN_EMAIL && role !== 'admin') {
              await updateDoc(userDocRef, { role: 'admin' });
              role = 'admin';
            }
          } else if (userEmail === ADMIN_EMAIL) {
            // Re-create admin doc if it was missing
            await setDoc(userDocRef, {
              id: user.uid,
              name: "System Administrator",
              email: userEmail,
              role: 'admin',
              createdAt: new Date().toISOString()
            });
            role = 'admin';
          }

          // 3. Final Redirect
          router.push(`/dashboard/${role}?role=${role}`);
        } catch (error) {
          setIsSubmitting(false);
          toast({
            variant: "destructive",
            title: "Sync Error",
            description: "Successfully signed in, but could not verify profile. Please try again.",
          });
        }
      })
      .catch((err: any) => {
        setIsSubmitting(false);
        
        let errorMessage = "Invalid email or password. Please try again.";
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
          errorMessage = "Incorrect credentials. Please check your email and password.";
        } else if (err.code === 'auth/user-not-found') {
          errorMessage = "No account found with this email.";
        } else if (err.code === 'auth/too-many-requests') {
          errorMessage = "Too many failed attempts. Please try again later.";
        }

        toast({
          variant: "destructive",
          title: "Login Failed",
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

  const isAdminEmail = email.toLowerCase().trim() === ADMIN_EMAIL;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <Heart className="h-8 w-8 text-accent fill-accent transition-transform group-hover:scale-110" />
        <span className="text-2xl font-headline font-bold text-primary">ElderCare Connect</span>
      </Link>
      
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-1 pb-6 text-center">
          <CardTitle className="text-2xl font-headline font-bold text-primary">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials manually to log in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                className="h-12 text-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                suppressHydrationWarning
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="h-12 text-lg pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-2"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-lg bg-primary hover:bg-primary/90 mt-2 shadow-lg" 
              disabled={isSubmitting}
              suppressHydrationWarning
            >
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-0">
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-semibold text-accent hover:underline">
              Register here
            </Link>
          </div>
          
          {isAdminEmail && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-muted-foreground italic">
              <AlertCircle className="h-3 w-3 text-accent shrink-0" />
              Administrator detected. Note: Initial password is "knadmin123".
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
