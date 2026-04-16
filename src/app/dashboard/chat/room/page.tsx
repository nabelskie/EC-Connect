
"use client";

import { useState, useMemo, Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ArrowLeft, ShieldCheck, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, serverTimestamp, where } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

function ChatContent() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId');
  const role = searchParams.get('role') || 'elderly';
  const db = useFirestore();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Ref for automatic scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chatRoomRef = useMemoFirebase(() => {
    if (!requestId || !db) return null;
    return doc(db, 'chat_rooms', requestId);
  }, [db, requestId]);

  const { data: chatRoom, isLoading: isRoomLoading, error: roomError } = useDoc(chatRoomRef);

  // Auto-retry once if doc is null (to handle sync latency)
  useEffect(() => {
    if (mounted && !isRoomLoading && !chatRoom && retryCount < 1) {
      const timer = setTimeout(() => setRetryCount(prev => prev + 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [mounted, isRoomLoading, chatRoom, retryCount]);

  const messagesQuery = useMemoFirebase(() => {
    if (!requestId || !db || !user) return null;
    return query(
      collection(db, 'chat_rooms', requestId, 'messages'),
      where('participantUserIds', 'array-contains', user.uid)
    );
  }, [db, requestId, user]);

  const { data: messages, isLoading: isMessagesLoading } = useCollection(messagesQuery);

  const sortedMessages = useMemo(() => {
    if (!messages) return [];
    return [...messages].sort((a, b) => {
      const timeA = a.timestamp?.toMillis?.() || 0;
      const timeB = b.timestamp?.toMillis?.() || 0;
      return timeA - timeB;
    });
  }, [messages]);

  // Handle automatic scrolling to bottom when messages change
  useEffect(() => {
    if (sortedMessages.length > 0) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [sortedMessages]);

  const chatPartner = useMemo(() => {
    if (!chatRoom) return { name: 'Chat', image: '', roleName: '...' };
    const isVolunteerRole = role === 'volunteer';
    const partnerName = isVolunteerRole ? chatRoom.residentName : chatRoom.volunteerName;
    const partnerRole = isVolunteerRole ? 'Elderly' : 'Volunteer';
    const partnerId = isVolunteerRole ? chatRoom.participantUserIds?.[0] : chatRoom.participantUserIds?.[1];

    return { 
      name: partnerName || partnerRole, 
      image: `https://picsum.photos/seed/${partnerId || 'default'}/1200/800`, 
      roleName: partnerRole 
    };
  }, [chatRoom, role]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !requestId || isSending || !chatRoom) return;

    setIsSending(true);
    const messageText = input.trim();
    setInput('');

    const messagesRef = collection(db, 'chat_rooms', requestId, 'messages');
    const messageData = {
      chatRoomId: requestId,
      senderUserId: user.uid,
      messageText: messageText,
      timestamp: serverTimestamp(),
      participantUserIds: chatRoom.participantUserIds || []
    };

    addDocumentNonBlocking(messagesRef, messageData);
    updateDocumentNonBlocking(doc(db, 'chat_rooms', requestId), {
      lastMessageSnippet: messageText,
      lastMessageAt: serverTimestamp(),
      lastMessageSenderId: user.uid
    });
    setIsSending(false);
  };

  if (!mounted) return null;

  if (isRoomLoading || (!chatRoom && retryCount < 1)) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm font-black uppercase text-muted-foreground tracking-[0.3em]">Establishing link...</p>
      </div>
    );
  }

  if (roomError || (mounted && !isRoomLoading && !chatRoom && retryCount >= 1)) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-32 gap-6 text-center px-10">
        <div className="p-6 bg-destructive/10 rounded-[2rem]">
           <ShieldCheck className="h-16 w-16 text-destructive" />
        </div>
        <h2 className="text-2xl font-black text-primary">Chat Disconnected</h2>
        <p className="text-lg text-muted-foreground leading-relaxed font-medium">
          The connection was lost or the chat has been archived.
        </p>
        <Button asChild variant="outline" className="h-16 px-10 rounded-2xl text-lg font-bold border-2">
          <Link href={`/dashboard/chat?role=${role}`}>Return to Inbox</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-background -mx-4 -mt-8">
      <Card className="flex-1 flex flex-col border-none shadow-none overflow-hidden bg-white">
        <CardHeader className="bg-primary text-white border-b px-6 py-4 flex flex-row items-center justify-between shrink-0 shadow-lg z-10">
          <div className="flex items-center gap-4">
            <Link 
              href={`/dashboard/chat?role=${role}`} 
              className="p-3 -ml-3 hover:bg-white/10 rounded-full transition-all active:scale-90"
            >
              <ArrowLeft className="h-9 w-9" />
            </Link>
            <Avatar className="h-12 w-12 border-2 border-white/20 shadow-sm">
              <AvatarImage src={chatPartner.image} />
              <AvatarFallback>{chatPartner.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl font-headline font-black tracking-tight">{chatPartner.name}</CardTitle>
              <div className="text-xs text-white/70 flex items-center gap-1.5 font-bold uppercase tracking-widest">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></div> {chatPartner.roleName}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden bg-[#f0f2f5] relative">
          <ScrollArea className="h-full p-6">
            <div className="space-y-6">
              <div className="text-center">
                <span className="bg-white/70 backdrop-blur-md text-muted-foreground text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] shadow-sm">End-to-End Encrypted</span>
              </div>
              
              {isMessagesLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : sortedMessages && sortedMessages.length > 0 ? (
                <>
                  {sortedMessages.map((msg) => {
                    const isMe = msg.senderUserId === user?.uid;
                    const timeStr = msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...';
                    
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`p-4 rounded-[1.5rem] shadow-sm text-lg leading-relaxed font-medium ${
                            isMe 
                              ? 'bg-accent text-white rounded-tr-none' 
                              : 'bg-white text-primary rounded-tl-none'
                          }`}>
                            {msg.messageText}
                          </div>
                          <span className="text-[11px] text-muted-foreground mt-2 font-black uppercase tracking-tighter">{timeStr}</span>
                        </div>
                      </div>
                    );
                  })}
                  {/* Invisible element to target for scrolling */}
                  <div ref={messagesEndRef} className="h-2" />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center opacity-30">
                  <Sparkles className="h-12 w-12 mb-4 text-accent" />
                  <p className="text-sm font-black uppercase tracking-[0.3em]">Start the conversation</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 bg-white border-t shrink-0 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
          <form 
            onSubmit={handleSend}
            className="flex items-center gap-4 w-full"
          >
            <Input 
              placeholder="Type a message..." 
              className="flex-1 h-14 text-lg bg-slate-100 border-none focus-visible:ring-accent rounded-2xl px-6 font-medium"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isSending || !chatRoom}
              className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl disabled:opacity-50 transition-all active:scale-95"
            >
              <Send className="h-7 w-7" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen-dvh items-center justify-center py-32"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
      <ChatContent />
    </Suspense>
  );
}
