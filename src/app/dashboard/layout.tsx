"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Heart, Home, ClipboardList, MessageSquare, User, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    router.push('/auth/login');
  };

  const navItems = [
    { label: 'Home', icon: Home, href: '/dashboard/elderly', role: 'elderly' },
    { label: 'Tasks', icon: ClipboardList, href: '/dashboard/elderly/requests', role: 'elderly' },
    
    { label: 'Browse', icon: LayoutDashboard, href: '/dashboard/volunteer', role: 'volunteer' },
    { label: 'History', icon: ClipboardList, href: '/dashboard/volunteer/history', role: 'volunteer' },

    { label: 'Admin', icon: ShieldCheck, href: '/dashboard/admin', role: 'admin' },
  ];

  const currentRole = pathname.includes('admin') ? 'admin' : pathname.includes('volunteer') ? 'volunteer' : 'elderly';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* App Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-accent fill-accent" />
          <span className="font-headline font-bold text-xl text-primary tracking-tight">ElderCare</span>
        </Link>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100" onClick={handleLogout}>
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      {/* Main App Content - Padded at bottom for mobile nav */}
      <main className="flex-1 pb-24 overflow-x-hidden">
        <div className="max-w-md mx-auto p-4 md:p-6 lg:max-w-7xl">
          {children}
        </div>
      </main>

      {/* Persistent Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t flex items-center justify-around px-4 py-3 safe-area-bottom z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] rounded-t-3xl">
        {navItems.filter(item => item.role === currentRole).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 group relative">
              <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-primary text-white scale-110 shadow-md' : 'text-muted-foreground group-active:scale-95'}`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className={`text-[10px] font-bold tracking-tight transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -top-1 right-0 w-2 h-2 bg-accent rounded-full border-2 border-white" />
              )}
            </Link>
          );
        })}
        <Link href="/chat/demo" className="flex flex-col items-center gap-1 group relative">
          <div className={`p-2 rounded-2xl transition-all duration-300 ${pathname.includes('/chat') ? 'bg-primary text-white scale-110 shadow-md' : 'text-muted-foreground group-active:scale-95'}`}>
            <MessageSquare className="h-6 w-6" />
          </div>
          <span className={`text-[10px] font-bold tracking-tight transition-colors ${pathname.includes('/chat') ? 'text-primary' : 'text-muted-foreground'}`}>
            Chat
          </span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 group relative">
          <div className={`p-2 rounded-2xl transition-all duration-300 ${pathname === '/profile' ? 'bg-primary text-white scale-110 shadow-md' : 'text-muted-foreground group-active:scale-95'}`}>
            <User className="h-6 w-6" />
          </div>
          <span className={`text-[10px] font-bold tracking-tight transition-colors ${pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'}`}>
            Profile
          </span>
        </Link>
      </nav>
    </div>
  );
}
