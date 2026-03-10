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
  LogOut, 
  LayoutDashboard, 
  ShieldCheck,
  Search,
  Bell,
  Menu
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    router.push('/auth/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard/elderly', role: 'elderly' },
    { label: 'My Requests', icon: ClipboardList, href: '/dashboard/elderly/requests', role: 'elderly' },
    
    { label: 'Browse Tasks', icon: LayoutDashboard, href: '/dashboard/volunteer', role: 'volunteer' },
    { label: 'My Tasks', icon: ClipboardList, href: '/dashboard/volunteer/history', role: 'volunteer' },

    { label: 'System Admin', icon: ShieldCheck, href: '/dashboard/admin', role: 'admin' },
  ];

  const currentRole = pathname.includes('admin') ? 'admin' : pathname.includes('volunteer') ? 'volunteer' : 'elderly';
  const roleNavItems = navItems.filter(item => item.role === currentRole);

  return (
    <SidebarProvider>
      <div className="min-h-screen-dvh bg-background flex w-full overflow-hidden">
        {/* Sidebar */}
        <Sidebar className="border-r bg-white shadow-sm">
          <SidebarHeader className="p-6">
            <Link href="/" className="flex items-center gap-2 px-2">
              <Heart className="h-6 w-6 text-accent fill-accent" />
              <span className="font-headline font-bold text-xl text-primary tracking-tight">ElderCare</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-4 py-2">
            <SidebarMenu>
              {roleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`h-12 px-4 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-primary text-white hover:bg-primary/90 shadow-md' 
                          : 'hover:bg-slate-100 text-muted-foreground'
                      }`}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  className="h-12 px-4 rounded-xl hover:bg-slate-100 text-muted-foreground"
                >
                  <Link href="/chat/demo" className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5" />
                    <span className="font-medium">Messages</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-6 border-t">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  className="h-12 px-4 rounded-xl hover:bg-slate-100 text-muted-foreground"
                >
                  <Link href="/profile" className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    <span className="font-medium">Account Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout}
                  className="h-12 px-4 rounded-xl hover:bg-destructive/10 text-destructive w-full"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Log Out</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Top Navigation Bar */}
          <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden">
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full w-80">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search requests, volunteers..." 
                  className="border-none bg-transparent h-6 focus-visible:ring-0 text-sm p-0"
                />
              </div>
              <div className="md:hidden">
                <span className="font-headline font-bold text-primary truncate block max-w-[120px]">ElderCare</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" size="icon" className="rounded-full relative text-muted-foreground">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
              </Button>
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-primary leading-tight">Mrs. Hapsah</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Elderly</p>
                </div>
                <Avatar className="h-8 w-8 md:h-9 md:w-9 border-2 border-slate-100 shadow-sm">
                  <AvatarImage src="https://picsum.photos/seed/user/100/100" />
                  <AvatarFallback>MH</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
