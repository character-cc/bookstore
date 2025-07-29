"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Trash2, Package, BookOpen, DollarSign, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface BookDto {
    id: number
    name: string
    isbn: string
    authors: { name: string }[]
    categories: { name: string }[]
    publishers: { name: string }[]
    images: { imageUrl: string }[]
    salePrice: number
}

interface ImportEntryDto {
    id: number
    bookId: number
    book: BookDto
    initialStockQuantity: number
    costPrice: number
}

interface AddImportForm {
    bookId: number | null
    initialStockQuantity: number
    costPrice: number
}



const mockBooks: BookDto[] = [
    {
        id: 101,
        name: "Toán học lớp 12",
        isbn: "978-604-2-12345-6",
        authors: [{ name: "Nguyễn Văn A" }],
        categories: [{ name: "Sách giáo khoa" }],
        publishers: [{ name: "NXB Giáo dục" }],
        images: [{ imageUrl: "/placeholder.svg?height=60&width=45" }],
        salePrice: 95000,
    },
    {
        id: 102,
        name: "Văn học lớp 11",
        isbn: "978-604-2-12346-7",
        authors: [{ name: "Trần Thị B" }],
        categories: [{ name: "Sách giáo khoa" }],
        publishers: [{ name: "NXB Giáo dục" }],
        images: [{ imageUrl: "/placeholder.svg?height=60&width=45" }],
        salePrice: 165000,
    },
    {
        id: 103,
        name: "Lịch sử lớp 10",
        isbn: "978-604-2-12347-8",
        authors: [{ name: "Lê Văn C" }],
        categories: [{ name: "Sách giáo khoa" }],
        publishers: [{ name: "NXB Giáo dục" }],
        images: [{ imageUrl: "/placeholder.svg?height=60&width=45" }],
        salePrice: 85000,
    },
    {
        id: 104,
        name: "Hóa học lớp 12",
        isbn: "978-604-2-12348-9",
        authors: [{ name: "Phạm Thị D" }],
        categories: [{ name: "Sách giáo khoa" }],
        publishers: [{ name: "NXB Giáo dục" }],
        images: [{ imageUrl: "/placeholder.svg?height=60&width=45" }],
        salePrice: 92000,
    },
    {
        id: 105,
        name: "Vật lý lớp 11",
        isbn: "978-604-2-12349-0",
        authors: [{ name: "Hoàng Văn E" }],
        categories: [{ name: "Sách giáo khoa" }],
        publishers: [{ name: "NXB Giáo dục" }],
        images: [{ imageUrl: "/placeholder.svg?height=60&width=45" }],
        salePrice: 88000,
    },
]

export default function ImportManagement() {
    const [importEntries, setImportEntries] = useState<ImportEntryDto[]>([])
    const [books, setBooks] = useState<BookDto[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const [showBookDialog, setShowBookDialog] = useState(false)
    const [bookSearchTerm, setBookSearchTerm] = useState("")

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const [totalPages, setTotalPages] = useState(10)
    const [addForm, setAddForm] = useState<AddImportForm>({
        bookId: null,
        initialStockQuantity: 1,
        costPrice: 0,
    })

    useEffect(() => {
        loadBooks()
    }, [])

    useEffect(() => {
        loadBooks()
    }, [bookSearchTerm]);

    useEffect(() => {
        loadImportEntries()
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

    const handleSearch = async () => {
        setCurrentPage(1)
        loadImportEntries()
    }

    const loadImportEntries = async () => {
        try {
            setLoading(true)
            const response = await fetch("http://localhost/api/admin/books/imports/search",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    keyword: searchTerm,
                    pageIndex: currentPage - 1,
                    pageSize: itemsPerPage,
                }),
            })

            const data = await response.json()
            console.log(data)
            setImportEntries(data.items)
            setTotalPages(data.totalPages)
        } catch (error) {
            console.error("Error loading import entries:", error)
            toast("Không thể tải danh sách nhập hàng")
        } finally {
            setLoading(false)
        }
    }

    const loadBooks = async () => {
        try {
            const response = await fetch("http://localhost/api/books/search",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    keyword: bookSearchTerm,
                    pageIndex: 0,
                    pageSize: 100,
                }),
            })
            const data = await response.json()
            setBooks(data.items)
        } catch (error) {
            console.error("Error loading books:", error)
            toast("Không thể tải danh sách sách")
        }
    }

    const handleSelectBook = (book: BookDto) => {
        setAddForm((prev) => ({
            ...prev,
            bookId: book.id,
            costPrice: Math.round(book.salePrice * 0.7), // Suggest 70% of sale price
        }))
        setShowBookDialog(false)
        setBookSearchTerm("")
    }

    const handleAddImportEntry = async () => {
        if (!addForm.bookId || addForm.initialStockQuantity <= 0 || addForm.costPrice <= 0) {
            toast("Vui lòng điền đầy đủ thông tin")
            return
        }

        try {
            setLoading(true)

            const selectedBook = books.find((book) => book.id === addForm.bookId)
            if (!selectedBook) {
                toast("Không tìm thấy sách được chọn")
                return
            }

            try {
                const response = await fetch("http://localhost/api/admin/books/imports", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        bookId: addForm.bookId,
                        initialStockQuantity: addForm.initialStockQuantity,
                        costPrice: addForm.costPrice
                    })
                })
                if(!response.ok) {
                    throw new Error("Loi")
                }
            }
            catch (error) {
                console.error("Error loading import entries:", error)
            }



            loadImportEntries()
            setAddForm({
                bookId: null,
                initialStockQuantity: 1,
                costPrice: 0,
            })

            toast("Thêm lần nhập hàng thành công!")
        } catch (error) {
            console.error("Error adding import entry:", error)
            toast("Có lỗi xảy ra khi thêm lần nhập hàng!")
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteImportEntry = async (entryId: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa lần nhập hàng này?")) {
            return
        }

        try {
            setLoading(true)

            await fetch(`http://localhost/api/admin/books/imports/${entryId}`, {
              method: "DELETE"
            })

            toast("Xóa lần nhập hàng thành công!")
            loadImportEntries()
        } catch (error) {
            console.error("Error deleting import entry:", error)
            toast("Có lỗi xảy ra khi xóa lần nhập hàng!")
        } finally {
            setLoading(false)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ"
    }

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString("vi-VN")
    }

    const getMainImage = (book: BookDto) => {
        return book.images && book.images.length > 0 ? book.images[0].imageUrl : "/placeholder.svg?height=60&width=45"
    }

    const getAuthorsText = (authors: { name: string }[]) => {
        return authors.map((author) => author.name).join(", ")
    }



    const selectedBook = books.find((book) => book.id === addForm.bookId)

    const totalEntries = importEntries.length
    const totalQuantity = importEntries.reduce((sum, entry) => sum + entry.initialStockQuantity, 0)
    const totalValue = importEntries.reduce((sum, entry) => sum + entry.initialStockQuantity * entry.costPrice, 0)
    const uniqueBooks = new Set(importEntries.map((entry) => entry.bookId)).size

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý nhập hàng</h1>
                    <p className="text-gray-600">Theo dõi từng lần nhập hàng chi tiết</p>
                </div>
            </div>


            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5"/>
                        Thêm lần nhập hàng mới
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Label>Chọn sách *</Label>
                            <Button variant="outline" className="w-full justify-start mt-1"
                                    onClick={() => setShowBookDialog(true)}>
                                {selectedBook ? (
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={getMainImage(selectedBook) || "/placeholder.svg"}
                                            alt={selectedBook.name}
                                            className="w-6 h-8 object-cover rounded"
                                        />
                                        <span className="truncate">{selectedBook.name}</span>
                                    </div>
                                ) : (
                                    "Chọn sách..."
                                )}
                            </Button>
                        </div>

                        <div>
                            <Label htmlFor="initialStockQuantity">Số lượng *</Label>
                            <Input
                                id="initialStockQuantity"
                                type="number"
                                min="1"
                                value={addForm.initialStockQuantity}
                                onChange={(e) =>
                                    setAddForm((prev) => ({
                                        ...prev,
                                        initialStockQuantity: Number.parseInt(e.target.value) || 1,
                                    }))
                                }
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="costPrice">Đơn giá *</Label>
                            <Input
                                id="costPrice"
                                type="number"
                                min="0"
                                value={addForm.costPrice}
                                onChange={(e) =>
                                    setAddForm((prev) => ({
                                        ...prev,
                                        costPrice: Number.parseInt(e.target.value) || 0,
                                    }))
                                }
                                className="mt-1"
                            />
                        </div>

                        <div className="flex items-end">
                            <Button
                                onClick={handleAddImportEntry}
                                disabled={!addForm.bookId || addForm.initialStockQuantity <= 0 || addForm.costPrice <= 0 || loading}
                                className="w-full"
                            >
                                {loading ? "Đang thêm..." : "Thêm"}
                            </Button>
                        </div>
                    </div>

                    {selectedBook && (
                        <div className="mt-4 p-3 bg-blue-50 rounded border">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={getMainImage(selectedBook) || "/placeholder.svg"}
                                        alt={selectedBook.name}
                                        className="w-12 h-16 object-cover rounded"
                                    />
                                    <div>
                                        <div className="font-medium">{selectedBook.name}</div>
                                        <div className="text-sm text-gray-500">
                                            ISBN: {selectedBook.isbn} | Giá bán: {formatPrice(selectedBook.salePrice)}
                                        </div>
                                    </div>
                                </div>
                                {addForm.initialStockQuantity > 0 && addForm.costPrice > 0 && (
                                    <div className="text-right">
                                        <div className="text-sm text-gray-600">Tổng tiền:</div>
                                        <div className="text-lg font-bold text-green-600">
                                            {formatPrice(addForm.initialStockQuantity * addForm.costPrice)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex gap-4 mb-6">
                <div className="flex gap-2 max-w-md">
                    <Input
                        placeholder="Tìm kiếm theo tên sách hoặc isbn...."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 w-full"
                    />
                    <Button onClick={handleSearch} disabled={loading} variant="outline">
                        <Search className="h-4 w-4 mr-2"/>
                        Tìm kiếm
                    </Button>
                </div>
            </div>

            <div className="bg-white border rounded">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sách</TableHead>
                            <TableHead>Số lượng</TableHead>
                            <TableHead>Đơn giá</TableHead>
                            <TableHead>Ngày nhập</TableHead>
                            <TableHead className="w-20">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <div
                                        className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                                    <span className="ml-2">Đang tải...</span>
                                </TableCell>
                            </TableRow>
                        ) : importEntries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <div className="text-gray-500">Không tìm thấy lần nhập hàng nào</div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            importEntries.map((entry) => (
                                <TableRow key={entry.id} className="hover:bg-gray-50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={getMainImage(entry.book) || "/placeholder.svg"}
                                                alt={entry.book.name}
                                                className="w-12 h-16 object-cover rounded"
                                            />
                                            <div>
                                                <div className="font-medium">{entry.book.name}</div>
                                                <div className="text-sm text-gray-500">ISBN: {entry.book.isbn}</div>
                                                <div
                                                    className="text-sm text-gray-500">{getAuthorsText(entry.book.authors)}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                            {entry.initialStockQuantity} quyển
                                    </TableCell>
                                    <TableCell
                                        className="font-mono font-medium">{formatPrice(entry.costPrice)}</TableCell>
                                    <TableCell className="text-sm">{formatDateTime(entry.createdAt)}</TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDeleteImportEntry(entry.id)}
                                            disabled={loading}
                                        >
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
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

            <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Chọn sách</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                            <Input
                                placeholder="Tìm kiếm sách..."
                                value={bookSearchTerm}
                                onChange={(e) => setBookSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="max-h-96 overflow-y-auto border rounded">
                            {books.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">Không tìm thấy sách nào</div>
                            ) : (
                                <div className="space-y-1">
                                    {books.map((book) => (
                                        <div
                                            key={book.id}
                                            className="p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0"
                                            onClick={() => handleSelectBook(book)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={getMainImage(book) || "/placeholder.svg"}
                                                    alt={book.name}
                                                    className="w-12 h-16 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium">{book.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        ISBN: {book.isbn} | {getAuthorsText(book.authors)}
                                                    </div>
                                                    <div className="text-sm text-green-600">Giá
                                                        bán: {formatPrice(book.salePrice)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}