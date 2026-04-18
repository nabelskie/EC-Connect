
"use client";

import { useState, useMemo, Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ArrowLeft, ShieldCheck, Loader2, Sparkles, Mic, Square, Volume2, Play, Pause } from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, serverTimestamp, where } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { cn } from '@/lib/utils';

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
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    if (mounted && !isRoomLoading && !chatRoom && retryCount < 1) {
      const timer = setTimeout(() => setRetryCount(prev => prev + 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [mounted, isRoomLoading, chatRoom, retryCount]);

  const partnerId = useMemo(() => {
    if (!chatRoom || !user) return null;
    return chatRoom.participantUserIds?.find((id: string) => id !== user.uid);
  }, [chatRoom, user]);

  const partnerUserRef = useMemoFirebase(() => {
    if (!partnerId || !db) return null;
    return doc(db, 'users', partnerId);
  }, [db, partnerId]);

  const { data: partnerProfile } = useDoc(partnerUserRef);

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

    return { 
      name: partnerProfile?.name || partnerName || partnerRole, 
      image: partnerProfile?.photoURL || `https://picsum.photos/seed/${partnerId || 'default'}/400/400`, 
      roleName: partnerRole 
    };
  }, [chatRoom, role, partnerProfile, partnerId]);

  // Handle Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Recording error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSend = async (e?: React.FormEvent, audioDataUri?: string) => {
    if (e) e.preventDefault();
    if (!user || !requestId || isSending || !chatRoom) return;

    const messageText = input.trim();
    if (!messageText && !audioDataUri) return;

    setIsSending(true);
    setInput('');
    setAudioBlob(null);

    const messagesRef = collection(db, 'chat_rooms', requestId, 'messages');
    const messageData = {
      chatRoomId: requestId,
      senderUserId: user.uid,
      messageText: messageText || "Voice Message",
      audioUrl: audioDataUri || null,
      type: audioDataUri ? 'audio' : 'text',
      timestamp: serverTimestamp(),
      participantUserIds: chatRoom.participantUserIds || []
    };

    addDocumentNonBlocking(messagesRef, messageData);
    updateDocumentNonBlocking(doc(db, 'chat_rooms', requestId), {
      lastMessageSnippet: audioDataUri ? "🎤 Voice Message" : messageText,
      lastMessageAt: serverTimestamp(),
      lastMessageSenderId: user.uid
    });
    setIsSending(false);
  };

  const handleSendVoiceNote = async () => {
    if (!audioBlob) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      handleSend(undefined, base64data);
    };
    reader.readAsDataURL(audioBlob);
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for clarity
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!mounted) return null;

  if (isRoomLoading || (!chatRoom && retryCount < 1)) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm font-black uppercase text-muted-foreground tracking-[0.3em]">Connecting...</p>
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
            <Avatar className="h-12 w-12 border-2 border-white/20">
              <AvatarImage src={chatPartner.image} className="object-cover" />
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
              {isMessagesLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : sortedMessages.length > 0 ? (
                <>
                  {sortedMessages.map((msg) => {
                    const isMe = msg.senderUserId === user?.uid;
                    const timeStr = msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...';
                    
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`p-4 rounded-[1.5rem] shadow-sm text-lg leading-relaxed font-medium relative group ${
                            isMe 
                              ? 'bg-accent text-white rounded-tr-none' 
                              : 'bg-white text-primary rounded-tl-none'
                          }`}>
                            {msg.audioUrl ? (
                              <div className="flex items-center gap-3 min-w-[200px] py-1">
                                <div className={cn("p-2 rounded-full", isMe ? "bg-white/20" : "bg-primary/5")}>
                                  <Mic className={cn("h-6 w-6", isMe ? "text-white" : "text-primary")} />
                                </div>
                                <audio controls className="h-10 w-full" src={msg.audioUrl} />
                              </div>
                            ) : (
                              <div className="flex items-start gap-3">
                                <span className="flex-1">{msg.messageText}</span>
                                <button 
                                  onClick={() => speakMessage(msg.messageText)}
                                  className={cn("p-1.5 rounded-full transition-all active:scale-90", isMe ? "hover:bg-white/20" : "hover:bg-slate-100")}
                                >
                                  <Volume2 className="h-5 w-5 opacity-60 hover:opacity-100" />
                                </button>
                              </div>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground mt-2 font-black uppercase tracking-tighter">{timeStr}</span>
                        </div>
                      </div>
                    );
                  })}
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

        <CardFooter className="p-4 bg-white border-t shrink-0 shadow-lg">
          <div className="flex flex-col w-full gap-3">
            {isRecording && (
              <div className="flex items-center justify-between bg-destructive/5 p-4 rounded-2xl animate-pulse">
                <div className="flex items-center gap-3 text-destructive font-black uppercase tracking-widest text-xs">
                  <div className="h-3 w-3 rounded-full bg-destructive" />
                  Recording... {recordingTime}s
                </div>
                <Button variant="ghost" size="icon" onClick={stopRecording} className="text-destructive h-10 w-10">
                  <Square className="h-6 w-6 fill-destructive" />
                </Button>
              </div>
            )}
            
            {audioBlob && !isRecording && (
              <div className="flex items-center justify-between bg-accent/5 p-4 rounded-2xl">
                <div className="flex items-center gap-3 text-accent font-black uppercase tracking-widest text-xs">
                  <Play className="h-5 w-5" />
                  Voice Note Ready
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setAudioBlob(null)} className="text-muted-foreground font-bold">Cancel</Button>
                  <Button size="sm" onClick={handleSendVoiceNote} className="bg-accent text-white font-bold rounded-xl h-10 px-6">Send Audio</Button>
                </div>
              </div>
            )}

            {!isRecording && !audioBlob && (
              <form onSubmit={handleSend} className="flex items-center gap-3 w-full">
                <Button 
                  type="button" 
                  size="icon" 
                  onClick={startRecording}
                  className="h-14 w-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-primary border-none shadow-none shrink-0"
                >
                  <Mic className="h-7 w-7" />
                </Button>
                
                <Input 
                  placeholder="Type or use mic..." 
                  className="flex-1 h-14 text-lg bg-slate-100 border-none focus-visible:ring-accent rounded-2xl px-6 font-medium"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!input.trim() || isSending}
                  className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl active:scale-95 transition-all"
                >
                  <Send className="h-7 w-7" />
                </Button>
              </form>
            )}
          </div>
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
