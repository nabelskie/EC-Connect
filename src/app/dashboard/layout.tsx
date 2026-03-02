"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Heart, Home, ClipboardList, MessageSquare, User, LogOut, LayoutDashboard } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    router.push('/auth/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard/elderly', role: 'elderly' },
    { label: 'My Requests', icon: ClipboardList, href: '/dashboard/elderly/requests', role: 'elderly' },
    
    { label: 'Nearby Tasks', icon: LayoutDashboard, href: '/dashboard/volunteer', role: 'volunteer' },
    { label: 'My Work', icon: ClipboardList, href: '/dashboard/volunteer/history', role: 'volunteer' },

    { label: 'Admin Hub', icon: ShieldCheck, href: '/dashboard/admin', role: 'admin' },
  ];

  // Simple role detection from pathname for demo
  const currentRole = pathname.includes('admin') ? 'admin' : pathname.includes('volunteer') ? 'volunteer' : 'elderly';

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-accent fill-accent" />
          <span className="font-bold text-primary">ElderCare</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5 text-muted-foreground" />
        </Button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0 p-6">
        <Link href="/" className="flex items-center gap-3 mb-10">
          <Heart className="h-8 w-8 text-accent fill-accent" />
          <span className="text-xl font-headline font-bold text-primary tracking-tight">ElderCare Connect</span>
        </Link>
        
        <nav className="flex-1 space-y-2">
          {navItems.filter(item => item.role === currentRole).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-primary text-white font-semibold shadow-md' 
                    : 'text-muted-foreground hover:bg-accent/10 hover:text-accent'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/chat"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              pathname.includes('/chat') 
                ? 'bg-primary text-white font-semibold shadow-md' 
                : 'text-muted-foreground hover:bg-accent/10 hover:text-accent'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            Messages
          </Link>
        </nav>

        <div className="pt-6 border-t mt-auto space-y-4">
          <div className="flex items-center gap-3 px-4">
            <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
              <User className="h-6 w-6 text-accent" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-primary truncate w-32">User Name</span>
              <span className="text-xs text-muted-foreground capitalize">{currentRole}</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 border-none hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-50">
        {navItems.filter(item => item.role === currentRole).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 group">
              <Icon className={`h-6 w-6 transition-colors ${isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-accent'}`} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-accent' : 'text-muted-foreground'}`}>{item.label}</span>
            </Link>
          );
        })}
        <Link href="/chat" className="flex flex-col items-center gap-1 group">
          <MessageSquare className={`h-6 w-6 ${pathname.includes('/chat') ? 'text-accent' : 'text-muted-foreground group-hover:text-accent'}`} />
          <span className={`text-[10px] font-medium ${pathname.includes('/chat') ? 'text-accent' : 'text-muted-foreground'}`}>Chat</span>
        </Link>
      </nav>
    </div>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}