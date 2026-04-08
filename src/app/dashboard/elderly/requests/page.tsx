
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
  Loader2
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

  // Fetch all types of requests for this user
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
    
    return combined.sort((a, b) => {
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
      case 'Pending': return <Badge className="bg-yellow-500 text-white rounded-full px-3">Pending</Badge>;
      case 'Accepted': return <Badge className="bg-sky-500 text-white rounded-full px-3">Accepted</Badge>;
      case 'Completed': return <Badge className="bg-emerald-500 text-white rounded-full px-3">Completed</Badge>;
      default: return <Badge variant="outline" className="rounded-full px-3">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Groceries': return <ShoppingCart className="h-5 w-5" />;
      case 'Transportation': return <Truck className="h-5 w-5" />;
      case 'Tech Support': return <Wrench className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/elderly" 
          className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-primary" />
        </Link>
        <h1 className="text-2xl font-headline font-bold text-primary">Request History</h1>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
        {filters.map((f) => (
          <Button
            key={f}
            variant={activeFilter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(f)}
            className={cn(
              "rounded-full px-4 h-8 text-[10px] font-bold uppercase tracking-wider transition-all shrink-0",
              activeFilter === f 
                ? "bg-primary text-white border-primary" 
                : "text-muted-foreground border-slate-200 bg-white"
            )}
          >
            {f}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading && allRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 opacity-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-[10px] font-bold uppercase">Loading your history...</p>
          </div>
        ) : filteredRequests.map((req) => (
          <Card 
            key={req.id} 
            className="border-none shadow-sm rounded-3xl overflow-hidden active:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => setSelectedRequest(req)}
          >
            <CardContent className="p-5 flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-accent/10 text-accent shrink-0">
                {getTypeIcon(req.taskType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-primary truncate text-lg">{req.taskType}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">{formatDate(req.createdAt).split(',')[0]}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">{req.description}</p>
                <div className="flex items-center justify-between">
                  {getStatusBadge(req.status)}
                  <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!isLoading && filteredRequests.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 mx-1">
             <Filter className="h-12 w-12 mx-auto mb-4 text-slate-200" />
             <p className="text-lg font-bold text-primary">No {activeFilter === 'All' ? '' : activeFilter} Requests</p>
             <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">There are no requests matching this status in your history.</p>
          </div>
        )}
      </div>

      <Sheet open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <SheetContent side="bottom" className="rounded-t-[3rem] h-[80vh] px-6 py-8">
          {selectedRequest && (
            <div className="space-y-6 h-full overflow-y-auto pb-10">
              <SheetHeader className="text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-4 rounded-2xl bg-accent/10 text-accent w-fit">
                    {getTypeIcon(selectedRequest.taskType)}
                  </div>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <SheetTitle className="text-2xl font-bold text-primary">{selectedRequest.taskType} Help</SheetTitle>
                <SheetDescription className="text-base leading-relaxed text-slate-600 italic">
                  "{selectedRequest.description}"
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Location</Label>
                    <p className="text-primary font-medium">{selectedRequest.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Requested On</Label>
                    <p className="text-primary font-medium">{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                </div>

                {selectedRequest.volunteerName && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-500">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase font-bold">Volunteer Assigned</Label>
                      <p className="text-primary font-medium">{selectedRequest.volunteerName}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-6">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Progress Timeline</h3>
                <div className="space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="h-5 w-5 rounded-full bg-emerald-500 border-4 border-white shadow-sm mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-primary">Request Submitted</p>
                      <p className="text-xs text-muted-foreground">{formatDate(selectedRequest.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`h-5 w-5 rounded-full border-4 border-white shadow-sm mt-0.5 ${
                      selectedRequest.status === 'Accepted' || selectedRequest.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-200'
                    }`} />
                    <div>
                      <p className={`text-sm font-bold ${
                        selectedRequest.status === 'Accepted' || selectedRequest.status === 'Completed' ? 'text-primary' : 'text-muted-foreground'
                      }`}>Volunteer Accepted</p>
                      {selectedRequest.volunteerName && <p className="text-xs text-muted-foreground">Assigned to {selectedRequest.volunteerName}</p>}
                    </div>
                  </div>

                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`h-5 w-5 rounded-full border-4 border-white shadow-sm mt-0.5 ${
                      selectedRequest.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-200'
                    }`} />
                    <div>
                      <p className={`text-sm font-bold ${
                        selectedRequest.status === 'Completed' ? 'text-primary' : 'text-muted-foreground'
                      }`}>Task Completed</p>
                      {selectedRequest.status === 'Completed' && (
                        <p className="text-xs text-muted-foreground">
                          Finished on {formatDate(selectedRequest.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function RequestsHistoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <RequestsHistoryContent />
    </Suspense>
  );
}
