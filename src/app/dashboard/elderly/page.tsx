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
  Loader2, 
  ChevronRight, 
  X, 
  MapPin,
  Calendar,
  User,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, getDoc } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function ElderlyDashboard() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    initialDesc: '',
    fromLocation: '',
    toLocation: '',
    address: '',
    device: '',
    urgency: 'Low' as 'Low' | 'Medium' | 'High'
  });

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

  const { data: pendingData, isLoading: isPendingLoading } = useCollection(pendingQuery);
  const { data: activeData, isLoading: isActiveLoading } = useCollection(activeQuery);

  const allActiveRequests = useMemo(() => {
    const combined = [...(pendingData || []), ...(activeData || [])];
    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
    return unique.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [pendingData, activeData]);

  const isFormValid = useMemo(() => {
    if (!formData.type || !formData.initialDesc.trim()) return false;
    
    if (formData.type === 'Transportation') {
      return formData.fromLocation.trim() !== '' && formData.toLocation.trim() !== '';
    }
    
    if (formData.type === 'Groceries') {
      return formData.address.trim() !== '';
    }

    if (formData.type === 'Tech Support') {
      return formData.address.trim() !== '' && formData.device !== '';
    }
    
    return true;
  }, [formData]);

  const handleSubmit = async () => {
    if (!isFormValid || !user) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill in all required fields marked with * to continue."
      });
      return;
    }
    
    setIsSubmitting(true);
    let nameToUse = user.displayName;
    let ageToUse = "N/A";
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        nameToUse = userData.name;
        ageToUse = userData.age || "N/A";
      }
    } catch (e) {}
    
    const requestId = Math.random().toString(36).substring(7);
    let finalLocation = 'Not specified';
    let finalDescription = formData.initialDesc;
    
    if (formData.type === 'Transportation') {
      finalLocation = `From: ${formData.fromLocation} To: ${formData.toLocation}`;
    } else if (formData.type === 'Groceries' || formData.type === 'Tech Support') {
      finalLocation = formData.address;
    }
    
    if (formData.type === 'Tech Support' && formData.device) {
      finalDescription = `[Device: ${formData.device}] ${formData.initialDesc}`;
    }

    const requestData = {
      id: requestId,
      createdByUserId: user.uid,
      createdByName: nameToUse || 'Elderly',
      creatorAge: ageToUse,
      taskType: formData.type,
      description: finalDescription,
      location: finalLocation,
      urgencyLevel: formData.urgency,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    
    const docRef = doc(db, 'assistance_requests_pending', requestId);
    setDocumentNonBlocking(docRef, requestData, { merge: true });
    
    setIsSubmitting(false);
    setShowForm(false);
    toast({ title: "Request Submitted", description: "Volunteers have been notified of your request." });
    setFormData({ type: '', initialDesc: '', fromLocation: '', toLocation: '', address: '', device: '', urgency: 'Low' });
  };

  const handleCancelRequest = (request: any) => {
    const collectionName = request.status === 'Pending' ? 'assistance_requests_pending' : 'assistance_requests_active';
    const docRef = doc(db, collectionName, request.id);
    deleteDocumentNonBlocking(docRef);
    setSelectedRequest(null);
    toast({ title: "Request Cancelled", description: "Your assistance request has been removed." });
  };

  const handleCompleteRequest = (request: any) => {
    if (!user) return;
    const requestId = request.id;
    const completedData = { ...request, status: 'Completed', completedAt: new Date().toISOString() };
    const completedRef = doc(db, 'assistance_requests_completed', requestId);
    const activeRef = doc(db, 'assistance_requests_active', requestId);
    setDocumentNonBlocking(completedRef, completedData, { merge: true });
    deleteDocumentNonBlocking(activeRef);
    setSelectedRequest(null);
    toast({ title: "Task Completed", description: "Thank you! The status has been updated." });
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
      case 'Groceries': return <ShoppingCart className="h-6 w-6" />;
      case 'Transportation': return <Truck className="h-6 w-6" />;
      case 'Tech Support': return <Wrench className="h-6 w-6" />;
      default: return <Info className="h-6 w-6" />;
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
        <h1 className="text-4xl font-headline font-bold text-primary">Hi {user?.displayName?.split(' ')[0] || 'there'}!</h1>
        <p className="text-xl text-muted-foreground">What can we help you with today?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setShowForm(true)}
          className="flex flex-col items-center justify-center p-8 bg-accent/10 rounded-[2.5rem] border-2 border-accent/20 text-accent group active:scale-95 transition-all"
        >
          <PlusCircle className="h-12 w-12 mb-3 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-xl">New Request</span>
        </button>
        <Link 
          href="/dashboard/elderly/requests"
          className="flex flex-col items-center justify-center p-8 bg-primary/5 rounded-[2.5rem] border-2 border-primary/10 text-primary active:scale-95 transition-all"
        >
          <Clock className="h-12 w-12 mb-3" />
          <span className="font-bold text-xl">History</span>
        </Link>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto p-6 safe-area-bottom animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-primary">Request Help</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowForm(false)} 
              className="rounded-full h-14 w-14 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <X className="h-8 w-8 text-primary" />
            </Button>
          </div>
          <div className="space-y-6 pb-12">
            <div className="space-y-3">
              <Label className="text-base font-bold text-muted-foreground uppercase tracking-wider">
                Help Category <span className="text-destructive">*</span>
              </Label>
              <Select onValueChange={(val) => setFormData({...formData, type: val})}>
                <SelectTrigger className="h-16 rounded-[1.25rem] text-xl px-6">
                  <SelectValue placeholder="Choose Category" />
                </SelectTrigger>
                <SelectContent className="z-[110]">
                  <SelectItem value="Groceries" className="text-lg py-4">Groceries</SelectItem>
                  <SelectItem value="Transportation" className="text-lg py-4">Transportation</SelectItem>
                  <SelectItem value="Tech Support" className="text-lg py-4">Tech Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.type === 'Tech Support' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-3">
                  <Label className="text-base font-bold text-muted-foreground uppercase tracking-wider">
                    Device Type <span className="text-destructive">*</span>
                  </Label>
                  <Select onValueChange={(val) => setFormData({...formData, device: val})}>
                    <SelectTrigger className="h-16 rounded-[1.25rem] text-xl px-6">
                      <SelectValue placeholder="Select Device" />
                    </SelectTrigger>
                    <SelectContent className="z-[110]">
                      <SelectItem value="Smartphone" className="text-lg py-4">Smartphone (Handphone)</SelectItem>
                      <SelectItem value="Tablet" className="text-lg py-4">Tablet (iPad/Tab)</SelectItem>
                      <SelectItem value="Laptop" className="text-lg py-4">Laptop / Computer</SelectItem>
                      <SelectItem value="Printer" className="text-lg py-4">Printer</SelectItem>
                      <SelectItem value="Other" className="text-lg py-4">Other Device</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-bold text-muted-foreground uppercase tracking-wider">
                    Location / Address <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    placeholder="Where should the volunteer go?" 
                    className="h-16 rounded-[1.25rem] text-xl px-6" 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})} 
                  />
                </div>
              </div>
            )}
            
            {formData.type === 'Groceries' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label className="text-base font-bold text-muted-foreground uppercase tracking-wider">
                  Delivery Address <span className="text-destructive">*</span>
                </Label>
                <Input 
                  placeholder="e.g. Block A, Room 102" 
                  className="h-16 rounded-[1.25rem] text-xl px-6" 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})} 
                />
              </div>
            )}
            
            {formData.type === 'Transportation' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-3">
                  <Label className="text-base font-bold text-muted-foreground uppercase tracking-wider">
                    From (Pick-up) <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    placeholder="e.g. My Home / Block A" 
                    className="h-16 rounded-[1.25rem] text-xl px-6" 
                    value={formData.fromLocation} 
                    onChange={(e) => setFormData({...formData, fromLocation: e.target.value})} 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-bold text-muted-foreground uppercase tracking-wider">
                    To (Destination) <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    placeholder="e.g. General Hospital / Market" 
                    className="h-16 rounded-[1.25rem] text-xl px-6" 
                    value={formData.toLocation} 
                    onChange={(e) => setFormData({...formData, toLocation: e.target.value})} 
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Label className="text-base font-bold text-muted-foreground uppercase tracking-wider">Urgency Level</Label>
              <Select value={formData.urgency} onValueChange={(val) => setFormData({...formData, urgency: val as 'Low' | 'Medium' | 'High'})}>
                <SelectTrigger className="h-16 rounded-[1.25rem] text-xl px-6">
                  <SelectValue placeholder="Select Urgency" />
                </SelectTrigger>
                <SelectContent className="z-[110]">
                  <SelectItem value="Low" className="text-lg py-4">Low - Not Urgent</SelectItem>
                  <SelectItem value="Medium" className="text-lg py-4">Medium - Needed Soon</SelectItem>
                  <SelectItem value="High" className="text-lg py-4 text-destructive font-bold">High - Urgent / Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label className="text-base font-bold text-muted-foreground uppercase tracking-wider">
                Details <span className="text-destructive">*</span>
              </Label>
              <Textarea 
                placeholder="What specifically do you need help with?" 
                className="min-h-[160px] rounded-[1.25rem] text-xl p-6" 
                value={formData.initialDesc} 
                onChange={(e) => setFormData({...formData, initialDesc: e.target.value})} 
              />
            </div>
            
            <div className="pt-6">
              <Button 
                size="lg" 
                className="w-full h-20 text-2xl rounded-[1.5rem] bg-primary font-bold shadow-2xl" 
                onClick={handleSubmit} 
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (<><Loader2 className="mr-3 h-8 w-8 animate-spin" />Submitting...</>) : 'Submit Request'}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4 font-bold italic">
                All fields marked with (*) are required for a successful request.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <h2 className="text-2xl font-bold text-primary">Active Status</h2>
        <div className="space-y-4">
          {(isPendingLoading || isActiveLoading) ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-40">
              <Loader2 className="h-10 w-10 animate-spin" />
              <p className="text-base font-bold uppercase tracking-widest">Loading requests...</p>
            </div>
          ) : allActiveRequests.map((req) => (
            <Card key={req.id} className="border-none shadow-md rounded-[2rem] overflow-hidden active:bg-slate-50 transition-all cursor-pointer hover:shadow-lg" onClick={() => setSelectedRequest(req)}>
              <CardContent className="p-6 flex items-center gap-5">
                <div className="p-4 rounded-[1.25rem] bg-accent/10 text-accent">{getTypeIcon(req.taskType)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xl text-primary truncate">{req.taskType}</span>
                    <span className="text-xs text-muted-foreground font-bold uppercase">{formatDate(req.createdAt)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mb-3">{req.description}</p>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(req.status)}
                    {req.urgencyLevel === 'High' && <Badge variant="destructive" className="text-[10px] h-6 px-2 font-bold uppercase">Urgent</Badge>}
                  </div>
                </div>
                <ChevronRight className="h-8 w-8 text-muted-foreground/20" />
              </CardContent>
            </Card>
          ))}
          {(!isPendingLoading && !isActiveLoading) && allActiveRequests.length === 0 && (
            <div className="text-center py-16 opacity-40 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <p className="text-xl font-bold text-primary mb-1">No active requests</p>
              <p className="text-xs font-bold uppercase tracking-widest">Tap "New Request" to get help</p>
            </div>
          )}
        </div>
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
                  <SheetTitle className="text-3xl font-bold text-primary mb-2">{selectedRequest.taskType} Help</SheetTitle>
                  <SheetDescription className="text-xl leading-relaxed text-slate-700 italic font-medium">
                    "{selectedRequest.description}"
                  </SheetDescription>
                </div>
              </SheetHeader>
              <div className="space-y-6 pt-6 border-t">
                <div className="flex items-start gap-5">
                  <div className="p-3 rounded-xl bg-slate-100 text-slate-500"><MapPin className="h-6 w-6" /></div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase font-black tracking-widest">Location Details</Label>
                    <p className="text-xl text-primary font-bold mt-1">{selectedRequest.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="p-3 rounded-xl bg-slate-100 text-slate-500"><Clock className="h-6 w-6" /></div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase font-black tracking-widest">Urgency</Label>
                    <p className={`text-xl font-black mt-1 ${selectedRequest.urgencyLevel === 'High' ? 'text-destructive' : 'text-primary'}`}>{selectedRequest.urgencyLevel}</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="p-3 rounded-xl bg-slate-100 text-slate-500"><Calendar className="h-6 w-6" /></div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase font-black tracking-widest">Requested On</Label>
                    <p className="text-xl text-primary font-bold mt-1">{selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleDateString() : 'Recent'}</p>
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
              <div className="flex flex-col gap-4 mt-10">
                {selectedRequest.status === 'Accepted' && (
                  <div className="flex flex-col gap-4">
                    <Button asChild className="w-full h-18 rounded-[1.5rem] bg-accent hover:bg-accent/90 font-bold text-xl shadow-xl shadow-accent/20">
                      <Link href={`/dashboard/chat/room?requestId=${selectedRequest.chatRoomId || selectedRequest.id}&role=elderly`}>
                        Chat with Volunteer
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="w-full h-18 rounded-[1.5rem] bg-emerald-500 hover:bg-emerald-600 font-bold text-xl gap-3 shadow-xl shadow-emerald-500/20">
                          <CheckCircle2 className="h-7 w-7" />
                          Mark as Completed
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[2.5rem] max-w-[90vw] mx-auto p-8">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-2xl font-bold">Is this task finished?</AlertDialogTitle>
                          <AlertDialogDescription className="text-lg">Confirming this will let the volunteer and admin know the task is successfully completed.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex flex-col gap-3 mt-6">
                          <AlertDialogAction onClick={() => handleCompleteRequest(selectedRequest)} className="bg-emerald-500 hover:bg-emerald-600 h-16 rounded-2xl font-bold text-lg">Yes, Mark Completed</AlertDialogAction>
                          <AlertDialogCancel className="h-16 rounded-2xl font-bold border-none bg-slate-100 text-lg">Not Yet</AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
                {selectedRequest.status === 'Pending' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full h-18 rounded-[1.5rem] text-destructive hover:bg-destructive/10 border-destructive/20 font-bold text-xl gap-3">
                        <Trash2 className="h-7 w-7" />
                        Cancel Request
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[2.5rem] max-w-[90vw] mx-auto p-8">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-lg">This will remove your request from the system permanently.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex flex-col gap-3 mt-6">
                        <AlertDialogAction onClick={() => handleCancelRequest(selectedRequest)} className="bg-destructive hover:bg-destructive/90 h-16 rounded-2xl font-bold text-lg">Yes, Cancel Request</AlertDialogAction>
                        <AlertDialogCancel className="h-16 rounded-2xl font-bold border-none bg-slate-100 text-lg">Keep Request</AlertDialogCancel>
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
