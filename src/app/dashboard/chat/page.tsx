
"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ChevronRight, ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState, useEffect } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

function ChatInboxContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const role = searchParams.get('role') || 'elderly';
  const db = useFirestore();
  const { user } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real-time chat rooms for the current user
  // Simplified query: removed orderBy to avoid requiring a composite index
  const chatRoomsQuery = useMemoFirebase(() => {
    if (!user || !mounted) return null;
    return query(
      collection(db, 'chat_rooms'),
      where('participantUserIds', 'array-contains', user.uid)
    );
  }, [db, user, mounted]);

  const { data: chatRooms, isLoading, error } = useCollection(chatRoomsQuery);

  // Sort chat rooms in memory by lastMessageAt descending
  const sortedChatRooms = useMemo(() => {
    if (!chatRooms) return [];
    return [...chatRooms].sort((a, b) => {
      const timeA = a.lastMessageAt?.toMillis?.() || 0;
      const timeB = b.lastMessageAt?.toMillis?.() || 0;
      return timeB - timeA;
    });
  }, [chatRooms]);

  const backHref = role === 'admin' ? '/dashboard/admin' : role === 'volunteer' ? '/dashboard/volunteer' : '/dashboard/elderly';

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-xs font-bold uppercase">Preparing messages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-2">
          <Link 
            href={`${backHref}?role=${role}`} 
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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-xs font-bold uppercase">Loading conversations...</p>
            </div>
          ) : sortedChatRooms.map((chat) => (
            <Link key={chat.id} href={`/dashboard/chat/${chat.requestId}?role=${role}`}>
              <Card className="border-none shadow-sm rounded-3xl overflow-hidden active:bg-slate-50 transition-colors mb-3">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-2 border-slate-100">
                      <AvatarImage src={`https://picsum.photos/seed/${chat.id}/100/100`} />
                      <AvatarFallback>C</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 h-4 w-4 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-primary truncate">Task Request</span>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {chat.lastMessageAt?.toDate?.() ? chat.lastMessageAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                      </span>
                    </div>
                    <p className="text-sm truncate text-muted-foreground font-medium">
                      {chat.lastMessageSnippet || "No messages yet"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {!isLoading && (!chatRooms || chatRooms.length === 0) && !error && (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 mx-2">
              <div className="p-4 bg-slate-50 rounded-full">
                <MessageSquare className="h-10 w-10 text-slate-300" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-primary">No Chats Available</p>
                <p className="text-xs text-muted-foreground max-w-[220px] mx-auto leading-relaxed">
                  {role === 'volunteer' 
                    ? "Accept a request to start a conversation with a resident." 
                    : "Once a volunteer accepts your request, you'll be able to chat here."
                  }
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-10 text-destructive text-sm font-bold">
              Failed to load chats. Please try again.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default function ChatInboxPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <ChatInboxContent />
    </Suspense>
  );
}
