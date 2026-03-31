
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, CheckCircle, Clock, Search, Filter, ShieldCheck, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { generateAdminDashboardSummary } from '@/ai/flows/generate-admin-dashboard-summary-flow';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import Link from 'next/link';

export default function AdminDashboard() {
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const db = useFirestore();

  // Fetch real-time data from Firestore collections
  const usersQuery = useMemoFirebase(() => collection(db, 'users'), [db]);
  const pendingQuery = useMemoFirebase(() => collection(db, 'assistance_requests_pending'), [db]);
  const activeQuery = useMemoFirebase(() => collection(db, 'assistance_requests_active'), [db]);
  const completedQuery = useMemoFirebase(() => collection(db, 'assistance_requests_completed'), [db]);

  const { data: usersData, isLoading: isUsersLoading } = useCollection(usersQuery);
  const { data: pendingData, isLoading: isPendingLoading } = useCollection(pendingQuery);
  const { data: activeData, isLoading: isActiveLoading } = useCollection(activeQuery);
  const { data: completedData, isLoading: isCompletedLoading } = useCollection(completedQuery);

  // Derived metrics from real-time data
  const metrics = useMemo(() => {
    const totalUsers = usersData?.length || 0;
    const activeVolunteers = usersData?.filter(u => u.role === 'volunteer').length || 0;
    const completedTasks = completedData?.length || 0;
    const totalRequests = (pendingData?.length || 0) + (activeData?.length || 0) + completedTasks;

    // Calculate task type counts for AI analysis
    const counts: Record<string, number> = {};
    const allReqs = [...(pendingData || []), ...(activeData || []), ...(completedData || [])];
    allReqs.forEach(req => {
      const type = req.taskType || 'Other';
      counts[type] = (counts[type] || 0) + 1;
    });

    return {
      totalUsers,
      totalRequests,
      activeVolunteers,
      completedTasks,
      taskTypeCounts: counts
    };
  }, [usersData, pendingData, activeData, completedData]);

  const handleGenerateSummary = async () => {
    if (isAiLoading || !usersData) return;
    setIsAiLoading(true);
    try {
      const result = await generateAdminDashboardSummary(metrics);
      setAiSummary(result.summary);
    } catch (err) {
      console.error("AI Insight generation failed:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Automatically generate summary when data is first loaded
  useEffect(() => {
    if (!isUsersLoading && !isPendingLoading && !isActiveLoading && !isCompletedLoading && usersData) {
      handleGenerateSummary();
    }
  }, [isUsersLoading, isPendingLoading, isActiveLoading, isCompletedLoading, usersData]);

  // Combine data for a unified recent activity feed
  const recentActivity = useMemo(() => {
    const allReqs = [
      ...(pendingData || []).map(r => ({ ...r, status: 'Pending' })),
      ...(activeData || []).map(r => ({ ...r, status: 'Active' })),
      ...(completedData || []).map(r => ({ ...r, status: 'Completed' }))
    ];
    return allReqs
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [pendingData, activeData, completedData]);

  const isDataLoading = isUsersLoading || isPendingLoading || isActiveLoading || isCompletedLoading;

  if (isDataLoading && !usersData) {
    return (
      <div className="flex h-[calc(100vh-160px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold text-primary">Admin Console</h1>
          <p className="text-sm text-muted-foreground">Politeknik Kuching Sarawak</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard/admin/users?role=admin" className="block">
          <Card className="border-none shadow-sm bg-white p-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="p-2 w-fit rounded-lg bg-blue-100 text-blue-600 mb-2">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-xl font-bold text-primary">{metrics.totalUsers}</div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Total Users</div>
          </Card>
        </Link>
        
        <Link href="/dashboard/admin/requests?role=admin" className="block">
          <Card className="border-none shadow-sm bg-white p-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="p-2 w-fit rounded-lg bg-orange-100 text-orange-600 mb-2">
              <FileText className="h-5 w-5" />
            </div>
            <div className="text-xl font-bold text-primary">{metrics.totalRequests}</div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Total Requests</div>
          </Card>
        </Link>

        <Link href="/dashboard/admin/users?role=admin&filter=volunteer" className="block">
          <Card className="border-none shadow-sm bg-white p-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="p-2 w-fit rounded-lg bg-accent/10 text-accent mb-2">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-xl font-bold text-primary">{metrics.activeVolunteers}</div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Volunteers</div>
          </Card>
        </Link>

        <Link href="/dashboard/admin/requests?role=admin&filter=Completed" className="block">
          <Card className="border-none shadow-sm bg-white p-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="p-2 w-fit rounded-lg bg-emerald-100 text-emerald-600 mb-2">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="text-xl font-bold text-primary">{metrics.completedTasks}</div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Completed</div>
          </Card>
        </Link>
      </div>

      <Card className="bg-primary/5 border-primary/20 shadow-none overflow-hidden border-2 border-dashed rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <CardTitle className="text-sm font-bold text-primary">AI Insights</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleGenerateSummary} 
            disabled={isAiLoading || !usersData} 
            className="text-[10px] h-7 px-2 font-bold uppercase"
          >
            {isAiLoading ? "..." : "Refresh"}
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-xs text-primary/80 leading-relaxed font-medium">
            {isAiLoading ? "Analyzing system data..." : aiSummary || "Generating insights based on current system activity..."}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">Recent Activity</h2>
          <Button asChild variant="link" className="text-xs font-bold text-accent h-auto p-0">
            <Link href="/dashboard/admin/requests?role=admin">View All</Link>
          </Button>
        </div>

        <div className="space-y-2">
          {recentActivity.map((req) => (
            <Card key={req.id} className="border-none shadow-sm rounded-2xl p-4 flex items-center justify-between active:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary font-mono text-[10px] font-bold">
                  {req.id.slice(0, 4).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-primary">Request {req.id.slice(0, 4).toUpperCase()}</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Badge variant="outline" className="text-[8px] h-4 px-1 leading-none">{req.taskType}</Badge>
                    <span>•</span>
                    <span>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`text-[8px] h-4 px-1 ${
                  req.status === 'Completed' ? 'bg-emerald-500' : 
                  req.status === 'Active' ? 'bg-sky-500' : 'bg-yellow-500'
                }`}>
                  {req.status}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground/30 ml-auto mt-1" />
              </div>
            </Card>
          ))}
          {(!isDataLoading && recentActivity.length === 0) && (
            <div className="text-center py-10 opacity-30 italic text-sm">
              No recent requests found in the system.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
