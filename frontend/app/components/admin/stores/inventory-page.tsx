"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Edit, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

import {useParams} from "react-router";

interface BookImageDto {
    id: number
    bookId: number
    imageUrl: string
    createdAt: string
    updatedAt: string
}

interface AuthorDto {
    id: number
    name: string
    biography: string
    imageUrl: string
    createAt: string
    updatedAt: string
}

interface CategoryDto {
    id: number
    name: string
}

interface PublisherDto {
    id: number
    name: string
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
    shortDescription: string
    fullDescription: string
    languageId: number
    isDeleted: boolean
    pageCount: number
    inventoryManagementMethodId: number
    stockQuantity?: number
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
    authors: AuthorDto[]
    categories: CategoryDto[]
    publishers: PublisherDto[]
}

interface StoreDto {
    id: number
    name: string
    address: string
}

interface StoreBookDto {
    storeId: number
    bookId: number
    quantity: number
    lowStockThreshold: number
    store: StoreDto
    book: BookDto
}





export default function InventoryPage() {
    const [inventory, setInventory] = useState([])
    const [books, setBooks] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [selectedBooks, setSelectedBooks] = useState<number[]>([])
    const [editingItem, setEditingItem] = useState<StoreBookDto | null>(null)
    const [editStock, setEditStock] = useState("")
    const [editThreshold, setEditThreshold] = useState("")
    const [bookSearchTerm, setBookSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)


    const [filteredBooks , setFilteredBooks] = useState([])

    const { id } = useParams()

    const storeId = parseInt(id ?? "0", 10)
    useEffect(() => {
        loadInventory()
    }, [storeId,searchTerm,statusFilter])

    useEffect(() => {
        loadBooks()
    }, [bookSearchTerm]);

    const loadInventory = async () => {
        try {
            setLoading(true)
            const response = await fetch(`http://localhost/api/admin/stores/${storeId}/search`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    storeId: storeId,
                    keyword: searchTerm,
                    stockFilter: statusFilter,
                    pageIndex: 0,
                    pageSize: 10,
                }),
            })
            const data = await response.json()
            setInventory(data.items)
        } catch (error) {
            console.log(error)
            toast("Không thể tải danh sách tồn kho")
        } finally {
            setLoading(false)
        }
    }

    const loadBooks = async () => {
        try {
            setLoading(true)
            const response = await fetch(`http://localhost/api/admin/books/inventory-store`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  storeId: storeId,
                  keyword: bookSearchTerm,
                  pageIndex: 0,
                  pageSize: 100,
              })
            })
            const data = await response.json()
            setBooks(data.items || [])
        } catch (error) {
            console.log(error)
            toast("Không thể tải danh sách sách")
        } finally {
            setLoading(false)
        }
    }

    const getStockStatus = (item: StoreBookDto) => {
        if (item.quantity === 0) {
            return { label: "Hết hàng", color: "bg-red-100 text-red-800" }
        } else if (item.quantity <= item.lowStockThreshold) {
            return { label: "Sắp hết", color: "bg-yellow-100 text-yellow-800" }
        } else {
            return { label: "Còn hàng", color: "bg-green-100 text-green-800" }
        }
    }

    const filteredInventory = inventory.filter((item) => {
        const matchesSearch =
            item.book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.book.isbn.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "in-stock" && item.quantity > item.lowStockThreshold) ||
            (statusFilter === "low-stock" && item.quantity <= item.lowStockThreshold && item.quantity > 0) ||
            (statusFilter === "out-of-stock" && item.quantity === 0)

        return matchesSearch && matchesStatus
    })



    const handleEdit = (item: StoreBookDto) => {
        setEditingItem(item)
        setEditStock(item.quantity.toString())
        setEditThreshold(item.lowStockThreshold.toString())
    }

    const handleSaveEdit = async () => {
        if (!editingItem) return

        try {
            setLoading(true)

            await fetch(`http://localhost/api/admin/stores/${storeId}/inventory/${editingItem.bookId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                quantity: Number(editStock),
                lowStockThreshold: Number(editThreshold)
              })
            })


            setEditingItem(null)
            toast("Cập nhật thành công!")
            loadInventory()
        } catch (error) {
            console.log(error)
            toast("Có lỗi xảy ra khi cập nhật!")
        } finally {
            setLoading(false)
        }
    }

    const handleAddBooks = async () => {
        try {
            setLoading(true)

            await fetch(`http://localhost/api/admin/stores/${storeId}/inventory`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookIds: selectedBooks
              })
            })


            setSelectedBooks([])
            setShowAddDialog(false)
            setBookSearchTerm("")
            toast(`Đã thêm sách vào kho`)
            loadInventory()
        } catch (error) {
            console.log(error)
            toast("Có lỗi xảy ra khi thêm sách!")
        } finally {
            setLoading(false)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ"
    }

    const getMainImage = (book: BookDto) => {
        return book.images && book.images.length > 0 ? book.images[0].imageUrl : "/placeholder.svg?height=80&width=60"
    }

    const getAuthorsText = (authors: AuthorDto[]) => {
        return authors.map((author) => author.name).join(", ")
    }

    const getCategoriesText = (categories: CategoryDto[]) => {
        return categories.map((category) => category.name).join(", ")
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" onClick={() => window.history.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Quản lý tồn kho </h1>
                    <p className="text-gray-600">Quản lý số lượng và ngưỡng cảnh báo cho từng sách</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 border rounded">
                    <div className="text-2xl font-bold">{inventory.length}</div>
                    <div className="text-sm text-gray-600">Tổng sản phẩm</div>
                </div>
                <div className="bg-white p-4 border rounded">
                    <div className="text-2xl font-bold text-green-600">
                        {inventory.filter((i) => i.quantity > i.lowStockThreshold).length}
                    </div>
                    <div className="text-sm text-gray-600">Còn hàng</div>
                </div>
                <div className="bg-white p-4 border rounded">
                    <div className="text-2xl font-bold text-yellow-600">
                        {inventory.filter((i) => i.quantity <= i.lowStockThreshold && i.quantity > 0).length}
                    </div>
                    <div className="text-sm text-gray-600">Sắp hết</div>
                </div>
                <div className="bg-white p-4 border rounded">
                    <div className="text-2xl font-bold text-red-600">{inventory.filter((i) => i.quantity === 0).length}</div>
                    <div className="text-sm text-gray-600">Hết hàng</div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm sách..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="in-stock">Còn hàng</SelectItem>
                        <SelectItem value="low-stock">Sắp hết</SelectItem>
                        <SelectItem value="out-of-stock">Hết hàng</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={() => setShowAddDialog(true)} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm sách
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white border rounded">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sách</TableHead>
                            <TableHead>ISBN</TableHead>
                            <TableHead>Tác giả</TableHead>
                            <TableHead>Giá bán</TableHead>
                            <TableHead>Tồn kho</TableHead>
                            <TableHead>Ngưỡng cảnh báo</TableHead>
                            {/*<TableHead>Trạng thái</TableHead>*/}
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                                    <span className="ml-2">Đang tải...</span>
                                </TableCell>
                            </TableRow>
                        ) : inventory.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    <div className="text-gray-500">Không tìm thấy sản phẩm nào</div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            inventory.map((item) => {
                                const stockStatus = getStockStatus(item)
                                const isEditing = editingItem?.bookId === item.bookId

                                return (
                                    <TableRow key={item.bookId}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={getMainImage(item.book) || "/placeholder.svg"}
                                                    alt={item.book.name}
                                                    className="w-10 h-12 object-cover rounded"
                                                />
                                                <div>
                                                    <div className="font-medium">{item.book.name}</div>
                                                    <div className="text-sm text-gray-500">ID: {item.book.id}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{item.book.isbn}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">{getAuthorsText(item.book.authors)}</div>
                                        </TableCell>
                                        <TableCell>{formatPrice(item.book.salePrice)}</TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Input
                                                    type="number"
                                                    value={editStock}
                                                    onChange={(e) => setEditStock(e.target.value)}
                                                    className="w-20"
                                                    min="0"
                                                />
                                            ) : (
                                                <span className="font-bold">{item.quantity}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Input
                                                    type="number"
                                                    value={editThreshold}
                                                    onChange={(e) => setEditThreshold(e.target.value)}
                                                    className="w-20"
                                                    min="0"
                                                />
                                            ) : (
                                                item.lowStockThreshold
                                            )}
                                        </TableCell>
                                        {/*<TableCell>*/}
                                        {/*    <Badge className={stockStatus.color}>{stockStatus.label}</Badge>*/}
                                        {/*</TableCell>*/}
                                        <TableCell>
                                            {isEditing ? (
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={handleSaveEdit} disabled={loading}>
                                                        Lưu
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                                                        Hủy
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button size="sm" variant="ghost" onClick={() => handleEdit(item)} disabled={loading}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Chọn sách để thêm vào kho</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Search input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Tìm kiếm sách theo tên, ISBN, tác giả..."
                                value={bookSearchTerm}
                                onChange={(e) => setBookSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedBooks.length === filteredBooks.length && filteredBooks.length > 0}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedBooks(filteredBooks.map((book) => book.id))
                                                    } else {
                                                        setSelectedBooks([])
                                                    }
                                                }}
                                            />
                                        </TableHead>
                                        <TableHead>Sách</TableHead>
                                        <TableHead>ISBN</TableHead>
                                        <TableHead>Tác giả</TableHead>
                                        <TableHead>Giá bán</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {books.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                <div className="text-gray-500">Không tìm thấy sách nào phù hợp</div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        books.map((book) => (
                                            <TableRow key={book.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedBooks.includes(book.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedBooks((prev) => [...prev, book.id])
                                                            } else {
                                                                setSelectedBooks((prev) => prev.filter((id) => id !== book.id))
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={getMainImage(book) || "/placeholder.svg"}
                                                            alt={book.name}
                                                            className="w-10 h-12 object-cover rounded"
                                                        />
                                                        <div>
                                                            <div className="font-medium">{book.name}</div>
                                                            <div className="text-sm text-gray-500">ID: {book.id}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">{book.isbn}</TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{getAuthorsText(book.authors)}</div>
                                                </TableCell>
                                                <TableCell>{formatPrice(book.salePrice)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowAddDialog(false)
                                    setBookSearchTerm("")
                                    setSelectedBooks([])
                                }}
                            >
                                Hủy
                            </Button>
                            <Button onClick={handleAddBooks} disabled={selectedBooks.length === 0 || loading}>
                                {loading ? "Đang thêm..." : `Thêm (${selectedBooks.length})`}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
