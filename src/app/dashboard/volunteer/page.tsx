
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
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

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

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(userProfileRef);

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

  const completedQuery = useMemoFirebase(() => {
    if (!user || !mounted) return null;
    return query(collection(db, 'assistance_requests_completed'), where('assignedVolunteerId', '==', user.uid));
  }, [db, user, mounted]);
  
  const { data: completedTasks, isLoading: isCompletedLoading } = useCollection(completedQuery);

  const availableTasks = useMemo(() => {
    if (!pendingTasks) return [];
    if (filter === 'All') return pendingTasks;
    return pendingTasks.filter(t => t.taskType === filter);
  }, [pendingTasks, filter]);

  const handleAcceptTask = async (task: any) => {
    if (!user || !db || !profile) return;
    if (profile.role !== 'volunteer') {
      toast({ variant: "destructive", title: "Permission Denied", description: "Only registered volunteers can accept tasks." });
      return;
    }
    const volunteerId = user.uid;
    const volunteerName = profile.name || user.displayName || 'Volunteer';
    const residentId = task.createdByUserId;
    if (!residentId) {
      toast({ variant: "destructive", title: "Error", description: "Could not identify the resident." });
      return;
    }
    let residentName = task.createdByName || 'Resident';
    const chatRoomId = [residentId, volunteerId].sort().join('_');
    const activeRef = doc(db, 'assistance_requests_active', task.id);
    const pendingRef = doc(db, 'assistance_requests_pending', task.id);
    setDocumentNonBlocking(activeRef, { ...task, status: 'Accepted', assignedVolunteerId: volunteerId, volunteerName: volunteerName, residentName: residentName, chatRoomId: chatRoomId, acceptedAt: serverTimestamp() }, { merge: true });
    deleteDocumentNonBlocking(pendingRef);
    const chatRoomRef = doc(db, 'chat_rooms', chatRoomId);
    const participantUserIds = [residentId, volunteerId];
    setDocumentNonBlocking(chatRoomRef, { id: chatRoomId, requestId: task.id, participantUserIds: participantUserIds, residentName: residentName, volunteerName: volunteerName, createdAt: serverTimestamp(), lastMessageSnippet: `Volunteer ${volunteerName} has accepted your request.`, lastMessageAt: serverTimestamp() }, { merge: true });
    const messagesRef = collection(db, 'chat_rooms', chatRoomId, 'messages');
    addDocumentNonBlocking(messagesRef, { chatRoomId: chatRoomId, senderUserId: volunteerId, messageText: `I've accepted your request for ${task.taskType}. I'm here to help!`, timestamp: serverTimestamp(), participantUserIds: participantUserIds });
    toast({ title: "Task Accepted", description: `You are now helping ${residentName}.` });
    router.push(`/dashboard/chat/room?requestId=${chatRoomId}&role=volunteer`);
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
        <TabsList className="grid w-full grid-cols-3 mb-6 h-12 rounded-2xl p-1 bg-slate-100">
          <TabsTrigger value="available" className="rounded-xl font-bold text-sm">Available ({availableTasks.length})</TabsTrigger>
          <TabsTrigger value="active" className="rounded-xl font-bold text-sm">Active ({activeTasks?.length || 0})</TabsTrigger>
          <TabsTrigger value="completed" className="rounded-xl font-bold text-sm">History ({completedTasks?.length || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="available" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary">Open Requests</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-accent text-xs font-bold gap-1"><Filter className="h-3.5 w-3.5" />{filter === 'All' ? 'Filters' : filter}</Button>
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
            {isPendingLoading ? (<div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin" /><p className="text-xs font-bold uppercase">Loading requests...</p></div>) : availableTasks.map((task) => (
              <Card key={task.id} className="overflow-hidden border-none shadow-sm rounded-3xl transition-all">
                <CardContent className="p-0">
                  <div className="p-4 flex items-center justify-between bg-slate-50/50 border-b">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white shadow-sm text-accent">{getTypeIcon(task.taskType)}</div>
                      <div>
                        <div className="font-bold text-sm text-primary">{task.taskType}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase">{task.createdByName || 'Resident'}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] rounded-lg ${getUrgencyColor(task.urgencyLevel)}`}>{task.urgencyLevel}</Badge>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed italic">"{task.description}"</p>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase"><span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {task.location}</span></div>
                    <Button onClick={() => handleAcceptTask(task)} className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl gap-2 mt-2 shadow-lg shadow-accent/20">Accept & Chat<ArrowRight className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!isPendingLoading && availableTasks.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-slate-50 rounded-full"><SearchX className="h-10 w-10 text-slate-300" /></div>
                <p className="text-lg font-bold text-primary">No Requests Available</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="active" className="space-y-4">
          <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-primary">Ongoing Tasks</h2></div>
          <div className="space-y-4">
            {isActiveLoading ? (<div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin" /><p className="text-xs font-bold uppercase">Loading tasks...</p></div>) : activeTasks?.map((task) => (
              <Card key={task.id} className="overflow-hidden border-none shadow-sm rounded-3xl border-l-4 border-l-emerald-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">{getTypeIcon(task.taskType)}</div>
                      <div>
                        <div className="font-bold text-sm text-primary">{task.taskType}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase">{task.residentName || 'Resident'}</div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500 text-white text-[8px] h-5 uppercase">{task.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {task.location}</div>
                    <Button asChild size="sm" className="bg-primary text-white rounded-xl h-9 px-4 text-xs font-bold gap-2">
                      <Link href={`/dashboard/chat/room?requestId=${task.chatRoomId || task.id}&role=volunteer`}>Go to Chat<ArrowRight className="h-3 w-3" /></Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-primary">Completed Tasks</h2></div>
          <div className="space-y-4">
            {isCompletedLoading ? (<div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin" /></div>) : completedTasks?.map((task) => (
              <Card key={task.id} className="overflow-hidden border-none shadow-sm rounded-3xl opacity-80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-50 text-slate-400">{getTypeIcon(task.taskType)}</div>
                      <div>
                        <div className="font-bold text-sm text-primary">{task.taskType}</div>
                        <div className="text-[10px] text-muted-foreground">{task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Finished'}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Completed</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground italic truncate">"{task.description}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
