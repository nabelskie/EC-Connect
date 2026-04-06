
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
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
  PlusCircle, 
  Clock, 
  ShoppingCart, 
  Truck, 
  Wrench, 
  Info, 
  Sparkles, 
  Loader2, 
  ChevronRight, 
  X, 
  MapPin,
  Calendar,
  User,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { generateTaskDescription } from '@/ai/flows/generate-task-description-flow';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function ElderlyDashboard() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    initialDesc: '',
    location: '',
    urgency: 'Low' as 'Low' | 'Medium' | 'High'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time data fetching for user's requests
  const pendingQuery = useMemoFirebase(() => {
    if (!user || !mounted) return null;
    return query(collection(db, 'assistance_requests_pending'), where('createdByUserId', '==', user.uid));
  }, [db, user, mounted]);

  const activeQuery = useMemoFirebase(() => {
    if (!user || !mounted) return null;
    return query(collection(db, 'assistance_requests_active'), where('createdByUserId', '==', user.uid));
  }, [db, user, mounted]);

  const { data: pendingData, isLoading: isPendingLoading } = useCollection(pendingQuery);
  const { data: activeData, isLoading: isActiveLoading } = useCollection(activeQuery);

  const allActiveRequests = useMemo(() => {
    const combined = [...(pendingData || []), ...(activeData || [])];
    return combined.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [pendingData, activeData]);

  const handleAiHelp = async () => {
    if (!formData.type || !formData.initialDesc) return;
    setIsAiLoading(true);
    try {
      const result = await generateTaskDescription({
        taskType: formData.type as 'Groceries' | 'Transportation' | 'Tech Support',
        initialDescription: formData.initialDesc,
        location: formData.location,
        urgencyLevel: formData.urgency
      });
      setFormData({ ...formData, initialDesc: result.generatedDescription });
    } catch (error) {
      // AI errors handled by Genkit flow
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.type || !formData.initialDesc || !user) return;
    
    setIsSubmitting(true);
    const requestId = Math.random().toString(36).substring(7);
    const requestData = {
      id: requestId,
      createdByUserId: user.uid,
      taskType: formData.type,
      description: formData.initialDesc,
      location: formData.location || 'Not specified',
      urgencyLevel: formData.urgency,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const docRef = doc(db, 'assistance_requests_pending', requestId);
    setDocumentNonBlocking(docRef, requestData, { merge: true });

    // Assume success locally for a smooth UI
    setIsSubmitting(false);
    setShowForm(false);
    
    toast({
      title: "Request Submitted",
      description: "Volunteers have been notified of your request.",
    });

    setFormData({
      type: '',
      initialDesc: '',
      location: '',
      urgency: 'Low'
    });
  };

  const handleCancelRequest = (request: any) => {
    const collectionName = request.status === 'Pending' ? 'assistance_requests_pending' : 'assistance_requests_active';
    const docRef = doc(db, collectionName, request.id);
    deleteDocumentNonBlocking(docRef);
    setSelectedRequest(null);
    toast({
      title: "Request Cancelled",
      description: "Your assistance request has been removed.",
    });
  };

  const handleCompleteRequest = (request: any) => {
    if (!user) return;
    const requestId = request.id;
    const completedData = {
      ...request,
      status: 'Completed',
      completedAt: new Date().toISOString()
    };

    const completedRef = doc(db, 'assistance_requests_completed', requestId);
    const activeRef = doc(db, 'assistance_requests_active', requestId);

    setDocumentNonBlocking(completedRef, completedData, { merge: true });
    deleteDocumentNonBlocking(activeRef);
    
    setSelectedRequest(null);
    toast({
      title: "Task Completed",
      description: "Thank you! The status has been updated.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <Badge className="bg-yellow-500 text-white rounded-full px-3">Pending</Badge>;
      case 'Accepted': return <Badge className="bg-sky-500 text-white rounded-full px-3">Accepted</Badge>;
      case 'Completed': return <Badge className="bg-emerald-500 text-white rounded-full px-3">Completed</Badge>;
      default: return <Badge variant="outline" className="rounded-full">{status}</Badge>;
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
      const date = new Date(dateStr);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-screen-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-bold text-primary">Hi {user?.displayName?.split(' ')[0] || 'there'}!</h1>
        <p className="text-muted-foreground">What can we help you with today?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setShowForm(true)}
          className="flex flex-col items-center justify-center p-6 bg-accent/10 rounded-3xl border-2 border-accent/20 text-accent group active:scale-95 transition-all"
        >
          <PlusCircle className="h-10 w-10 mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-bold">New Request</span>
        </button>
        <Link 
          href="/dashboard/elderly/requests"
          className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-3xl border-2 border-primary/10 text-primary active:scale-95 transition-all"
        >
          <Clock className="h-10 w-10 mb-2" />
          <span className="font-bold">History</span>
        </Link>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto p-6 safe-area-bottom animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-primary">Request Help</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="rounded-full h-10 w-10 bg-slate-100">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Help Category</Label>
              <Select onValueChange={(val) => setFormData({...formData, type: val})}>
                <SelectTrigger className="h-14 rounded-2xl text-lg">
                  <SelectValue placeholder="Choose Category" />
                </SelectTrigger>
                <SelectContent className="z-[110]">
                  <SelectItem value="Groceries">Groceries</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Tech Support">Tech Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Details</Label>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={handleAiHelp} 
                  disabled={isAiLoading || !formData.type || !formData.initialDesc} 
                  className="text-accent font-bold gap-1 p-0"
                >
                  {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  AI Refine
                </Button>
              </div>
              <Textarea 
                placeholder="What specifically do you need help with?" 
                className="min-h-[120px] rounded-2xl text-lg p-4"
                value={formData.initialDesc}
                onChange={(e) => setFormData({...formData, initialDesc: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Location / Meeting Point</Label>
              <Input 
                placeholder="e.g. Block C, Lobby" 
                className="h-14 rounded-2xl text-lg"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>

            <div className="pt-4">
              <Button 
                size="lg" 
                className="w-full h-16 text-xl rounded-2xl bg-primary font-bold shadow-xl"
                onClick={handleSubmit}
                disabled={!formData.type || !formData.initialDesc || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-primary">Active Status</h2>
        
        <div className="space-y-3">
          {(isPendingLoading || isActiveLoading) ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-40">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-xs font-bold uppercase">Loading requests...</p>
            </div>
          ) : allActiveRequests.map((req) => (
            <Card 
              key={req.id} 
              className="border-none shadow-sm rounded-3xl overflow-hidden active:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => setSelectedRequest(req)}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-accent/10 text-accent">
                  {getTypeIcon(req.taskType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-primary truncate">{req.taskType}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">{formatDate(req.createdAt)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-2">{req.description}</p>
                  {getStatusBadge(req.status)}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
              </CardContent>
            </Card>
          ))}
          
          {(!isPendingLoading && !isActiveLoading) && allActiveRequests.length === 0 && (
            <div className="text-center py-10 opacity-40 bg-white rounded-3xl border-2 border-dashed">
              <p className="text-sm font-bold">No active requests</p>
              <p className="text-[10px] uppercase tracking-wider">Tap "New Request" to get help</p>
            </div>
          )}
        </div>
      </div>

      <Sheet open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <SheetContent side="bottom" className="rounded-t-[3rem] h-[85vh] px-6 py-8">
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
                    <p className="text-primary font-medium">{selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleDateString() : 'Recent'}</p>
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

              <div className="flex flex-col gap-3 mt-8">
                {selectedRequest.status === 'Accepted' && (
                  <div className="flex flex-col gap-3">
                    <Button asChild className="w-full h-14 rounded-2xl bg-accent hover:bg-accent/90 font-bold">
                      <Link href={`/dashboard/chat/${selectedRequest.chatRoomId || selectedRequest.id}?role=elderly`}>
                        Chat with Volunteer
                      </Link>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-bold gap-2">
                          <CheckCircle2 className="h-5 w-5" />
                          Mark as Completed
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-3xl max-w-[90vw] mx-auto">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Is this task finished?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Confirming this will let the volunteer and admin know the task is successfully completed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex flex-col gap-2">
                          <AlertDialogAction 
                            onClick={() => handleCompleteRequest(selectedRequest)}
                            className="bg-emerald-500 hover:bg-emerald-600 h-12 rounded-xl font-bold"
                          >
                            Yes, Mark Completed
                          </AlertDialogAction>
                          <AlertDialogCancel className="h-12 rounded-xl font-bold border-none bg-slate-100">
                            Not Yet
                          </AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
                
                {selectedRequest.status === 'Pending' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full h-14 rounded-2xl text-destructive hover:bg-destructive/10 border-destructive/20 font-bold gap-2">
                        <Trash2 className="h-5 w-5" />
                        Cancel Request
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl max-w-[90vw] mx-auto">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove your request from the system permanently.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex flex-col gap-2">
                        <AlertDialogAction 
                          onClick={() => handleCancelRequest(selectedRequest)}
                          className="bg-destructive hover:bg-destructive/90 h-12 rounded-xl font-bold"
                        >
                          Yes, Cancel Request
                        </AlertDialogAction>
                        <AlertDialogCancel className="h-12 rounded-xl font-bold border-none bg-slate-100">
                          Keep Request
                        </AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
