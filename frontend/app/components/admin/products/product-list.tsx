"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Edit,
    Eye,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    Download,
    Filter,
    BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { booksApi, type Book, type Category, type Author, type Publisher } from "@/lib/book-api"
import { useApi } from "@/hooks/useApi"
import {Link} from "react-router";

export default function AdminBookList() {
    const [searchName, setSearchName] = useState("")
    const [searchIsbn, setSearchIsbn] = useState("")
    const [books, setBooks] = useState<Book[]>([])
    const [authors, setAuthors] = useState<Author[]>([])
    const [publishers, setPublishers] = useState<Publisher[]>([])
    const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined)
    const [categoryFilter, setCategoryFilter] = useState<string>("all")
    const [authorFilter, setAuthorFilter] = useState<string>("all")
    const [publisherFilter, setPublisherFilter] = useState<string>("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [selectedBooks, setSelectedBooks] = useState<number[]>([])
    const [sortField, setSortField] = useState<string>("")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
    const [totalBooks, setTotalBooks] = useState(0)

    const { loading: booksLoading, execute: executeBooks } = useApi<any>()
    const { loading: categoriesLoading, execute: executeCategories } = useApi<Category[]>()
    const { loading: authorsLoading, execute: executeAuthors } = useApi<Author[]>()
    const { loading: publishersLoading, execute: executePublishers } = useApi<Publisher[]>()

    const [totalPages, setTotalPages] = useState(10)

    useEffect(() => {
        loadBooks()
    }, [currentPage, itemsPerPage, sortField, sortDirection])

    useEffect(() => {
        loadAuthors()
        loadPublishers()
    }, [])

    const  handleDeleteBook = async (id: number) => {
        try {
            const response = await fetch('http://localhost/api/admin/books/' + id,{
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                }
            })
            if (!response.ok) {
                throw new Error("Failed to delete book")
            }
            toast("Xóa sách thành công")
            loadBooks()
        }
        catch(error) {
            console.log(error)
        }
    }

    const loadBooks = async () => {
        try {
            const result = await executeBooks(() =>
                booksApi.getBooks({
                    name: searchName || undefined,
                    isbn: searchIsbn || undefined,
                    pageIndex: currentPage - 1,
                    pageSize: itemsPerPage,
                }),
            )

            if (result) {
                setBooks(result.items)
                setTotalPages(result.totalPages)
            }
        } catch (error) {
            console.error("Failed to load books:", error)
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


    const loadAuthors = async () => {
        try {
            const result = await executeAuthors(() => booksApi.getAuthors())
            if (result) setAuthors(result)
        } catch (error) {
            console.error("Failed to load authors:", error)
        }
    }

    const loadPublishers = async () => {
        try {
            const result = await executePublishers(() => booksApi.getPublishers())
            if (result) setPublishers(result)
        } catch (error) {
            console.error("Failed to load publishers:", error)
        }
    }

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedBooks(books.map((book) => book.id))
        } else {
            setSelectedBooks([])
        }
    }

    const handleSelectBook = (bookId: number, checked: boolean) => {
        if (checked) {
            setSelectedBooks([...selectedBooks, bookId])
        } else {
            setSelectedBooks(selectedBooks.filter((id) => id !== bookId))
        }
    }

    const handleBulkAction = async (action: "activate" | "deactivate" | "delete") => {
        if (selectedBooks.length === 0) {
            toast.error("Vui lòng chọn ít nhất một sách")
            return
        }

        try {
            toast.success(
                `Đã ${action === "activate" ? "kích hoạt" : action === "deactivate" ? "vô hiệu hóa" : "xóa"} ${selectedBooks.length} sách`,
            )
            setSelectedBooks([])
            loadBooks()
        } catch (error) {
            console.error("Bulk action failed:", error)
        }
    }

    const search_books = () => {
        setCurrentPage(1)
        loadBooks()
    }

    const clearFilters = () => {
        setSearchName("")
        setSearchIsbn("")
        setStatusFilter(undefined)
        setCategoryFilter("all")
        setAuthorFilter("all")
        setPublisherFilter("all")
        setCurrentPage(1)
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN")
    }

    const isLoading = booksLoading || categoriesLoading || authorsLoading || publishersLoading

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Quản lý sách</CardTitle>
                        <CardDescription>Quản lý thông tin và trạng thái của tất cả sách trong hệ thống</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                        {/*<Button variant="outline" size="sm" disabled={isLoading}>*/}
                        {/*    <Download className="h-4 w-4 mr-2" />*/}
                        {/*    Xuất Excel*/}
                        {/*</Button>*/}
                        <Link to="/admin/books/add">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Thêm sách
                            </Button>
                        </Link>

                    </div>
                </div>
            </CardHeader>

            <CardContent>

                <div className="flex flex-row flex-wrap items-center gap-4 mb-6">
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                        <Input
                            placeholder="Tìm theo tên sách..."
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            className="pl-10"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                        <Input
                            placeholder="Tìm theo ISBN..."
                            value={searchIsbn}
                            onChange={(e) => setSearchIsbn(e.target.value)}
                            className="pl-10"
                            disabled={isLoading}
                        />
                    </div>

                    <Button variant="outline" onClick={search_books} disabled={isLoading}>
                        Tìm kiếm
                    </Button>
                </div>


                {selectedBooks.length > 0 && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-blue-700">Đã chọn {selectedBooks.length} sách</span>
                        {/*<Button variant="outline" size="sm" onClick={() => handleBulkAction("activate")}*/}
                        {/*        disabled={isLoading}>*/}
                        {/*    <BookOpen className="h-4 w-4 mr-2"/>*/}
                        {/*    Kích hoạt*/}
                        {/*</Button>*/}
                        {/*<Button variant="outline" size="sm" onClick={() => handleBulkAction("deactivate")} disabled={isLoading}>*/}
                        {/*    <BookOpen className="h-4 w-4 mr-2" />*/}
                        {/*    Vô hiệu hóa*/}
                        {/*</Button>*/}
                        <Button variant="outline" size="sm" onClick={() => handleBulkAction("delete")}
                                disabled={isLoading}>
                            <Trash2 className="h-4 w-4 mr-2"/>
                            Xóa
                        </Button>
                    </div>
                )}

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={selectedBooks.length === books.length && books.length > 0}
                                        onCheckedChange={handleSelectAll}
                                        disabled={isLoading}
                                    />
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-gray-50"
                                           onClick={() => handleSort("title")}>
                                    Sách
                                    {sortField === "title" && (
                                        <ChevronDown
                                            className={`inline h-4 w-4 ml-1 ${sortDirection === "desc" ? "rotate-180" : ""}`}/>
                                    )}
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-gray-50"
                                           onClick={() => handleSort("isbn")}>
                                    ISBN
                                    {sortField === "isbn" && (
                                        <ChevronDown
                                            className={`inline h-4 w-4 ml-1 ${sortDirection === "desc" ? "rotate-180" : ""}`}/>
                                    )}
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-gray-50"
                                           onClick={() => handleSort("price")}>
                                    Giá
                                    {sortField === "price" && (
                                        <ChevronDown
                                            className={`inline h-4 w-4 ml-1 ${sortDirection === "desc" ? "rotate-180" : ""}`}/>
                                    )}
                                </TableHead>
                                {/*<TableHead className="cursor-pointer hover:bg-gray-50"*/}
                                {/*           onClick={() => handleSort("stock")}>*/}
                                {/*    Kho*/}
                                {/*    {sortField === "stock" && (*/}
                                {/*        <ChevronDown*/}
                                {/*            className={`inline h-4 w-4 ml-1 ${sortDirection === "desc" ? "rotate-180" : ""}`}/>*/}
                                {/*    )}*/}
                                {/*</TableHead>*/}
                                <TableHead className="cursor-pointer hover:bg-gray-50"
                                           onClick={() => handleSort("publishedDate")}>
                                    Xuất bản
                                    {sortField === "publishedDate" && (
                                        <ChevronDown
                                            className={`inline h-4 w-4 ml-1 ${sortDirection === "desc" ? "rotate-180" : ""}`}/>
                                    )}
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-gray-50"
                                           onClick={() => handleSort("createdAt")}>
                                    Ngày tạo
                                </TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        <div className="flex items-center justify-center">
                                            <div
                                                className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                            <span className="ml-2">Đang tải...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : books.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                        Không tìm thấy sách nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                books.map((book) => (
                                    <TableRow key={book.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedBooks.includes(book.id)}
                                                onCheckedChange={(checked) => handleSelectBook(book.id, checked as boolean)}
                                                disabled={isLoading}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-12 w-12 rounded-md">
                                                    <AvatarImage src={book.images[0]?.imageUrl || "/placeholder.svg"}
                                                                 alt={book.title}/>
                                                    <AvatarFallback className="rounded-md">
                                                        <BookOpen className="h-6 w-6"/>
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div
                                                        className="font-medium max-w-[200px] truncate">{book.title}</div>
                                                    <div className="text-sm text-gray-500">{book.name}</div>
                                                    <div className="text-xs text-gray-400">ID: {book.id}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-mono text-sm">{book.isbn}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{formatPrice(book.salePrice)}</div>
                                                {book.originalPrice > book.salePrice && (
                                                    <div
                                                        className="text-sm text-gray-500 line-through">{formatPrice(book.originalPrice)}</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        {/*<TableCell>*/}
                                        {/*    <div*/}
                                        {/*        className={`text-sm ${book.stockQuantity > 0 ? "text-green-600" : "text-red-600"}`}>*/}
                                        {/*        {book.stockQuantity > 0 ? `${book.stockQuantity} cuốn` : "Hết hàng"}*/}
                                        {/*    </div>*/}
                                        {/*</TableCell>*/}
                                        <TableCell>
                                            <div className="text-sm">{formatDate(book.publishedDate)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{formatDate(book.createdAt)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={isLoading}>
                                                        <MoreHorizontal className="h-4 w-4"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                                    {/*<DropdownMenuItem>*/}
                                                    {/*    <Eye className="h-4 w-4 mr-2"/>*/}
                                                    {/*    Xem chi tiết*/}
                                                    {/*</DropdownMenuItem>*/}
                                                    <Link to={"/admin/books/edit/" + book.id}>
                                                        <DropdownMenuItem>
                                                            <Edit className="h-4 w-4 mr-2"/>
                                                            Chỉnh sửa
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuSeparator/>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteBook(book.id)}>
                                                        <Trash2 className="h-4 w-4 mr-2"/>
                                                        Xóa
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>


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
            </CardContent>
        </Card>
    )
}
