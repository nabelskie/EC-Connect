
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
  AlertCircle,
  MapPin,
  UserCircle,
  Hash,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

function AdminUsersContent() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'All';
  const [roleFilter, setRoleFilter] = useState(initialFilter);
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();

  const ADMIN_EMAIL = 'adminkn@gmail.com';

  useEffect(() => {
    setMounted(true);
  }, []);

  const userProfileRef = useMemoFirebase(() => {
    if (!currentUser) return null;
    return doc(db, 'users', currentUser.uid);
  }, [db, currentUser]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);
  
  const isAdminConfirmed = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.email?.toLowerCase() === ADMIN_EMAIL || profile?.role === 'admin';
  }, [currentUser, profile]);

  const usersQuery = useMemoFirebase(() => (isAdminConfirmed && currentUser) ? collection(db, 'users') : null, [db, isAdminConfirmed, currentUser]);
  const { data: usersData, isLoading: isUsersLoading, error: usersError } = useCollection(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!usersData) return [];
    return usersData.filter(u => {
      const name = u.name || '';
      const email = u.email || '';
      const matrix = u.matrixNumber || '';
      const matchesSearch = 
        name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matrix.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'All' || u.role?.toLowerCase() === roleFilter.toLowerCase();
      
      return matchesSearch && matchesRole;
    });
  }, [usersData, searchTerm, roleFilter]);

  /**
   * Cascading Delete Handler
   * Deletes the user profile and all requests created by this user.
   */
  const confirmDeleteUser = async () => {
    if (!userToDelete || isDeleting) return;
    
    if (userToDelete.id === currentUser?.uid) {
      toast({
        variant: "destructive",
        title: "Action Blocked",
        description: "You cannot delete your own administrative account.",
      });
      setUserToDelete(null);
      return;
    }

    setIsDeleting(true);
    const userId = userToDelete.id;
    const batch = writeBatch(db);

    try {
      // 1. Queue user profile deletion
      batch.delete(doc(db, 'users', userId));

      // 2. Find and queue deletion for all requests created by this user across all status collections
      const collectionsToClean = [
        'assistance_requests_pending',
        'assistance_requests_active',
        'assistance_requests_completed'
      ];

      for (const collName of collectionsToClean) {
        const q = query(collection(db, collName), where('createdByUserId', '==', userId));
        const snapshot = await getDocs(q);
        snapshot.forEach((d) => {
          batch.delete(d.ref);
        });
      }

      // 3. Execute all deletions atomically
      await batch.commit();
      
      toast({
        title: "User & Data Removed",
        description: `${userToDelete.name}'s profile and all their requests have been deleted.`,
      });
    } catch (error) {
      console.error("Deletion error:", error);
      toast({
        variant: "destructive",
        title: "Cleanup Failed",
        description: "User was deleted, but some associated data might remain.",
      });
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  const getDisplayRole = (role: string) => {
    if (!role) return 'User';
    const r = role.toLowerCase();
    if (r === 'elderly') return 'Elderly';
    if (r === 'volunteer') return 'Volunteer';
    if (r === 'admin') return 'Admin';
    return role.charAt(0).toUpperCase() + role.slice(1);
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
        <p className="text-sm text-muted-foreground">Only system administrators can manage the community directory.</p>
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
            placeholder="Search by name, email or matrix..." 
            className="pl-10 h-12 rounded-2xl bg-white border-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide px-1">
          {['All', 'elderly', 'volunteer', 'admin'].map((r) => (
            <Button
              key={r}
              variant={roleFilter.toLowerCase() === r.toLowerCase() ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter(r)}
              className={`rounded-full px-4 h-8 text-[10px] font-bold uppercase shrink-0 transition-all ${
                roleFilter.toLowerCase() === r.toLowerCase() ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-muted-foreground border-slate-200'
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
            <Card key={u.id} className="border-none shadow-sm rounded-2xl p-4 flex items-start justify-between gap-4 active:bg-slate-50 transition-colors">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <Avatar className="h-12 w-12 border-2 border-slate-50 shrink-0">
                  <AvatarImage src={u.photoURL || `https://picsum.photos/seed/${u.id}/100/100`} className="object-cover" />
                  <AvatarFallback>{u.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-primary break-words whitespace-normal leading-tight flex-1 min-w-[120px]">{u.name}</span>
                    <Badge variant="outline" className={`text-[8px] h-4 px-1 leading-none uppercase shrink-0 ${
                      u.role === 'admin' ? 'border-primary text-primary' : 
                      u.role === 'volunteer' ? 'border-accent text-accent' : 'border-slate-400 text-slate-500'
                    }`}>
                      {getDisplayRole(u.role)}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1 mt-2">
                    {u.age && u.age !== "N/A" && (
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>Age: {u.age}</span>
                      </div>
                    )}
                    {u.matrixNumber && u.matrixNumber !== "N/A" && (
                      <div className="flex items-center gap-2 text-[10px] text-accent font-black">
                        <Hash className="h-3 w-3 shrink-0" />
                        <span>Matrix: {u.matrixNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="break-all whitespace-normal">{u.email}</span>
                    </div>
                    {u.gender && (
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <UserCircle className="h-3 w-3 shrink-0" /> 
                        <span>{u.gender}</span>
                      </div>
                    )}
                    {u.phone && u.phone !== "N/A" && (
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Phone className="h-3 w-3 shrink-0" /> 
                        <span className="break-words">{u.phone}</span>
                      </div>
                    )}
                    {u.address && u.address !== "System Console" && (
                      <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0 mt-0.5" /> 
                        <span className="break-words whitespace-normal">{u.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                {u.id !== currentUser?.uid && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive/10 rounded-xl h-9 px-2 flex items-center gap-1 transition-colors"
                    onClick={() => setUserToDelete(u)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase hidden sm:inline">Delete</span>
                  </Button>
                )}
              </div>
            </Card>
          ))}
          
          {filteredUsers.length === 0 && !isUsersLoading && (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 mx-1">
              <div className="p-4 bg-slate-50 rounded-full">
                <AlertCircle className="h-10 w-10 text-slate-200" />
              </div>
              <p className="text-sm font-bold text-primary">No members found in this category</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && !isDeleting && setUserToDelete(null)}>
        <AlertDialogContent className="rounded-3xl max-w-[90vw] mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Remove User?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This will permanently delete <strong>{userToDelete?.name}</strong> and <strong>all assistance requests</strong> created by them. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 mt-4">
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteUser();
              }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 h-12 rounded-xl font-bold shadow-lg shadow-destructive/20"
            >
              {isDeleting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              {isDeleting ? "Deleting..." : "Yes, Remove Everything"}
            </AlertDialogAction>
            <AlertDialogCancel disabled={isDeleting} className="h-12 rounded-xl font-bold border-none bg-slate-100 hover:bg-slate-200 transition-colors">
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
