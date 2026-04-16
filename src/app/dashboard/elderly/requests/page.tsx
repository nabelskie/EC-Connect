
"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { 
  ShoppingCart, 
  Truck, 
  Wrench, 
  Info, 
  ChevronRight, 
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Filter,
  Loader2,
  Clock,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

function RequestsHistoryContent() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const { user } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  const pendingQuery = useMemoFirebase(() => {
    if (!user || !mounted) return null;
    return query(collection(db, 'assistance_requests_pending'), where('createdByUserId', '==', user.uid));
  }, [db, user, mounted]);

  const activeQuery = useMemoFirebase(() => {
    if (!user || !mounted) return null;
    return query(collection(db, 'assistance_requests_active'), where('createdByUserId', '==', user.uid));
  }, [db, user, mounted]);

  const completedQuery = useMemoFirebase(() => {
    if (!user || !mounted) return null;
    return query(collection(db, 'assistance_requests_completed'), where('createdByUserId', '==', user.uid));
  }, [db, user, mounted]);

  const { data: pendingData, isLoading: isPendingLoading } = useCollection(pendingQuery);
  const { data: activeData, isLoading: isActiveLoading } = useCollection(activeQuery);
  const { data: completedData, isLoading: isCompletedLoading } = useCollection(completedQuery);

  const allRequests = useMemo(() => {
    const combined = [
      ...(pendingData || []).map(r => ({ ...r, status: 'Pending' })),
      ...(activeData || []).map(r => ({ ...r, status: 'Accepted' })),
      ...(completedData || []).map(r => ({ ...r, status: 'Completed' }))
    ];
    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
    return unique.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [pendingData, activeData, completedData]);

  const filteredRequests = useMemo(() => {
    if (activeFilter === 'All') return allRequests;
    return allRequests.filter(req => req.status === activeFilter);
  }, [activeFilter, allRequests]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <Badge className="bg-yellow-500 text-white rounded-full px-4 h-7 font-bold">Pending</Badge>;
      case 'Accepted': return <Badge className="bg-sky-500 text-white rounded-full px-4 h-7 font-bold">Accepted</Badge>;
      case 'Completed': return <Badge className="bg-emerald-500 text-white rounded-full px-4 h-7 font-bold">Completed</Badge>;
      default: return <Badge variant="outline" className="rounded-full px-4 h-7 font-bold">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Groceries': return <ShoppingCart className="h-6 w-6" />;
      case 'Transportation': return <Truck className="h-6 w-6" />;
      case 'Tech Support': return <Wrench className="h-6 w-6" />;
      default: return <Info className="h-6 w-6" />;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Recent';
    try {
      return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const filters = ['All', 'Pending', 'Accepted', 'Completed'];

  if (!mounted) return null;

  const isLoading = isPendingLoading || isActiveLoading || isCompletedLoading;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/elderly?role=elderly" 
          className="p-3 -ml-3 hover:bg-slate-100 rounded-full transition-colors active:scale-90"
        >
          <ArrowLeft className="h-8 w-8 text-primary" />
        </Link>
        <h1 className="text-3xl font-headline font-black text-primary">History</h1>
      </div>
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
        {filters.map((f) => (
          <Button 
            key={f} 
            variant={activeFilter === f ? "default" : "outline"} 
            size="lg" 
            onClick={() => setActiveFilter(f)} 
            className={cn(
              "rounded-full px-6 h-12 text-xs font-black uppercase tracking-widest transition-all shrink-0 shadow-sm", 
              activeFilter === f ? "bg-primary text-white border-primary" : "text-muted-foreground border-slate-200 bg-white"
            )}
          >
            {f}
          </Button>
        ))}
      </div>
      <div className="space-y-5">
        {isLoading && allRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 opacity-40">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-black uppercase tracking-widest">Loading history...</p>
          </div>
        ) : filteredRequests.map((req) => (
          <Card key={req.id} className="border-none shadow-md rounded-[2.25rem] overflow-hidden active:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-200 hover:shadow-lg" onClick={() => setSelectedRequest(req)}>
            <CardContent className="p-7 flex items-start gap-5">
              <div className="p-4 rounded-[1.25rem] bg-accent/10 text-accent shrink-0">{getTypeIcon(req.taskType)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-primary truncate text-xl">{req.taskType}</span>
                  <span className="text-xs text-muted-foreground font-black uppercase tracking-tighter">{formatDate(req.createdAt).split(',')[0]}</span>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed mb-4 line-clamp-2 font-medium">{req.description}</p>
                <div className="flex items-center justify-between">
                  {getStatusBadge(req.status)}
                  <ChevronRight className="h-8 w-8 text-muted-foreground/20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!isLoading && filteredRequests.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 mx-1 flex flex-col items-center justify-center gap-6">
             <div className="p-5 bg-slate-50 rounded-full"><Filter className="h-12 w-12 text-slate-300" /></div>
             <div className="space-y-2">
               <p className="text-2xl font-black text-primary">No matching requests</p>
               <p className="text-sm text-muted-foreground max-w-[240px] mx-auto font-bold uppercase tracking-widest leading-relaxed">Try changing the status filter above</p>
             </div>
          </div>
        )}
      </div>
      <Sheet open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <SheetContent side="bottom" className="rounded-t-[3.5rem] h-[90vh] px-8 py-10">
          {selectedRequest && (
            <div className="space-y-8 h-full overflow-y-auto pb-12">
              <SheetHeader className="text-left space-y-6">
                <div className="flex items-center justify-between">
                  <div className="p-5 rounded-[1.5rem] bg-accent/10 text-accent w-fit">{getTypeIcon(selectedRequest.taskType)}</div>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div>
                  <SheetTitle className="text-3xl font-bold text-primary mb-2">{selectedRequest.taskType} Details</SheetTitle>
                  <SheetDescription className="text-xl leading-relaxed text-slate-700 italic font-medium">
                    "{selectedRequest.description}"
                  </SheetDescription>
                </div>
              </SheetHeader>
              <div className="space-y-6 pt-6 border-t">
                <div className="flex items-start gap-5">
                  <div className="p-3 rounded-xl bg-slate-100 text-slate-500"><MapPin className="h-6 w-6" /></div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase font-black tracking-widest">Location</Label>
                    <p className="text-xl text-primary font-bold mt-1">{selectedRequest.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="p-3 rounded-xl bg-slate-100 text-slate-500"><Calendar className="h-6 w-6" /></div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase font-black tracking-widest">Requested On</Label>
                    <p className="text-xl text-primary font-bold mt-1">{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                </div>
                {selectedRequest.volunteerName && (
                  <div className="flex items-start gap-5">
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-500"><User className="h-6 w-6" /></div>
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase font-black tracking-widest">Volunteer Assigned</Label>
                      <p className="text-xl text-emerald-600 font-black mt-1">{selectedRequest.volunteerName}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-6 pt-8">
                <h3 className="text-base font-black text-primary uppercase tracking-[0.2em]">Progress Timeline</h3>
                <div className="space-y-8 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-1 before:bg-slate-100">
                  <div className="flex items-start gap-6 relative z-10">
                    <div className="h-7 w-7 rounded-full bg-emerald-500 border-4 border-white shadow-md mt-0.5" />
                    <div>
                      <p className="text-lg font-black text-primary">Request Submitted</p>
                      <p className="text-sm text-muted-foreground font-bold">{formatDate(selectedRequest.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6 relative z-10">
                    <div className={`h-7 w-7 rounded-full border-4 border-white shadow-md mt-0.5 ${selectedRequest.status === 'Accepted' || selectedRequest.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    <div>
                      <p className={`text-lg font-black ${selectedRequest.status === 'Accepted' || selectedRequest.status === 'Completed' ? 'text-primary' : 'text-muted-foreground'}`}>Volunteer Accepted</p>
                      {selectedRequest.volunteerName ? (<p className="text-sm text-muted-foreground font-bold">Assigned to {selectedRequest.volunteerName}</p>) : (<p className="text-sm text-muted-foreground font-bold italic">Awaiting verification</p>)}
                    </div>
                  </div>
                  <div className="flex items-start gap-6 relative z-10">
                    <div className={`h-7 w-7 rounded-full border-4 border-white shadow-md mt-0.5 ${selectedRequest.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    <div>
                      <p className={`text-lg font-black ${selectedRequest.status === 'Completed' ? 'text-primary' : 'text-muted-foreground'}`}>Task Completed</p>
                      {selectedRequest.status === 'Completed' && (<p className="text-sm text-muted-foreground font-bold">Finished on {formatDate(selectedRequest.completedAt)}</p>)}
                    </div>
                  </div>
                </div>
              </div>
              {selectedRequest.status === 'Accepted' && (
                <div className="pt-6">
                  <Button asChild className="w-full h-20 rounded-[1.5rem] bg-accent hover:bg-accent/90 font-bold text-2xl shadow-2xl shadow-accent/20">
                    <Link href={`/dashboard/chat/room?requestId=${selectedRequest.chatRoomId || selectedRequest.id}&role=elderly`}>Chat with Volunteer</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function RequestsHistoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-32"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
      <RequestsHistoryContent />
    </Suspense>
  );
}
