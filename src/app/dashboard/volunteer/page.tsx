"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Clock, ArrowRight, ShoppingCart, Truck, Wrench, AlertCircle, Heart } from 'lucide-react';

export default function VolunteerDashboard() {
  const [filter, setFilter] = useState('all');

  const availableTasks = [
    { 
      id: 1, 
      user: 'Mrs. Hapsah', 
      type: 'Grocery', 
      urgency: 'High', 
      location: 'Block C, Ground Floor', 
      dist: '200m away',
      desc: 'Need urgent help getting medications and some rice from the mart. I cannot walk far today.' 
    },
    { 
      id: 2, 
      user: 'Mr. Lim', 
      type: 'Tech Support', 
      urgency: 'Medium', 
      location: 'Block A, Level 2', 
      dist: '500m away',
      desc: 'My laptop screen is flickering. Need help to check if it is a loose cable.' 
    },
    { 
      id: 3, 
      user: 'Uncle Sam', 
      type: 'Transport', 
      urgency: 'Low', 
      location: 'Taman Politeknik', 
      dist: '1.2km away',
      desc: 'Going to the post office tomorrow afternoon. Would appreciate a lift if anyone is heading out.' 
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary mb-2">Volunteer Hub</h1>
          <p className="text-muted-foreground text-lg">Ready to make someone's day better?</p>
        </div>
        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-white">
            <Heart className="h-6 w-6 fill-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">12</div>
            <div className="text-sm text-muted-foreground">Tasks Completed</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
          <TabsTrigger value="available" className="text-lg">Available Tasks</TabsTrigger>
          <TabsTrigger value="active" className="text-lg">My Active Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-headline font-bold text-primary">Browse Requests</h2>
            <div className="flex gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent/10">Urgent First</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent/10">Near Me</Badge>
            </div>
          </div>

          <div className="grid gap-6">
            {availableTasks.map((task) => (
              <Card key={task.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group">
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-64 bg-slate-50 p-6 flex flex-col justify-center items-center text-center border-b lg:border-b-0 lg:border-r">
                    <div className="p-4 rounded-full bg-white shadow-sm text-accent mb-4 group-hover:scale-110 transition-transform">
                      {getTypeIcon(task.type)}
                    </div>
                    <div className="font-bold text-lg text-primary">{task.type}</div>
                    <Badge variant="outline" className={`mt-2 ${getUrgencyColor(task.urgency)}`}>
                      {task.urgency} Urgency
                    </Badge>
                  </div>
                  <CardContent className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-primary">{task.user}</h3>
                        <div className="flex items-center gap-4 text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {task.location}</span>
                          <span className="flex items-center gap-1 font-semibold text-accent"><Clock className="h-4 w-4" /> {task.dist}</span>
                        </div>
                      </div>
                      <Button className="bg-accent hover:bg-accent/90 text-white font-bold h-12 px-8">
                        View Details
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      "{task.desc}"
                    </p>
                  </CardContent>
                  <div className="bg-primary/5 p-6 flex items-center justify-center lg:w-48 border-t lg:border-t-0 lg:border-l">
                    <Button variant="ghost" className="w-full h-full text-primary font-bold gap-2 group-hover:bg-primary group-hover:text-white transition-colors">
                      Accept Task
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-muted">
            <div className="max-w-xs mx-auto space-y-4">
              <div className="p-4 bg-muted/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <Clock className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-primary">No active tasks</h3>
              <p className="text-muted-foreground">Pick an available task from the list to get started helping our elders!</p>
              <Button onClick={() => setFilter('available')} variant="outline" className="border-accent text-accent">Browse Available</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}