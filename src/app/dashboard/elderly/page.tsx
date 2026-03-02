"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Clock, CheckCircle2, ShoppingCart, Truck, Wrench, Info, Sparkles, Loader2 } from 'lucide-react';
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
    { id: 1, type: 'Grocery', status: 'Pending', date: 'Oct 24, 2024', desc: 'Need help buying milk and bread from the nearby mart.' },
    { id: 2, type: 'Transport', status: 'Accepted', date: 'Oct 23, 2024', desc: 'Need a ride to the clinic for my checkup at 10 AM.' },
    { id: 3, type: 'Tech Support', status: 'Completed', date: 'Oct 21, 2024', desc: 'Having trouble setting up my new phone.' },
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
      case 'Pending': return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'Accepted': return <Badge className="bg-sky-500 text-white">Accepted</Badge>;
      case 'Completed': return <Badge className="bg-emerald-500 text-white">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary mb-2">Hello, welcome back!</h1>
          <p className="text-muted-foreground text-lg">How can our student volunteers assist you today?</p>
        </div>
        <Button 
          size="lg" 
          onClick={() => setShowForm(!showForm)} 
          className="bg-accent hover:bg-accent/90 text-white font-bold h-14 px-8 text-lg rounded-full shadow-lg"
        >
          <PlusCircle className="mr-2 h-6 w-6" />
          New Request
        </Button>
      </div>

      {showForm && (
        <Card className="border-none shadow-2xl overflow-hidden bg-white animate-in slide-in-from-top duration-500">
          <CardHeader className="bg-primary text-white pb-8">
            <CardTitle className="text-2xl font-headline font-bold flex items-center gap-2">
              <PlusCircle className="h-7 w-7" />
              Request Assistance
            </CardTitle>
            <CardDescription className="text-white/80 text-lg">
              Fill in the details so we can find the right volunteer for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label htmlFor="taskType" className="text-lg font-semibold">What do you need help with?</Label>
                <Select onValueChange={(val) => setFormData({...formData, type: val})}>
                  <SelectTrigger id="taskType" className="h-14 text-lg">
                    <SelectValue placeholder="Choose task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grocery">Grocery Shopping</SelectItem>
                    <SelectItem value="Transport">Transportation</SelectItem>
                    <SelectItem value="Tech Support">Tech Support</SelectItem>
                    <SelectItem value="Other">Other Assistance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label htmlFor="urgency" className="text-lg font-semibold">Urgency Level</Label>
                <Select defaultValue="Low" onValueChange={(val) => setFormData({...formData, urgency: val})}>
                  <SelectTrigger id="urgency" className="h-14 text-lg">
                    <SelectValue placeholder="Urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low (Can wait)</SelectItem>
                    <SelectItem value="Medium">Medium (Soon)</SelectItem>
                    <SelectItem value="High">High (Immediate)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="desc" className="text-lg font-semibold">Description</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-accent border-accent hover:bg-accent/10 gap-2 font-bold"
                    onClick={handleAiHelp}
                    disabled={isAiLoading || !formData.type || !formData.initialDesc}
                  >
                    {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Help me write this
                  </Button>
                </div>
                <Textarea 
                  id="desc" 
                  placeholder="Tell us more about what you need..." 
                  className="min-h-[150px] text-lg resize-none"
                  value={formData.initialDesc}
                  onChange={(e) => setFormData({...formData, initialDesc: e.target.value})}
                />
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Tip: Briefly type what you need and click "Help me write this" to let our AI refine it for you.
                </p>
              </div>

              <div className="space-y-4 md:col-span-2">
                <Label htmlFor="loc" className="text-lg font-semibold">Pick-up / Task Location</Label>
                <Input 
                  id="loc" 
                  placeholder="e.g. Block A Lobby or My Home Address" 
                  className="h-14 text-lg"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 p-8 flex flex-col sm:flex-row gap-4 border-t">
            <Button size="lg" className="w-full sm:w-auto px-12 h-14 text-xl bg-primary hover:bg-primary/90 font-bold">
              Submit Request
            </Button>
            <Button variant="ghost" size="lg" onClick={() => setShowForm(false)} className="w-full sm:w-auto h-14 text-lg">
              Cancel
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
          <Clock className="h-6 w-6 text-accent" />
          Your Recent Requests
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recentRequests.map((req) => (
            <Card key={req.id} className="hover:shadow-md transition-shadow bg-white border-none shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    {getTypeIcon(req.type)}
                  </div>
                  {getStatusBadge(req.status)}
                </div>
                <CardTitle className="text-xl font-bold text-primary">{req.type}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {req.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2">{req.desc}</p>
              </CardContent>
              <CardFooter className="pt-0 flex gap-2">
                <Button variant="link" className="text-accent p-0 font-bold">View Details</Button>
                {req.status === 'Accepted' && (
                  <Button variant="ghost" size="sm" className="ml-auto text-primary font-bold">Chat with Volunteer</Button>
                )}
                {req.status === 'Completed' && (
                  <Button variant="ghost" size="sm" className="ml-auto text-accent font-bold">Rate Task</Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}