"use client";

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Phone, Info, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const params = useParams();
  const requestId = params.requestId as string;

  // Mock conversation data based on ID
  const volunteerInfo = useMemo(() => {
    if (requestId === 'RQ1023') return { name: 'Sarah', image: 'https://picsum.photos/seed/volunteer2/100/100' };
    if (requestId === 'RQ1022') return { name: 'Jason', image: 'https://picsum.photos/seed/volunteer3/100/100' };
    return { name: 'Ahmad', image: 'https://picsum.photos/seed/volunteer1/100/100' };
  }, [requestId]);

  const [messages, setMessages] = useState([
    { id: 1, sender: 'volunteer', text: `Hello Mrs. Hapsah! I have accepted your request (${requestId}).`, time: '10:05 AM' },
    { id: 2, sender: 'elderly', text: 'Thank you. Can you please help me with the details?', time: '10:07 AM' },
    { id: 3, sender: 'volunteer', text: 'Sure thing! I am ready to help.', time: '10:08 AM' },
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
    <div className="h-screen-dvh flex flex-col bg-background">
      <Card className="flex-1 flex flex-col border-none shadow-none md:shadow-2xl overflow-hidden bg-white rounded-none md:rounded-3xl md:m-4">
        <CardHeader className="bg-primary text-white border-b px-4 py-3 md:px-6 md:py-4 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <Link 
              href="/chat" 
              className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 group"
            >
              <ArrowLeft className="h-6 w-6 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-bold hidden sm:inline">Back</span>
            </Link>
            <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-white/20">
              <AvatarImage src={volunteerInfo.image} />
              <AvatarFallback>{volunteerInfo.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg md:text-xl font-headline font-bold">{volunteerInfo.name}</CardTitle>
              <div className="text-[10px] md:text-xs text-white/70 flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-emerald-400"></div> Online
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-9 w-9 md:h-11 md:w-11">
              <Phone className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-9 w-9 md:h-11 md:w-11">
              <Info className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden bg-[#f0f2f5] relative">
          <ScrollArea className="h-full p-4 md:p-6">
            <div className="space-y-4 md:space-y-6">
              <div className="text-center">
                <span className="bg-white/50 backdrop-blur-sm text-muted-foreground text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">Today</span>
              </div>
              
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'elderly' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] md:max-w-[80%] flex flex-col ${msg.sender === 'elderly' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 md:p-4 rounded-2xl shadow-sm text-base md:text-lg leading-relaxed ${
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

        <CardFooter className="p-3 md:p-4 bg-white border-t safe-area-bottom shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2 md:gap-3 w-full"
          >
            <Input 
              placeholder="Type your message..." 
              className="flex-1 h-12 md:h-14 text-base md:text-lg bg-slate-50 border-none focus-visible:ring-accent rounded-2xl px-4 md:px-6"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg"
            >
              <Send className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </form>
        </CardFooter>
      </Card>
      <div className="hidden md:flex mb-4 items-center justify-center gap-6 text-sm text-muted-foreground font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          End-to-end encrypted
        </div>
      </div>
    </div>
  );
}
