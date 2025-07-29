"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"

// TypeScript interfaces based on C# models
interface BookImageDto {
    id: number
    bookId: number
    imageUrl: string
    createdAt: string
    updatedAt: string
}

interface BookDto {
    id: number
    name: string
    isbn: string
    originalPrice: number
    costPrice: number
    salePrice: number
    published: boolean
    publishedDate: string
    weight: number
    length: number
    width: number
    height: number
    shortDescription: string
    fullDescription: string
    language: string
    isDeleted: boolean
    pageCount: number
    inventoryManagementMethodId: number
    lowStockThreshold?: number
    markAsBestseller: boolean
    markAsNew: boolean
    isShowAsNewOnHome: boolean
    isShowAsBestsellerOnHome: boolean
    displayOrderBestseller: number
    displayOrderAsNew: number
    displayOrderAsSale: number
    isGift: boolean
    createdAt: string
    updatedAt: string
    images: BookImageDto[]
}

interface BookInventoryDto {
    book: BookDto
    totalRevenue: number
    totalCost: number
    profit: number
    currentStock: number
    totalImportedQuantity: number
}

// API Request interface
interface BookInventoryRequest {
    keyword: string
    sortBy: string
    sortDesc: boolean
    from: string
    to: string
    pageIndex: number
    pageSize: number
}


export default function BookInventorySimpleTable() {
    const [data, setData] = useState<BookInventoryDto[]>([])
    const [loading, setLoading] = useState(false)
    const [searchKeyword, setSearchKeyword] = useState("")

    const [totalItems, setTotalItems] = useState(0)
    const [sortBy, setSortBy] = useState("")
    const [sortDesc, setSortDesc] = useState(false)

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const [totalPages, setTotalPages] = useState(10)

    useEffect(() => {
        loadData()
    }, [currentPage, sortBy, sortDesc])

    const loadData = async () => {
        setLoading(true)
        try {
            const request: BookInventoryRequest = {
                keyword: searchKeyword,
                sortBy: sortBy,
                sortDesc: sortDesc,
                pageIndex: currentPage - 1,
                pageSize: itemsPerPage,
            }


            const response = await fetch('/api/admin/books/inventory', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(request)
            })

            console.log(response)
            if (!response.ok) {
              throw new Error('Failed to fetch data')
            }

            const result = await response.json()
            setData(result.items)
            setTotalPages(result.totalPages)
            // setTotalItems(result.totalItems)


        } catch (error) {
            console.error("Error loading data:", error)
            setData([])
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = () => {
        setCurrentPage(1)
        loadData()
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

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDesc(!sortDesc)
        } else {
            setSortBy(field)
            setSortDesc(false)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
    }

    const getSortIcon = (field: string) => {
        if (sortBy !== field) {
            return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
        }
        return <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDesc ? "rotate-180" : ""}`} />
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Quản Lý Kho Sách</h1>
                <p className="text-gray-600 mt-1">Theo dõi tồn kho và doanh thu của từng đầu sách</p>
            </div>

            <div className="flex gap-2 max-w-md">
                <Input
                    placeholder="Tìm kiếm theo tên sách hoặc ISBN..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading} variant="outline">
                    <Search className="h-4 w-4 mr-2"/>
                    Tìm kiếm
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="w-16 text-gray-700 font-medium">#</TableHead>
                                    <TableHead className="w-20 text-gray-700 font-medium">Ảnh</TableHead>
                                    <TableHead className="text-gray-700 font-medium">Tên sách</TableHead>
                                    <TableHead className="text-gray-700 font-medium">ISBN</TableHead>
                                    <TableHead className="text-gray-700 font-medium">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort("TotalRevenue")}
                                            className="h-auto p-0 font-medium text-gray-700 hover:text-gray-900"
                                        >
                                            Doanh thu
                                            {getSortIcon("TotalRevenue")}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-gray-700 font-medium">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort("TotalCost")}
                                            className="h-auto p-0 font-medium text-gray-700 hover:text-gray-900"
                                        >
                                            Tổng chi phí
                                            {getSortIcon("TotalCost")}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-gray-700 font-medium">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort("Profit")}
                                            className="h-auto p-0 font-medium text-gray-700 hover:text-gray-900"
                                        >
                                            Lợi nhuận
                                            {getSortIcon("Profit")}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-gray-700 font-medium">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort("CurrentStock")}
                                            className="h-auto p-0 font-medium text-gray-700 hover:text-gray-900"
                                        >
                                            Tồn kho hiện tại
                                            {getSortIcon("CurrentStock")}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-gray-700 font-medium">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort("TotalImportedQuantity")}
                                            className="h-auto p-0 font-medium text-gray-700 hover:text-gray-900"
                                        >
                                            Tổng nhập kho
                                            {getSortIcon("TotalImportedQuantity")}
                                        </Button>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8">
                                            <div className="flex items-center justify-center">
                                                <div
                                                    className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                                                <span className="ml-2 text-gray-600">Đang tải...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8">
                                            <p className="text-gray-500">Không tìm thấy dữ liệu nào</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((item, index) => (
                                        <TableRow key={item.book.id} className="hover:bg-gray-50">
                                            <TableCell
                                                className="text-gray-600">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                                            <TableCell>
                                                <img

                                                    src={item.book.images[0]?.imageUrl || "/placeholder.svg?height=60&width=45"}
                                                    alt={item.book.name}
                                                    className="w-10 h-14 object-cover rounded border"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs">
                                                    <p className="font-medium text-gray-900 line-clamp-2">{item.book.name}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className="font-mono text-sm text-gray-600">{item.book.isbn}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className="font-medium text-gray-900">{formatPrice(item.totalRevenue)}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className="font-medium text-gray-900">{formatPrice(item.totalCost)}</span>
                                            </TableCell>
                                            <TableCell>
                        <span className={`font-medium ${item.profit >= 0 ? "text-gray-900" : "text-red-600"}`}>
                          {formatPrice(item.profit)}
                        </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-gray-900">{item.currentStock}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className="font-medium text-gray-900">{item.totalImportedQuantity}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

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
        </div>
    )
}
