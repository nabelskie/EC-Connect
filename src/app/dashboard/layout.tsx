"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Home, 
  ClipboardList, 
  MessageSquare, 
  User, 
  LayoutDashboard, 
  ShieldCheck,
  Bell
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentRole = pathname.includes('admin') ? 'admin' : pathname.includes('volunteer') ? 'volunteer' : 'elderly';

  const navItems = {
    elderly: [
      { label: 'Home', icon: Home, href: '/dashboard/elderly' },
      { label: 'Requests', icon: ClipboardList, href: '/dashboard/elderly/requests' },
      { label: 'Chat', icon: MessageSquare, href: '/chat/demo' },
      { label: 'Profile', icon: User, href: '/dashboard/profile' },
    ],
    volunteer: [
      { label: 'Browse', icon: LayoutDashboard, href: '/dashboard/volunteer' },
      { label: 'My Tasks', icon: ClipboardList, href: '/dashboard/volunteer/history' },
      { label: 'Chat', icon: MessageSquare, href: '/chat/demo' },
      { label: 'Profile', icon: User, href: '/dashboard/profile' },
    ],
    admin: [
      { label: 'Overview', icon: ShieldCheck, href: '/dashboard/admin' },
      { label: 'Requests', icon: ClipboardList, href: '/dashboard/admin/requests' },
      { label: 'Messages', icon: MessageSquare, href: '/chat/demo' },
      { label: 'Profile', icon: User, href: '/dashboard/profile' },
    ]
  };

  const roleNavItems = navItems[currentRole as keyof typeof navItems] || navItems.elderly;

  return (
    <div className="flex flex-col h-screen-dvh bg-background overflow-hidden">
      {/* Mobile Header */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-accent fill-accent" />
          <span className="font-headline font-bold text-xl text-primary tracking-tight">ElderCare</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full relative text-muted-foreground h-10 w-10">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
          </Button>
          <Avatar className="h-9 w-9 border-2 border-slate-100 shadow-sm">
            <AvatarImage src="https://picsum.photos/seed/user/100/100" />
            <AvatarFallback>MH</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content Scroll Area */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-6 max-w-md mx-auto w-full">
        {children}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="h-20 bg-white border-t flex items-center justify-around px-2 fixed bottom-0 left-0 right-0 z-50 safe-area-bottom shadow-[0_-4_-10px_rgba(0,0,0,0.05)]">
        {roleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-all ${
                isActive ? 'text-accent' : 'text-muted-foreground'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-accent/10' : ''}`}>
                <Icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
