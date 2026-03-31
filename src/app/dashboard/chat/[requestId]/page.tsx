"use client";

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Phone, Info, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

function ChatContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const requestId = params.requestId as string;
  const role = searchParams.get('role') || 'elderly';
  const db = useFirestore();
  const { user } = useUser();

  const chatRoomRef = useMemoFirebase(() => {
    if (!requestId) return null;
    return doc(db, 'chat_rooms', requestId);
  }, [db, requestId]);

  const { data: chatRoom, isLoading, error } = useDoc(chatRoomRef);

  // Determine partner info from real data
  const chatPartner = useMemo(() => {
    if (!chatRoom) return { name: 'Chat', image: '', roleName: '...' };
    
    if (role === 'volunteer') {
      return { 
        name: chatRoom.residentName || 'Resident', 
        image: `https://picsum.photos/seed/${chatRoom.participantUserIds?.[0] || '1'}/100/100`, 
        roleName: 'Resident' 
      };
    } else {
      return { 
        name: chatRoom.volunteerName || 'Volunteer', 
        image: `https://picsum.photos/seed/${chatRoom.participantUserIds?.[1] || '2'}/100/100`, 
        roleName: 'Volunteer' 
      };
    }
  }, [chatRoom, role]);

  const [messages, setMessages] = useState([
    { id: 1, sender: 'partner', text: "Hello! I'm here to help.", time: '10:05 AM' },
    { id: 2, sender: 'me', text: 'Thank you so much!', time: '10:07 AM' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { 
      id: messages.length + 1, 
      sender: 'me', 
      text: input, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);
    setInput('');
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase text-muted-foreground">Connecting to chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
        <div className="p-4 bg-destructive/10 rounded-full">
           <ShieldCheck className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-lg font-bold text-primary">Access Denied</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You don't have permission to view this chat. This can happen if the chat room was just created or if you're logged into a different account.
        </p>
        <Button asChild variant="outline" className="mt-4 rounded-xl">
          <Link href={`/dashboard/chat?role=${role}`}>Back to Messages</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-background -mx-4 -mt-6">
      <Card className="flex-1 flex flex-col border-none shadow-none overflow-hidden bg-white">
        <CardHeader className="bg-primary text-white border-b px-4 py-3 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link 
              href={`/dashboard/chat?role=${role}`} 
              className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 group"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <Avatar className="h-10 w-10 border-2 border-white/20">
              <AvatarImage src={chatPartner.image} />
              <AvatarFallback>{chatPartner.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-headline font-bold">{chatPartner.name}</CardTitle>
              <div className="text-[10px] text-white/70 flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-emerald-400"></div> {chatPartner.roleName}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-9 w-9">
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden bg-[#f0f2f5] relative">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              <div className="text-center">
                <span className="bg-white/50 backdrop-blur-sm text-muted-foreground text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">Today</span>
              </div>
              
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-2xl shadow-sm text-sm ${
                      msg.sender === 'me' 
                        ? 'bg-accent text-white rounded-tr-none' 
                        : 'bg-white text-primary rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 font-semibold">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-3 bg-white border-t shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2 w-full"
          >
            <Input 
              placeholder="Type a message..." 
              className="flex-1 h-12 text-sm bg-slate-50 border-none focus-visible:ring-accent rounded-2xl px-4"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              suppressHydrationWarning
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <ChatContent />
    </Suspense>
  );
}