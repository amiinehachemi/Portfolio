'use client';

import * as React from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle,
  DrawerClose 
} from '@/components/ui/drawer';
import { Bot, X, Send, Sparkles, Briefcase, Code, Award, ExternalLink, ChevronDown, MessageCircle } from 'lucide-react';
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
  suggestedPages?: PageSuggestion[] | undefined;
  isStreaming?: boolean | undefined;
}

const suggestedQuestions = [
  { 
    text: "Key skills", 
    fullText: "What are Amine's key skills?",
    icon: Code,
    category: "Skills"
  },
  { 
    text: "Intelswift experience", 
    fullText: "Tell me about Amine's experience at Intelswift",
    icon: Briefcase,
    category: "Experience"
  },
  { 
    text: "Projects", 
    fullText: "What projects has Amine worked on?",
    icon: Code,
    category: "Projects"
  },
  { 
    text: "Technologies", 
    fullText: "What technologies does Amine specialize in?",
    icon: Award,
    category: "Tech Stack"
  },
];

// Reusable Message Bubble Component
function MessageBubble({ message, isMobile = false }: { message: Message; isMobile?: boolean }) {
  // Render assistant content with markdown
  const renderAssistantContent = () => {
    if (message.content) {
      return (
        <>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              code: ({ children, className }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="bg-background/50 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                ) : (
                  <code className="block bg-background/50 p-2 rounded text-xs font-mono overflow-x-auto my-2">{children}</code>
                );
              },
              pre: ({ children }) => <pre className="bg-background/50 p-2 rounded overflow-x-auto my-2">{children}</pre>,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                  {children}
                </a>
              ),
              h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h1>,
              h2: ({ children }) => <h2 className="text-sm font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0">{children}</h3>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-primary/50 pl-3 italic my-2">{children}</blockquote>
              ),
              hr: () => <hr className="border-border my-3" />,
              table: ({ children }) => (
                <div className="overflow-x-auto my-2">
                  <table className="min-w-full border-collapse text-xs">{children}</table>
                </div>
              ),
              th: ({ children }) => <th className="border border-border px-2 py-1 bg-background/50 font-semibold">{children}</th>,
              td: ({ children }) => <td className="border border-border px-2 py-1">{children}</td>,
            }}
          >
            {message.content}
          </ReactMarkdown>
          {message.isStreaming && (
            <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-1 align-text-bottom rounded-sm" />
          )}
        </>
      );
    }
    
    // Show typing cursor when streaming but no content yet
    if (message.isStreaming) {
      return (
        <span className="inline-flex items-center h-5">
          <span className="inline-block w-2 h-5 bg-primary animate-pulse rounded-sm" />
        </span>
      );
    }
    
    return null;
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          'flex gap-2',
          message.role === 'user' ? 'justify-end' : 'justify-start'
        )}
      >
        {message.role === 'assistant' && (
          <div className="flex-shrink-0 h-8 w-8 min-w-[32px] rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
        )}
        <div
          className={cn(
            'rounded-2xl text-sm leading-relaxed',
            isMobile 
              ? 'max-w-[calc(100%-48px)] px-3.5 py-2.5' 
              : 'max-w-[85%] px-3 py-2',
            message.role === 'user'
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted text-foreground rounded-bl-md',
          )}
        >
          {message.role === 'user' ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="max-w-none break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 min-h-[20px]">
              {renderAssistantContent()}
            </div>
          )}
        </div>
        {message.role === 'user' && (
          <div className="flex-shrink-0 h-8 w-8 min-w-[32px] rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-primary-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Page Suggestions Component
function PageSuggestions({ 
  pages, 
  onClose, 
  isMobile = false 
}: { 
  pages: PageSuggestion[]; 
  onClose: () => void; 
  isMobile?: boolean;
}) {
  return (
    <div className={cn(
      "flex flex-wrap gap-2",
      isMobile ? "ml-10 mr-2" : "ml-11"
    )}>
      {pages.map((page, idx) => (
        <Link
          key={idx}
          href={page.href}
          onClick={onClose}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full',
            'border border-border bg-card hover:bg-muted',
            'hover:border-primary/50 transition-all duration-200',
            'active:scale-95',
            'group',
            // Mobile: Larger touch targets (min 44px height)
            isMobile ? 'px-3.5 py-2.5 text-sm min-h-[44px]' : 'px-3 py-1.5 text-xs'
          )}
        >
          <span className="text-foreground group-hover:text-primary transition-colors">
            {page.title}
          </span>
          <ExternalLink className={cn(
            "text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0",
            isMobile ? "h-4 w-4" : "h-3 w-3"
          )} />
        </Link>
      ))}
    </div>
  );
}

// Loading Indicator Component
function LoadingIndicator({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="flex gap-2 sm:gap-3 justify-start">
      <div className={cn(
        "flex-shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/10",
        isMobile ? "h-8 w-8 min-w-[32px]" : "h-8 w-8"
      )}>
        <Bot className={cn("text-primary", isMobile ? "h-4 w-4" : "h-4 w-4")} />
      </div>
      <div className={cn("bg-muted rounded-2xl rounded-bl-md", isMobile ? "px-4 py-3" : "px-4 py-2")}>
        <div className="flex gap-1.5">
          <div className={cn("bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]", isMobile ? "h-2 w-2" : "h-2 w-2")} />
          <div className={cn("bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]", isMobile ? "h-2 w-2" : "h-2 w-2")} />
          <div className={cn("bg-muted-foreground/60 rounded-full animate-bounce", isMobile ? "h-2 w-2" : "h-2 w-2")} />
        </div>
      </div>
    </div>
  );
}

// Suggested Questions Component
function SuggestedQuestions({ 
  onSelect, 
  isMobile = false 
}: { 
  onSelect: (text: string) => void; 
  isMobile?: boolean;
}) {
  return (
    <div className="space-y-3 mb-4">
      <p className={cn(
        "font-medium text-muted-foreground px-1",
        isMobile ? "text-sm" : "text-xs"
      )}>
        Quick questions:
      </p>
      <div className={cn(
        "gap-2",
        // Mobile: Single column on very small screens, 2 cols on larger mobile
        isMobile 
          ? "grid grid-cols-1 min-[360px]:grid-cols-2" 
          : "flex flex-wrap gap-1.5"
      )}>
        {suggestedQuestions.map((suggestion, idx) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelect(suggestion.fullText)}
              className={cn(
                'text-left rounded-xl border border-border bg-muted/50',
                'hover:bg-muted hover:border-primary/50',
                'active:scale-[0.98] active:bg-muted',
                'transition-all duration-200',
                'flex items-center gap-2',
                'group',
                // Mobile: Proper touch targets (min 44px height)
                isMobile 
                  ? 'px-3 py-3 text-sm min-h-[52px]' 
                  : 'px-2.5 py-1.5 text-xs rounded-md'
              )}
            >
              <div className={cn(
                "rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0",
                isMobile ? "p-2" : "p-1"
              )}>
                <Icon className={cn(
                  "text-primary shrink-0 group-hover:scale-110 transition-transform",
                  isMobile ? "h-4 w-4" : "h-3 w-3"
                )} />
              </div>
              <span className="text-foreground group-hover:text-primary transition-colors leading-tight">
                {suggestion.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Mobile Input Component with keyboard handling
function MobileInputArea({
  input,
  setInput,
  isLoading,
  onSubmit,
  inputRef,
}: {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [keyboardOpen, setKeyboardOpen] = React.useState(false);
  const inputAreaRef = React.useRef<HTMLDivElement>(null);

  // Detect keyboard open/close via viewport changes
  React.useEffect(() => {
    const handleResize = () => {
      // On iOS/Android, when keyboard opens, the visual viewport height decreases
      if (typeof window !== 'undefined' && window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        // If visual viewport is significantly smaller than window, keyboard is likely open
        setKeyboardOpen(viewportHeight < windowHeight * 0.75);
      }
    };

    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport?.removeEventListener('resize', handleResize);
    }
    return undefined;
  }, []);

  // Scroll input into view when keyboard opens
  React.useEffect(() => {
    if (keyboardOpen && inputAreaRef.current) {
      // Small delay to let the keyboard finish appearing
      setTimeout(() => {
        inputAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [keyboardOpen]);

  return (
    <div 
      ref={inputAreaRef}
      className={cn(
        "shrink-0 border-t border-border bg-background/95 backdrop-blur-sm",
        "px-3 pt-3",
        // Dynamic bottom padding: more when keyboard is closed (for home indicator)
        keyboardOpen ? "pb-2" : "pb-[max(12px,env(safe-area-inset-bottom))]"
      )}
    >
      <form onSubmit={onSubmit} className="flex gap-2 items-center">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Amine..."
          disabled={isLoading}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="sentences"
          enterKeyHint="send"
          className={cn(
            "flex-1 h-12 text-base rounded-full px-4",
            "bg-muted border-0",
            "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0",
            "placeholder:text-muted-foreground/70"
          )}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          size="icon"
          className={cn(
            "h-12 w-12 rounded-full shrink-0",
            "active:scale-95 transition-transform",
            !input.trim() && "opacity-50"
          )}
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}

export function Copilot() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hey! 👋 I'm **Amine Buddy**, your friendly guide to Amine's portfolio.

I know all about his:
- **Skills** & technologies
- **Experience** at Intelswift
- **Projects** & achievements

Whether you're a *CEO*, *recruiter*, or just exploring — ask me anything!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  
  // Refs - Always create all refs, apply them consistently
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const desktopMessagesContainerRef = React.useRef<HTMLDivElement>(null);
  const mobileMessagesContainerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const mobileInputRef = React.useRef<HTMLInputElement>(null);
  const widgetRef = React.useRef<HTMLDivElement>(null);
  const buttonContainerRef = React.useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = React.useRef(true);
  const mobileMessagesEndRef = React.useRef<HTMLDivElement>(null);

  // Detect mobile - with SSR safety
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToBottom = React.useCallback((isMobileScroll: boolean = false) => {
    if (isMobileScroll) {
      mobileMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Check if user is near the bottom (within 100px threshold)
  const isNearBottom = React.useCallback((container: HTMLDivElement | null) => {
    if (!container) return true;
    const threshold = 100;
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  }, []);

  // Handle scroll events to track if user has scrolled up
  const handleScroll = React.useCallback((isMobileScroll: boolean = false) => {
    const container = isMobileScroll ? mobileMessagesContainerRef.current : desktopMessagesContainerRef.current;
    shouldAutoScrollRef.current = isNearBottom(container);
  }, [isNearBottom]);

  // Auto-scroll on new messages
  React.useEffect(() => {
    if (shouldAutoScrollRef.current && isOpen) {
      // Small delay to ensure DOM has updated
      requestAnimationFrame(() => {
        scrollToBottom(isMobile);
      });
    }
  }, [messages, isMobile, scrollToBottom, isOpen]);

  // Focus input when opening
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (isMobile) {
          mobileInputRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, isMobile]);

  // Refocus input after loading completes
  React.useEffect(() => {
    if (!isLoading && isOpen) {
      const timer = setTimeout(() => {
        if (isMobile) {
          mobileInputRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isLoading, isOpen, isMobile]);

  // Click outside handler for desktop
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        !isMobile &&
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node) &&
        buttonContainerRef.current &&
        !buttonContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile]);

  const handleQuestionClick = (question: string) => {
    setInput(question);
    setTimeout(() => {
      handleSubmitWithQuestion(question);
    }, 100);
  };

  const handleSubmitWithQuestion = async (questionOverride?: string) => {
    const questionToSubmit = (questionOverride || input).trim();
    if (!questionToSubmit || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: questionToSubmit,
      timestamp: new Date(),
    };

    const assistantMessageId = (Date.now() + 1).toString();

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    shouldAutoScrollRef.current = true;

    const streamingMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, streamingMessage]);

    try {
      const response = await fetch('/api/rag-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionToSubmit }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let suggestedPages: PageSuggestion[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'chunk' && data.content) {
                  accumulatedContent += data.content;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                } else if (data.type === 'suggestions' && data.pages) {
                  suggestedPages = data.pages;
                } else if (data.type === 'error') {
                  throw new Error(data.message);
                }
              } catch {
                // Skip invalid JSON lines
              }
            }
          }
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: accumulatedContent || 'I apologize, but I could not generate a response. Please try rephrasing your question.',
                isStreaming: false,
                suggestedPages: suggestedPages.length > 0 ? suggestedPages : undefined,
              }
            : msg
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: 'I apologize, but I encountered an error while processing your request. Please try again, or feel free to explore the portfolio pages for more information.',
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmitWithQuestion();
  };

  // Render messages list (shared between mobile and desktop)
  const renderMessages = (isMobileView: boolean) => (
    <>
      {messages.length === 1 && (
        <SuggestedQuestions onSelect={handleQuestionClick} isMobile={isMobileView} />
      )}
      {messages.map((message) => (
        <div key={message.id} className={cn("space-y-2", isMobileView && "space-y-3")}>
          <MessageBubble message={message} isMobile={isMobileView} />
          {message.role === 'assistant' && message.suggestedPages && message.suggestedPages.length > 0 && (
            <PageSuggestions 
              pages={message.suggestedPages} 
              onClose={() => setIsOpen(false)} 
              isMobile={isMobileView}
            />
          )}
        </div>
      ))}
      {isLoading && !messages.some(m => m.isStreaming && m.content) && (
        <LoadingIndicator isMobile={isMobileView} />
      )}
    </>
  );

  return (
    <>
      {/* Floating Button with Label */}
      <div
        ref={buttonContainerRef}
        className={cn(
          'fixed z-50 flex items-center gap-3',
          'md:bottom-6 md:right-6',
          // Mobile: Account for safe area and give more space from edges
          'bottom-[max(16px,env(safe-area-inset-bottom))] right-4',
          'transition-all duration-300 ease-in-out',
          isOpen && 'opacity-0 pointer-events-none'
        )}
      >
        {/* Label - Hidden on mobile */}
        <div className="hidden md:block bg-card border border-border rounded-full px-4 py-2 shadow-lg">
          <p className="text-sm text-foreground whitespace-nowrap flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            Ask about Amine
          </p>
        </div>
        
        {/* Button - Larger touch target on mobile */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'rounded-full shadow-xl',
            'bg-primary hover:bg-primary/90 text-primary-foreground',
            'transition-all duration-300 ease-in-out',
            'hover:scale-110 active:scale-95',
            'ring-2 ring-primary/20 ring-offset-2 ring-offset-background',
            'flex-shrink-0',
            // Consistent size, meets 44px minimum touch target
            'h-14 w-14'
          )}
          aria-label="Open Amine Buddy - AI Copilot"
        >
          <div className="relative">
            <Bot className="h-6 w-6" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 animate-pulse" />
          </div>
        </Button>
      </div>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer 
          open={isOpen} 
          onOpenChange={setIsOpen}
          // Prevent drawer from closing when scrolling messages
          dismissible={true}
        >
          <DrawerContent 
            className={cn(
              "flex flex-col",
              // Use dvh for better mobile viewport handling
              "h-[85dvh] max-h-[85dvh]",
              // Prevent content overflow issues
              "overflow-hidden"
            )} 
            showHandle={true}
          >
            {/* Header - Compact, fixed */}
            <DrawerHeader className="shrink-0 border-b border-border py-2 px-3 bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <Sparkles className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 text-yellow-400 animate-pulse" />
                  </div>
                  <DrawerTitle className="text-sm font-semibold">Amine Buddy</DrawerTitle>
                </div>
                <DrawerClose asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-full active:scale-95 transition-transform -mr-1"
                    aria-label="Close chat"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            {/* Messages - Scrollable area with proper flex behavior */}
            <div 
              ref={mobileMessagesContainerRef}
              onScroll={() => handleScroll(true)}
              className={cn(
                "flex-1 overflow-y-auto overscroll-contain",
                "px-3 py-4 space-y-4",
                // Custom scrollbar hidden for cleaner look
                "no-scrollbar",
                // Ensure minimum height so content is visible
                "min-h-0"
              )}
              style={{ 
                // Prevent rubber-band scrolling from affecting the drawer
                overscrollBehavior: 'contain',
                // iOS fix for scroll container
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {/* Force re-render when messages update */}
              <div key={messages.length} className="contents">
                {renderMessages(true)}
              </div>
              {/* Scroll anchor */}
              <div ref={mobileMessagesEndRef} className="h-px" />
            </div>

            {/* Input - Fixed at bottom with safe area handling */}
            <MobileInputArea
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              inputRef={mobileInputRef}
            />
          </DrawerContent>
        </Drawer>
      )}

      {/* Desktop Chat Window */}
      {!isMobile && (
        <div
          ref={widgetRef}
          className={cn(
            'fixed bottom-6 right-6 z-50',
            'w-[400px] max-w-[calc(100vw-3rem)]',
            'h-[650px] max-h-[calc(100vh-8rem)]',
            'bg-card border border-border rounded-2xl shadow-2xl',
            'flex flex-col transition-all duration-300 ease-in-out',
            'backdrop-blur-sm',
            'overflow-hidden',
            isOpen
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-95 pointer-events-none'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50 rounded-t-2xl shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <Sparkles className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 text-yellow-400 animate-pulse" />
              </div>
              <h3 className="font-semibold text-sm">Amine Buddy</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full"
              aria-label="Close Amine Buddy"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div 
            ref={desktopMessagesContainerRef}
            onScroll={() => handleScroll(false)}
            className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar min-h-0"
          >
            {renderMessages(false)}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-muted/30 rounded-b-2xl shrink-0">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={isLoading}
                className="flex-1 rounded-full px-4"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="icon"
                className="shrink-0 rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
