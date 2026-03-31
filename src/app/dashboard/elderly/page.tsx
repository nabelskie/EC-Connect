"use client";

import { useState, useEffect } from 'react';
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
  Trash2
} from 'lucide-react';
import { generateTaskDescription } from '@/ai/flows/generate-task-description-flow';
import { useToast } from '@/hooks/use-toast';

export default function ElderlyDashboard() {
  const { toast } = useToast();
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

  const [requests, setRequests] = useState([
    { id: 1, type: 'Groceries', status: 'Pending', date: 'Oct 24', desc: 'Need help buying milk and bread.', location: 'Block C, Room 102', urgency: 'Medium' },
    { id: 2, type: 'Transportation', status: 'Accepted', date: 'Oct 23', desc: 'Ride to the clinic for checkup.', location: 'Lobby Block A', urgency: 'High', volunteer: 'Sarah (Student)' },
    { id: 3, type: 'Tech Support', status: 'Completed', date: 'Oct 21', desc: 'Setting up my new phone.', location: 'Block C, Room 102', urgency: 'Low', volunteer: 'Jason (Student)' },
    { id: 4, type: 'Groceries', status: 'Completed', date: 'Oct 15', desc: 'Buying fruits from market.', location: 'Block C, Room 102', urgency: 'Low', volunteer: 'Sarah (Student)' },
  ]);

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
      console.error("AI failed", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.type || !formData.initialDesc) return;
    
    setIsSubmitting(true);
    
    // Simulate server processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newRequest = {
      id: Date.now(),
      type: formData.type,
      status: 'Pending',
      date: 'Just Now',
      desc: formData.initialDesc,
      location: formData.location || 'Not specified',
      urgency: formData.urgency
    };

    setRequests([newRequest, ...requests]);
    setIsSubmitting(false);
    setShowForm(false);
    
    toast({
      title: "Request Submitted Successfully",
      description: "Volunteers have been notified of your request.",
    });

    // Reset form
    setFormData({
      type: '',
      initialDesc: '',
      location: '',
      urgency: 'Low'
    });
  };

  const handleCancelRequest = (id: number) => {
    setRequests(requests.filter(req => req.id !== id));
    setSelectedRequest(null);
    toast({
      title: "Request Cancelled",
      description: "Your assistance request has been removed.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <Badge className="bg-yellow-500 text-white rounded-full px-3">Pending</Badge>;
      case 'Accepted': return <Badge className="bg-sky-500 text-white rounded-full px-3">Accepted</Badge>;
      case 'Completed': return <Badge className="bg-emerald-500 text-white rounded-full px-3">Completed</Badge>;
      case 'Rejected': return <Badge className="bg-destructive text-white rounded-full px-3">Rejected</Badge>;
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
        <h1 className="text-3xl font-headline font-bold text-primary">Hi Hapsah!</h1>
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
          {requests.slice(0, 3).map((req) => (
            <Card 
              key={req.id} 
              className="border-none shadow-sm rounded-3xl overflow-hidden active:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => setSelectedRequest(req)}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-accent/10 text-accent">
                  {getTypeIcon(req.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-primary truncate">{req.type}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">{req.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-2">{req.desc}</p>
                  {getStatusBadge(req.status)}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
              </CardContent>
            </Card>
          ))}
          
          {requests.length > 3 && (
            <p className="text-center text-xs text-muted-foreground font-medium pt-2">
              Tap the History button to view all {requests.length} requests.
            </p>
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
                    {getTypeIcon(selectedRequest.type)}
                  </div>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <SheetTitle className="text-2xl font-bold text-primary">{selectedRequest.type} Help</SheetTitle>
                <SheetDescription className="text-base leading-relaxed text-slate-600 italic">
                  "{selectedRequest.desc}"
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
                    <p className="text-primary font-medium">{selectedRequest.date}</p>
                  </div>
                </div>

                {selectedRequest.volunteer && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-500">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase font-bold">Volunteer Assigned</Label>
                      <p className="text-primary font-medium">{selectedRequest.volunteer}</p>
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
                      <p className="text-xs text-muted-foreground">{selectedRequest.date}</p>
                    </div>
                  </div>
                  
                  {selectedRequest.status === 'Rejected' ? (
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="h-5 w-5 rounded-full bg-destructive border-4 border-white shadow-sm mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-destructive">Request Rejected</p>
                        <p className="text-xs text-muted-foreground">No volunteer available or request declined.</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className={`h-5 w-5 rounded-full border-4 border-white shadow-sm mt-0.5 ${
                          selectedRequest.status === 'Accepted' || selectedRequest.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-200'
                        }`} />
                        <div>
                          <p className={`text-sm font-bold ${
                            selectedRequest.status === 'Accepted' || selectedRequest.status === 'Completed' ? 'text-primary' : 'text-muted-foreground'
                          }`}>Volunteer Accepted</p>
                          {selectedRequest.volunteer && <p className="text-xs text-muted-foreground">Assigned to {selectedRequest.volunteer}</p>}
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
                          {selectedRequest.status === 'Completed' && <p className="text-xs text-muted-foreground">Successfully closed</p>}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                {selectedRequest.status === 'Accepted' && (
                  <Button asChild className="w-full h-14 rounded-2xl bg-accent hover:bg-accent/90">
                    <Link href={`/dashboard/chat/${selectedRequest.id}?role=elderly`}>
                      Chat with Volunteer
                    </Link>
                  </Button>
                )}
                
                {selectedRequest.status !== 'Completed' && selectedRequest.status !== 'Rejected' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full h-14 rounded-2xl text-destructive hover:bg-destructive/10 border-destructive/20 font-bold gap-2">
                        <Trash2 className="h-5 w-5" />
                        Cancel Request
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl max-w-[90vw] mx-auto">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove your help request. You will need to create a new one if you still need assistance.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex flex-col gap-2">
                        <AlertDialogAction 
                          onClick={() => handleCancelRequest(selectedRequest.id)}
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
