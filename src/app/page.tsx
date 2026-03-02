import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, ShieldCheck, Users, ArrowRight } from 'lucide-react';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-elderly');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white border-b sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="#">
          <Heart className="h-6 w-6 text-accent fill-accent" />
          <span className="font-headline font-bold text-xl text-primary tracking-tight">ElderCare Connect</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-accent transition-colors" href="/auth/login">
            Login
          </Link>
          <Button asChild className="bg-primary text-white hover:bg-primary/90">
            <Link href="/auth/register">Join Us</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl md:text-6xl text-primary leading-tight">
                    Connecting Generations, <br />Empowering Independence.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Politeknik Kuching Sarawak's bridge between student volunteers and elderly residents. Real help, real impact.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-accent text-white hover:bg-accent/90 px-8 py-6 text-lg">
                    <Link href="/auth/register">Get Assistance</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 px-8 py-6 text-lg">
                    <Link href="/auth/register">Volunteer Now</Link>
                  </Button>
                </div>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-2xl shadow-2xl border-4 border-white">
                <Image
                  src={heroImage?.imageUrl || "https://picsum.photos/seed/1/1200/600"}
                  alt={heroImage?.description || "Elderly and Volunteer"}
                  fill
                  className="object-cover"
                  priority
                  data-ai-hint="elderly volunteer"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl text-primary">How We Help</h2>
              <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
                Simplified support for daily life, provided by dedicated Politeknik students.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group p-8 rounded-2xl bg-background border transition-all hover:shadow-lg hover:-translate-y-1">
                <ShieldCheck className="h-12 w-12 text-accent mb-4" />
                <h3 className="text-xl font-bold mb-2 text-primary">Verified Volunteers</h3>
                <p className="text-muted-foreground">Every student volunteer is a registered Politeknik student, ensuring safety and trust.</p>
              </div>
              <div className="group p-8 rounded-2xl bg-background border transition-all hover:shadow-lg hover:-translate-y-1">
                <Users className="h-12 w-12 text-accent mb-4" />
                <h3 className="text-xl font-bold mb-2 text-primary">Generational Connection</h3>
                <p className="text-muted-foreground">Beyond tasks, we build relationships that bridge the gap between young and old.</p>
              </div>
              <div className="group p-8 rounded-2xl bg-background border transition-all hover:shadow-lg hover:-translate-y-1">
                <Heart className="h-12 w-12 text-accent mb-4" />
                <h3 className="text-xl font-bold mb-2 text-primary">Diverse Support</h3>
                <p className="text-muted-foreground">From groceries to tech help, we cover the essentials of modern independent living.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-8 border-t bg-white">
        <div className="container px-4 md:px-6 mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 ElderCare Connect. Politeknik Kuching Sarawak Final Year Project.
          </p>
          <div className="flex gap-4 items-center">
            <Link className="text-sm text-muted-foreground hover:text-accent underline-offset-4" href="#">Terms</Link>
            <Link className="text-sm text-muted-foreground hover:text-accent underline-offset-4" href="#">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}