"use client"

import React, { useEffect, useRef, useState } from "react"
import { Bot, Send, X, Minimize2, Maximize2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const STARTER_QUESTIONS = [
  "How much cement do I need for a 10×8m slab?",
  "What's the best roofing material for a wet climate?",
  "How do I reduce material costs on my house build?",
  "What does a standard estimate include?",
]

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
        AI
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"
  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isUser ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}`}>
        {isUser ? "You" : "AI"}
      </div>
      <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted text-foreground"}`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={`mt-1 text-[10px] ${isUser ? "text-primary-foreground/60" : "text-muted-foreground/70"}`}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  )
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimised, setIsMinimised] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm BuildCalc AI 👷 Ask me anything about construction materials, project costs, or building best practices.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && !isMinimised) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading, isOpen, isMinimised])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimised) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimised])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    const userMessage: Message = { role: "user", content: trimmed, timestamp: new Date() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json() as { message?: string; error?: string }
      const reply = data.message || "Sorry, I couldn't get a response right now. Please try again."

      const assistantMessage: Message = { role: "assistant", content: reply, timestamp: new Date() }
      setMessages(prev => [...prev, assistantMessage])

      // Increment unread count if chat is minimised or closed
      if (!isOpen || isMinimised) {
        setUnread(prev => prev + 1)
      }
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Connection error. Please check your internet and try again.",
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    setIsMinimised(false)
    setUnread(0)
  }

  const handleClose = () => {
    setIsOpen(false)
    setUnread(0)
  }

  const handleClear = () => {
    setMessages([{
      role: "assistant",
      content: "Chat cleared. How can I help you with your construction project?",
      timestamp: new Date(),
    }])
  }

  return (
    <>
      {/* ── Floating button ──────────────────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-all duration-200 hover:scale-110 hover:shadow-primary/30 focus:outline-none"
          aria-label="Open AI chat"
        >
          <Bot className="h-6 w-6" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unread}
            </span>
          )}
        </button>
      )}

      {/* ── Chat window ──────────────────────────────────────────────────── */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl border border-border bg-background shadow-2xl transition-all duration-300 ${isMinimised ? "h-14 w-80 overflow-hidden" : "h-[560px] w-[380px] sm:w-[420px]"}`}>

          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 rounded-t-2xl bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-none">BuildCalc AI</p>
              <p className="text-[11px] text-primary-foreground/70 mt-0.5">Construction assistant</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-primary-foreground/20 transition-colors"
                title="Clear chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsMinimised(v => !v)}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-primary-foreground/20 transition-colors"
                title={isMinimised ? "Expand" : "Minimise"}
              >
                {isMinimised ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={handleClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-primary-foreground/20 transition-colors"
                title="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {!isMinimised && (
            <>
              {/* Message list */}
              <ScrollArea className="flex-1 px-4 py-3">
                <div className="space-y-4">
                  {messages.map((message, i) => (
                    <MessageBubble key={i} message={message} />
                  ))}
                  {isLoading && <TypingIndicator />}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>

              {/* Starter chips — only shown when only the welcome message exists */}
              {messages.length === 1 && (
                <div className="shrink-0 flex flex-wrap gap-2 border-t border-border px-4 py-3">
                  {STARTER_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => void sendMessage(q)}
                      className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs text-primary hover:bg-primary/10 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input row */}
              <div className="shrink-0 flex items-center gap-2 border-t border-border bg-background/95 px-3 py-3 rounded-b-2xl">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(input) } }}
                  placeholder="Ask about materials, costs, plans…"
                  disabled={isLoading}
                  className="h-10 flex-1 rounded-xl border-border bg-muted/50 text-sm focus-visible:ring-primary"
                />
                <Button
                  size="icon"
                  onClick={() => void sendMessage(input)}
                  disabled={isLoading || !input.trim()}
                  className="h-10 w-10 shrink-0 rounded-xl"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
