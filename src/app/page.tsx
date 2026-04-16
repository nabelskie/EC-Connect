import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, ArrowRight } from 'lucide-react';

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
        <div className="absolute top-[20%] left-0 right-0 flex flex-col items-center px-6 text-center">
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-2xl mb-6 border border-white animate-in zoom-in duration-700">
            <Heart className="h-12 w-12 text-accent fill-accent" />
          </div>
          <h1 className="text-4xl font-headline font-extrabold text-white drop-shadow-lg tracking-tight mb-2">
            ElderCare Connect
          </h1>
          <p className="text-white/95 font-semibold text-lg drop-shadow-md">
            Politeknik Kuching Sarawak
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-8 pt-12 pb-12 bg-white rounded-t-[3rem] -mt-20 z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] flex flex-col items-center">
        <div className="text-center mb-10 space-y-3">
          <h2 className="text-2xl font-headline font-bold text-primary">Better Together</h2>
          <p className="text-muted-foreground leading-relaxed max-w-xs">
            Connecting students and elders for a supportive community environment.
          </p>
        </div>

        <div className="w-full max-w-xs space-y-6">
          <Button asChild size="lg" className="w-full h-16 text-xl rounded-2xl bg-primary hover:bg-primary/90 font-bold shadow-xl shadow-primary/20 gap-3 group">
            <Link href="/auth/register">
              Get Started
              <ArrowRight className="h-5 w-5 ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          
          <div className="text-center">
            <p className="text-muted-foreground font-medium">
              Already a member?{' '}
              <Link href="/auth/login" className="text-accent font-bold hover:underline underline-offset-4">
                Log in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-12 text-center opacity-40">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em]">
            Connecting Generations
          </p>
        </div>
      </div>
    </div>
  );
}
