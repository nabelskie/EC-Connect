
"use client";

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Phone, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function ChatContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const requestId = params.requestId as string;
  const role = searchParams.get('role') || 'elderly';
  const db = useFirestore();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chatRoomRef = useMemoFirebase(() => {
    if (!requestId) return null;
    return doc(db, 'chat_rooms', requestId);
  }, [db, requestId]);

  const { data: chatRoom, isLoading: isRoomLoading, error: roomError } = useDoc(chatRoomRef);

  // Fetch real messages from subcollection
  const messagesQuery = useMemoFirebase(() => {
    if (!requestId) return null;
    return query(
      collection(db, 'chat_rooms', requestId, 'messages'),
      orderBy('timestamp', 'asc')
    );
  }, [db, requestId]);

  const { data: messages, isLoading: isMessagesLoading } = useCollection(messagesQuery);

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !requestId || isSending) return;

    setIsSending(true);
    const messageText = input.trim();
    setInput('');

    const messageData = {
      chatRoomId: requestId,
      senderUserId: user.uid,
      messageText: messageText,
      timestamp: serverTimestamp(),
      // Denormalize participants for security rules as per backend.json guidelines
      participantUserIds: chatRoom?.participantUserIds || []
    };

    const messagesRef = collection(db, 'chat_rooms', requestId, 'messages');
    
    addDoc(messagesRef, messageData)
      .then(() => {
        setIsSending(false);
        // Also update the parent chat room with a snippet
        const roomRef = doc(db, 'chat_rooms', requestId);
        // Use non-blocking update
        const { updateDoc } = require('firebase/firestore');
        updateDoc(roomRef, {
          lastMessageSnippet: messageText,
          lastMessageAt: serverTimestamp()
        }).catch(() => {});
      })
      .catch(async (err) => {
        setIsSending(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `${messagesRef.path}/new`,
          operation: 'create',
          requestResourceData: messageData
        }));
      });
  };

  if (!mounted) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase text-muted-foreground">Preparing chat...</p>
      </div>
    );
  }

  if (isRoomLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase text-muted-foreground">Connecting to chat...</p>
      </div>
    );
  }

  if (roomError) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
        <div className="p-4 bg-destructive/10 rounded-full">
           <ShieldCheck className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-lg font-bold text-primary">Access Denied</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You don't have permission to view this chat.
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
              
              {isMessagesLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((msg) => {
                  const isMe = msg.senderUserId === user?.uid;
                  const timeStr = msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...';
                  
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3 rounded-2xl shadow-sm text-sm ${
                          isMe 
                            ? 'bg-accent text-white rounded-tr-none' 
                            : 'bg-white text-primary rounded-tl-none'
                        }`}>
                          {msg.messageText}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 font-semibold">{timeStr}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Start the conversation</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-3 bg-white border-t shrink-0">
          <form 
            onSubmit={handleSend}
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
              disabled={!input.trim() || isSending}
              className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg disabled:opacity-50"
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
