'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Trash2, 
  Cpu, 
  MessageSquare
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface OracleChatBoxProps {
  eventTitle: string;
  eventDescription: string;
  category?: string;
}

const QUICK_PROMPTS = [
  'What happened last time this occurred?',
  'What are the strongest historical precedents?',
  'What unexpected catalyst could flip this?',
  'Summarize the biggest black swan risk.',
];

export function OracleChatBox({ eventTitle, eventDescription, category }: OracleChatBoxProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Greetings Oracle Hunter. I have ingested telemetry for "${eventTitle.slice(0, 60)}...". Ask me any statistical or predictive question to refine your stance.`,
    },
  ]);
  const [inputQuestion, setInputQuestion] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuestion.trim();
    if (!query || isStreaming) return;

    setInputQuestion('');

    const userMessage: Message = {
      id: `user-${crypto.randomUUID()}`,
      role: 'user',
      content: query,
    };

    const assistantMessageId = `assistant-${crypto.randomUUID()}`;
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
    };

    setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);
    setIsStreaming(true);

    try {
      const response = await fetch('/api/oracle-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          eventTitle,
          eventDescription,
          category,
          history: messages.slice(-6),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to connect to Oracle Stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText = accumulatedText + chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: accumulatedText } : msg
          )
        );
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  '⚡ [Oracle Offline] Unable to stream live response at this moment. Historical benchmark convergence remains estimated at ~78%.',
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Chat session reset. Ready for your follow-up queries on "${eventTitle.slice(0, 60)}...".`,
      },
    ]);
  };

  return (
    <div className="border-3 border-black bg-white rounded-sm shadow-[4px_4px_0px_#000000] mt-6 overflow-hidden">
      <div className="py-3 px-5 border-b-3 border-black bg-[#8A2BE2] text-white flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-sm bg-[#F5FF00] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000000]">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black uppercase text-white tracking-wide">Ask the Oracle Agent</h3>
              <Badge variant="cyan" className="font-mono text-[9px]">
                STREAMING AI
              </Badge>
            </div>
            <p className="text-[11px] text-purple-200 font-bold font-mono">
              Real-Time Event Deep Dive & Historical Precedents
            </p>
          </div>
        </div>

        {messages.length > 1 && (
          <Button
            size="xs"
            variant="destructive"
            onClick={handleClearChat}
            className="font-mono text-xs"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
          </Button>
        )}
      </div>

      <div className="p-6 space-y-4 bg-[#FFFDF0]">
        {/* Messages Stream Container */}
        <div className="space-y-3.5 max-h-80 min-h-[140px] overflow-y-auto pr-2">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={`flex items-start gap-2.5 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-sm bg-[#8A2BE2] border-2 border-black flex items-center justify-center text-white shrink-0 mt-0.5 shadow-[2px_2px_0px_#000000]">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-sm border-2 border-black px-4 py-2.5 text-xs sm:text-sm font-bold leading-relaxed shadow-[3px_3px_0px_#000000] ${
                    msg.role === 'user'
                      ? 'bg-[#00F0FF] text-black'
                      : 'bg-white text-black'
                  }`}
                >
                  <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
                  {msg.role === 'assistant' && isStreaming && msg.id === messages[messages.length - 1]?.id && (
                    <span className="inline-block w-2 h-4 ml-1 bg-black animate-pulse align-middle" />
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="h-7 w-7 rounded-sm bg-[#FF3EA5] border-2 border-black flex items-center justify-center text-white shrink-0 mt-0.5 shadow-[2px_2px_0px_#000000]">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t-2 border-black">
          <span className="text-[11px] font-black uppercase text-black mr-1 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-[#8A2BE2]" /> Quick Ask:
          </span>
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              type="button"
              disabled={isStreaming}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-sm bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000000] hover:bg-[#F5FF00] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-1"
        >
          <div className="relative flex-1">
            <Input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              disabled={isStreaming}
              placeholder="Ask a follow-up question regarding historical precedents or risk factors..."
              className="bg-white border-3 border-black text-black placeholder:text-slate-500 text-xs sm:text-sm h-11 pr-10 font-bold"
            />
          </div>

          <Button
            type="submit"
            disabled={!inputQuestion.trim() || isStreaming}
            className="h-11 px-5 border-3 border-black bg-[#F5FF00] text-black font-black font-mono text-xs shadow-[3px_3px_0px_#000000] shrink-0"
          >
            {isStreaming ? (
              <Cpu className="h-4 w-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-1.5">
                Send <Send className="h-3.5 w-3.5" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

