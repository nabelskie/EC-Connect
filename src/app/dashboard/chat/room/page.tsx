"use client";

import { useState, useMemo, Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, ArrowLeft, Loader2, Mic, Square, Volume2, Play, Trash2, Star } from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, serverTimestamp, orderBy, where } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { cn } from '@/lib/utils';

/** Achievement helper */
function getLevel(tasksCount: number) {
  let level = 1;
  let tasksNeededForNextLevel = 2;
  while (tasksCount >= tasksNeededForNextLevel && level < 100) {
    level++;
    const increment = Math.ceil(level / 2) + 1;
    tasksNeededForNextLevel += increment;
  }
  return level;
}

function getAchievementClasses(level: number, role?: string) {
  if (role !== 'volunteer') return "";
  if (level >= 100) return "ring-2 ring-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]";
  if (level >= 50) return "ring-2 ring-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.3)]";
  if (level >= 20) return "ring-2 ring-slate-400 shadow-[0_0_5px_rgba(148,163,184,0.2)]";
  if (level >= 10) return "ring-2 ring-amber-600 shadow-[0_0_5px_rgba(217,119,6,0.1)]";
  return "ring-2 ring-slate-100";
}

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
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chatRoomRef = useMemoFirebase(() => {
    if (!requestId || !db) return null;
    return doc(db, 'chat_rooms', requestId);
  }, [db, requestId]);

  const { data: chatRoom, isLoading: isRoomLoading } = useDoc(chatRoomRef);

  useEffect(() => {
    if (mounted && !isRoomLoading && !chatRoom && retryCount < 1) {
      const timer = setTimeout(() => setRetryCount(prev => prev + 1), 500);
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

  // Achievement check for partner (especially if they are a volunteer)
  const completedQuery = useMemoFirebase(() => {
    if (!partnerId || partnerProfile?.role !== 'volunteer') return null;
    return query(collection(db, 'assistance_requests_completed'), where('assignedVolunteerId', '==', partnerId));
  }, [db, partnerId, partnerProfile?.role]);
  const { data: partnerCompletedTasks } = useCollection(completedQuery);

  const partnerLevel = useMemo(() => getLevel(partnerCompletedTasks?.length || 0), [partnerCompletedTasks]);
  const partnerBorder = useMemo(() => getAchievementClasses(partnerLevel, partnerProfile?.role), [partnerLevel, partnerProfile?.role]);

  const messagesQuery = useMemoFirebase(() => {
    if (!requestId || !db) return null;
    return collection(db, 'chat_rooms', requestId, 'messages');
  }, [db, requestId]);

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
      const frame = requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      });
      return () => cancelAnimationFrame(frame);
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/mp4') 
        ? 'audio/mp4' : (MediaRecorder.isTypeSupported('audio/mpeg') ? 'audio/mpeg' : 'audio/webm');
        
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) { console.error("Recording error:", err); }
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
    addDocumentNonBlocking(messagesRef, {
      chatRoomId: requestId,
      senderUserId: user.uid,
      messageText: messageText || "🎤 Voice Message",
      audioUrl: audioDataUri || null,
      type: audioDataUri ? 'audio' : 'text',
      timestamp: serverTimestamp(),
      participantUserIds: chatRoom.participantUserIds || []
    });
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
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!mounted) return null;

  if (isRoomLoading || (!chatRoom && retryCount < 1)) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Connecting...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-background -mx-4 -mt-8 gpu-accelerated">
      <Card className="flex-1 flex flex-col border-none shadow-none overflow-hidden bg-white">
        <CardHeader className="bg-primary text-white border-b px-6 py-4 flex flex-row items-center justify-between shrink-0 shadow-md z-10">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/chat?role=${role}`} className="p-2 -ml-2 hover:bg-white/10 rounded-full active:scale-90 transition-transform">
              <ArrowLeft className="h-8 w-8" />
            </Link>
            <Avatar className={cn("h-10 w-10 transition-shadow", partnerBorder)}>
              <AvatarImage src={chatPartner.image} className="object-cover" />
              <AvatarFallback>{chatPartner.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-headline font-black leading-none">{chatPartner.name}</CardTitle>
                {partnerProfile?.role === 'volunteer' && partnerLevel > 1 && (
                  <Badge className="h-4 px-1 text-[8px] bg-white text-primary font-black">Lvl {partnerLevel}</Badge>
                )}
              </div>
              <div className="text-[10px] text-white/70 flex items-center gap-1.5 font-bold uppercase tracking-wider mt-1">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div> {chatPartner.roleName}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden bg-[#f8fafc] relative">
          <ScrollArea className="h-full p-4 md:p-6">
            <div className="space-y-4">
              {isMessagesLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : sortedMessages.map((msg) => {
                const isMe = msg.senderUserId === user?.uid;
                const timeStr = msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                return (
                  <div key={msg.id} className={cn("flex", isMe ? 'justify-end' : 'justify-start')}>
                    <div className={cn("max-w-[85%] flex flex-col", isMe ? 'items-end' : 'items-start')}>
                      <div className={cn("p-3.5 rounded-2xl shadow-sm text-base leading-snug", isMe ? 'bg-accent text-white rounded-tr-none' : 'bg-white text-primary rounded-tl-none')}>
                        {msg.audioUrl ? (
                          <div className="flex items-center gap-2 min-w-[200px]">
                            <Mic className={cn("h-4 w-4 shrink-0", isMe ? "text-white/70" : "text-primary/50")} />
                            <audio controls className="h-8 w-full" src={msg.audioUrl} preload="metadata" />
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <span>{msg.messageText}</span>
                            <button onClick={() => speakMessage(msg.messageText)} className="shrink-0 mt-0.5 opacity-50 hover:opacity-100"><Volume2 className="h-4 w-4" /></button>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-muted-foreground mt-1 font-bold uppercase">{timeStr}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} className="h-2" />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-3 bg-white border-t shrink-0 shadow-sm">
          <div className="flex flex-col w-full gap-2">
            {isRecording && (
              <div className="flex items-center justify-between bg-destructive/5 p-3 rounded-xl animate-pulse">
                <div className="flex items-center gap-2 text-destructive font-black uppercase text-[10px]">
                  <div className="h-2 w-2 rounded-full bg-destructive" /> REC {recordingTime}s
                </div>
                <Button variant="ghost" size="icon" onClick={stopRecording} className="text-destructive h-8 w-8"><Square className="h-4 w-4 fill-destructive" /></Button>
              </div>
            )}
            {audioBlob && !isRecording && (
              <div className="flex items-center justify-between bg-accent/5 p-3 rounded-xl">
                <div className="flex items-center gap-2 text-accent font-black uppercase text-[10px]"><Play className="h-4 w-4" /> Ready</div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setAudioBlob(null)} className="h-8 px-2"><Trash2 className="h-4 w-4" /></Button>
                  <Button size="sm" onClick={handleSendVoiceNote} className="bg-accent h-8 px-4 rounded-lg text-[10px] font-bold">Send</Button>
                </div>
              </div>
            )}
            {!isRecording && !audioBlob && (
              <form onSubmit={handleSend} className="flex items-center gap-2 w-full">
                <Button type="button" size="icon" onClick={startRecording} className="h-12 w-12 rounded-xl bg-slate-50 text-primary shrink-0"><Mic className="h-5 w-5" /></Button>
                <Input placeholder="Message..." className="flex-1 h-12 bg-slate-50 border-none rounded-xl px-4 text-sm" value={input} onChange={(e) => setInput(e.target.value)} />
                <Button type="submit" size="icon" disabled={!input.trim() || isSending} className="h-12 w-12 rounded-xl bg-primary text-white shadow-md active:scale-95 transition-transform"><Send className="h-5 w-5" /></Button>
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
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <ChatContent />
    </Suspense>
  );
}
