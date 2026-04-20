
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
  ChevronRight,
  Star
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
import { collection, query, where, doc, limit, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';

/**
 * Sub-component for Notifications to safely use useSearchParams()
 */
function NotificationIconWithBadge() {
  const [mounted, setMounted] = useState(false);
  const [isNotificationsRead, setIsNotificationsRead] = useState(false);
  const { notifications } = useNotificationData();

  useEffect(() => { setMounted(true); }, []);

  const showIndicatorDot = useMemo(() => {
    if (!mounted || isNotificationsRead || notifications.length === 0) return false;
    return notifications.some(n => n.unread);
  }, [mounted, isNotificationsRead, notifications]);

  const handleOpenNotifications = (open: boolean) => {
    if (open) setIsNotificationsRead(true);
  };

  return (
    <Sheet onOpenChange={handleOpenNotifications}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-2xl relative text-muted-foreground h-12 w-12 bg-slate-50 hover:bg-slate-100 transition-colors">
          <Bell className="h-6 w-6" />
          {showIndicatorDot && (
            <span className="absolute top-2.5 right-2.5 w-3.5 h-3.5 bg-destructive rounded-full border-2 border-white shadow-sm animate-pulse" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0 rounded-l-[3rem] border-none shadow-2xl">
        <SheetHeader className="p-8 border-b bg-primary text-white rounded-tl-[3rem]">
          <SheetTitle className="text-2xl font-black flex items-center gap-3 text-white">
            <Bell className="h-7 w-7" />
            Notifications
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] bg-slate-50/50">
          <NotificationContent notifications={notifications} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function useNotificationData() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { user } = useUser();
  const roleQuery = searchParams.get('role');

  const currentRole = useMemo(() => {
    if (user?.email === 'adminkn@gmail.com') return 'admin';
    if (roleQuery) return roleQuery;
    if (pathname.includes('/admin')) return 'admin';
    if (pathname.includes('/volunteer')) return 'volunteer';
    if (pathname.includes('/elderly')) return 'elderly';
    return 'elderly';
  }, [roleQuery, pathname, user]);

  const pendingRequestsQuery = useMemoFirebase(() => 
    query(collection(db, 'assistance_requests_pending'), orderBy('createdAt', 'desc'), limit(5)), [db]);
  
  const activeRequestsQuery = useMemoFirebase(() => 
    user ? query(collection(db, 'assistance_requests_active'), where('createdByUserId', '==', user.uid), limit(5)) : null, [db, user]);
  
  const chatRoomsQuery = useMemoFirebase(() => 
    user ? query(collection(db, 'chat_rooms'), where('participantUserIds', 'array-contains', user.uid)) : null, [db, user]);

  const recentRatingsQuery = useMemoFirebase(() => 
    user ? query(collection(db, 'ratings'), where('volunteerUserId', '==', user.uid), limit(5)) : null, [db, user]);

  const recentUsersQuery = useMemoFirebase(() => 
    query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5)), [db]);

  const { data: pendingReqs } = useCollection(pendingRequestsQuery);
  const { data: activeReqs } = useCollection(activeRequestsQuery);
  const { data: chatRooms } = useCollection(chatRoomsQuery);
  const { data: ratings } = useCollection(recentRatingsQuery);
  const { data: recentUsers } = useCollection(recentUsersQuery);

  const notifications = useMemo(() => {
    if (!user) return [];
    const items: any[] = [];

    if (currentRole === 'elderly') {
      activeReqs?.forEach(req => {
        items.push({
          id: `acc-${req.id}`,
          title: 'Request Accepted',
          message: `${req.volunteerName || 'A volunteer'} has accepted your ${req.taskType} request.`,
          time: 'Active Now',
          unread: true,
          icon: CheckCircle2,
          color: 'text-emerald-500',
          href: '/dashboard/elderly?role=elderly'
        });
      });
      chatRooms?.forEach(room => {
        if (room.lastMessageSenderId && room.lastMessageSenderId !== user.uid) {
          items.push({
            id: `msg-${room.id}`,
            title: 'New Message',
            message: `New message from ${room.volunteerName || 'Volunteer'}.`,
            time: 'Recent',
            unread: true,
            icon: MessageCircle,
            color: 'text-sky-500',
            href: `/dashboard/chat/room?requestId=${room.id}&role=elderly`
          });
        }
      });
    }

    if (currentRole === 'volunteer') {
      pendingReqs?.forEach(req => {
        items.push({
          id: `pend-${req.id}`,
          title: 'New Request Available',
          message: `${req.createdByName} needs help with ${req.taskType}.`,
          time: 'Available',
          unread: true,
          icon: AlertCircle,
          color: 'text-orange-500',
          href: '/dashboard/volunteer?role=volunteer&tab=available'
        });
      });
      ratings?.forEach(r => {
        items.push({
          id: `rate-${r.id}`,
          title: 'New Achievement Review',
          message: `A resident gave you a ${r.ratingScore}/10 score.`,
          time: 'Achievement',
          unread: true,
          icon: Star,
          color: 'text-yellow-500',
          href: '/dashboard/volunteer?role=volunteer&tab=achievement'
        });
      });
    }

    if (currentRole === 'admin') {
      recentUsers?.filter(u => u.id !== user.uid).forEach(u => {
        items.push({
          id: `user-${u.id}`,
          title: 'New User Registered',
          message: `${u.name} joined as a ${u.role}.`,
          time: 'Directory',
          unread: true,
          icon: UserPlus,
          color: 'text-primary',
          href: '/dashboard/admin/users?role=admin'
        });
      });
      if (pendingReqs && pendingReqs.length > 0) {
        items.push({
          id: 'sys-load',
          title: 'System Activity',
          message: `There are ${pendingReqs.length} pending requests awaiting help.`,
          time: 'Overview',
          unread: true,
          icon: BarChart3,
          color: 'text-accent',
          href: '/dashboard/admin?role=admin&tab=overview'
        });
      }
    }

    return items;
  }, [currentRole, activeReqs, chatRooms, pendingReqs, ratings, recentUsers, user]);

  return { notifications, currentRole };
}

function DashboardNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const { user } = useUser();

  useEffect(() => { setMounted(true); }, []);

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
    if (user?.email === 'adminkn@gmail.com') return 'admin';
    if (roleQuery) return roleQuery;
    if (pathname.includes('/admin')) return 'admin';
    if (pathname.includes('/volunteer')) return 'volunteer';
    if (pathname.includes('/elderly')) return 'elderly';
    return 'elderly';
  }, [roleQuery, pathname, user]);

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
    <nav className="h-24 bg-white border-t flex items-center justify-around px-2 fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 safe-area-bottom shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
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

function NotificationContent({ notifications }: { notifications: any[] }) {
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
          <p className="text-xs font-bold uppercase mt-2 tracking-widest">Everything is up to date</p>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const { user } = useUser();
  
  useFcm();

  useEffect(() => { setMounted(true); }, []);

  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(userRef);

  const isLargeText = mounted && profile?.largeTextEnabled === true;

  return (
    <div className={cn("flex flex-col h-screen-dvh bg-background overflow-hidden items-center", isLargeText && "large-font-mode")}>
      <div className="w-full max-w-md h-full flex flex-col bg-white shadow-2xl relative">
        <header className="h-20 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/10">
              <Heart className="h-7 w-7 text-accent fill-accent" />
            </div>
            <span className="font-headline font-black text-2xl text-primary tracking-tight">ElderCare</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Suspense fallback={<div className="h-12 w-12 rounded-2xl bg-slate-50 animate-pulse" />}>
              <NotificationIconWithBadge />
            </Suspense>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-28 px-4 pt-8 w-full transition-all duration-200">
          {children}
        </main>

        <Suspense fallback={<div className="h-24 bg-white border-t" />}>
          <DashboardNav />
        </Suspense>
      </div>
    </div>
  );
}
