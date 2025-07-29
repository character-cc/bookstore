"use client"

import { useState, useEffect } from "react"
import {Link} from "react-router"
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Truck,
    Shield,
    Users,
    Heart,
    TrendingUp,
    Sparkles,
    Copy,
    Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Category {
    id: number
    name: string
    description: string
    imageUrl: string
    parentId?: number
    isShowOnHomepage: boolean
    homepageDisplayOrder: number
    isShowOnNavigationBar: boolean
    navigationDisplayOrder: number
    bookCount: number
}

interface Discount {
    id: number
    code: string
    description: string
    discountPercentage?: number
    maxDiscountAmount?: number
    discountAmount: number
    isPercentage: boolean
    isPublic: boolean
    startDate: string
    endDate: string
    isActive: boolean
    minimumOrderAmount: number
    maxUsagePerUser: number
    totalUsageLimit?: number
    currentUsageCount: number
}

interface Author {
    id: number
    name: string
    imageUrl: string
}

interface AuthorHome {
    id: number
    author: Author
    bookCount: number
}

interface Publisher {
    id: number
    name: string
    imageUrl: string
}

interface PublisherHome {
    id: number
    publisher: Publisher
    bookCount: number
}

interface BookImage {
    imageUrl: string
}

interface Book {
    id: number
    name: string
    authors: Author[]
    originalPrice: number
    salePrice?: number
    images: BookImage[]
    MarkAsNew: boolean
    MarkAsBestseller: boolean
}

const slides = [
    {
        id: 1,
        title: "Chọn Lọc Cho Người Yêu Âm Thanh Cổ Điển",
        description: "Khám phá thế giới tri thức qua những tác phẩm kinh điển",
        image: "https://images.unsplash.com/photo-1519682577862-22b62b24e493",
    },
    {
        id: 2,
        title: "Sách Hay - Giá Tốt",
        description: "Bộ sưu tập sách đa dạng từ nhiều thể loại khác nhau",
        image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
    },
    {
        id: 3,
        title: "Giao Hàng Toàn Quốc",
        description: "Dịch vụ giao hàng nhanh chóng và đáng tin cậy",
        image: "https://thumbs.dreamstime.com/z/courier-delivering-book-package-doorstep-soft-afternoon-light-generative-ai-371817241.jpg",
    },
]



const fakeAuthors: AuthorHome[] = [
    {
        id: 1,
        author: { id: 1, name: "Nguyễn Nhật Ánh", imageUrl: "/placeholder.svg?height=150&width=150" },
        bookCount: 45,
    },
    {
        id: 2,
        author: { id: 2, name: "Dale Carnegie", imageUrl: "/placeholder.svg?height=150&width=150" },
        bookCount: 12,
    },
    {
        id: 3,
        author: { id: 3, name: "Nguyên Phong", imageUrl: "/placeholder.svg?height=150&width=150" },
        bookCount: 28,
    },
    {
        id: 4,
        author: { id: 4, name: "Trang Hạ", imageUrl: "/placeholder.svg?height=150&width=150" },
        bookCount: 18,
    },
]

const fakePublishers: PublisherHome[] = [
    {
        id: 1,
        publisher: { id: 1, name: "NXB Trẻ", imageUrl: "/placeholder.svg?height=150&width=150" },
        bookCount: 234,
    },
    {
        id: 2,
        publisher: { id: 2, name: "NXB Kim Đồng", imageUrl: "/placeholder.svg?height=150&width=150" },
        bookCount: 189,
    },
    {
        id: 3,
        publisher: { id: 3, name: "NXB Văn học", imageUrl: "/placeholder.svg?height=150&width=150" },
        bookCount: 156,
    },
    {
        id: 4,
        publisher: { id: 4, name: "NXB Lao động", imageUrl: "/placeholder.svg?height=150&width=150" },
        bookCount: 98,
    },
]

function BookCard({ book }: { book: Book }) {
    const discountPercent = book.salePrice
        ? Math.round(((book.originalPrice - book.salePrice) / book.originalPrice) * 100)
        : 0

    return (
        <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
            <div className="relative overflow-hidden">
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                    {book.MarkAsNew && (
                        <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Mới
                        </Badge>
                    )}
                    {book.MarkAsBestseller && (
                        <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Bán chạy
                        </Badge>
                    )}
                </div>

                {book.salePrice && (
                    <Badge className="absolute top-3 right-3 z-10 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
                        -{discountPercent}%
                    </Badge>
                )}

                <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                    <img
                        src={book.images.length > 0 ? book.images[0].imageUrl : "/placeholder.svg?height=240&width=180"}
                        alt={book.name}
                        className="h-full w-auto object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            </div>

            <CardContent className="p-4 flex-1">
                <div className="space-y-2">
                    <h3 className="font-bold text-gray-900 line-clamp-2 h-12 group-hover:text-blue-600 transition-colors">
                        {book.name}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">
                        {book.authors.length === 1 ? book.authors[0].name : "Nhiều tác giả"}
                    </p>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <div className="w-full space-y-3">
                    <div className="space-y-1 min-h-[60px] flex flex-col justify-end">
                        {book.salePrice ? (
                            <>
                                <div className="text-left">
                                    <span className="text-sm text-gray-500 line-through">{book.originalPrice.toLocaleString()}đ</span>
                                </div>
                                <div className="text-left">
                                    <span className="text-xl font-bold text-red-600">{book.salePrice.toLocaleString()}đ</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-left">
                                    <span className="text-sm text-transparent">placeholder</span>
                                </div>
                                <div className="text-left">
                                    <span className="text-xl font-bold text-blue-600">{book.originalPrice.toLocaleString()}đ</span>
                                </div>
                            </>
                        )}
                    </div>

                    <Link to={`/books/${book.id}/detail`} className="w-full block">
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                            Xem chi tiết
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}


function CategoryCard({ category }: { category: Category }) {
    return (
        <Link to={`/categories/${category.id}`} className="block group h-full">
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md rounded-2xl h-full flex flex-col">
                <div className="relative flex-1 flex flex-col">
                    <div className="h-32 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                        <img
                            src={category.imageUrl || "/placeholder.svg?height=128&width=400"}
                            alt={category.name}
                            className="w-full h-full object-contain bg-white"
                        />
                    </div>

                    <div className="p-6 bg-gradient-to-br from-orange-50 to-pink-50 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight">
                            {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-3">
                            {category.description}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mt-auto">
                            <BookOpen className="w-4 h-4 mr-1" />
                            {category.bookCount} sách
                        </div>
                    </div>

                    <div className="absolute top-2 right-2 opacity-20">
                        <div className="flex space-x-1">
                            <div className="w-4 h-6 bg-blue-400 rounded-sm transform rotate-12"></div>
                            <div className="w-4 h-6 bg-green-400 rounded-sm transform -rotate-6"></div>
                            <div className="w-4 h-6 bg-red-400 rounded-sm transform rotate-3"></div>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    )
}
function DiscountCard({ discount, index }: { discount: Discount; index: number }) {
    const [copied, setCopied] = useState(false)

    const colors = ["from-yellow-400 to-orange-500", "from-green-400 to-blue-500", "from-purple-400 to-pink-500"]

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(discount.code)
            setCopied(true)
            toast.success("Đã sao chép mã giảm giá!")
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast.error("Không thể sao chép mã")
        }
    }

    return (
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
            <div className={`relative h-32 bg-gradient-to-r ${colors[index % colors.length]} p-4 text-white`}>
                <div className="absolute top-2 right-2 opacity-30">
                    <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                </div>
                <div className="absolute bottom-2 left-2 opacity-20">
                    <Sparkles className="w-8 h-8" />
                </div>

                <div className="relative z-10">
                    <div className="text-xs opacity-90 mb-1">Nhập mã</div>
                    <div className="text-2xl font-bold mb-1">{discount.code}</div>
                    <div className="text-sm font-medium">Giảm {discount.isPercentage? discount.discountPercentage + "%" : discount.discountAmount.toLocaleString() + "đ"}</div>
                    <div className="text-xs opacity-90 mt-1">cho đơn từ {discount.minimumOrderAmount.toLocaleString()}đ</div>
                </div>
            </div>

            <CardContent className="p-4">
                <Button
                    onClick={copyToClipboard}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 border-2 border-dashed border-gray-300"
                    variant="outline"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4 mr-2" />
                            Đã sao chép
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4 mr-2" />
                            Sao chép mã
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}

function AuthorCard({ author }: { author: AuthorHome }) {
    return (
        <Link to={`/author/${author.id}`} className="block group">
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                <CardContent className="p-6 text-center">
                    <div className="relative mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all duration-300">
                        <img
                            src={author.author.imageUrl || "/placeholder.svg?height=96&width=96"}
                            alt={author.author.name}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{author.author.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {author.bookCount} cuốn sách
                    </p>
                </CardContent>
            </Card>
        </Link>
    )
}

function PublisherCard({ publisher }: { publisher: PublisherHome }) {
    return (
        <Link to={`/publisher/${publisher.id}`} className="block group">
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                <CardContent className="p-6 text-center">
                    <div className="relative mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full ring-4 ring-green-100 group-hover:ring-green-200 transition-all duration-300">
                        <img
                            src={publisher.publisher.imageUrl || "/placeholder.svg?height=96&width=96"}
                            alt={publisher.publisher.name}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                        {publisher.publisher.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {publisher.bookCount} cuốn sách
                    </p>
                </CardContent>
            </Card>
        </Link>
    )
}

function SectionHeader({ title, subtitle, viewAllLink }: { title: string; subtitle?: string; viewAllLink: string }) {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
                {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>
            <Button
                variant="outline"
                asChild
                className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors bg-transparent"
            >
                <Link to={viewAllLink} className="flex items-center">
                    Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    )
}

export default function BookHomePage() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [categories, setCategories] = useState<Category[]>([])
    const [authors, setAuthors] = useState<AuthorHome[]>([])
    const [publishers, setPublishers] = useState<PublisherHome[]>([])
    const [saleBooks, setSaleBooks] = useState<Book[]>([])
    const [newBooks, setNewBooks] = useState<Book[]>([])
    const [bestsellerBooks, setBestSellerBooks] = useState<Book[]>([])
    const [discounts, setDiscounts] = useState<Discount[]>([])

    // Auto slide
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        loadCategories()
        // loadAuthors()
        loadSaleBooks()
        loadNewBooks()
        loadBestSellerBooks()
        loadDiscounts()


        setAuthors(fakeAuthors)
        setPublishers(fakePublishers)

    }, [])



    const loadCategories = async () => {
      try {
        const response = await fetch("http://localhost/api/categories/show-home")
        if (!response.ok) throw new Error(response.statusText)
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error(error)
      }
    }

    const loadAuthors = async () => {
      try {
        const response = await fetch("http://localhost/api/authors/show-home?pageIndex=0&&pageSize=6")
        if (!response.ok) throw new Error(response.statusText)
        const data = await response.json()
        setAuthors(data)
      } catch (error) {
        console.error(error)
      }
    }

    const loadSaleBooks = async () => {
      try {
        const response = await fetch("http://localhost/api/books/sale/show-home?pageIndex=0&&pageSize=6")
        if (!response.ok) throw new Error(response.statusText)
        const data = await response.json()
        setSaleBooks(data)
      } catch (error) {
        console.error(error)
      }
    }

    const loadNewBooks = async () => {
      try {
        const response = await fetch("http://localhost/api/books/new/show-home?pageIndex=0&&pageSize=6")
        if (!response.ok) throw new Error(response.statusText)
        const data = await response.json()
        setNewBooks(data)
      } catch (error) {
        console.error(error)
      }
    }

    const loadBestSellerBooks = async () => {
      try {
        const response = await fetch("http://localhost/api/books/bestsellers/show-home?pageIndex=0&&pageSize=6")
        if (!response.ok) throw new Error(response.statusText)
        const data = await response.json()
        setBestSellerBooks(data)
      } catch (error) {
        console.error(error)
      }
    }

    const loadDiscounts = async () => {
      try {
        const response = await fetch("http://localhost/api/discounts/random")
        if (!response.ok) throw new Error(response.statusText)
        const data = await response.json()
        setDiscounts(data)
      } catch (error) {
        console.error(error)
      }
    }



    return (
        <main className="min-h-screen bg-white">
            {/* Simple Hero Section - No buttons */}
            <section className="relative overflow-hidden">
                <div className="relative h-[500px]">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 transition-opacity duration-1000 ${
                                index === currentSlide ? "opacity-100" : "opacity-0"
                            }`}
                        >
                            <img src={slide.image || "/placeholder.svg"} alt={slide.title} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                                <div className="container mx-auto px-4 pl-16 md:pl-24">
                                    <div className="max-w-lg text-white space-y-4">
                                        <h1 className="text-3xl md:text-4xl font-bold">{slide.title}</h1>
                                        <p className="text-lg opacity-90">{slide.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`h-2 w-2 rounded-full transition-colors ${
                                index === currentSlide ? "bg-white" : "bg-white/50"
                            }`}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>


            </section>

            <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4">
                    <SectionHeader
                        title="Danh Mục Sách"
                        subtitle="Chọn sách phù hợp theo danh mục "
                        viewAllLink="/categories"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {(categories.length < 6 ? categories : categories.slice(0, -2)).map((category) => (
                            <CategoryCard key={category.id} category={category} />
                        ))}
                    </div>
                </div>
            </section>


            {categories.length > 5 && (
                <section className="py-8">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                <CardContent className="p-8 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">{categories[categories.length - 2].name}</h3>
                                        <p className="opacity-90">{categories[categories.length - 2].description}</p>
                                    </div>
                                    <Link to={"/categories/" + categories[categories.length - 2].id }>
                                    <Button className="bg-white text-blue-700 hover:bg-gray-100">Xem Ngay</Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card className="overflow-hidden bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                                <CardContent className="p-8 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">{categories[categories.length - 1].name}</h3>
                                        <p className="opacity-90">{categories[categories.length - 1].description}</p>
                                    </div>
                                    <Link to={"/categories/" + categories[categories.length - 1].id  }>
                                    <Button className="bg-white text-purple-700 hover:bg-gray-100">Xem Ngay</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            )}


            <section className="py-16 bg-gradient-to-b from-yellow-50 to-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Mã Giảm Giá Hấp Dẫn</h2>
                        <p className="text-gray-600 text-lg">Sử dụng ngay để tiết kiệm chi phí mua sách</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {discounts.map((discount, index) => (
                            <DiscountCard key={discount.id} discount={discount} index={index} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-4">
                    <SectionHeader
                        title="Sách Mới Nhất"
                        subtitle="Những đầu sách mới nhất vừa được phát hành"
                        viewAllLink="/books/new"
                    />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {newBooks.slice(0, 5).map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
                <div className="container mx-auto px-4">
                    <SectionHeader
                        title="Sách Bán Chạy"
                        subtitle="Những cuốn sách được yêu thích nhất"
                        viewAllLink="/books/bestsellers"
                    />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {bestsellerBooks.slice(0, 5).map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-4">
                    <SectionHeader
                        title="Sách Giảm Giá"
                        subtitle="Cơ hội sở hữu sách hay với giá ưu đãi"
                        viewAllLink="/books/sale"
                    />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {saleBooks.slice(0, 5).map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                </div>
            </section>


            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Tại Sao Chọn Chúng Tôi?</h2>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            Chúng tôi cam kết mang đến trải nghiệm mua sắm sách tốt nhất cho bạn
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center group">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                                <BookOpen className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">50.000+ Đầu Sách</h3>
                            <p className="text-blue-100 leading-relaxed">
                                Thư viện khổng lồ với hàng chục nghìn đầu sách từ mọi thể loại
                            </p>
                        </div>

                        <div className="text-center group">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Shield className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Chính Hãng 100%</h3>
                            <p className="text-blue-100 leading-relaxed">
                                Cam kết sách chính hãng, chất lượng cao từ các nhà xuất bản uy tín
                            </p>
                        </div>

                        <div className="text-center group">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Truck className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Giao Hàng Nhanh</h3>
                            <p className="text-blue-100 leading-relaxed">Giao hàng toàn quốc trong 1-3 ngày, miễn phí từ 200.000đ</p>
                        </div>

                        <div className="text-center group">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Users className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Hỗ Trợ 24/7</h3>
                            <p className="text-blue-100 leading-relaxed">
                                Đội ngũ chăm sóc khách hàng tận tình, sẵn sàng hỗ trợ mọi lúc
                            </p>
                        </div>
                    </div>
                </div>
            </section>


        </main>

    )
}
