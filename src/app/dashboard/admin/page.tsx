"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  FileText, 
  Search, 
  Filter, 
  ShieldCheck, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  Heart,
  Clock,
  MapPin
} from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import Link from 'next/link';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend, 
  ChartLegendContent 
} from '@/components/ui/chart';

export default function AdminDashboard() {
  const db = useFirestore();
  const { user } = useUser();

  const ADMIN_EMAIL = 'adminkn@gmail.com';

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);
  
  const isAdminConfirmed = useMemo(() => {
    if (!user) return false;
    return user.email?.toLowerCase() === ADMIN_EMAIL || profile?.role === 'admin';
  }, [user, profile]);

  const usersQuery = useMemoFirebase(() => (isAdminConfirmed && user) ? collection(db, 'users') : null, [db, isAdminConfirmed, user]);
  const pendingQuery = useMemoFirebase(() => (isAdminConfirmed && user) ? collection(db, 'assistance_requests_pending') : null, [db, isAdminConfirmed, user]);
  const activeQuery = useMemoFirebase(() => (isAdminConfirmed && user) ? collection(db, 'assistance_requests_active') : null, [db, isAdminConfirmed, user]);
  const completedQuery = useMemoFirebase(() => (isAdminConfirmed && user) ? collection(db, 'assistance_requests_completed') : null, [db, isAdminConfirmed, user]);

  const { data: usersData, isLoading: isUsersLoading } = useCollection(usersQuery);
  const { data: pendingData, isLoading: isPendingLoading } = useCollection(pendingQuery);
  const { data: activeData, isLoading: isActiveLoading } = useCollection(activeQuery);
  const { data: completedData, isLoading: isCompletedLoading } = useCollection(completedQuery);

  const metrics = useMemo(() => {
    const totalUsers = usersData?.length || 0;
    const completedTasksCount = completedData?.length || 0;
    const totalRequests = (pendingData?.length || 0) + (activeData?.length || 0) + completedTasksCount;
    const activeVolunteers = usersData?.filter(u => u.role === 'volunteer').length || 0;

    const counts: Record<string, number> = {};
    const allReqs = [...(pendingData || []), ...(activeData || []), ...(completedData || [])];
    const uniqueReqs = Array.from(new Map(allReqs.map(r => [r.id, r])).values());
    
    uniqueReqs.forEach(req => {
      const type = req.taskType || 'Other';
      counts[type] = (counts[type] || 0) + 1;
    });

    return {
      totalUsers,
      totalRequests,
      activeVolunteers,
      completedTasks: completedTasksCount,
      taskTypeCounts: counts
    };
  }, [usersData, pendingData, activeData, completedData]);

  const analyticsData = useMemo(() => {
    const allReqs = [
      ...(pendingData || []),
      ...(activeData || []),
      ...(completedData || [])
    ];
    
    const uniqueReqs = Array.from(new Map(allReqs.map(r => [r.id, r])).values());
    
    const ageBrackets: Record<string, Record<string, number>> = {
      '60-69': { Groceries: 0, Transportation: 0, 'Tech Support': 0 },
      '70-79': { Groceries: 0, Transportation: 0, 'Tech Support': 0 },
      '80-89': { Groceries: 0, Transportation: 0, 'Tech Support': 0 },
      '90+': { Groceries: 0, Transportation: 0, 'Tech Support': 0 }
    };

    uniqueReqs.forEach(req => {
      const age = parseInt(req.creatorAge);
      if (isNaN(age)) return;
      
      let bracket = '90+';
      if (age < 70) bracket = '60-69';
      else if (age < 80) bracket = '70-79';
      else if (age < 90) bracket = '80-89';

      if (ageBrackets[bracket][req.taskType] !== undefined) {
        ageBrackets[bracket][req.taskType]++;
      }
    });

    const barData = Object.entries(ageBrackets).map(([bracket, tasks]) => ({
      ageRange: bracket,
      ...tasks
    }));

    const pieData = Object.entries(metrics.taskTypeCounts).map(([name, value]) => ({
      name,
      value
    }));

    return { barData, pieData };
  }, [pendingData, activeData, completedData, metrics.taskTypeCounts]);

  const chartConfig = {
    Groceries: { label: "Groceries", color: "hsl(var(--chart-1))" },
    Transportation: { label: "Transportation", color: "hsl(var(--chart-2))" },
    'Tech Support': { label: "Tech Support", color: "hsl(var(--chart-3))" }
  };

  const recentActivity = useMemo(() => {
    const allReqs = [
      ...(pendingData || []).map(r => ({ ...r, status: 'Pending' })),
      ...(activeData || []).map(r => ({ ...r, status: 'Active' })),
      ...(completedData || []).map(r => ({ ...r, status: 'Completed' }))
    ];
    
    const unique = Array.from(new Map(allReqs.map(item => [item.id, item])).values());

    return unique
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [pendingData, activeData, completedData]);

  if (isProfileLoading) {
    return (
      <div className="flex h-[calc(100vh-160px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-headline font-bold text-primary">System Dashboard</h1>
          <p className="text-sm text-muted-foreground">Monitoring PKS ElderCare Connect</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12 rounded-2xl p-1 bg-slate-100">
          <TabsTrigger value="overview" className="rounded-xl font-bold text-sm">Overview</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl font-bold text-sm">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/admin/users?role=admin" className="block">
              <Card className="border-none shadow-sm bg-white p-4 hover:bg-slate-50 transition-colors cursor-pointer h-full">
                <div className="p-2 w-fit rounded-lg bg-blue-100 text-blue-600 mb-2"><Users className="h-5 w-5" /></div>
                <div className="text-xl font-bold text-primary">{metrics.totalUsers}</div>
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Total Users</div>
              </Card>
            </Link>
            <Link href="/dashboard/admin/requests?role=admin" className="block">
              <Card className="border-none shadow-sm bg-white p-4 hover:bg-slate-50 transition-colors cursor-pointer h-full">
                <div className="p-2 w-fit rounded-lg bg-orange-100 text-orange-600 mb-2"><FileText className="h-5 w-5" /></div>
                <div className="text-xl font-bold text-primary">{metrics.totalRequests}</div>
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Total Requests</div>
              </Card>
            </Link>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-primary">Recent Activity</h2>
            <div className="space-y-2">
              {recentActivity.map((req) => (
                <Card key={req.id} className="border-none shadow-sm rounded-2xl p-4 flex items-center justify-between active:bg-slate-50 transition-colors gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary font-mono text-[10px] font-bold shrink-0">
                      {req.id.slice(0, 4).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-primary break-words whitespace-normal leading-tight">{req.createdByName || 'Unknown User'}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Badge variant="outline" className="text-[8px] h-4 px-1 leading-none shrink-0">{req.taskType}</Badge>
                      </div>
                    </div>
                  </div>
                  <Badge className={`text-[8px] h-4 px-1 ${req.status === 'Completed' ? 'bg-emerald-500' : 'bg-yellow-500'}`}>{req.status}</Badge>
                </Card>
              ))}
              {recentActivity.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-xs italic">No recent activity recorded.</div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base font-bold text-primary">Age Group vs. Assistance Type</CardTitle>
              <CardDescription className="text-xs">Correlation between elderly age and requested services</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] p-4">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="ageRange" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="Groceries" fill="var(--color-Groceries)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Transportation" fill="var(--color-Transportation)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Tech Support" fill="var(--color-Tech Support)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base font-bold text-primary">Service Distribution</CardTitle>
              <CardDescription className="text-xs">Overall demand for specific help categories</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={Object.values(chartConfig)[index % 3].color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
