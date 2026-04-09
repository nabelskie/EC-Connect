
"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Search, 
  Mail, 
  Phone,
  Loader2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

function AdminUsersContent() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'All';
  const [roleFilter, setRoleFilter] = useState(initialFilter);
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const ADMIN_EMAIL = 'adminkn@gmail.com';

  useEffect(() => {
    setMounted(true);
  }, []);

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);
  
  const isAdminConfirmed = useMemo(() => {
    if (!user) return false;
    return user.email?.toLowerCase() === ADMIN_EMAIL || profile?.role === 'admin';
  }, [user, profile]);

  const usersQuery = useMemoFirebase(() => (isAdminConfirmed && user) ? collection(db, 'users') : null, [db, isAdminConfirmed, user]);
  const { data: usersData, isLoading: isUsersLoading, error: usersError } = useCollection(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!usersData) return [];
    return usersData.filter(u => {
      const matchesSearch = 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [usersData, searchTerm, roleFilter]);

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    const docRef = doc(db, 'users', userToDelete.id);
    
    // Non-blocking delete to prevent UI lockup
    deleteDocumentNonBlocking(docRef);
    
    toast({
      title: "User Removed",
      description: `${userToDelete.name}'s profile is being deleted.`,
    });
    
    setUserToDelete(null);
  };

  const getDisplayRole = (role: string) => {
    if (role === 'elderly') return 'Elderly';
    if (role === 'volunteer') return 'Volunteer';
    if (role === 'admin') return 'Admin';
    return role;
  };

  if (!mounted || isProfileLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (usersError || !isAdminConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold text-primary">Access Denied</h2>
        <p className="text-sm text-muted-foreground">Only system administrators can view the directory.</p>
        <Button asChild variant="outline" className="rounded-xl">
           <Link href="/dashboard/admin?role=admin">Back to Console</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 px-1">
        <Link 
          href="/dashboard/admin?role=admin" 
          className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-primary" />
        </Link>
        <h1 className="text-2xl font-headline font-bold text-primary">Community Directory</h1>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10 h-12 rounded-2xl bg-white border-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide px-1">
          {['All', 'elderly', 'volunteer', 'admin'].map((r) => (
            <Button
              key={r}
              variant={roleFilter === r ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter(r)}
              className={`rounded-full px-4 h-8 text-[10px] font-bold uppercase shrink-0 ${
                roleFilter === r ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-muted-foreground border-slate-200'
              }`}
            >
              {getDisplayRole(r)}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="space-y-3 px-1">
          {isUsersLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.map((u) => (
            <Card key={u.id} className="border-none shadow-sm rounded-2xl p-4 flex items-center gap-4 active:bg-slate-50 transition-colors">
              <Avatar className="h-12 w-12 border-2 border-slate-50 shrink-0">
                <AvatarImage src={`https://picsum.photos/seed/${u.id}/100/100`} />
                <AvatarFallback>{u.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary truncate">{u.name}</span>
                  <Badge variant="outline" className="text-[8px] h-4 px-1 leading-none uppercase shrink-0">
                    {getDisplayRole(u.role)}
                  </Badge>
                </div>
                <div className="flex flex-col gap-0.5 mt-1">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                    <Mail className="h-2.5 w-2.5" /> {u.email}
                  </div>
                  {u.phone && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Phone className="h-2.5 w-2.5" /> {u.phone}
                    </div>
                  )}
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive hover:bg-destructive/10 rounded-full h-9 w-9 shrink-0"
                onClick={() => setUserToDelete(u)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
          
          {filteredUsers.length === 0 && !isUsersLoading && (
            <div className="text-center py-20 opacity-30 italic text-sm">
              No users found matching your filters.
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Centralized User Deletion Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="rounded-3xl max-w-[90vw] mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete <strong>{userToDelete?.name}</strong> from the community directory. They will immediately lose access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2">
            <AlertDialogAction 
              onClick={confirmDeleteUser}
              className="bg-destructive hover:bg-destructive/90 h-12 rounded-xl font-bold"
            >
              Yes, Remove User
            </AlertDialogAction>
            <AlertDialogCancel className="h-12 rounded-xl font-bold border-none bg-slate-100">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <AdminUsersContent />
    </Suspense>
  );
}
