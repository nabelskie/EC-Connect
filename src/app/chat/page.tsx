"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ChevronRight, ArrowLeft, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function ChatInboxPage() {
  const conversations = [
    {
      id: 'RQ1024',
      name: 'Ahmad (Volunteer)',
      lastMessage: 'Sure thing! Any specific brand you prefer?',
      time: '10:08 AM',
      unread: 1,
      image: 'https://picsum.photos/seed/volunteer1/100/100',
      status: 'Online'
    },
    {
      id: 'RQ1023',
      name: 'Sarah (Volunteer)',
      lastMessage: 'I am on my way to pick up your medicine.',
      time: 'Yesterday',
      unread: 0,
      image: 'https://picsum.photos/seed/volunteer2/100/100',
      status: 'Away'
    },
    {
      id: 'RQ1022',
      name: 'Jason (Volunteer)',
      lastMessage: 'The tech issue is resolved. Let me know if it happens again!',
      time: 'Oct 22',
      unread: 0,
      image: 'https://picsum.photos/seed/volunteer3/100/100',
      status: 'Offline'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-2">
          <Link 
            href="/dashboard/elderly" 
            className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-primary" />
          </Link>
          <h1 className="text-2xl font-headline font-bold text-primary">Messages</h1>
        </div>
        
        <div className="relative px-2">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-10 h-12 rounded-2xl bg-white border-none shadow-sm focus-visible:ring-accent"
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="space-y-3 px-2">
          {conversations.map((chat) => (
            <Link key={chat.id} href={`/chat/${chat.id}`}>
              <Card className="border-none shadow-sm rounded-3xl overflow-hidden active:bg-slate-50 transition-colors mb-3">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-2 border-slate-100">
                      <AvatarImage src={chat.image} />
                      <AvatarFallback>{chat.name[0]}</AvatarFallback>
                    </Avatar>
                    {chat.status === 'Online' && (
                      <div className="absolute bottom-0 right-0 h-4 w-4 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-primary truncate">{chat.name}</span>
                      <span className="text-[10px] text-muted-foreground font-semibold">{chat.time}</span>
                    </div>
                    <p className={`text-sm truncate ${chat.unread > 0 ? 'text-primary font-bold' : 'text-muted-foreground font-medium'}`}>
                      {chat.lastMessage}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {chat.unread > 0 && (
                      <div className="h-5 min-w-5 px-1.5 flex items-center justify-center bg-accent text-white rounded-full text-[10px] font-bold">
                        {chat.unread}
                      </div>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {conversations.length === 0 && (
            <div className="text-center py-20 opacity-50">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-bold">No messages yet</p>
              <p className="text-sm">Once a volunteer accepts your request, you can chat here.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
