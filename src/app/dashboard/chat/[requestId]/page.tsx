"use client";

import { useState, useMemo, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Phone, Info, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

function ChatContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const requestId = params.requestId as string;
  const role = searchParams.get('role') || 'elderly';

  // Mock participant info based on role
  const chatPartner = useMemo(() => {
    if (role === 'volunteer') {
      return { name: 'Mrs. Hapsah', image: 'https://picsum.photos/seed/user/100/100', roleName: 'Elderly' };
    }
    if (requestId === 'RQ1023') return { name: 'Sarah', image: 'https://picsum.photos/seed/volunteer2/100/100', roleName: 'Volunteer' };
    return { name: 'Ahmad', image: 'https://picsum.photos/seed/volunteer1/100/100', roleName: 'Volunteer' };
  }, [requestId, role]);

  const [messages, setMessages] = useState([
    { id: 1, sender: role === 'volunteer' ? 'partner' : 'me', text: `Hello! Regarding the request (${requestId})...`, time: '10:05 AM' },
    { id: 2, sender: role === 'volunteer' ? 'me' : 'partner', text: 'I am here to help. What do you need?', time: '10:07 AM' },
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
              <AvatarFallback>{chatPartner.name[0]}</AvatarFallback>
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
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}