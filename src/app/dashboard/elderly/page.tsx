"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Clock, ShoppingCart, Truck, Wrench, Info, Sparkles, Loader2, ChevronRight } from 'lucide-react';
import { generateTaskDescription } from '@/ai/flows/generate-task-description-flow';

export default function ElderlyDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    initialDesc: '',
    location: '',
    urgency: 'Low'
  });

  const recentRequests = [
    { id: 1, type: 'Grocery', status: 'Pending', date: 'Oct 24', desc: 'Need help buying milk and bread.' },
    { id: 2, type: 'Transport', status: 'Accepted', date: 'Oct 23', desc: 'Ride to the clinic for checkup.' },
    { id: 3, type: 'Tech Support', status: 'Completed', date: 'Oct 21', desc: 'Setting up my new phone.' },
  ];

  const handleAiHelp = async () => {
    if (!formData.type || !formData.initialDesc) return;
    setIsAiLoading(true);
    try {
      const result = await generateTaskDescription({
        taskType: formData.type as any,
        initialDescription: formData.initialDesc,
        location: formData.location,
        urgencyLevel: formData.urgency as any
      });
      setFormData({ ...formData, initialDesc: result.generatedDescription });
    } catch (error) {
      console.error("AI failed", error);
    } finally {
      setIsAiLoading(false);
    }
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
      case 'Grocery': return <ShoppingCart className="h-5 w-5" />;
      case 'Transport': return <Truck className="h-5 w-5" />;
      case 'Tech Support': return <Wrench className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

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
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="rounded-full">Close</Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Help Category</Label>
              <Select onValueChange={(val) => setFormData({...formData, type: val})}>
                <SelectTrigger className="h-14 rounded-2xl text-lg">
                  <SelectValue placeholder="What do you need?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grocery">Grocery Shopping</SelectItem>
                  <SelectItem value="Transport">Transportation</SelectItem>
                  <SelectItem value="Tech Support">Tech Support</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Details</Label>
                <Button variant="link" size="sm" onClick={handleAiHelp} disabled={isAiLoading || !formData.type} className="text-accent font-bold gap-1 p-0">
                  {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  AI Refine
                </Button>
              </div>
              <Textarea 
                placeholder="Briefly describe what you need..." 
                className="min-h-[120px] rounded-2xl text-lg p-4"
                value={formData.initialDesc}
                onChange={(e) => setFormData({...formData, initialDesc: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Location</Label>
              <Input 
                placeholder="Where should we meet?" 
                className="h-14 rounded-2xl text-lg"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>

            <div className="pt-4">
              <Button 
                size="lg" 
                className="w-full h-16 text-xl rounded-2xl bg-primary font-bold shadow-xl"
                onClick={() => setShowForm(false)}
              >
                Submit Request
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">Your Requests</h2>
          <Button asChild variant="link" className="text-accent p-0 font-bold">
            <Link href="/dashboard/elderly/requests">View All</Link>
          </Button>
        </div>
        
        <div className="space-y-3">
          {recentRequests.map((req) => (
            <Card key={req.id} className="border-none shadow-sm rounded-3xl overflow-hidden active:bg-slate-50 transition-colors">
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
        </div>
      </div>
    </div>
  );
}
