'use client';

import * as React from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, X, Send, Sparkles, ExternalLink, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageSuggestion {
  title: string;
  href: string;
  description?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedPages?: PageSuggestion[];
  isStreaming?: boolean;
}

const suggestedQuestions = [
  { text: "Key skills", fullText: "What are Amine's key skills?" },
  { text: "Experience", fullText: "Tell me about Amine's experience at Intelswift" },
  { text: "Projects", fullText: "What projects has Amine worked on?" },
  { text: "Technologies", fullText: "What technologies does Amine specialize in?" },
];

export function Copilot() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hey! 👋 I'm **Amine Buddy**, your guide to Amine's portfolio.\n\nAsk me about his skills, experience, or projects!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, userMessage, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/rag-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) throw new Error('Failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let content = '';
      let pages: PageSuggestion[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'chunk' && data.content) {
                  content += data.content;
                  setMessages(prev => prev.map(m => 
                    m.id === assistantId ? { ...m, content } : m
                  ));
                } else if (data.type === 'suggestions' && data.pages) {
                  pages = data.pages;
                }
              } catch {}
            }
          }
        }
      }

      setMessages(prev => prev.map(m => {
        if (m.id === assistantId) {
          const updated: Message = {
            ...m,
            content: content || 'Sorry, I could not generate a response.',
            isStreaming: false,
          };
          if (pages.length > 0) {
            updated.suggestedPages = pages;
          }
          return updated;
        }
        return m;
      }));
    } catch {
      setMessages(prev => prev.map(m => 
        m.id === assistantId ? { 
          ...m, 
          content: 'Sorry, something went wrong. Please try again.',
          isStreaming: false,
        } : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div
        className={cn(
          'fixed z-50 flex items-center gap-3',
          'bottom-4 right-4 md:bottom-6 md:right-6',
          'transition-all duration-200',
          isOpen && 'opacity-0 pointer-events-none'
        )}
      >
        <div className="hidden md:block bg-card border border-border rounded-full px-4 py-2 shadow-lg">
          <p className="text-sm text-foreground whitespace-nowrap flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            Ask about Amine
          </p>
        </div>
        
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
          aria-label="Open chat"
        >
          <div className="relative">
            <Bot className="h-6 w-6" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 animate-pulse" />
          </div>
        </Button>
      </div>

      {/* Chat Widget - Same for mobile and desktop */}
      <div
        className={cn(
          'fixed z-50 bg-card border border-border rounded-2xl shadow-2xl',
          'flex flex-col overflow-hidden',
          'transition-all duration-200',
          // Position & size - responsive
          'bottom-4 right-4 md:bottom-6 md:right-6',
          'w-[calc(100vw-32px)] md:w-[380px]',
          'h-[70vh] max-h-[500px] md:h-[550px] md:max-h-[calc(100vh-100px)]',
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <Sparkles className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 text-yellow-400 animate-pulse" />
            </div>
            <span className="font-semibold text-sm">Amine Buddy</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
          {/* Quick questions - only show initially */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(q.fullText); setTimeout(() => inputRef.current?.form?.requestSubmit(), 50); }}
                  className="text-xs px-2.5 py-1.5 rounded-full border border-border bg-muted/50 hover:bg-muted hover:border-primary/50 transition-colors"
                >
                  {q.text}
                </button>
              ))}
            </div>
          )}

          {/* Message list */}
          {messages.map((msg) => (
            <div key={msg.id}>
              <div className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  )}
                >
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="[&>p]:mb-1.5 [&>p:last-child]:mb-0 [&>ul]:mb-1.5 [&>ul]:list-disc [&>ul]:list-inside">
                      {msg.content ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      ) : msg.isStreaming ? (
                        <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse rounded-sm" />
                      ) : null}
                      {msg.isStreaming && msg.content && (
                        <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-0.5 rounded-sm" />
                      )}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="shrink-0 h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </div>
              
              {/* Page suggestions */}
              {msg.suggestedPages && msg.suggestedPages.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                  {msg.suggestedPages.map((page, i) => (
                    <Link
                      key={i}
                      href={page.href}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-border hover:border-primary/50 hover:bg-muted transition-colors"
                    >
                      {page.title}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && !messages.some(m => m.isStreaming && m.content) && (
            <div className="flex gap-2">
              <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-muted/30 shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="flex-1 h-10 rounded-full px-4 text-sm"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-10 w-10 rounded-full shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
