
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect logic when user state is detected
  useEffect(() => {
    if (user && !isUserLoading && mounted) {
      const checkRoleAndRedirect = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const role = userDoc.data().role;
            // Ensure redirection to the correct dashboard based on the database role
            router.push(`/dashboard/${role}?role=${role}`);
          } else {
            // Check if it's the specific admin email if no doc exists yet
            if (user.email === 'admineld@gmail.com') {
               router.push('/dashboard/admin?role=admin');
            } else {
               router.push('/auth/register');
            }
          }
        } catch (error) {
          console.error("Redirection error:", error);
        }
      };
      checkRoleAndRedirect();
    }
  }, [user, isUserLoading, db, router, mounted]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password)
      .catch((err: any) => {
        setIsSubmitting(false);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
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
        </CardFooter>
      </Card>
    </div>
  );
}
