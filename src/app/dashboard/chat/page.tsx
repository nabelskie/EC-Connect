
"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ChevronRight, ArrowLeft, MessageSquare, Loader2, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState, useEffect } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

/** Achievement helper for shared display */
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
  if (role !== 'volunteer') return "ring-2 ring-slate-100";
  if (level >= 100) return "ring-2 ring-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]";
  if (level >= 50) return "ring-2 ring-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.3)]";
  if (level >= 20) return "ring-2 ring-slate-400 shadow-[0_0_5px_rgba(148,163,184,0.2)]";
  if (level >= 10) return "ring-2 ring-amber-600 shadow-[0_0_5px_rgba(217,119,6,0.1)]";
  return "ring-2 ring-slate-100";
}

/**
 * Optimized Avatar component that fetches the LATEST profile information.
 * This ensures updates to profile pictures and achievement levels are reflected.
 */
function ChatPartnerAvatar({ partnerId, partnerName, photoURL }: { partnerId: string; partnerName: string; photoURL?: string }) {
  const db = useFirestore();
  const partnerRef = useMemoFirebase(() => partnerId ? doc(db, 'users', partnerId) : null, [db, partnerId]);
  const { data: partnerProfile } = useDoc(partnerRef);
  
  // Fetch completed tasks to show achievement border even for non-volunteer viewers
  const completedQuery = useMemoFirebase(() => {
    if (!partnerId || partnerProfile?.role !== 'volunteer') return null;
    return query(collection(db, 'assistance_requests_completed'), where('assignedVolunteerId', '==', partnerId));
  }, [db, partnerId, partnerProfile?.role]);
  
  const { data: completedTasks } = useCollection(completedQuery);
  
  const partnerLevel = useMemo(() => getLevel(completedTasks?.length || 0), [completedTasks]);
  const borderClass = useMemo(() => getAchievementClasses(partnerLevel, partnerProfile?.role), [partnerLevel, partnerProfile?.role]);

  const finalPhoto = partnerProfile?.photoURL || photoURL || `https://picsum.photos/seed/${partnerId}/100/100`;

  return (
    <div className="relative">
      <Avatar className={cn("h-14 w-14 transition-transform active:scale-95", borderClass)}>
        <AvatarImage src={finalPhoto} className="object-cover" />
        <AvatarFallback>{partnerName?.[0] || 'U'}</AvatarFallback>
      </Avatar>
      {partnerProfile?.role === 'volunteer' && partnerLevel > 1 && (
        <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-primary text-white text-[8px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-sm">
          {partnerLevel}
        </div>
      )}
    </div>
  );
}

function ChatInboxContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const role = searchParams.get('role') || 'elderly';
  const db = useFirestore();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const chatRoomsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'chat_rooms'),
      where('participantUserIds', 'array-contains', user.uid)
    );
  }, [db, user]);

  const { data: chatRooms, isLoading, error } = useCollection(chatRoomsQuery);

  const sortedChatRooms = useMemo(() => {
    if (!chatRooms) return [];
    
    const filtered = chatRooms.filter(chat => {
      const partnerName = role === 'volunteer' ? chat.residentName : chat.volunteerName;
      if (!partnerName) return true;
      return partnerName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return [...filtered].sort((a, b) => {
      const timeA = a.lastMessageAt?.toMillis?.() || 0;
      const timeB = b.lastMessageAt?.toMillis?.() || 0;
      return timeB - timeA;
    });
  }, [chatRooms, searchTerm, role]);

  const backHref = role === 'admin' ? '/dashboard/admin' : role === 'volunteer' ? '/dashboard/volunteer' : '/dashboard/elderly';

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest">Preparing messages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-2">
          <Link 
            href={`${backHref}?role=${role}`} 
            className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors active:scale-90"
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="space-y-3 px-2 pb-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading conversations...</p>
            </div>
          ) : (
            <>
              {sortedChatRooms.map((chat) => {
                const isVolunteerRole = role === 'volunteer';
                const partnerName = isVolunteerRole ? chat.residentName : chat.volunteerName;
                const partnerPhoto = isVolunteerRole ? chat.residentPhotoURL : chat.volunteerPhotoURL;
                const partnerRole = isVolunteerRole ? 'Elderly' : 'Volunteer';
                const partnerId = chat.participantUserIds?.find((id: string) => id !== user?.uid) || '';
                const isUnread = chat.lastMessageSenderId && chat.lastMessageSenderId !== user?.uid;
                
                return (
                  <Link key={chat.id} href={`/dashboard/chat/room?requestId=${chat.id}&role=${role}`}>
                    <Card className={`border-none shadow-sm rounded-3xl overflow-hidden active:bg-slate-50 transition-all mb-3 ${isUnread ? 'bg-accent/5 ring-1 ring-accent/10' : 'bg-white'}`}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <ChatPartnerAvatar partnerId={partnerId} partnerName={partnerName || 'User'} photoURL={partnerPhoto} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className={`truncate ${isUnread ? 'font-black text-primary' : 'font-bold text-primary/80'}`}>{partnerName || "User"}</span>
                              <Badge variant="outline" className="text-[8px] h-4 px-1 leading-none uppercase shrink-0">
                                {partnerRole}
                              </Badge>
                            </div>
                            <span className={`text-[10px] font-semibold shrink-0 ${isUnread ? 'text-accent' : 'text-muted-foreground'}`}>
                              {chat.lastMessageAt?.toDate?.() ? chat.lastMessageAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                            </span>
                          </div>
                          <p className={`text-sm truncate ${isUnread ? 'text-primary font-bold' : 'text-muted-foreground font-medium'}`}>
                            {chat.lastMessageSnippet || "No messages yet"}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <ChevronRight className={`h-5 w-5 ${isUnread ? 'text-accent' : 'text-muted-foreground/30'}`} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}

              {sortedChatRooms.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 mx-2">
                  <div className="p-4 bg-slate-50 rounded-full">
                    <MessageSquare className="h-10 w-10 text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-primary">No Chats Available</p>
                    <p className="text-xs text-muted-foreground max-w-[220px] mx-auto leading-relaxed">
                      {searchTerm 
                        ? "No conversations match your search." 
                        : (role === 'volunteer' ? "Accept a request to start a conversation." : "Wait for a volunteer to accept your request.")
                      }
                    </p>
                  </div>
                </div>
              )}
            </>
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
