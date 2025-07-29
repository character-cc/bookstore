"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MessageCircle, X, Send, Bot, Minus } from "lucide-react"
import { GoogleGenerativeAI } from "@google/generative-ai"
import ReactMarkdown from "react-markdown"

const GEMINI_API_KEY = ""

interface Message {
    id: string
    text: string
    sender: "user" | "bot"
    timestamp: Date
}

interface Book {
    isbn: string
    title: string
    price: number
    images: string[]
    authors: Array<{ id: number; name: string }>
    categories: Array<{ id: number; name: string }>
}

interface Discount {
    code: string
    description: string
}

const INITIAL_MESSAGES: Message[] = [
    {
        id: "1",
        text: "Xin chào! Tôi là trợ lý AI tư vấn sách. Tôi có thể giúp bạn tìm sách, tư vấn về giá cả, khuyến mãi và các thông tin khác. Bạn cần hỗ trợ gì?",
        sender: "bot",
        timestamp: new Date(),
    },
]

export default function GeminiChatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
    const [inputValue, setInputValue] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [books, setBooks] = useState<Book[]>([])
    const [discounts, setDiscounts] = useState<Discount[]>([])

    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const fetchBooksAndDiscounts = async () => {
        try {
            const responseBook = await fetch("/api/books")
            const dataBook = await responseBook.json()
            setBooks(dataBook || [])
            const responseDiscounts = await fetch("/api/discounts/public")
            const dataDiscounts = await responseDiscounts.json()
            setDiscounts(dataDiscounts || [])

            console.log(dataDiscounts)
            console.log(dataBook)
        } catch (error) {
            console.error("Error fetching data:", error)
            setBooks([
                {
                    isbn: "9786043312676",
                    title: "Clean Code",
                    price: 290000,
                    images: ["http://localhost/api/uploads/ce65e430-afde-4d54-9fed-751bb8e5f690.jpg"],
                    authors: [{ id: 1, name: "Robert C. Martin" }],
                    categories: [{ id: 1, name: "Lập trình" }],
                },
            ])
            setDiscounts([{ code: "SUMMER10", description: "Giảm 10% cho tất cả sách" }])
        }
    }

    useEffect(() => {
        fetchBooksAndDiscounts()
    }, [])

    const getSystemPrompt = (): string => {
        const booksPrompt = books.map((b) => JSON.stringify(b, null, 2)).join("\n\n")
        const discountPrompt = JSON.stringify(discounts, null, 2)

        return `Bạn là trợ lý tư vấn sách thông minh và thân thiện của cửa hàng sách online. 
Hãy trả lời ngắn gọn, nhiệt tình và hữu ích (1-3 câu). 
Sử dụng dữ liệu sau để tư vấn chính xác:

DANH SÁCH SÁCH HIỆN CÓ:
${booksPrompt}

MÃ GIẢM GIÁ HIỆN TẠI:
${discountPrompt}

HƯỚNG DẪN TRẢ LỜI:
- Nếu hỏi về sách cụ thể: đưa ra thông tin chi tiết và LUÔN bao gồm:
  * Tên sách, giá, tác giả, mô tả
  * Hình ảnh: ![Tên sách](đường_dẫn_hình_ảnh)
  * Link chi tiết: [Xem chi tiết sách](http://localhost/books/{id}/detail)
  * Ví dụ format trả lời:
    "📚 **Clean Code** - 290.000đ
    Tác giả: Robert C. Martin
    
    ![Clean Code](https://example.com/image.jpg)
    
    Đây là cuốn sách tuyệt vời về lập trình sạch...
    
    👉 [Xem chi tiết sách](http://localhost/books/1/detail)"

- Nếu đề xuất nhiều sách: liệt kê từng cuốn với format trên
- Nếu hỏi về giảm giá/khuyến mãi: đề xuất mã phù hợp và cách sử dụng
- Nếu hỏi về giao hàng: "Giao hàng 1-3 ngày làm việc, miễn phí vận chuyển cho đơn từ 200.000đ"
- Nếu hỏi về đơn hàng: "Bạn có thể kiểm tra trong mục 'Đơn hàng của tôi' hoặc liên hệ hotline 1900-xxxx"
- Nếu hỏi về thanh toán: "Chúng tôi hỗ trợ thanh toán COD, chuyển khoản, và các ví điện tử"
- Nếu không có sách phù hợp: gợi ý sách tương tự hoặc hỏi thêm về sở thích
- Luôn thân thiện, nhiệt tình và sẵn sàng hỗ trợ thêm
- Sử dụng emoji phù hợp để tạo cảm giác thân thiện

LƯU Ý QUAN TRỌNG:
- Khi đề cập đến sách, LUÔN sử dụng id từ dữ liệu để tạo link: http://localhost/books/{id}/detail
- Hình ảnh lấy từ trường images[0] trong dữ liệu sách
- Format markdown để hiển thị đẹp: **tên sách**, ![alt](src), [text](link)

Trả lời bằng tiếng Việt tự nhiên và dễ hiểu.`
    }

    const getAIResponse = async (userMessage: string): Promise<string> => {
        try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

            const result = await model.generateContent([{ text: getSystemPrompt() }, { text: userMessage }])

            const response = await result.response
            const text = response.text()

            if (!text || text.trim() === "") {
                throw new Error("Empty response from AI")
            }

            return text
        } catch (error) {
            console.error("Gemini AI Error:", error)

            if (error.message?.includes("API_KEY")) {
                return "❌ Lỗi xác thực API. Vui lòng kiểm tra lại cấu hình."
            } else if (error.message?.includes("quota")) {
                return "⚠️ Đã vượt quá giới hạn API. Vui lòng thử lại sau hoặc liên hệ hotline 1900-xxxx."
            } else {
                return "😅 Xin lỗi, tôi đang gặp chút vấn đề kỹ thuật. Vui lòng thử lại sau hoặc liên hệ hotline 1900-xxxx để được hỗ trợ trực tiếp."
            }
        }
    }

    const sendMessage = async (text: string) => {
        if (!text.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            text: text.trim(),
            sender: "user",
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInputValue("")
        setIsTyping(true)

        try {
            const botResponse = await getAIResponse(text)

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponse,
                sender: "bot",
                timestamp: new Date(),
            }

            setMessages((prev) => [...prev, botMessage])
        } catch (error) {
            console.error("Send message error:", error)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "😔 Xin lỗi, có lỗi xảy ra khi xử lý tin nhắn. Vui lòng thử lại sau.",
                sender: "bot",
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsTyping(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        sendMessage(inputValue)
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const resetChat = () => {
        setMessages(INITIAL_MESSAGES)
    }

    if (!isOpen) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-200 hover:scale-105"
                    size="icon"
                >
                    <MessageCircle className="h-5 w-5 text-white" />
                </Button>
            </div>
        )
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Card className={`w-96 shadow-xl border transition-all duration-300 ${isMinimized ? "h-12" : "h-[32rem]"}`}>
                {/* Header */}
                <CardHeader className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4" />
                            <span className="text-sm font-medium">AI Tư vấn sách</span>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="AI đang hoạt động"></div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-white hover:bg-blue-800 transition-colors"
                                onClick={() => setIsMinimized(!isMinimized)}
                                title={isMinimized ? "Mở rộng" : "Thu nhỏ"}
                            >
                                <Minus className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-white hover:bg-blue-800 transition-colors"
                                onClick={() => setIsOpen(false)}
                                title="Đóng"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {!isMinimized && (
                    <>
                        {/* Messages */}
                        <CardContent className="p-0 h-80 overflow-y-auto bg-gray-50">
                            <div className="p-3 space-y-3">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                                                message.sender === "user"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-white text-gray-800 border border-gray-200"
                                            }`}
                                        >
                                            <div className="prose prose-sm max-w-none">
                                                {message.sender === "bot" ? (
                                                    <ReactMarkdown
                                                        components={{
                                                            img: ({ src, alt }) => (
                                                                <img
                                                                    src={src || "/placeholder.svg"}
                                                                    alt={alt || ""}
                                                                    className="max-w-32 h-auto rounded-lg my-2 border shadow-sm block"
                                                                    style={{ maxWidth: "128px", minWidth: "80px" }}
                                                                    // onError={(e) => {
                                                                    //     e.currentTarget.src = "/placeholder.svg?height=120&width=80"
                                                                    // }}
                                                                />
                                                            ),
                                                            a: ({ href, children }) => (
                                                                <a
                                                                    href={href}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                                                                >
                                                                    {children}
                                                                </a>
                                                            ),
                                                            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                        }}
                                                    >
                                                        {message.text}
                                                    </ReactMarkdown>
                                                ) : (
                                                    <p className="whitespace-pre-wrap">{message.text}</p>
                                                )}
                                            </div>
                                            <p className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                                                {formatTime(message.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 max-w-[75%] shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <Bot className="h-3 w-3 text-blue-600" />
                                                <div className="flex space-x-1">
                                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                                                    <div
                                                        className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                                                        style={{ animationDelay: "0.1s" }}
                                                    ></div>
                                                    <div
                                                        className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                                                        style={{ animationDelay: "0.2s" }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-500">AI đang suy nghĩ...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        </CardContent>

                        {/* Input */}
                        <div className="p-3 border-t bg-white rounded-b-lg">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Hỏi AI về sách, giá, khuyến mãi..."
                                    className="flex-1 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    disabled={isTyping}
                                    maxLength={500}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="h-9 w-9 bg-blue-600 hover:bg-blue-700 transition-colors"
                                    disabled={!inputValue.trim() || isTyping}
                                    title="Gửi tin nhắn"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>

                            <div className="flex gap-1 mt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-gray-500 hover:text-blue-600 p-1 h-auto"
                                    onClick={resetChat}
                                    disabled={isTyping}
                                >
                                    Làm mới
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-gray-500 hover:text-blue-600 p-1 h-auto"
                                    onClick={() => sendMessage("Có những sách gì hay?")}
                                    disabled={isTyping}
                                >
                                    Sách hay
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-gray-500 hover:text-blue-600 p-1 h-auto"
                                    onClick={() => sendMessage("Có khuyến mãi gì không?")}
                                    disabled={isTyping}
                                >
                                    Khuyến mãi
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </Card>
        </div>
    )
}
