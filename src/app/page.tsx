import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, ArrowRight, CheckCircle2, Users, Shield } from 'lucide-react';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-elderly');

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-accent fill-accent" />
          <span className="font-headline font-bold text-xl text-primary tracking-tight">ElderCare Connect</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
          <Link href="/auth/login" className="hover:text-primary transition-colors">Login</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/auth/register">Join Now</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-20 lg:py-32 bg-slate-50">
          <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-bold">
                <Users className="h-4 w-4" />
                <span>Empowering the Community</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-headline font-extrabold text-primary leading-[1.1] tracking-tight">
                Connecting Generations with Care
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                ElderCare Connect bridges the gap between elderly residents and student volunteers at Politeknik Kuching Sarawak, providing essential assistance while building meaningful relationships.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="h-14 px-8 text-lg rounded-xl bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
                  <Link href="/auth/register">
                    Register as Volunteer
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg rounded-xl border-2 font-bold">
                  <Link href="/auth/login">I Need Assistance</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-square lg:aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
              <Image
                src={heroImage?.imageUrl || "https://picsum.photos/seed/1/1200/800"}
                alt="Elderly care"
                fill
                className="object-cover"
                priority
                data-ai-hint="elderly care"
              />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl font-headline font-bold text-primary">Designed for Ease and Security</h2>
              <p className="text-muted-foreground text-lg">Our platform ensures that getting help is as simple as possible while maintaining the highest standards of safety for our elderly members.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Simple Requests",
                  desc: "Use AI-assisted tools to clearly describe your needs, whether it's groceries, transport, or tech support.",
                  icon: CheckCircle2,
                },
                {
                  title: "Verified Students",
                  desc: "All volunteers are registered students of Politeknik Kuching Sarawak, verified by staff administrators.",
                  icon: Shield,
                },
                {
                  title: "Real-time Support",
                  desc: "Connect instantly with your assigned volunteer through our secure messaging system.",
                  icon: Users,
                },
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-3xl border bg-slate-50/50 hover:border-accent/50 hover:bg-white transition-all group">
                  <div className="p-4 rounded-2xl bg-white w-fit shadow-sm text-accent mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-white py-12 px-6">
        <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 fill-accent text-accent" />
              <span className="font-headline font-bold text-xl">ElderCare Connect</span>
            </div>
            <p className="text-white/60 max-w-sm">A dedicated initiative for the community of Politeknik Kuching Sarawak.</p>
          </div>
          <div className="md:text-right text-sm text-white/40">
            © 2024 ElderCare Connect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
