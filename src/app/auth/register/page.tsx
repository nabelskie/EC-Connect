"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Heart, User, GraduationCap, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState('elderly');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Real Firebase registration logic would go here
    setTimeout(() => {
      router.push(`/dashboard/${role}`);
      setIsLoading(false);
    }, 1500);
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
                <Input id="full-name" placeholder="John Doe" required className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="012-3456789" required className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john@example.com" required className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <Input id="password" type="password" required className="h-12" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address / Room No (Politeknik Dorm)</Label>
                <Input id="address" placeholder="Block A, Room 102 / No 12, Taman..." required className="h-12" />
              </div>
            </div>

            <Button type="submit" className="w-full h-14 text-xl bg-primary hover:bg-primary/90 mt-4" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
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