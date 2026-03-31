"use client";

import { useState, useMemo } from 'react';
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
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function RequestsHistoryPage() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const allRequests = [
    { id: 1, type: 'Groceries', status: 'Pending', date: 'Oct 24, 2024', desc: 'Need help buying milk and bread from the local market.', location: 'Block C, Room 102', urgency: 'Medium' },
    { id: 2, type: 'Transportation', status: 'Accepted', date: 'Oct 23, 2024', desc: 'Ride to the clinic for monthly health checkup.', location: 'Lobby Block A', urgency: 'High', volunteer: 'Sarah (Student)' },
    { id: 3, type: 'Tech Support', status: 'Completed', date: 'Oct 21, 2024', desc: 'Setting up my new phone and installing WhatsApp.', location: 'Block C, Room 102', urgency: 'Low', volunteer: 'Jason (Student)' },
    { id: 4, type: 'Groceries', status: 'Completed', date: 'Oct 10, 2024', desc: 'Weekly grocery run for vegetables and fruits.', location: 'Local Market', urgency: 'Low', volunteer: 'Ahmad (Student)' },
    { id: 5, type: 'Transportation', status: 'Rejected', date: 'Oct 05, 2024', desc: 'Urgent ride to the hospital, but no student was available at the time.', location: 'Block B', urgency: 'High' },
  ];

  const filteredRequests = useMemo(() => {
    if (activeFilter === 'All') return allRequests;
    return allRequests.filter(req => req.status === activeFilter);
  }, [activeFilter, allRequests]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <Badge className="bg-yellow-500 text-white rounded-full px-3">Pending</Badge>;
      case 'Accepted': return <Badge className="bg-sky-500 text-white rounded-full px-3">Accepted</Badge>;
      case 'Completed': return <Badge className="bg-emerald-500 text-white rounded-full px-3">Completed</Badge>;
      case 'Rejected': return <Badge variant="destructive" className="rounded-full px-3">Rejected</Badge>;
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

  const filters = ['All', 'Pending', 'Accepted', 'Completed', 'Rejected'];

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
        {filteredRequests.map((req) => (
          <Card 
            key={req.id} 
            className="border-none shadow-sm rounded-3xl overflow-hidden active:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => setSelectedRequest(req)}
          >
            <CardContent className="p-5 flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-accent/10 text-accent shrink-0">
                {getTypeIcon(req.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-primary truncate text-lg">{req.type}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">{req.date.split(',')[0]}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">{req.desc}</p>
                <div className="flex items-center justify-between">
                  {getStatusBadge(req.status)}
                  <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 mx-1">
             <Filter className="h-12 w-12 mx-auto mb-4 text-slate-200" />
             <p className="text-lg font-bold text-primary">No {activeFilter === 'All' ? '' : activeFilter} Requests</p>
             <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">There are no requests matching this status right now.</p>
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
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
