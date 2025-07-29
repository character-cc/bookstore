"use client"

import {useEffect, useState} from "react"
import {Link} from "react-router";
import { ArrowLeft, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {useParams} from "react-router";

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

const categoryDataMock = {
    id: 1,
    name: "Văn học Việt Nam",
    description: "Các tác phẩm văn học nổi tiếng của Việt Nam",
    totalBooks: 25,
}

const booksInCategory: BookDetail[] = [
    {
        id: 1,
        name: "Lão Hạc",
        isbn: "9786041234567",
        costPrice: 50000,
        originalPrice: 100000,
        salePrice: 90000,
        published: true,
        publishedDate: "2025-01-01T00:00:00Z",
        shortDescription: "Truyện ngắn cảm động về lòng nhân hậu",
        fullDescription: "Lão Hạc là một tác phẩm kinh điển của Nam Cao...",
        languageId: 1,
        languageName: "Tiếng Việt",
        isGift: false,
        pageCount: 120,
        inventoryManagementMethodId: 1,
        inventoryManagementMethodName: "Theo dõi đơn giản",
        stockQuantity: 50,
        lowStockThreshold: 5,
        markAsBestseller: true,
        markAsNew: true,
        isShowAsNewOnHome: true,
        isShowAsBestsellerOnHome: true,
        displayOrderBestseller: 1,
        displayOrderAsNew: 1,
        displayOrderAsSale: 0,
        createdAt: "2025-06-14T15:50:00Z",
        updatedAt: "2025-06-14T15:50:00Z",
        categories: [
            {
                id: 1,
                name: "Văn học Việt Nam",
                description: "Các tác phẩm văn học nổi tiếng của Việt Nam",
                parentId: null,
                isShowOnHomepage: true,
                homepageDisplayOrder: 1,
                isShowOnNavigationBar: true,
                navigationDisplayOrder: 1,
                imageUrl: "https://example.com/images/van-hoc-vn.jpg",
            },
        ],
        authors: [
            {
                id: 1,
                name: "Nam Cao",
                biography: "Nam Cao là nhà văn hiện thực xuất sắc của Việt Nam",
                imageUrl: "https://example.com/images/nam-cao.jpg",
            },
        ],
        publishers: [
            {
                id: 1,
                name: "NXB Văn Học",
                description: "Nhà xuất bản chuyên về văn học",
                website: "https://nxbvanhoc.com",
                logoUrl: "https://example.com/images/nxb-vanhoc-logo.jpg",
            },
        ],
        images: [
            {
                id: 1,
                imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop",
                thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150&h=200&fit=crop",
                altText: "Bìa sách Lão Hạc",
                title: "Lão Hạc",
            },
        ],
        customAttributes: [],
    },
    {
        id: 2,
        name: "Chí Phèo",
        isbn: "9786041234568",
        costPrice: 40000,
        originalPrice: 85000,
        salePrice: 75000,
        published: true,
        publishedDate: "2025-01-01T00:00:00Z",
        shortDescription: "Tác phẩm kinh điển của Nam Cao",
        fullDescription: "Chí Phèo là một trong những tác phẩm tiêu biểu nhất của Nam Cao...",
        languageId: 1,
        languageName: "Tiếng Việt",
        isGift: false,
        pageCount: 150,
        inventoryManagementMethodId: 1,
        inventoryManagementMethodName: "Theo dõi đơn giản",
        stockQuantity: 30,
        lowStockThreshold: 5,
        markAsBestseller: false,
        markAsNew: false,
        isShowAsNewOnHome: false,
        isShowAsBestsellerOnHome: false,
        displayOrderBestseller: 0,
        displayOrderAsNew: 0,
        displayOrderAsSale: 0,
        createdAt: "2025-06-14T15:50:00Z",
        updatedAt: "2025-06-14T15:50:00Z",
        categories: [
            {
                id: 1,
                name: "Văn học Việt Nam",
                description: "Các tác phẩm văn học nổi tiếng của Việt Nam",
                parentId: null,
                isShowOnHomepage: true,
                homepageDisplayOrder: 1,
                isShowOnNavigationBar: true,
                navigationDisplayOrder: 1,
                imageUrl: "https://example.com/images/van-hoc-vn.jpg",
            },
        ],
        authors: [
            {
                id: 1,
                name: "Nam Cao",
                biography: "Nam Cao là nhà văn hiện thực xuất sắc của Việt Nam",
                imageUrl: "https://example.com/images/nam-cao.jpg",
            },
        ],
        publishers: [
            {
                id: 1,
                name: "NXB Văn Học",
                description: "Nhà xuất bản chuyên về văn học",
                website: "https://nxbvanhoc.com",
                logoUrl: "https://example.com/images/nxb-vanhoc-logo.jpg",
            },
        ],
        images: [
            {
                id: 5,
                imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop",
                thumbnailUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=150&h=200&fit=crop",
                altText: "Bìa sách Chí Phèo",
                title: "Chí Phèo",
            },
        ],
        customAttributes: [],
    },
    {
        id: 3,
        name: "Tắt Đèn",
        isbn: "9786041234569",
        costPrice: 45000,
        originalPrice: 95000,
        salePrice: 80000,
        published: true,
        publishedDate: "2025-01-01T00:00:00Z",
        shortDescription: "Tác phẩm hiện thực phê phán của Ngô Tất Tố",
        fullDescription: "Tắt Đèn là một tác phẩm nổi tiếng của Ngô Tất Tố...",
        languageId: 1,
        languageName: "Tiếng Việt",
        isGift: false,
        pageCount: 180,
        inventoryManagementMethodId: 1,
        inventoryManagementMethodName: "Theo dõi đơn giản",
        stockQuantity: 25,
        lowStockThreshold: 5,
        markAsBestseller: false,
        markAsNew: true,
        isShowAsNewOnHome: false,
        isShowAsBestsellerOnHome: false,
        displayOrderBestseller: 0,
        displayOrderAsNew: 0,
        displayOrderAsSale: 0,
        createdAt: "2025-06-14T15:50:00Z",
        updatedAt: "2025-06-14T15:50:00Z",
        categories: [
            {
                id: 1,
                name: "Văn học Việt Nam",
                description: "Các tác phẩm văn học nổi tiếng của Việt Nam",
                parentId: null,
                isShowOnHomepage: true,
                homepageDisplayOrder: 1,
                isShowOnNavigationBar: true,
                navigationDisplayOrder: 1,
                imageUrl: "https://example.com/images/van-hoc-vn.jpg",
            },
        ],
        authors: [
            {
                id: 2,
                name: "Ngô Tất Tố",
                biography: "Ngô Tất Tố là nhà văn hiện thực phê phán xuất sắc của Việt Nam",
                imageUrl: "https://example.com/images/ngo-tat-to.jpg",
            },
        ],
        publishers: [
            {
                id: 1,
                name: "NXB Văn Học",
                description: "Nhà xuất bản chuyên về văn học",
                website: "https://nxbvanhoc.com",
                logoUrl: "https://example.com/images/nxb-vanhoc-logo.jpg",
            },
        ],
        images: [
            {
                id: 6,
                imageUrl: "https://images.unsplash.com/photo-1585346445685-499f8184b39d?w=300&h=400&fit=crop",
                thumbnailUrl: "https://images.unsplash.com/photo-1585346445685-499f8184b39d?w=150&h=200&fit=crop",
                altText: "Bìa sách Tắt Đèn",
                title: "Tắt Đèn",
            },
        ],
        customAttributes: [],
    },
    {
        id: 4,
        name: "Số Đỏ",
        isbn: "9786041234570",
        costPrice: 50000,
        originalPrice: 110000,
        salePrice: 99000,
        published: true,
        publishedDate: "2025-01-01T00:00:00Z",
        shortDescription: "Tác phẩm trào phúng của Vũ Trọng Phụng",
        fullDescription: "Số Đỏ là một tác phẩm trào phúng nổi tiếng của Vũ Trọng Phụng...",
        languageId: 1,
        languageName: "Tiếng Việt",
        isGift: false,
        pageCount: 200,
        inventoryManagementMethodId: 1,
        inventoryManagementMethodName: "Theo dõi đơn giản",
        stockQuantity: 40,
        lowStockThreshold: 5,
        markAsBestseller: true,
        markAsNew: false,
        isShowAsNewOnHome: true,
        isShowAsBestsellerOnHome: true,
        displayOrderBestseller: 2,
        displayOrderAsNew: 0,
        displayOrderAsSale: 0,
        createdAt: "2025-06-14T15:50:00Z",
        updatedAt: "2025-06-14T15:50:00Z",
        categories: [
            {
                id: 1,
                name: "Văn học Việt Nam",
                description: "Các tác phẩm văn học nổi tiếng của Việt Nam",
                parentId: null,
                isShowOnHomepage: true,
                homepageDisplayOrder: 1,
                isShowOnNavigationBar: true,
                navigationDisplayOrder: 1,
                imageUrl: "https://example.com/images/van-hoc-vn.jpg",
            },
        ],
        authors: [
            {
                id: 3,
                name: "Vũ Trọng Phụng",
                biography: "Vũ Trọng Phụng là nhà văn trào phúng xuất sắc của Việt Nam",
                imageUrl: "https://example.com/images/vu-trong-phung.jpg",
            },
        ],
        publishers: [
            {
                id: 1,
                name: "NXB Văn Học",
                description: "Nhà xuất bản chuyên về văn học",
                website: "https://nxbvanhoc.com",
                logoUrl: "https://example.com/images/nxb-vanhoc-logo.jpg",
            },
        ],
        images: [
            {
                id: 7,
                imageUrl: "https://images.unsplash.com/photo-1589998059171-98d884ca5f02?w=300&h=400&fit=crop",
                thumbnailUrl: "https://images.unsplash.com/photo-1589998059171-98d884ca5f02?w=150&h=200&fit=crop",
                altText: "Bìa sách Số Đỏ",
                title: "Số Đỏ",
            },
        ],
        customAttributes: [],
    },
    {
        id: 5,
        name: "Vợ Nhặt",
        isbn: "9786041234571",
        costPrice: 35000,
        originalPrice: 80000,
        salePrice: 70000,
        published: true,
        publishedDate: "2025-01-01T00:00:00Z",
        shortDescription: "Truyện ngắn cảm động của Kim Lân",
        fullDescription: "Vợ Nhặt là một truyện ngắn nổi tiếng của Kim Lân...",
        languageId: 1,
        languageName: "Tiếng Việt",
        isGift: false,
        pageCount: 130,
        inventoryManagementMethodId: 1,
        inventoryManagementMethodName: "Theo dõi đơn giản",
        stockQuantity: 35,
        lowStockThreshold: 5,
        markAsBestseller: false,
        markAsNew: false,
        isShowAsNewOnHome: false,
        isShowAsBestsellerOnHome: false,
        displayOrderBestseller: 0,
        displayOrderAsNew: 0,
        displayOrderAsSale: 0,
        createdAt: "2025-06-14T15:50:00Z",
        updatedAt: "2025-06-14T15:50:00Z",
        categories: [
            {
                id: 1,
                name: "Văn học Việt Nam",
                description: "Các tác phẩm văn học nổi tiếng của Việt Nam",
                parentId: null,
                isShowOnHomepage: true,
                homepageDisplayOrder: 1,
                isShowOnNavigationBar: true,
                navigationDisplayOrder: 1,
                imageUrl: "https://example.com/images/van-hoc-vn.jpg",
            },
        ],
        authors: [
            {
                id: 4,
                name: "Kim Lân",
                biography: "Kim Lân là nhà văn chuyên viết về nông thôn Việt Nam",
                imageUrl: "https://example.com/images/kim-lan.jpg",
            },
        ],
        publishers: [
            {
                id: 1,
                name: "NXB Văn Học",
                description: "Nhà xuất bản chuyên về văn học",
                website: "https://nxbvanhoc.com",
                logoUrl: "https://example.com/images/nxb-vanhoc-logo.jpg",
            },
        ],
        images: [
            {
                id: 8,
                imageUrl: "https://images.unsplash.com/photo-1616364442929-1521e5084944?w=300&h=400&fit=crop",
                thumbnailUrl: "https://images.unsplash.com/photo-1616364442929-1521e5084944?w=150&h=200&fit=crop",
                altText: "Bìa sách Vợ Nhặt",
                title: "Vợ Nhặt",
            },
        ],
        customAttributes: [],
    },
    {
        id: 6,
        name: "Dế Mèn Phiêu Lưu Ký",
        isbn: "9786041234572",
        costPrice: 30000,
        originalPrice: 75000,
        salePrice: 65000,
        published: true,
        publishedDate: "2025-01-01T00:00:00Z",
        shortDescription: "Truyện thiếu nhi kinh điển của Tô Hoài",
        fullDescription: "Dế Mèn Phiêu Lưu Ký là tác phẩm nổi tiếng của Tô Hoài...",
        languageId: 1,
        languageName: "Tiếng Việt",
        isGift: false,
        pageCount: 160,
        inventoryManagementMethodId: 1,
        inventoryManagementMethodName: "Theo dõi đơn giản",
        stockQuantity: 45,
        lowStockThreshold: 5,
        markAsBestseller: true,
        markAsNew: false,
        isShowAsNewOnHome: false,
        isShowAsBestsellerOnHome: true,
        displayOrderBestseller: 3,
        displayOrderAsNew: 0,
        displayOrderAsSale: 0,
        createdAt: "2025-06-14T15:50:00Z",
        updatedAt: "2025-06-14T15:50:00Z",
        categories: [
            {
                id: 1,
                name: "Văn học Việt Nam",
                description: "Các tác phẩm văn học nổi tiếng của Việt Nam",
                parentId: null,
                isShowOnHomepage: true,
                homepageDisplayOrder: 1,
                isShowOnNavigationBar: true,
                navigationDisplayOrder: 1,
                imageUrl: "https://example.com/images/van-hoc-vn.jpg",
            },
        ],
        authors: [
            {
                id: 5,
                name: "Tô Hoài",
                biography: "Tô Hoài là nhà văn nổi tiếng với các tác phẩm thiếu nhi",
                imageUrl: "https://example.com/images/to-hoai.jpg",
            },
        ],
        publishers: [
            {
                id: 2,
                name: "NXB Kim Đồng",
                description: "Nhà xuất bản chuyên về sách thiếu nhi",
                website: "https://nxbkimdong.com",
                logoUrl: "https://example.com/images/nxb-kimdong-logo.jpg",
            },
        ],
        images: [
            {
                id: 9,
                imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop",
                thumbnailUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=150&h=200&fit=crop",
                altText: "Bìa sách Dế Mèn Phiêu Lưu Ký",
                title: "Dế Mèn Phiêu Lưu Ký",
            },
        ],
        customAttributes: [],
    },
]

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

export default function CategoryPage() {
    const [books, setBooks] = useState(booksInCategory)
    const [sortBy, setSortBy] = useState("default")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [categoryData, setCategoryData] = useState(categoryDataMock)
    const { id } = useParams();
    const categoryId = parseInt(id!, 10);
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(12)

    const [totalPages, setTotalPages] = useState(10)
    const handleSort = (value: string) => {
        setSortBy(value)
        let sortedBooks = [...books]

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
            default:
        }
        loadBooks(orderBy,orderDesc)
    }
    useEffect(() => {
        let value = sortBy
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
            default:
        }
        loadBooks(orderBy,orderDesc)
    }, [currentPage]);

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

    useEffect(() => {
        loadCategory()
        loadBooks(undefined,undefined)
    },[categoryId])
    const loadCategory = async () => {
        try {

            const response = await fetch("http://localhost/api/categories/" + categoryId);
            const data = await response.json();
            if(!response.ok) {
                throw new Error("Failed to fetch categories.");
            }
            console.log(data);
            setCategoryData(data)
        }
        catch (e) {
            console.error(e);
        }
    }

    const loadBooks = async (sortBy, sortDesc) => {
        try {
            const response = await fetch("http://localhost/api/categories/" + categoryId + "/books",{
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
            console.log(data)
            setBooks(data.items)
            setTotalPages(data.totalPages)
        }
        catch (error) {
            console.error(error)
        }

    }
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
                    <span className="font-medium">{categoryData.name}</span>
                </div>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">{categoryData.name}</h1>
                    <p className="text-gray-600 mb-4">{categoryData.description}</p>
                    <p className="text-sm text-gray-500">Tìm thấy {categoryData.totalBooks} cuốn sách</p>
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

                {/* Pagination */}
                {/*<div className="flex items-center justify-center gap-2 mt-8">*/}
                {/*    <Button variant="outline" disabled>*/}
                {/*        Trước*/}
                {/*    </Button>*/}
                {/*    <Button variant="default">1</Button>*/}
                {/*    <Button variant="outline">2</Button>*/}
                {/*    <Button variant="outline">3</Button>*/}
                {/*    <Button variant="outline">Sau</Button>*/}
                {/*</div>*/}
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
