"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Clock, 
  ArrowRight, 
  ShoppingCart, 
  Truck, 
  Wrench, 
  AlertCircle, 
  Heart,
  Filter,
  CheckCircle2,
  Loader2,
  SearchX
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, setDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function VolunteerDashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [filter, setFilter] = useState('All');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user && mounted) {
      router.push('/auth/login');
    }
  }, [user, isUserLoading, router, mounted]);

  const pendingQuery = useMemoFirebase(() => {
    if (!user || !mounted) return null;
    return collection(db, 'assistance_requests_pending');
  }, [db, user, mounted]);
  
  const { data: pendingTasks, isLoading: isPendingLoading } = useCollection(pendingQuery);

  const activeQuery = useMemoFirebase(() => {
    if (!user || !mounted) return null;
    return query(collection(db, 'assistance_requests_active'), where('assignedVolunteerId', '==', user.uid));
  }, [db, user, mounted]);
  
  const { data: activeTasks, isLoading: isActiveLoading } = useCollection(activeQuery);

  const availableTasks = useMemo(() => {
    if (!pendingTasks) return [];
    if (filter === 'All') return pendingTasks;
    return pendingTasks.filter(t => t.taskType === filter);
  }, [pendingTasks, filter]);

  const handleAcceptTask = async (task: any) => {
    if (!user || !db) return;

    const volunteerId = user.uid;
    const volunteerName = user.displayName || 'Volunteer';

    const activeRef = doc(db, 'assistance_requests_active', task.id);
    const pendingRef = doc(db, 'assistance_requests_pending', task.id);

    // 1. Move to active
    setDoc(activeRef, {
      ...task,
      status: 'Accepted',
      assignedVolunteerId: volunteerId,
      acceptedAt: serverTimestamp(),
    }).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: activeRef.path,
        operation: 'create',
        requestResourceData: task,
      }));
    });

    // 2. Remove from pending
    deleteDoc(pendingRef).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: pendingRef.path,
        operation: 'delete',
      }));
    });

    // 3. Create chat room
    const chatRoomId = `chat_${task.id}`;
    const chatRoomRef = doc(db, 'chat_rooms', chatRoomId);
    setDoc(chatRoomRef, {
      id: chatRoomId,
      requestId: task.id,
      participantUserIds: [task.createdByUserId, volunteerId],
      createdAt: serverTimestamp(),
      lastMessageSnippet: `Volunteer ${volunteerName} has accepted your request.`,
      lastMessageAt: serverTimestamp(),
    }).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: chatRoomRef.path,
        operation: 'create',
      }));
    });

    toast({
      title: "Task Accepted!",
      description: "You can now chat with the resident in the Active tab.",
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Medium': return 'bg-orange-100 text-orange-600 border-orange-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Groceries': return <ShoppingCart className="h-5 w-5" />;
      case 'Transportation': return <Truck className="h-5 w-5" />;
      case 'Tech Support': return <Wrench className="h-5 w-5" />;
      default: return <AlertCircle className="h-5 w-5" />;
    }
  };

  if (!mounted || isUserLoading) {
    return (
      <div className="flex h-screen-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold text-primary">Volunteer Hub</h1>
          <p className="text-xs text-muted-foreground">Politeknik Kuching Sarawak</p>
        </div>
        <div className="bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10 flex items-center gap-2">
          <Heart className="h-4 w-4 text-accent fill-accent" />
          <span className="text-sm font-bold text-primary">{activeTasks?.length || 0} Active</span>
        </div>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12 rounded-2xl p-1 bg-slate-100">
          <TabsTrigger value="available" className="rounded-xl font-bold text-sm">
            Available ({availableTasks.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="rounded-xl font-bold text-sm">
            Active ({activeTasks?.length || 0})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary">Open Requests</h2>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-accent text-xs font-bold gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  {filter === 'All' ? 'Filters' : filter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
                  <DropdownMenuRadioItem value="All">All Categories</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Groceries">Groceries</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Transportation">Transportation</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Tech Support">Tech Support</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-4">
            {isPendingLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-xs font-bold uppercase">Loading requests...</p>
              </div>
            ) : availableTasks.map((task) => (
              <Card key={task.id} className="overflow-hidden border-none shadow-sm rounded-3xl active:scale-[0.98] transition-all">
                <CardContent className="p-0">
                  <div className="p-4 flex items-center justify-between bg-slate-50/50 border-b">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white shadow-sm text-accent">
                        {getTypeIcon(task.taskType)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-primary">{task.taskType}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase">Resident ID: {task.createdByUserId?.slice(0, 5)}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] rounded-lg ${getUrgencyColor(task.urgencyLevel)}`}>
                      {task.urgencyLevel}
                    </Badge>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed italic">
                      "{task.description}"
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {task.location}</span>
                    </div>
                    <Button 
                      onClick={() => handleAcceptTask(task)}
                      className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl gap-2 mt-2 shadow-lg shadow-accent/20"
                    >
                      Accept & Chat
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!isPendingLoading && availableTasks.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-slate-50 rounded-full">
                  <SearchX className="h-10 w-10 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-primary">No Requests Available</p>
                  <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                    There are no open assistance requests {filter !== 'All' ? `for ${filter}` : ''} right now. Check back soon!
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary">Ongoing Tasks</h2>
          </div>

          <div className="space-y-4">
            {isActiveLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-xs font-bold uppercase">Loading your tasks...</p>
              </div>
            ) : activeTasks?.map((task) => (
              <Card key={task.id} className="overflow-hidden border-none shadow-sm rounded-3xl border-l-4 border-l-emerald-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                        {getTypeIcon(task.taskType)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-primary">{task.taskType}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase">Resident ID: {task.createdByUserId?.slice(0, 5)}</div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500 text-white text-[8px] h-5 uppercase">{task.status}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {task.location}
                    </div>
                    <Button asChild size="sm" className="bg-primary text-white rounded-xl h-9 px-4 text-xs font-bold gap-2">
                      <Link href={`/dashboard/chat?role=volunteer`}>
                        Go to Chat
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!isActiveLoading && (!activeTasks || activeTasks.length === 0) && (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-slate-50 rounded-full">
                  <Clock className="h-10 w-10 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-primary">No Active Tasks</p>
                  <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                    You haven't accepted any tasks yet. Head over to the "Available" tab to start helping!
                  </p>
                </div>
              </div>
            )}
            
            {!isActiveLoading && activeTasks && activeTasks.length > 0 && (
              <div className="flex items-center justify-center gap-2 p-4 bg-emerald-50 rounded-2xl text-emerald-700 text-[10px] font-bold uppercase">
                <CheckCircle2 className="h-4 w-4" />
                You are currently helping {activeTasks.length} residents
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
