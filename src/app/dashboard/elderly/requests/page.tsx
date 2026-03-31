"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Truck, Wrench, Info, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RequestsHistoryPage() {
  const allRequests = [
    { id: 1, type: 'Groceries', status: 'Pending', date: 'Oct 24, 2024', desc: 'Need help buying milk and bread from the local market.' },
    { id: 2, type: 'Transportation', status: 'Accepted', date: 'Oct 23, 2024', desc: 'Ride to the clinic for monthly health checkup.' },
    { id: 3, type: 'Tech Support', status: 'Completed', date: 'Oct 21, 2024', desc: 'Setting up my new phone and installing WhatsApp.' },
    { id: 4, type: 'Groceries', status: 'Completed', date: 'Oct 10, 2024', desc: 'Weekly grocery run for vegetables and fruits.' },
  ];

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

      <div className="space-y-4">
        {allRequests.map((req) => (
          <Card key={req.id} className="border-none shadow-sm rounded-3xl overflow-hidden active:bg-slate-50 transition-colors">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-accent/10 text-accent shrink-0">
                {getTypeIcon(req.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-primary truncate text-lg">{req.type}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">{req.date}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{req.desc}</p>
                <div className="flex items-center justify-between">
                  {getStatusBadge(req.status)}
                  <Button variant="ghost" size="sm" className="text-accent font-bold text-xs p-0 h-auto">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
