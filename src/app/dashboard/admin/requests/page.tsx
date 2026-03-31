
"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  Clock, 
  Loader2,
  MapPin,
  User,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

function AdminRequestsContent() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleDelete = async (request: any) => {
    try {
      let collName = 'assistance_requests_pending';
      if (request.status === 'Active' || request.status === 'Accepted') collName = 'assistance_requests_active';
      if (request.status === 'Completed') collName = 'assistance_requests_completed';
      
      await deleteDoc(doc(db, collName, request.id));
      toast({
        title: "Request Deleted",
        description: "The assistance request has been permanently removed.",
      });
    } catch (e) {
      console.error("Delete failed", e);
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
              className={`rounded-full px-4 h-8 text-[10px] font-bold uppercase shrink-0 ${
                statusFilter === s ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-slate-200'
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
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRequests.map((req) => (
            <Card key={req.id} className="border-none shadow-sm rounded-2xl p-4 overflow-hidden relative active:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-primary">{req.taskType}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">ID: {req.id.slice(0, 8)}</div>
                  </div>
                </div>
                <Badge className={`text-[8px] h-5 px-2 ${
                  req.status === 'Completed' ? 'bg-emerald-500' : 
                  req.status === 'Active' || req.status === 'Accepted' ? 'bg-sky-500' : 'bg-yellow-500'
                }`}>
                  {req.status}
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed italic">
                "{req.description}"
              </p>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg"><MapPin className="h-3 w-3" /> {req.location?.slice(0, 15)}</span>
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg"><User className="h-3 w-3" /> {req.createdByUserId?.slice(0, 5)}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full"
                  onClick={() => handleDelete(req)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
          
          {filteredRequests.length === 0 && !isPendingLoading && (
            <div className="text-center py-20 opacity-30 italic text-sm">
              No requests matching your filters.
            </div>
          )}
        </div>
      </ScrollArea>
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
