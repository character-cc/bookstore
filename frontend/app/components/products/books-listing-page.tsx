"use client"

import { useState, useEffect } from "react"
import {Link} from "react-router"
import { ArrowLeft, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Interface cho dữ liệu sách (sử dụng lại từ book-detail-page)
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


type BookListingType = "new-books" | "bestsellers" | "sale-books"

interface BooksListingPageProps {
    type: BookListingType
}

function BookCard({ book }: { book: BookDetail }) {
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
                <p className="text-sm text-gray-600 mb-2">{book.authors[0]?.name}</p>
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

export default function BooksListingPage({ type }: BooksListingPageProps) {
    const [books, setBooks] = useState<BookDetail[]>([])
    const [sortBy, setSortBy] = useState("default")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(12)

    const [totalPages, setTotalPages] = useState(10)
    const [pageList, setPageList] = useState()
    const getPageInfo = () => {
        switch (type) {
            case "new-books":
                return {
                    title: "Sách mới",
                    description: "Những cuốn sách mới nhất được cập nhật",
                    breadcrumb: "Sách mới",
                }
            case "bestsellers":
                return {
                    title: "Sách bán chạy",
                    description: "Những cuốn sách được yêu thích nhất",
                    breadcrumb: "Sách bán chạy",
                }
            case "sale-books":
                return {
                    title: "Sách giảm giá",
                    description: "Những cuốn sách đang có ưu đãi đặc biệt",
                    breadcrumb: "Sách giảm giá",
                }
            default:
                return {
                    title: "Danh sách sách",
                    description: "Tất cả sách",
                    breadcrumb: "Sách",
                }
        }
    }



    useEffect(() => {
        let filteredBooks: BookDetail[] = []

        switch (type) {
            case "new-books":
                loadNewBooks(undefined, undefined)
                break
            case "bestsellers":
                loadBestSellerBooks(undefined, undefined)
                break
            case "sale-books":
                loadSaleBooks(undefined, undefined)
                break
            default:
        }

    }, [type])


    const handleSort = (value: string) => {
        setSortBy(value)
        const sortedBooks = [...books]

        let orderBy;
        let orderDesc;
        switch (value) {
            case "price-low":
                orderBy = "SalePrice"
                break
            case "price-high":
                orderBy = "SalePrice"
                orderDesc = true
                break
            case "name":
                orderBy = "Name"
                break
            case "newest":
                orderBy = "Name"
                orderDesc = true
                break
            case "discount":
                break
            default:

        }
        console.log(orderBy, orderDesc)
        if(type === "sale-books") {
            loadSaleBooks(orderBy,orderDesc)
        }
        if (type === "bestsellers") {
            loadBestSellerBooks(orderBy,orderDesc)
        }
        if (type === "new-books") {
            loadNewBooks(orderBy,orderDesc)
        }

    }

    useEffect(() => {
        let value = sortBy
        // console.log(value)
        let orderBy;
        let orderDesc;
        switch (value) {
            case "price-low":
                orderBy = "SalePrice"
                break
            case "price-high":
                orderBy = "SalePrice"
                orderDesc = true
                break
            case "name":
                orderBy = "Name"
                break
            case "newest":
                orderBy = "Name"
                orderDesc = true
                break
            case "discount":
                break
            default:

        }
        if(type === "sale-books") {
            loadSaleBooks(orderBy,orderDesc)
        }
        if (type === "bestsellers") {
            loadBestSellerBooks(orderBy,orderDesc)
        }
        if (type === "new-books") {
            loadNewBooks(orderBy,orderDesc)
        }
        console.log(currentPage)
    },[currentPage])

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

    const loadNewBooks = async (sortBy : any, sortDesc:any) => {
        try {
            const response = await fetch(`http://localhost/api/books/new/search`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pageIndex: currentPage - 1,
                    pageSize: itemsPerPage,
                    sortBy,
                    sortDesc,
                })
            } )
            if(!response.ok) {
                throw new Error(response.statusText)
            }
            const  data = await response.json()
            setBooks(data.items)
            setTotalPages(data.totalPages)
        }
        catch (error) {
            console.error(error)
        }

    }
    const loadSaleBooks = async (sortBy, sortDesc) => {
        try {
            const response = await fetch(`http://localhost/api/books/sales/search`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pageIndex: currentPage - 1,
                    pageSize: itemsPerPage,
                    sortBy,
                    sortDesc,
                })
            } )
            if(!response.ok) {
                throw new Error(response.statusText)
            }
            const  data = await response.json()
            setBooks(data.items)
            setTotalPages(data.totalPages)

        }
        catch (error) {
            console.error(error)
        }

    }
    const loadBestSellerBooks = async (sortBy, sortDesc) => {
        try {
            const response = await fetch(`http://localhost/api/books/bestsellers/search`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pageIndex: currentPage - 1,
                    pageSize: itemsPerPage,
                    sortBy,
                    sortDesc,
                })
            } )
            if(!response.ok) {
                throw new Error(response.statusText)
            }
            const  data = await response.json()
            setBooks(data.items)
            setTotalPages(data.totalPages)

        }
        catch (error) {
            console.error(error)
        }

    }
    const pageInfo = getPageInfo()

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center gap-2 mb-6">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4"/>
                            Trang chủ
                        </Link>
                    </Button>
                    <span className="text-gray-400">/</span>
                    <span className="font-medium">{pageInfo.breadcrumb}</span>
                </div>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">{pageInfo.title}</h1>
                    <p className="text-gray-600 mb-4">{pageInfo.description}</p>
                    <p className="text-sm text-gray-500">Tìm thấy {books.length} cuốn sách</p>
                </div>

                <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center gap-4">
                        <Select value={sortBy} onValueChange={handleSort}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Sắp xếp theo"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Mặc định</SelectItem>
                                <SelectItem value="price-low">Giá thấp đến cao</SelectItem>
                                <SelectItem value="price-high">Giá cao đến thấp</SelectItem>
                                <SelectItem value="name">Tên A-Z</SelectItem>
                                {/*<SelectItem value="newest">Mới nhất</SelectItem>*/}
                                {/*{type === "sale-books" && <SelectItem value="discount">Giảm giá nhiều nhất</SelectItem>}*/}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm"
                                onClick={() => setViewMode("grid")}>
                            <Grid className="h-4 w-4"/>
                        </Button>
                        <Button variant={viewMode === "list" ? "default" : "outline"} size="sm"
                                onClick={() => setViewMode("list")}>
                            <List className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>

                {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {books.map((book) => (
                            <BookCard key={book.id} book={book}/>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {books.map((book) => (
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
                                                <p className="text-gray-600 mb-1">{book.authors[0]?.name}</p>
                                                <p className="text-sm text-gray-500 mb-2">{book.publishers[0]?.name}</p>
                                                <p className="text-sm text-gray-700 mb-3">{book.shortDescription}</p>
                                                <div className="flex items-center gap-2 mb-3">
                                                    {book.markAsNew && <Badge className="bg-blue-500">Mới</Badge>}
                                                    {book.markAsBestseller &&
                                                        <Badge className="bg-red-500">Bestseller</Badge>}
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
                                                            <span
                                                                className="font-bold text-primary text-lg">{book.salePrice.toLocaleString()}đ</span>
                                                            <span className="text-sm text-gray-500 line-through">
                                {book.originalPrice.toLocaleString()}đ
                              </span>
                                                        </>
                                                    ) : (
                                                        <span className="font-bold text-primary text-lg">
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

                {books.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">Không tìm thấy sách nào</p>
                    </div>
                )}

                {/* Pagination */}
                {/*{books.length > 0 && (*/}
                {/*    <div className="flex items-center justify-center gap-2 mt-8">*/}
                {/*        <Button variant="outline" disabled>*/}
                {/*            Trước*/}
                {/*        </Button>*/}
                {/*        <Button variant="default">1</Button>*/}
                {/*        <Button variant="outline">2</Button>*/}
                {/*        <Button variant="outline">3</Button>*/}
                {/*        <Button variant="outline">Sau</Button>*/}
                {/*    </div>*/}
                {/*)}*/}
                <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                        {/*Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredOrders.length)} trong tổng số{" "}*/}
                        {/*{filteredOrders.length} đơn hàng*/}
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
            </div>
        </div>
    )
}
