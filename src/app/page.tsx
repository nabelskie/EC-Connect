import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, ArrowRight } from 'lucide-react';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-elderly');

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-8 p-4 bg-primary/5 rounded-full animate-bounce-slow">
          <Heart className="h-16 w-16 text-accent fill-accent" />
        </div>
        
        <h1 className="text-4xl font-headline font-extrabold text-primary mb-4 tracking-tight">
          ElderCare <br />Connect
        </h1>
        
        <p className="text-muted-foreground text-lg mb-12 max-w-[280px]">
          Helping our elders live independently with student support.
        </p>

        <div className="relative w-full max-w-sm aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl mb-12">
          <Image
            src={heroImage?.imageUrl || "https://picsum.photos/seed/1/800/600"}
            alt="Elderly care"
            fill
            className="object-cover"
            priority
            data-ai-hint="elderly care"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
        </div>

        <div className="w-full max-w-sm space-y-4">
          <Button asChild size="lg" className="w-full h-16 text-xl rounded-2xl bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
            <Link href="/auth/login">
              Get Started
              <ArrowRight className="ml-2 h-6 w-6" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Politeknik Kuching Sarawak Initiative
          </p>
        </div>
      </main>
    </div>
  );
}
