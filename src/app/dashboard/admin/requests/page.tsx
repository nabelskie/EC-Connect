"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/sheet';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  Clock, 
  Loader2,
  MapPin,
  User,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function AdminRequestsContent() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'All';
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const db = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const pendingQuery = useMemoFirebase(() => collection(db, 'assistance_requests_pending'), [db]);
  const activeQuery = useMemoFirebase(() => collection(db, 'assistance_requests_active'), [db]);
  const completedQuery = useMemoFirebase(() => collection(db, 'assistance_requests_completed'), [db]);

  const { data: pendingData, isLoading: isPendingLoading } = useCollection(pendingQuery);
  const { data: activeData, isLoading: isActiveLoading } = useCollection(activeQuery);
  const { data: completedData, isLoading: isCompletedLoading } = useCollection(completedQuery);

  const allRequests = useMemo(() => {
    const combined = [
      ...(pendingData || []).map(r => ({ ...r, status: 'Pending' })),
      ...(activeData || []).map(r => ({ ...r, status: 'Active' })),
      ...(completedData || []).map(r => ({ ...r, status: 'Completed' }))
    ];
    
    return combined.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [pendingData, activeData, completedData]);

  const filteredRequests = useMemo(() => {
    return allRequests.filter(req => {
      const matchesSearch = 
        req.taskType?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        req.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [allRequests, searchTerm, statusFilter]);

  const handleDelete = (request: any) => {
    let collName = 'assistance_requests_pending';
    if (request.status === 'Active' || request.status === 'Accepted') collName = 'assistance_requests_active';
    if (request.status === 'Completed') collName = 'assistance_requests_completed';
    
    const docRef = doc(db, collName, request.id);
    
    deleteDoc(docRef)
      .then(() => {
        toast({
          title: "Request Deleted",
          description: "The assistance request has been permanently removed.",
        });
        if (selectedRequest?.id === request.id) {
          setSelectedRequest(null);
        }
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <Badge className="bg-yellow-500 text-white rounded-full px-3">Pending</Badge>;
      case 'Active':
      case 'Accepted': return <Badge className="bg-sky-500 text-white rounded-full px-3">Active</Badge>;
      case 'Completed': return <Badge className="bg-emerald-500 text-white rounded-full px-3">Completed</Badge>;
      default: return <Badge variant="outline" className="rounded-full px-3">{status}</Badge>;
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 px-1">
        <Link 
          href="/dashboard/admin?role=admin" 
          className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-primary" />
        </Link>
        <h1 className="text-2xl font-headline font-bold text-primary">System Requests</h1>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by ID, type, or desc..." 
            className="pl-10 h-12 rounded-2xl bg-white border-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide px-1">
          {['All', 'Pending', 'Active', 'Completed'].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-4 h-8 text-[10px] font-bold uppercase shrink-0 transition-all ${
                statusFilter === s ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-muted-foreground border-slate-200'
              }`}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="space-y-3 px-1">
          {(isPendingLoading || isActiveLoading || isCompletedLoading) && allRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 opacity-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-[10px] font-bold uppercase">Fetching requests...</p>
            </div>
          ) : filteredRequests.map((req) => (
            <Card 
              key={req.id} 
              className="border-none shadow-sm rounded-2xl p-4 overflow-hidden relative hover:bg-slate-50 transition-colors cursor-pointer group"
              onClick={() => setSelectedRequest(req)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 text-primary group-hover:bg-white transition-colors">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-primary">{req.taskType}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">ID: {req.id.slice(0, 8)}</div>
                  </div>
                </div>
                {getStatusBadge(req.status)}
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed italic">
                "{req.description}"
              </p>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg group-hover:bg-white"><MapPin className="h-3 w-3" /> {req.location?.slice(0, 15)}</span>
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg group-hover:bg-white"><User className="h-3 w-3" /> {req.createdByUserId?.slice(0, 5)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl max-w-[90vw] mx-auto">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Request?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This request will be permanently removed from the system.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex flex-col gap-2">
                        <AlertDialogAction 
                          onClick={() => handleDelete(req)}
                          className="bg-destructive hover:bg-destructive/90 h-12 rounded-xl font-bold"
                        >
                          Yes, Delete Permanently
                        </AlertDialogAction>
                        <AlertDialogCancel className="h-12 rounded-xl font-bold border-none bg-slate-100">
                          Cancel
                        </AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Card>
          ))}
          
          {filteredRequests.length === 0 && !isPendingLoading && !isActiveLoading && !isCompletedLoading && (
            <div className="text-center py-20 opacity-30 italic text-sm">
              No requests found matching your filters.
            </div>
          )}
        </div>
      </ScrollArea>

      <Sheet open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <SheetContent side="bottom" className="rounded-t-[3rem] h-[85vh] px-6 py-8">
          {selectedRequest && (
            <div className="space-y-6 h-full overflow-y-auto pb-10">
              <SheetHeader className="text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-4 rounded-2xl bg-primary/5 text-primary w-fit">
                    <Clock className="h-8 w-8" />
                  </div>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <SheetTitle className="text-2xl font-bold text-primary">{selectedRequest.taskType} Request</SheetTitle>
                <SheetDescription className="text-base leading-relaxed text-slate-600 italic">
                  "{selectedRequest.description}"
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Location</p>
                      <p className="text-sm text-primary font-medium">{selectedRequest.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Urgency</p>
                      <p className="text-sm text-primary font-medium">{selectedRequest.urgencyLevel}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Created On</p>
                    <p className="text-sm text-primary font-medium">
                      {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Requester ID</p>
                    <p className="text-sm font-mono text-primary font-medium">{selectedRequest.createdByUserId}</p>
                  </div>
                </div>

                {selectedRequest.volunteerName && (
                  <div className="flex items-start gap-3 pt-2">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Assigned Volunteer</p>
                      <p className="text-sm text-primary font-medium">{selectedRequest.volunteerName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{selectedRequest.assignedVolunteerId}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full h-14 rounded-2xl font-bold gap-2"
                    >
                      <Trash2 className="h-5 w-5" />
                      Remove Request From System
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl max-w-[90vw] mx-auto">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the assistance request from the database. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col gap-2">
                      <AlertDialogAction 
                        onClick={() => handleDelete(selectedRequest)}
                        className="bg-destructive hover:bg-destructive/90 h-12 rounded-xl font-bold"
                      >
                        Yes, Delete Request
                      </AlertDialogAction>
                      <AlertDialogCancel className="h-12 rounded-xl font-bold border-none bg-slate-100">
                        Keep Request
                      </AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function AdminRequestsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <AdminRequestsContent />
    </Suspense>
  );
}
