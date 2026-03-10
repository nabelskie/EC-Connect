
"use client";

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, CheckCircle, Clock, Search, Filter, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { generateAdminDashboardSummary } from '@/ai/flows/generate-admin-dashboard-summary-flow';

export default function AdminDashboard() {
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const metrics = {
    totalUsers: 254,
    totalRequests: 89,
    activeVolunteers: 42,
    completedTasks: 120,
    taskTypeCounts: {
      "Grocery": 35,
      "Transport": 28,
      "Tech Support": 20,
      "Other": 6
    }
  };

  const handleGenerateSummary = async () => {
    setIsAiLoading(true);
    try {
      const result = await generateAdminDashboardSummary(metrics);
      setAiSummary(result.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateSummary();
  }, []);

  const allRequests = [
    { id: 'RQ1024', user: 'Mrs. Hapsah', volunteer: 'Ahmad (Student)', status: 'In Progress', type: 'Grocery', date: '2024-10-24' },
    { id: 'RQ1023', user: 'Mr. Lim', volunteer: 'Unassigned', status: 'Pending', type: 'Tech Support', date: '2024-10-23' },
    { id: 'RQ1022', user: 'Uncle Sam', volunteer: 'Sarah (Student)', status: 'Completed', type: 'Transport', date: '2024-10-22' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold text-primary">Admin Console</h1>
          <p className="text-sm text-muted-foreground">Politeknik Kuching Sarawak</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-none shadow-sm bg-white p-4">
          <div className="p-2 w-fit rounded-lg bg-blue-100 text-blue-600 mb-2">
            <Users className="h-5 w-5" />
          </div>
          <div className="text-xl font-bold text-primary">{metrics.totalUsers}</div>
          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Total Users</div>
        </Card>
        
        <Card className="border-none shadow-sm bg-white p-4">
          <div className="p-2 w-fit rounded-lg bg-orange-100 text-orange-600 mb-2">
            <FileText className="h-5 w-5" />
          </div>
          <div className="text-xl font-bold text-primary">{metrics.totalRequests}</div>
          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Requests</div>
        </Card>

        <Card className="border-none shadow-sm bg-white p-4">
          <div className="p-2 w-fit rounded-lg bg-accent/10 text-accent mb-2">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="text-xl font-bold text-primary">{metrics.activeVolunteers}</div>
          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Volunteers</div>
        </Card>

        <Card className="border-none shadow-sm bg-white p-4">
          <div className="p-2 w-fit rounded-lg bg-emerald-100 text-emerald-600 mb-2">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="text-xl font-bold text-primary">{metrics.completedTasks}</div>
          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Completed</div>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/20 shadow-none overflow-hidden border-2 border-dashed rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <CardTitle className="text-sm font-bold text-primary">AI Insights</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleGenerateSummary} disabled={isAiLoading} className="text-[10px] h-7 px-2 font-bold uppercase">
            {isAiLoading ? "..." : "Refresh"}
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-xs text-primary/80 leading-relaxed font-medium">
            {isAiLoading ? "Analyzing system data..." : aiSummary || "Click refresh for latest insights."}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">Recent Activity</h2>
          <Button variant="link" className="text-xs font-bold text-accent h-auto p-0">View All</Button>
        </div>

        <div className="space-y-2">
          {allRequests.map((req) => (
            <Card key={req.id} className="border-none shadow-sm rounded-2xl p-4 flex items-center justify-between active:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary font-mono text-[10px] font-bold">
                  {req.id.replace('RQ', '')}
                </div>
                <div>
                  <div className="font-bold text-sm text-primary">{req.user}</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Badge variant="outline" className="text-[8px] h-4 px-1 leading-none">{req.type}</Badge>
                    <span>•</span>
                    <span>{req.date}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`text-[8px] h-4 px-1 ${
                  req.status === 'Completed' ? 'bg-emerald-500' : 
                  req.status === 'In Progress' ? 'bg-sky-500' : 'bg-yellow-500'
                }`}>
                  {req.status}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground/30 ml-auto mt-1" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
