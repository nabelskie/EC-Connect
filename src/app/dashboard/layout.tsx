"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Home, 
  MessageSquare, 
  User, 
  LayoutDashboard, 
  ShieldCheck,
  Bell,
  CheckCircle2,
  MessageCircle,
  Clock
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentRole = pathname.includes('admin') ? 'admin' : pathname.includes('volunteer') ? 'volunteer' : 'elderly';

  const navItems = {
    elderly: [
      { label: 'Home', icon: Home, href: '/dashboard/elderly' },
      { label: 'Chat', icon: MessageSquare, href: '/chat' },
      { label: 'Profile', icon: User, href: '/dashboard/profile?role=elderly' },
    ],
    volunteer: [
      { label: 'Browse', icon: LayoutDashboard, href: '/dashboard/volunteer' },
      { label: 'Chat', icon: MessageSquare, href: '/chat' },
      { label: 'Profile', icon: User, href: '/dashboard/profile?role=volunteer' },
    ],
    admin: [
      { label: 'Overview', icon: ShieldCheck, href: '/dashboard/admin' },
      { label: 'Messages', icon: MessageSquare, href: '/chat' },
      { label: 'Profile', icon: User, href: '/dashboard/profile?role=admin' },
    ]
  };

  const roleNavItems = navItems[currentRole as keyof typeof navItems] || navItems.elderly;

  const notifications = [
    { 
      id: 1, 
      title: 'Request Accepted', 
      message: 'Sarah has accepted your Grocery request.', 
      time: '2 mins ago', 
      unread: true,
      icon: CheckCircle2,
      color: 'text-emerald-500'
    },
    { 
      id: 2, 
      title: 'New Message', 
      message: 'Jason sent you a message regarding your Tech Support.', 
      time: '1 hour ago', 
      unread: true,
      icon: MessageCircle,
      color: 'text-sky-500'
    },
    { 
      id: 3, 
      title: 'Task Completed', 
      message: 'Ahmad has completed your Transportation request.', 
      time: 'Yesterday', 
      unread: false,
      icon: CheckCircle2,
      color: 'text-slate-400'
    },
  ];

  return (
    <div className="flex flex-col h-screen-dvh bg-background overflow-hidden">
      {/* Mobile Header */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-accent fill-accent" />
          <span className="font-headline font-bold text-xl text-primary tracking-tight">ElderCare</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full relative text-muted-foreground h-10 w-10">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0 rounded-l-3xl border-none shadow-2xl">
              <SheetHeader className="p-6 border-b bg-primary text-white rounded-tl-3xl">
                <SheetTitle className="text-xl font-bold flex items-center gap-2 text-white">
                  <Bell className="h-5 w-5" />
                  Notifications
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-80px)] bg-slate-50/50">
                <div className="divide-y divide-slate-100">
                  {notifications.length > 0 ? (
                    notifications.map((n) => {
                      const Icon = n.icon;
                      return (
                        <div key={n.id} className="p-5 hover:bg-white transition-colors relative group">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-xl bg-white shadow-sm ${n.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-bold ${n.unread ? 'text-primary' : 'text-slate-500'}`}>
                                  {n.title}
                                </p>
                                {n.unread && <div className="h-2 w-2 rounded-full bg-accent" />}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {n.message}
                              </p>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 font-bold uppercase pt-1">
                                <Clock className="h-3 w-3" />
                                {n.time}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center opacity-30">
                      <Bell className="h-12 w-12 mb-4" />
                      <p className="font-bold">No notifications yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
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
          const isActive = pathname === item.href || (item.href.split('?')[0] === '/dashboard/profile' && pathname === '/dashboard/profile');
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
