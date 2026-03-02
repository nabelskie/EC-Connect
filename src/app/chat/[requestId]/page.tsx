"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Phone, Info, MoreVertical, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'volunteer', text: 'Hello Mrs. Hapsah! I have accepted your grocery request.', time: '10:05 AM' },
    { id: 2, sender: 'elderly', text: 'Thank you Ahmad. Can you please buy 1kg of brown rice?', time: '10:07 AM' },
    { id: 3, sender: 'volunteer', text: 'Sure thing! Any specific brand you prefer?', time: '10:08 AM' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { 
      id: messages.length + 1, 
      sender: 'elderly', 
      text: input, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <Card className="flex-1 flex flex-col border-none shadow-2xl overflow-hidden bg-white rounded-3xl">
        <CardHeader className="bg-primary text-white border-b px-6 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/elderly" className="md:hidden">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <Avatar className="h-12 w-12 border-2 border-white/20">
              <AvatarImage src="https://picsum.photos/seed/volunteer/100/100" />
              <AvatarFallback>AV</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl font-headline font-bold">Ahmad (Volunteer)</CardTitle>
              <div className="text-sm text-white/70 flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-emerald-400"></div> Online
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-11 w-11">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-11 w-11">
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden bg-[#f0f2f5] relative">
          <ScrollArea className="h-full p-6">
            <div className="space-y-6">
              <div className="text-center">
                <span className="bg-white/50 backdrop-blur-sm text-muted-foreground text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">Today</span>
              </div>
              
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'elderly' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] flex flex-col ${msg.sender === 'elderly' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 rounded-2xl shadow-sm text-lg leading-relaxed ${
                      msg.sender === 'elderly' 
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

        <CardFooter className="p-4 bg-white border-t">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-3 w-full"
          >
            <Input 
              placeholder="Type your message here..." 
              className="flex-1 h-14 text-lg bg-slate-50 border-none focus-visible:ring-accent rounded-2xl px-6"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg"
            >
              <Send className="h-6 w-6" />
            </Button>
          </form>
        </CardFooter>
      </Card>
      <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          End-to-end encrypted
        </div>
      </div>
    </div>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}