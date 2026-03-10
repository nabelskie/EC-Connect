
"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Clock, ArrowRight, ShoppingCart, Truck, Wrench, AlertCircle, Heart } from 'lucide-react';

export default function VolunteerDashboard() {
  const availableTasks = [
    { 
      id: 1, 
      user: 'Mrs. Hapsah', 
      type: 'Grocery', 
      urgency: 'High', 
      location: 'Block C, G Floor', 
      dist: '200m away',
      desc: 'Need urgent help getting medications and some rice.' 
    },
    { 
      id: 2, 
      user: 'Mr. Lim', 
      type: 'Tech Support', 
      urgency: 'Medium', 
      location: 'Block A, Level 2', 
      dist: '500m away',
      desc: 'My laptop screen is flickering. Need help checking cable.' 
    },
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Medium': return 'bg-orange-100 text-orange-600 border-orange-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Grocery': return <ShoppingCart className="h-5 w-5" />;
      case 'Transport': return <Truck className="h-5 w-5" />;
      case 'Tech Support': return <Wrench className="h-5 w-5" />;
      default: return <AlertCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold text-primary">Volunteer Hub</h1>
          <p className="text-xs text-muted-foreground">Politeknik Kuching Sarawak</p>
        </div>
        <div className="bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10 flex items-center gap-2">
          <Heart className="h-4 w-4 text-accent fill-accent" />
          <span className="text-sm font-bold text-primary">12 Done</span>
        </div>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12 rounded-2xl p-1 bg-slate-100">
          <TabsTrigger value="available" className="rounded-xl font-bold text-sm">Available</TabsTrigger>
          <TabsTrigger value="active" className="rounded-xl font-bold text-sm">Active (0)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary">Open Requests</h2>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-accent text-xs font-bold">Filters</Button>
          </div>

          <div className="space-y-4">
            {availableTasks.map((task) => (
              <Card key={task.id} className="overflow-hidden border-none shadow-sm rounded-3xl active:scale-[0.98] transition-all">
                <CardContent className="p-0">
                  <div className="p-4 flex items-center justify-between bg-slate-50/50 border-b">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white shadow-sm text-accent">
                        {getTypeIcon(task.type)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-primary">{task.type}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase">{task.user}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] rounded-lg ${getUrgencyColor(task.urgency)}`}>
                      {task.urgency}
                    </Badge>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed italic">
                      "{task.desc}"
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {task.location}</span>
                      <span className="flex items-center gap-1 text-accent"><Clock className="h-3 w-3" /> {task.dist}</span>
                    </div>
                    <Button className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl gap-2 mt-2 shadow-lg shadow-accent/20">
                      Accept & Chat
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-muted">
            <div className="max-w-[180px] mx-auto space-y-3">
              <div className="p-3 bg-muted/20 rounded-full w-14 h-14 flex items-center justify-center mx-auto">
                <Clock className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-bold text-primary">No active tasks</h3>
              <p className="text-[10px] text-muted-foreground leading-tight">Pick a task to start helping our elders!</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
