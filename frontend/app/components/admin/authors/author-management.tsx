"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, ImageIcon, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {useNavigate} from "react-router";

interface Author {
    id: number
    name: string
    biography: string
    imageUrl: string
    isShownOnHomePage: boolean
    displayOrder: number
    createdAt: string
    updatedAt: string
}

// Mock data
const mockAuthors: Author[] = [
    {
        id: 1,
        name: "Dale Carnegie",
        biography:
            "Tác giả người Mỹ nổi tiếng với các tác phẩm về phát triển bản thân và kỹ năng giao tiếp. Ông được biết đến nhiều nhất qua cuốn sách 'Đắc Nhân Tâm'.",
        imageUrl: "/placeholder.svg?height=60&width=60",
        isShownOnHomePage: true,
        displayOrder: 1,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
    },
    {
        id: 2,
        name: "Yuval Noah Harari",
        biography:
            "Nhà sử học người Israel, tác giả của các cuốn sách bán chạy như 'Sapiens', 'Homo Deus' và '21 Lessons for the 21st Century'.",
        imageUrl: "/placeholder.svg?height=60&width=60",
        isShownOnHomePage: true,
        displayOrder: 2,
        createdAt: "2024-01-16T10:00:00Z",
        updatedAt: "2024-01-16T10:00:00Z",
    },
    {
        id: 3,
        name: "James Clear",
        biography:
            "Tác giả cuốn sách 'Atomic Habits', chuyên gia về thói quen và cải thiện hiệu suất. Ông là diễn giả và nhà tư vấn nổi tiếng.",
        imageUrl: "/placeholder.svg?height=60&width=60",
        isShownOnHomePage: false,
        displayOrder: 0,
        createdAt: "2024-01-17T10:00:00Z",
        updatedAt: "2024-01-17T10:00:00Z",
    },
    {
        id: 4,
        name: "Paulo Coelho",
        biography:
            "Tiểu thuyết gia người Brazil, tác giả của 'Nhà Giả Kim' - một trong những cuốn sách được dịch nhiều nhất thế giới.",
        imageUrl: "/placeholder.svg?height=60&width=60",
        isShownOnHomePage: true,
        displayOrder: 3,
        createdAt: "2024-01-18T10:00:00Z",
        updatedAt: "2024-01-18T10:00:00Z",
    },
    {
        id: 5,
        name: "Daniel Kahneman",
        biography: "Nhà tâm lý học đoạt giải Nobel Kinh tế, tác giả cuốn 'Thinking, Fast and Slow' (Tư Duy Nhanh Và Chậm).",
        imageUrl: "/placeholder.svg?height=60&width=60",
        isShownOnHomePage: false,
        displayOrder: 0,
        createdAt: "2024-01-19T10:00:00Z",
        updatedAt: "2024-01-19T10:00:00Z",
    },
]

export default function AuthorManagement() {
    const [authors, setAuthors] = useState<Author[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const [totalPages, setTotalPages] = useState(10)
    useEffect(() => {
        loadAuthors()
    }, [currentPage])

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
            setLoading(true)
            const response = await fetch("http://localhost/api/admin/authors/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body : JSON.stringify({
                    keyword: searchTerm,
                    pageIndex: currentPage - 1,
                    pageSize: itemsPerPage,
                })
            })
            const data = await response.json()
            setAuthors(data.items)
            setTotalPages(data.totalPages)
        } catch (error) {
            console.log(error)
            toast("Không thể tải danh sách tác giả")
        } finally {
            setLoading(false)
        }
    }

    const router = useNavigate()

    const handleAdd = () => {

        router("/admin/authors/add")
    }

    const handleEdit = (author: Author) => {

        router(`/admin/authors/${author.id}/edit`)
    }

    const handleDelete = async (authorId: number) => {
        try {
            setLoading(true)
            await fetch(`http://localhost/api/admin/authors/${authorId}`, {
              method: "DELETE"
            })

            toast("Xóa tác giả thành công!")
            loadAuthors()
        } catch (error) {
            console.error("Delete author failed:", error)
            toast("Có lỗi xảy ra khi xóa tác giả!")
        } finally {
            setLoading(false)
        }
    }


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const handleSearch = async () => {
        setCurrentPage(1)
        loadAuthors()
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý tác giả</h1>
                    <p className="text-gray-600 mt-1">Quản lý thông tin tác giả và hiển thị trên trang chủ</p>
                </div>
                <Button onClick={handleAdd} disabled={loading} className="flex items-center gap-2">
                    <Plus className="h-4 w-4"/>
                    Thêm tác giả
                </Button>
            </div>

            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex gap-2 max-w-md">
                        <Input
                            placeholder="Tìm kiếm tác giả theo tên hoặc tiểu sử..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button onClick={handleSearch}  disabled={loading} variant="outline">
                            <Search className="h-4 w-4 mr-2"/>
                            Tìm kiếm
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead>Tác giả</TableHead>
                                <TableHead>Tiểu sử</TableHead>
                                <TableHead>Hình ảnh</TableHead>
                                <TableHead>Hiển thị trang chủ</TableHead>
                                <TableHead>Thứ tự</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <div
                                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                                        <span className="ml-2">Đang tải...</span>
                                    </TableCell>
                                </TableRow>
                            ) : authors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <div className="text-gray-500">
                                            {searchTerm ? "Không tìm thấy tác giả nào phù hợp" : "Chưa có tác giả nào"}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                authors.map((author) => (
                                    <TableRow key={author.id} className="hover:bg-gray-50">
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{author.name}</div>
                                                <div className="text-sm text-gray-500">ID: {author.id}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-md">
                                                <div
                                                    className="text-sm line-clamp-3">{author.biography || "Không có tiểu sử"}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {author.imageUrl ? (
                                                <img
                                                    src={author.imageUrl || "/placeholder.svg"}
                                                    alt={author.name}
                                                    className="w-12 h-12 object-cover rounded border"
                                                />
                                            ) : (
                                                <div
                                                    className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                                                    <ImageIcon className="h-6 w-6 text-gray-400"/>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {author.isShownOnHomePage ? (
                                                <Badge variant="outline" className="text-xs">
                                                    <Eye className="h-3 w-3 mr-1"/>
                                                    Hiển thị
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-xs">
                                                    <EyeOff className="h-3 w-3 mr-1"/>
                                                    Ẩn
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div
                                                className="text-sm">{author.isShownOnHomePage ? author.displayOrder : "-"}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div>{formatDate(author.createdAt)}</div>
                                                {author.updatedAt !== author.createdAt && (
                                                    <div className="text-xs text-gray-500">Cập
                                                        nhật: {formatDate(author.updatedAt)}</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" disabled={loading}>
                                                        <Edit className="h-4 w-4"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(author)}>
                                                        <Edit className="h-4 w-4 mr-2"/>
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600"
                                                                      onClick={() => handleDelete(author.id)}>
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
