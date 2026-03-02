"use client";

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, FileText, CheckCircle, Clock, Search, Filter, ShieldCheck, Sparkles } from 'lucide-react';
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
    { id: 'RQ1021', user: 'Nenek Munah', volunteer: 'Jason (Student)', status: 'In Progress', type: 'Other', date: '2024-10-21' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary mb-2">Operational Dashboard</h1>
          <p className="text-muted-foreground text-lg">Politeknik Kuching Sarawak Admin Center</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
          <FileText className="h-5 w-5" />
          Generate Full Report
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <Badge className="bg-blue-100 text-blue-600 border-none">+12%</Badge>
            </div>
            <div className="text-3xl font-bold text-primary">{metrics.totalUsers}</div>
            <div className="text-sm text-muted-foreground font-medium">Total Registered Users</div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                <FileText className="h-6 w-6" />
              </div>
              <Badge className="bg-orange-100 text-orange-600 border-none">Active</Badge>
            </div>
            <div className="text-3xl font-bold text-primary">{metrics.totalRequests}</div>
            <div className="text-sm text-muted-foreground font-medium">Assistance Requests</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-accent/10 text-accent">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-600 border-none">Verified</Badge>
            </div>
            <div className="text-3xl font-bold text-primary">{metrics.activeVolunteers}</div>
            <div className="text-sm text-muted-foreground font-medium">Active Student Volunteers</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-600 border-none">Lifetime</Badge>
            </div>
            <div className="text-3xl font-bold text-primary">{metrics.completedTasks}</div>
            <div className="text-sm text-muted-foreground font-medium">Successfully Completed</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/20 shadow-none overflow-hidden border-2 border-dashed">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl font-headline font-bold text-primary">AI Operational Insights</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleGenerateSummary} disabled={isAiLoading} className="text-primary font-bold">
            {isAiLoading ? "Refreshing..." : "Refresh Summary"}
          </Button>
        </CardHeader>
        <CardContent>
          {isAiLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
              <Clock className="h-5 w-5" /> Generating latest insights...
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-primary/80 leading-relaxed font-medium">
              {aiSummary || "No insights generated yet. Click refresh to analyze system data."}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-headline font-bold text-primary">All Assistance Requests</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search requests..." className="pl-10 w-64 h-10" />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold">Request ID</TableHead>
                <TableHead className="font-bold">Elderly User</TableHead>
                <TableHead className="font-bold">Type</TableHead>
                <TableHead className="font-bold">Volunteer</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Date</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allRequests.map((req) => (
                <TableRow key={req.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono text-xs font-bold">{req.id}</TableCell>
                  <TableCell className="font-medium">{req.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">{req.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={req.volunteer === 'Unassigned' ? 'text-destructive italic' : ''}>
                      {req.volunteer}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      req.status === 'Completed' ? 'bg-emerald-500' : 
                      req.status === 'In Progress' ? 'bg-sky-500' : 'bg-yellow-500'
                    }>
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{req.date}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-accent font-bold">Manage</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}