
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Heart, Loader2, AlertCircle } from 'lucide-react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const ADMIN_EMAIL = 'adminkn@gmail.com';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect logic when user state is detected
  useEffect(() => {
    if (user && !isUserLoading && mounted && db) {
      const checkRoleAndRedirect = async () => {
        try {
          const userEmail = user.email?.toLowerCase().trim();
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          let role = 'elderly';

          if (userDoc.exists()) {
            role = userDoc.data().role;
            
            // Self-healing: if it's the admin email but role isn't admin, fix it
            if (userEmail === ADMIN_EMAIL && role !== 'admin') {
              await updateDoc(userDocRef, { role: 'admin' });
              role = 'admin';
            }
          } else if (userEmail === ADMIN_EMAIL) {
            // If doc doesn't exist but it's the admin email, create it
            await setDoc(userDocRef, {
              id: user.uid,
              name: "System Administrator",
              email: userEmail,
              role: 'admin',
              createdAt: new Date().toISOString()
            });
            role = 'admin';
          }

          router.push(`/dashboard/${role}?role=${role}`);
        } catch (error) {
          // Centrally handled or ignored for redirection phase
        }
      };
      checkRoleAndRedirect();
    }
  }, [user, isUserLoading, db, router, mounted]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const targetEmail = email.toLowerCase().trim();

    signInWithEmailAndPassword(auth, targetEmail, password)
      .then(() => {
        toast({
          title: "Sign-in successful",
          description: "Preparing your dashboard...",
        });
      })
      .catch((err: any) => {
        setIsSubmitting(false);
        
        let errorMessage = "Invalid email or password. Please try again.";
        if (err.code === 'auth/invalid-credential') {
          errorMessage = "Incorrect credentials. Please check your email and password.";
        } else if (err.code === 'auth/user-not-found') {
          errorMessage = "No account found with this email.";
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
            Access your ElderCare account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
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
                suppressHydrationWarning
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm font-medium text-accent hover:underline">
                  Forgot?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                className="h-12 text-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                suppressHydrationWarning
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-lg bg-primary hover:bg-primary/90 mt-2" 
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
