
"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  ArrowRight, 
  ShoppingCart, 
  Truck, 
  Wrench, 
  AlertCircle, 
  Heart,
  Filter,
  Loader2,
  SearchX,
  Star,
  Trophy,
  MessageSquareQuote,
  Clock,
  MessageSquare,
  CheckCircle2,
  Calendar
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
import { collection, query, where, doc, getDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { cn } from '@/lib/utils';

export default function VolunteerDashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [filter, setFilter] = useState('All');
  const [mounted, setMounted] = useState(false);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(searchParams.get('tab') || 'available');

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) setCurrentTab(tabParam);
  }, [searchParams]);

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(userProfileRef);

  useEffect(() => {
    if (!isUserLoading && !user && mounted) router.push('/auth/login');
  }, [user, isUserLoading, router, mounted]);

  const pendingQuery = useMemoFirebase(() => collection(db, 'assistance_requests_pending'), [db]);
  const { data: pendingTasks, isLoading: isPendingLoading } = useCollection(pendingQuery);

  const activeQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'assistance_requests_active'), where('assignedVolunteerId', '==', user.uid));
  }, [db, user]);
  const { data: activeTasks, isLoading: isActiveLoading } = useCollection(activeQuery);

  const completedQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'assistance_requests_completed'), 
      where('assignedVolunteerId', '==', user.uid)
    );
  }, [db, user]);
  const { data: completedTasks, isLoading: isCompletedLoading } = useCollection(completedQuery);

  const ratingsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'ratings'), where('volunteerUserId', '==', user.uid));
  }, [db, user]);
  const { data: ratingsData, isLoading: isRatingsLoading } = useCollection(ratingsQuery);

  const availableTasks = useMemo(() => {
    if (!pendingTasks) return [];
    let filtered = filter === 'All' ? [...pendingTasks] : pendingTasks.filter(t => t.taskType === filter);
    const weights: Record<string, number> = { 'High': 3, 'Medium': 2, 'Low': 1 };
    return filtered.sort((a, b) => {
      const wB = weights[b.urgencyLevel] || 0;
      const wA = weights[a.urgencyLevel] || 0;
      if (wB !== wA) return wB - wA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [pendingTasks, filter]);

  const achievementStats = useMemo(() => {
    if (!ratingsData || ratingsData.length === 0) return { avg: '0.0', count: 0 };
    const sum = ratingsData.reduce((acc, curr) => acc + (curr.ratingScore || 0), 0);
    return { avg: (sum / ratingsData.length).toFixed(1), count: ratingsData.length };
  }, [ratingsData]);

  const sortedCompletedTasks = useMemo(() => {
    if (!completedTasks) return [];
    return [...completedTasks].sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [completedTasks]);

  const handleAcceptTask = async (task: any) => {
    if (!user || !profile || isAccepting) return;
    setIsAccepting(task.id);
    const volunteerId = user.uid;
    const volunteerName = profile.name || user.displayName || 'Volunteer';
    const volunteerPhotoURL = profile.photoURL || '';
    const residentId = task.createdByUserId;
    const chatRoomId = [residentId, volunteerId].sort().join('_');
    const participants = [residentId, volunteerId];

    const activeRef = doc(db, 'assistance_requests_active', task.id);
    const pendingRef = doc(db, 'assistance_requests_pending', task.id);
    
    setDocumentNonBlocking(activeRef, { 
      ...task, status: 'Accepted', assignedVolunteerId: volunteerId, 
      volunteerName, chatRoomId, acceptedAt: new Date().toISOString()
    }, { merge: true });
    deleteDocumentNonBlocking(pendingRef);

    setDocumentNonBlocking(doc(db, 'chat_rooms', chatRoomId), { 
      id: chatRoomId, requestId: task.id, participantUserIds: participants, 
      volunteerName, volunteerPhotoURL, createdAt: new Date().toISOString(), 
      lastMessageSnippet: `Volunteer ${volunteerName} accepted.`, lastMessageAt: serverTimestamp() 
    }, { merge: true });

    addDocumentNonBlocking(collection(db, 'chat_rooms', chatRoomId, 'messages'), { 
      chatRoomId, senderUserId: volunteerId, 
      messageText: `I've accepted your request for ${task.taskType}. How can I help?`, 
      timestamp: serverTimestamp(), participantUserIds: participants 
    });

    toast({ title: "Task Accepted" });
    router.push(`/dashboard/chat/room?requestId=${chatRoomId}&role=volunteer`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Groceries': return <ShoppingCart className="h-5 w-5" />;
      case 'Transportation': return <Truck className="h-5 w-5" />;
      case 'Tech Support': return <Wrench className="h-5 w-5" />;
      default: return <AlertCircle className="h-5 w-5" />;
    }
  };

  if (!mounted || isUserLoading) return <div className="flex h-screen-dvh items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 gpu-accelerated">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-black text-primary">Volunteer</h1>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Politeknik Kuching Sarawak</p>
        </div>
        <div className="bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10 flex items-center gap-2">
          <Heart className="h-4 w-4 text-accent fill-accent" />
          <span className="text-sm font-bold text-primary">{activeTasks?.length || 0}</span>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4 h-11 rounded-2xl p-1 bg-slate-100">
          <TabsTrigger value="available" className="rounded-xl font-black text-[9px] uppercase">Browse</TabsTrigger>
          <TabsTrigger value="active" className="rounded-xl font-black text-[9px] uppercase">Active</TabsTrigger>
          <TabsTrigger value="completed" className="rounded-xl font-black text-[9px] uppercase">History</TabsTrigger>
          <TabsTrigger value="achievement" className="rounded-xl font-black text-[9px] uppercase">Stars</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-primary uppercase">Open Requests</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-accent text-[10px] font-black uppercase"><Filter className="h-3 w-3 mr-1" />{filter}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
                  <DropdownMenuRadioItem value="All">All Categories</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Groceries">Groceries</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Transportation">Transportation</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Tech Support">Tech Support</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {isPendingLoading ? <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div> : availableTasks.map((task) => (
            <Card key={task.id} className="border-none shadow-sm rounded-2xl active:scale-[0.98] transition-transform">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-50 text-accent">{getTypeIcon(task.taskType)}</div>
                    <div>
                      <div className="font-bold text-sm text-primary">{task.taskType}</div>
                      <div className="text-[9px] text-muted-foreground font-bold uppercase">{task.createdByName}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("text-[8px] rounded-lg uppercase", task.urgencyLevel === 'High' ? 'bg-destructive/5 text-destructive border-destructive/20' : 'bg-slate-50')}>
                    {task.urgencyLevel}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">"{task.description}"</p>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-bold"><MapPin className="h-3 w-3" /> {task.location}</span>
                  <Button onClick={() => handleAcceptTask(task)} disabled={isAccepting === task.id} className="h-9 px-4 bg-accent text-white font-black text-[10px] uppercase rounded-xl">Accept</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!isPendingLoading && availableTasks.length === 0 && <div className="py-20 text-center opacity-30 italic text-sm">No requests available</div>}
        </TabsContent>

        <TabsContent value="active" className="space-y-3">
          <h2 className="text-sm font-black text-primary uppercase mb-1">Ongoing Support</h2>
          {isActiveLoading ? <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div> : activeTasks?.map((task) => (
            <Card key={task.id} className="border-none shadow-sm rounded-2xl border-l-4 border-l-emerald-500 overflow-hidden active:scale-[0.98] transition-transform">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">{getTypeIcon(task.taskType)}</div>
                    <div>
                      <div className="font-bold text-sm text-primary">{task.taskType}</div>
                      <div className="text-[9px] text-muted-foreground font-bold uppercase">{task.createdByName || 'Resident'}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[8px] rounded-lg uppercase bg-emerald-50 text-emerald-700 border-emerald-100 font-black">
                    Active
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic">
                  "{task.description}"
                </p>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold truncate">
                      <MapPin className="h-3 w-3 shrink-0" /> {task.location}
                    </div>
                    <div className="flex items-center gap-1 text-[8px] text-emerald-600 font-black uppercase tracking-tight">
                      <Clock className="h-3 w-3" /> Started: {task.acceptedAt ? new Date(task.acceptedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                    </div>
                  </div>
                  
                  <Button asChild size="sm" className="h-9 px-4 bg-primary text-white font-black text-[10px] uppercase rounded-xl shadow-lg shadow-primary/10 gap-1.5 ml-4">
                    <Link href={`/dashboard/chat/room?requestId=${task.chatRoomId || task.id}&role=volunteer`}>
                      <MessageSquare className="h-3 w-3" />
                      Chat
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!isActiveLoading && (!activeTasks || activeTasks.length === 0) && (
            <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100 mx-1">
              <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto mb-4">
                <Heart className="h-8 w-8 text-slate-200" />
              </div>
              <p className="text-sm font-bold text-primary">No ongoing tasks</p>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Accept a request to see it here</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          <h2 className="text-sm font-black text-primary uppercase">Mission History</h2>
          {isCompletedLoading ? <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div> : sortedCompletedTasks?.map((task) => {
            const rating = ratingsData?.find(r => r.requestId === task.id);
            return (
              <Card key={task.id} className="border-none shadow-sm rounded-2xl bg-white active:scale-[0.98] transition-transform overflow-hidden">
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-50 text-slate-400">{getTypeIcon(task.taskType)}</div>
                      <div>
                        <div className="font-bold text-sm text-primary">{task.taskType}</div>
                        <div className="text-[9px] text-muted-foreground font-bold uppercase">Completed for {task.createdByName}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[8px] rounded-lg uppercase bg-emerald-50 text-emerald-600 border-emerald-100">
                      Completed
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic">
                    "{task.description}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-50 mt-1">
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold truncate">
                        <MapPin className="h-3 w-3" /> {task.location}
                      </div>
                      <div className="flex items-center gap-1 text-[8px] text-slate-400 font-bold uppercase tracking-tight">
                        <Calendar className="h-3 w-3" /> Finished: {task.completedAt ? new Date(task.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                      </div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 ml-4" />
                  </div>

                  {rating && (
                    <div className="mt-1 pt-2 border-t border-slate-50 bg-accent/5 -mx-4 -mb-4 px-4 pb-4">
                      <div className="flex items-center gap-1.5 text-accent font-black text-[10px] uppercase">
                        <Star className="h-3.5 w-3.5 fill-accent" /> Achievement: {rating.ratingScore}/10
                      </div>
                      {rating.feedback && (
                        <p className="text-[10px] text-muted-foreground italic mt-1 leading-relaxed">
                          "{rating.feedback}"
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {!isCompletedLoading && sortedCompletedTasks.length === 0 && (
            <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100 mx-1">
              <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto mb-4">
                <Clock className="h-8 w-8 text-slate-200" />
              </div>
              <p className="text-sm font-bold text-primary">No completed missions</p>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Finish a task to see it here</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievement" className="space-y-4">
          <Card className="border-none shadow-lg rounded-[2rem] bg-primary text-white text-center p-6">
            <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-xl font-black">Success Rate</h3>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white/10 rounded-2xl p-3">
                <div className="text-2xl font-black flex items-center justify-center gap-1">{achievementStats.avg} <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /></div>
                <div className="text-[8px] font-bold uppercase opacity-60">Avg Score</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-3">
                <div className="text-2xl font-black">{achievementStats.count}</div>
                <div className="text-[8px] font-bold uppercase opacity-60">Reviews</div>
              </div>
            </div>
          </Card>
          {ratingsData?.map((rating) => (
            <Card key={rating.id} className="border-none shadow-sm rounded-2xl bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-primary text-xs">{rating.ratingScore}/10 Stars</span>
                <span className="text-[8px] text-muted-foreground font-bold">{new Date(rating.createdAt).toLocaleDateString()}</span>
              </div>
              {rating.feedback && <p className="text-xs text-slate-600 italic leading-relaxed">"{rating.feedback}"</p>}
            </Card>
          ))}
          {(!ratingsData || ratingsData.length === 0) && <div className="py-10 text-center opacity-30 italic text-sm">No reviews yet</div>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
