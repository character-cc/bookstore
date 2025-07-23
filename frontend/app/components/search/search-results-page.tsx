"use client"

import { useState, useEffect } from "react"
import {Link} from "react-router";
import { ArrowLeft, Grid, List, Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Select from "react-select"
import { Select as SelectUi, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface BookDetail {
    id: number
    name: string
    isbn: string
    costPrice: number
    originalPrice: number
    salePrice: number
    published: boolean
    publishedDate: string
    shortDescription: string
    fullDescription: string
    languageId: number
    languageName: string
    isGift: boolean
    pageCount: number
    inventoryManagementMethodId: number
    inventoryManagementMethodName: string
    stockQuantity: number
    lowStockThreshold: number
    markAsBestseller: boolean
    markAsNew: boolean
    isShowAsNewOnHome: boolean
    isShowAsBestsellerOnHome: boolean
    displayOrderBestseller: number
    displayOrderAsNew: number
    displayOrderAsSale: number
    createdAt: string
    updatedAt: string
    categories: Array<{
        id: number
        name: string
        description: string
        parentId: number | null
        isShowOnHomepage: boolean
        homepageDisplayOrder: number
        isShowOnNavigationBar: boolean
        navigationDisplayOrder: number
        imageUrl: string
    }>
    authors: Array<{
        id: number
        name: string
        biography: string
        imageUrl: string
    }>
    publishers: Array<{
        id: number
        name: string
        description: string
        website: string
        logoUrl: string
    }>
    images: Array<{
        id: number
        imageUrl: string
        thumbnailUrl: string
        altText: string
        title: string
    }>
    customAttributes: Array<{
        id: number
        productId: number
        name: string
        controlType: string
        tooltip: string
        values: Array<{
            id: number
            attributeId: number
            value: string
            label: string
            priceAdjustment: number
            isPreSelected: boolean
            displayOrder: number
            isVariant: boolean
        }>
    }>
}



const authors = [
    { id: 1, name: "Nam Cao" },
    { id: 2, name: "Ngô Tất Tố" },
    { id: 3, name: "Vũ Trọng Phụng" },
    { id: 5, name: "Tô Hoài" },
    { id: 6, name: "James Clear" },
]

interface SearchResultsPageProps {
    searchQuery: string
}

function BookCard({ book, searchQuery }: { book: BookDetail; searchQuery: string }) {
    return (
        <Card className="h-full">
            <div className="p-4">
                <div className="relative">
                    <img
                        src={book.images[0]?.imageUrl || "/placeholder.svg"}
                        alt={book.name}
                        className="w-full h-48 object-cover rounded mb-3"
                    />
                    {book.markAsNew && <Badge className="absolute top-2 left-2 bg-blue-500">Mới</Badge>}
                    {book.markAsBestseller && <Badge className="absolute top-2 right-2 bg-red-500">Bestseller</Badge>}
                    {book.salePrice < book.originalPrice && (
                        <Badge className="absolute bottom-2 right-2 bg-green-500">
                            -{Math.round(((book.originalPrice - book.salePrice) / book.originalPrice) * 100)}%
                        </Badge>
                    )}
                </div>
            </div>
            <CardContent className="p-4 pt-0">
                <h3 className="font-semibold mb-1 line-clamp-2">{book.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{book.authors[0]?.name || ""}</p>
                <p className="text-xs text-gray-500 mb-2">{book.publishers[0]?.name}</p>
                <div className="flex items-center gap-2">
                    {book.salePrice < book.originalPrice ? (
                        <>
                            <span className="font-bold text-primary">{book.salePrice.toLocaleString()}đ</span>
                            <span className="text-sm text-gray-500 line-through">{book.originalPrice.toLocaleString()}đ</span>
                        </>
                    ) : (
                        <span className="font-bold text-primary">{book.originalPrice.toLocaleString()}đ</span>
                    )}
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button size="sm" className="w-full" asChild>
                    <Link to={`/books/${book.id}/detail`}>Xem chi tiết</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function SearchResultsPage({ searchQuery }: SearchResultsPageProps) {
    const [books, setBooks] = useState<BookDetail[]>([])
    const [filteredBooks, setFilteredBooks] = useState<BookDetail[]>([])
    const [sortBy, setSortBy] = useState()
    const [sortDesc, setSortDesc] = useState<boolean | undefined>(undefined)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [showFilters, setShowFilters] = useState(false)

    const [selectedCategories, setSelectedCategories] = useState<number[]>([])
    const [selectedAuthors, setSelectedAuthors] = useState<number[]>([])
    const [priceRange, setPriceRange] = useState([0, 200000])
    const [onlyInStock, setOnlyInStock] = useState(false)
    const [onlyOnSale, setOnlyOnSale] = useState(false)

    const [pendingCategories, setPendingCategories] = useState<number[]>([])
    const [pendingAuthors, setPendingAuthors] = useState<number[]>([])
    const [pendingPriceRange, setPendingPriceRange] = useState([0, 2000000])
    const [pendingInStock, setPendingInStock] = useState(false)
    const [pendingOnSale, setPendingOnSale] = useState(false)

    const [categories, setCategories] = useState([])
    const [authors, setAuthors] = useState([])
    const [sortName , setSortName] = useState("relevance")

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(12)

    const [totalPages, setTotalPages] = useState(10)

    useEffect(() => {
        loadAuthors()
        loadCategories()
        loadFilteredBooks()
    },[searchQuery])

    useEffect(() => {
        loadFilteredBooks()
    }, [currentPage]);
    const loadFilteredBooks = async (sort?: string | undefined , sortD?: boolean) => {
        try {
            const response = await fetch("http://localhost/api/books/search",{
                method : "POST",
                headers : {
                    "Content-Type": "application/json",
                },
                body : JSON.stringify({
                    keyword: searchQuery,
                    categoryIds: pendingCategories,
                    authorIds : pendingAuthors,
                    minPrice: priceRange[0],
                    maxPrice: priceRange[1],
                    isSale: onlyOnSale,
                    sortBy: sort,
                    sortDesc: sortD,
                    pageIndex : currentPage - 1,
                    pageSize: itemsPerPage,

                })
            })
            if (!response.ok) {
                throw Error("Loi")
            }
            const books = await response.json()
            console.log(books)
            setFilteredBooks(books.items)
            setTotalPages(books.totalPages)
        }
        catch (error) {
            console.log(error)
        }
    }

    const loadCategories = async () => {
        try{
            const response = await fetch("http://localhost/api/categories");
            if (!response.ok) {
                throw new Error("Failed to fetch categories.");
            }
            const data = await response.json();
            console.log("categories")
            console.log(data)
            setCategories(data);
        }
        catch (error) {
            console.log(error)
        }
    }

    const loadAuthors = async () => {
        try {
            const response = await fetch("http://localhost/api/authors");
            if (!response.ok) {
                throw new Error("Failed to fetch authors.");
            }
            const data = await response.json();
            console.log(data)
            setAuthors(data);
        }
        catch (error) {
            console.log(error)
        }
    }



    const renderPageButtons = () => {
        const pages = [];
        const maxVisible = 3;

        pages.push(
            <Button
                key={1}
                variant={currentPage === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(1)}
            >
                1
            </Button>
        );

        if (currentPage > maxVisible + 2) {
            pages.push(<span key="start-ellipsis">...</span>);
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
            pages.push(
                <Button
                    key={i}
                    variant={currentPage === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i)}
                >
                    {i}
                </Button>
            );
        }

        if (currentPage < totalPages - maxVisible - 1) {
            pages.push(<span key="end-ellipsis">...</span>);
        }

        if (totalPages > 1) {
            pages.push(
                <Button
                    key={totalPages}
                    variant={currentPage === totalPages ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                >
                    {totalPages}
                </Button>
            );
        }

        return pages;
    };

    const applyFilters = () => {
        setSelectedCategories([...pendingCategories])
        setSelectedAuthors([...pendingAuthors])
        setPriceRange([...pendingPriceRange])
        setOnlyInStock(pendingInStock)
        setOnlyOnSale(pendingOnSale)

        console.log(pendingAuthors)
        console.log(pendingCategories)
        loadFilteredBooks()


    }

    const handleSort = (value: string) => {
        // setSortBy(value)
        // const sortedBooks = [...filteredBooks]
        let sort
        let sortD

        switch (value) {
            case "price-low":
                sort = "SalePrice"
                setSortName("price-low")
                break
            case "price-high":
                sort = "SalePrice"
                sortD = true
                setSortName("price-high")
                break
            case "name":
                sort = "Name"
                setSortName("name")
                break
            case "relevance":
                sort = ""
                sortD = undefined
                setSortName("relevance")
                break
            default:
                break
        }

        loadFilteredBooks(sort, sortD)
    }

    const handleCategoryFilter = (categoryId: number, checked: boolean) => {
        if (checked) {
            setPendingCategories([...pendingCategories, categoryId])
        } else {
            setPendingCategories(pendingCategories.filter((id) => id !== categoryId))
        }
    }

    const handleAuthorFilter = (authorId: number, checked: boolean) => {
        if (checked) {
            setPendingAuthors([...pendingAuthors, authorId])
        } else {
            setPendingAuthors(pendingAuthors.filter((id) => id !== authorId))
        }
    }

    const clearAllFilters = () => {
        setSelectedCategories([])
        setSelectedAuthors([])
        setPriceRange([0, 200000])
        setOnlyInStock(false)
        setOnlyOnSale(false)
        setPendingCategories([])
        setPendingAuthors([])
        setPendingPriceRange([0, 200000])
        setPendingInStock(false)
        setPendingOnSale(false)
    }

    const hasActiveFilters =
        selectedCategories.length > 0 ||
        selectedAuthors.length > 0 ||
        priceRange[0] > 0 ||
        priceRange[1] < 200000 ||
        onlyInStock ||
        onlyOnSale

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center gap-2 mb-6">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Trang chủ
                        </Link>
                    </Button>
                    <span className="text-gray-400">/</span>
                    <span className="font-medium">Kết quả tìm kiếm</span>
                </div>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Kết quả tìm kiếm cho "{searchQuery}"</h1>
                    <p className="text-gray-600 mb-4">
                        Tìm thấy {filteredBooks.length} cuốn sách
                    </p>
                </div>

                <div className="flex gap-6">
                    <div className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-64 flex-shrink-0`}>
                        <Card className="sticky top-4">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold">Bộ lọc</h3>
                                    {hasActiveFilters && (
                                        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                                            <X className="h-4 w-4 mr-1" />
                                            Xóa
                                        </Button>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <h4 className="font-medium mb-3">Danh mục</h4>
                                    <Select
                                        isMulti
                                        options={categories.map((cat) => ({ label: cat.name, value: cat.id }))}
                                        value={categories
                                            .filter((cat) => pendingCategories.includes(cat.id))
                                            .map((cat) => ({ label: cat.name, value: cat.id }))}
                                        onChange={(selected) => setPendingCategories(selected ? selected.map((item) => item.value) : [])}
                                        placeholder="Chọn danh mục..."
                                        className="text-sm"
                                        classNamePrefix="select"
                                    />
                                </div>

                                <div className="mb-6">
                                    <h4 className="font-medium mb-3">Tác giả</h4>
                                    <Select
                                        isMulti
                                        options={authors.map((author) => ({ label: author.name, value: author.id }))}
                                        value={authors
                                            .filter((author) => pendingAuthors.includes(author.id))
                                            .map((author) => ({ label: author.name, value: author.id }))}
                                        onChange={(selected) => setPendingAuthors(selected ? selected.map((item) => item.value) : [])}
                                        placeholder="Chọn tác giả..."
                                        className="text-sm"
                                        classNamePrefix="select"
                                    />
                                </div>

                                <div className="mb-6">
                                    <h4 className="font-medium mb-3">Khoảng giá</h4>
                                    <div className="px-2">
                                        <Slider
                                            value={pendingPriceRange}
                                            onValueChange={setPendingPriceRange}
                                            max={2000000}
                                            min={0}
                                            step={10000}
                                            className="mb-2"
                                        />
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>{pendingPriceRange[0].toLocaleString()}đ</span>
                                            <span>{pendingPriceRange[1].toLocaleString()}đ</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/*<div className="flex items-center space-x-2">*/}
                                    {/*    <Checkbox id="in-stock" checked={pendingInStock} onCheckedChange={setPendingInStock} />*/}
                                    {/*    <Label htmlFor="in-stock" className="text-sm">*/}
                                    {/*        Chỉ sách còn hàng*/}
                                    {/*    </Label>*/}
                                    {/*</div>*/}
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="on-sale" checked={pendingOnSale} onCheckedChange={setPendingOnSale} />
                                        <Label htmlFor="on-sale" className="text-sm">
                                            Chỉ sách giảm giá
                                        </Label>
                                    </div>
                                </div>

                                <div className="border-t pt-4 mt-6">
                                    <div className="flex flex-col gap-2">
                                        <Button onClick={applyFilters} className="w-full" size="lg">
                                            Áp dụng bộ lọc
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setPendingCategories([])
                                                setPendingAuthors([])
                                                setPendingPriceRange([0, 2000000])
                                                setPendingInStock(false)
                                                setPendingOnSale(false)
                                            }}
                                            className="w-full"
                                            size="sm"
                                        >
                                            Đặt lại
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Bộ lọc
                                </Button>

                                <SelectUi value={sortName} onValueChange={handleSort}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Sắp xếp theo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="relevance">Liên quan nhất</SelectItem>
                                        <SelectItem value="price-low">Giá thấp đến cao</SelectItem>
                                        <SelectItem value="price-high">Giá cao đến thấp</SelectItem>
                                        <SelectItem value="name">Tên A-Z</SelectItem>
                                        {/*<SelectItem value="newest">Mới nhất</SelectItem>*/}
                                    </SelectContent>
                                </SelectUi>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant={viewMode === "grid" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setViewMode("grid")}
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setViewMode("list")}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {filteredBooks.length > 0 ? (
                            <>
                                {viewMode === "grid" ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {filteredBooks.map((book) => (
                                            <BookCard key={book.id} book={book} searchQuery={searchQuery}/>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredBooks.map((book) => (
                                            <Card key={book.id}>
                                                <div className="flex p-4">
                                                    <div className="w-24 h-32 flex-shrink-0 mr-4">
                                                        <img
                                                            src={book.images[0]?.imageUrl || "/placeholder.svg"}
                                                            alt={book.name}
                                                            className="w-full h-full object-cover rounded"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h3 className="font-semibold text-lg mb-1">{book.name}</h3>
                                                                <p className="text-gray-600 mb-1">{book.authors[0]?.name || ""}</p>
                                                                <p className="text-sm text-gray-500 mb-2">{book.publishers[0]?.name}</p>
                                                                <p className="text-sm text-gray-700 mb-3">{book.shortDescription}</p>
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    {book.markAsNew &&
                                                                        <Badge className="bg-blue-500">Mới</Badge>}
                                                                    {book.markAsBestseller && <Badge
                                                                        className="bg-red-500">Bestseller</Badge>}
                                                                    {book.salePrice < book.originalPrice && (
                                                                        <Badge className="bg-green-500">
                                                                            -{Math.round(((book.originalPrice - book.salePrice) / book.originalPrice) * 100)}%
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    {book.salePrice < book.originalPrice ? (
                                                                        <>
                                      <span className="font-bold text-primary text-lg">
                                        {book.salePrice.toLocaleString()}đ
                                      </span>
                                                                            <span
                                                                                className="text-sm text-gray-500 line-through">
                                        {book.originalPrice.toLocaleString()}đ
                                      </span>
                                                                        </>
                                                                    ) : (
                                                                        <span
                                                                            className="font-bold text-primary text-lg">
                                      {book.originalPrice.toLocaleString()}đ
                                    </span>
                                                                    )}
                                                                </div>
                                                                <Button asChild>
                                                                    <Link to={`/books/${book.id}/detail`}>Xem chi tiết</Link>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}


                                <div className="flex items-center justify-between mt-6">
                                    <div className="text-sm text-gray-600">

                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Trước
                                        </Button>

                                        {renderPageButtons()}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Sau
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4"/>
                                <h3 className="text-xl font-semibold mb-2">Không tìm thấy kết quả</h3>
                                <p className="text-gray-600 mb-6">Không tìm thấy sách nào phù hợp với từ khóa
                                    "{searchQuery}"</p>

                                <div className="max-w-md mx-auto">
                                    <h4 className="font-medium mb-3">Gợi ý:</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• Kiểm tra lại chính tả từ khóa</li>
                                        <li>• Thử sử dụng từ khóa ngắn gọn hơn</li>
                                        <li>• Tìm kiếm theo tên tác giả hoặc thể loại</li>
                                        <li>• Xóa bộ lọc để mở rộng kết quả</li>
                                    </ul>
                                </div>

                                {hasActiveFilters && (
                                    <Button onClick={clearAllFilters} className="mt-4">
                                        Xóa tất cả bộ lọc
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
