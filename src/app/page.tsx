import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, ArrowRight, UserCircle, GraduationCap } from 'lucide-react';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-elderly');

  return (
    <div className="flex flex-col h-screen-dvh bg-white overflow-hidden">
      {/* Background Image Container */}
      <div className="relative flex-1 w-full">
        <Image
          src={heroImage?.imageUrl || "https://picsum.photos/seed/1/1200/800"}
          alt="Elderly care"
          fill
          className="object-cover brightness-[0.85]"
          priority
          data-ai-hint="elderly care"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-transparent to-white" />
        
        {/* Branding Overlay */}
        <div className="absolute top-12 left-0 right-0 flex flex-col items-center">
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-2xl mb-4 border border-white">
            <Heart className="h-10 w-10 text-accent fill-accent" />
          </div>
          <h1 className="text-3xl font-headline font-extrabold text-white drop-shadow-lg tracking-tight">
            ElderCare Connect
          </h1>
          <p className="text-white/90 font-medium text-sm mt-2 drop-shadow-md">
            Politeknik Kuching Sarawak
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-8 pt-10 pb-12 bg-white rounded-t-[3rem] -mt-12 z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-2xl font-headline font-bold text-primary">Welcome Home</h2>
          <p className="text-muted-foreground leading-relaxed px-4">
            Connecting our elders with student volunteers for a stronger community.
          </p>
        </div>

        <div className="grid gap-4">
          <Button asChild size="lg" className="h-16 text-lg rounded-2xl bg-primary hover:bg-primary/90 font-bold shadow-xl shadow-primary/20 gap-3">
            <Link href="/auth/register">
              <GraduationCap className="h-6 w-6" />
              Join as Volunteer
              <ArrowRight className="h-5 w-5 ml-auto opacity-50" />
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="h-16 text-lg rounded-2xl border-2 font-bold gap-3 text-primary border-slate-100 hover:bg-slate-50 transition-all">
            <Link href="/auth/login">
              <UserCircle className="h-6 w-6 text-accent" />
              I Need Assistance
              <ArrowRight className="h-5 w-5 ml-auto opacity-30" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">
            Always Here to Help
          </p>
        </div>
      </div>
    </div>
  );
}
