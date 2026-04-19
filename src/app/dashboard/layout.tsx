
"use client";

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  Clock,
  AlertCircle,
  UserPlus,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose 
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Suspense, useMemo, useState, useEffect } from 'react';
import { useFcm } from '@/firebase/messaging/use-fcm';
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

function DashboardNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const { user } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time check for unread messages across all chat rooms
  const chatRoomsQuery = useMemoFirebase(() => {
    if (!user || !mounted) return null;
    return query(
      collection(db, 'chat_rooms'),
      where('participantUserIds', 'array-contains', user.uid)
    );
  }, [db, user, mounted]);

  const { data: chatRooms } = useCollection(chatRoomsQuery);

  const hasUnreadMessages = useMemo(() => {
    if (!chatRooms || !user) return false;
    return chatRooms.some(room => room.lastMessageSenderId && room.lastMessageSenderId !== user.uid);
  }, [chatRooms, user]);

  const roleQuery = searchParams.get('role');

  const currentRole = useMemo(() => {
    if (roleQuery) return roleQuery;
    if (pathname.includes('/admin')) return 'admin';
    if (pathname.includes('/volunteer')) return 'volunteer';
    if (pathname.includes('/elderly')) return 'elderly';
    return 'elderly';
  }, [roleQuery, pathname]);

  const navItems = {
    elderly: [
      { label: 'Home', icon: Home, href: `/dashboard/elderly?role=elderly` },
      { label: 'Chat', icon: MessageSquare, href: `/dashboard/chat?role=elderly`, hasBadge: hasUnreadMessages },
      { label: 'Profile', icon: User, href: `/dashboard/profile?role=elderly` },
    ],
    volunteer: [
      { label: 'Browse', icon: LayoutDashboard, href: `/dashboard/volunteer?role=volunteer` },
      { label: 'Chat', icon: MessageSquare, href: `/dashboard/chat?role=volunteer`, hasBadge: hasUnreadMessages },
      { label: 'Profile', icon: User, href: `/dashboard/profile?role=volunteer` },
    ],
    admin: [
      { label: 'Overview', icon: ShieldCheck, href: `/dashboard/admin?role=admin` },
      { label: 'Profile', icon: User, href: `/dashboard/profile?role=admin` },
    ]
  };

  if (!mounted) return null;

  const roleNavItems = navItems[currentRole as keyof typeof navItems] || navItems.elderly;

  return (
    <nav className="h-24 bg-white border-t flex items-center justify-around px-2 fixed bottom-0 left-0 right-0 z-50 safe-area-bottom shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
      {roleNavItems.map((item) => {
        const Icon = item.icon;
        const itemPath = item.href.split('?')[0];
        const isActive = pathname === itemPath || (pathname.startsWith(itemPath) && itemPath !== '/dashboard/elderly' && itemPath !== '/dashboard/volunteer' && itemPath !== '/dashboard/admin');
        
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1.5 w-full h-full transition-all active:bg-slate-50 ${
              isActive ? 'text-accent' : 'text-muted-foreground'
            }`}
          >
            <div className={`p-2.5 rounded-2xl transition-colors relative ${isActive ? 'bg-accent/10' : ''}`}>
              <Icon className={`h-7 w-7 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              {item.hasBadge && (
                <div className="absolute top-1 right-1 h-3.5 w-3.5 bg-destructive rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
            <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function NotificationContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const roleQuery = searchParams.get('role');

  const currentRole = useMemo(() => {
    if (roleQuery) return roleQuery;
    if (pathname.includes('/admin')) return 'admin';
    if (pathname.includes('/volunteer')) return 'volunteer';
    if (pathname.includes('/elderly')) return 'elderly';
    return 'elderly';
  }, [roleQuery, pathname]);

  const notificationsByRole = {
    elderly: [
      { 
        id: 1, 
        title: 'Request Accepted', 
        message: 'A volunteer has accepted your assistance request. See status on home.', 
        time: 'Just now', 
        unread: true,
        icon: CheckCircle2,
        color: 'text-emerald-500',
        href: '/dashboard/elderly?role=elderly'
      },
      { 
        id: 2, 
        title: 'New Message', 
        message: 'You have a new message from your assigned volunteer.', 
        time: '1 hour ago', 
        unread: true,
        icon: MessageCircle,
        color: 'text-sky-500',
        href: '/dashboard/chat?role=elderly'
      },
    ],
    volunteer: [
      { 
        id: 1, 
        title: 'New Request Available', 
        message: 'A resident needs help with a task near your location.', 
        time: '5 mins ago', 
        unread: true,
        icon: AlertCircle,
        color: 'text-orange-500',
        href: '/dashboard/volunteer?role=volunteer&tab=available'
      },
      { 
        id: 2, 
        title: 'New Achievement Review', 
        message: 'An elderly resident has left a star rating for your last task.', 
        time: 'Yesterday', 
        unread: false,
        icon: CheckCircle2,
        color: 'text-emerald-500',
        href: '/dashboard/volunteer?role=volunteer&tab=achievement'
      },
    ],
    admin: [
      { 
        id: 1, 
        title: 'New User Registration', 
        message: 'A new volunteer has successfully registered and is pending review.', 
        time: '10 mins ago', 
        unread: true,
        icon: UserPlus,
        color: 'text-primary',
        href: '/dashboard/admin/users?role=admin'
      },
      { 
        id: 2, 
        title: 'System Performance Ready', 
        message: 'The operational analytics report for the current week is now ready.', 
        time: 'Yesterday', 
        unread: false,
        icon: BarChart3,
        color: 'text-accent',
        href: '/dashboard/admin?role=admin&tab=analytics'
      },
    ]
  };

  const notifications = notificationsByRole[currentRole as keyof typeof notificationsByRole] || notificationsByRole.elderly;

  return (
    <div className="divide-y divide-slate-100">
      {notifications.length > 0 ? (
        notifications.map((n) => {
          const Icon = n.icon;
          return (
            <SheetClose asChild key={n.id}>
              <Link 
                href={n.href}
                className="block p-6 hover:bg-white transition-colors relative group active:bg-slate-50"
              >
                <div className="flex items-start gap-5">
                  <div className={`p-3 rounded-2xl bg-white shadow-md shrink-0 ${n.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-base font-black truncate ${n.unread ? 'text-primary' : 'text-slate-500'}`}>
                        {n.title}
                      </p>
                      {n.unread && <div className="h-2.5 w-2.5 rounded-full bg-accent shrink-0 ml-2 shadow-sm" />}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 font-medium">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">
                        <Clock className="h-3.5 w-3.5" />
                        {n.time}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-accent transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            </SheetClose>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center opacity-30">
          <Bell className="h-16 w-16 mb-6" />
          <p className="text-xl font-black text-primary">No notifications yet</p>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const db = useFirestore();
  const { user } = useUser();
  
  // Initialize Cloud Messaging
  useFcm();

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(userRef);

  // CRITICAL: Ensure large font mode is only applied after mounting to prevent hydration mismatch
  const isLargeText = mounted && profile?.largeTextEnabled === true;

  const handleOpenNotifications = (open: boolean) => {
    if (open) {
      setHasUnreadNotifications(false);
    }
  };

  return (
    <div className={cn("flex flex-col h-screen-dvh bg-background overflow-hidden", isLargeText && "large-font-mode")}>
      <header className="h-20 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-30 shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent/10">
            <Heart className="h-7 w-7 text-accent fill-accent" />
          </div>
          <span className="font-headline font-black text-2xl text-primary tracking-tight">ElderCare</span>
        </div>
        
        <div className="flex items-center gap-4">
          {mounted ? (
            <Sheet onOpenChange={handleOpenNotifications}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-2xl relative text-muted-foreground h-12 w-12 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <Bell className="h-6 w-6" />
                  {hasUnreadNotifications && (
                    <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-destructive rounded-full border-2 border-white shadow-sm" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-[450px] p-0 rounded-l-[3rem] border-none shadow-2xl">
                <SheetHeader className="p-8 border-b bg-primary text-white rounded-tl-[3rem]">
                  <SheetTitle className="text-2xl font-black flex items-center gap-3 text-white">
                    <Bell className="h-7 w-7" />
                    Notifications
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-100px)] bg-slate-50/50">
                  <Suspense fallback={<div className="p-16 text-center text-base font-bold text-muted-foreground animate-pulse">Checking alerts...</div>}>
                    <NotificationContent />
                  </Suspense>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="h-12 w-12 rounded-2xl bg-slate-100 animate-pulse" />
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-28 px-4 pt-8 max-w-md mx-auto w-full">
        {children}
      </main>

      {mounted && (
        <Suspense fallback={<div className="h-24 bg-white border-t" />}>
          <DashboardNav />
        </Suspense>
      )}
    </div>
  );
}
