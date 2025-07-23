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
    subCategories: Category[]
    createdAt: string
    updatedAt: string
}

// Mock data
const mockCategories: Category[] = [
    {
        id: 1,
        name: "Văn học",
        description: "Sách văn học trong và ngoài nước",
        imageUrl: "/placeholder.svg?height=60&width=60",
        parentId: undefined,
        isShowOnHomepage: true,
        homepageDisplayOrder: 1,
        isShowOnNavigationBar: true,
        navigationDisplayOrder: 1,
        subCategories: [
            {
                id: 2,
                name: "Văn học Việt Nam",
                description: "Tác phẩm văn học của các tác giả Việt Nam",
                imageUrl: "/placeholder.svg?height=60&width=60",
                parentId: 1,
                isShowOnHomepage: false,
                homepageDisplayOrder: 0,
                isShowOnNavigationBar: false,
                navigationDisplayOrder: 0,
                subCategories: [],
                createdAt: "2024-01-15T10:00:00Z",
                updatedAt: "2024-01-15T10:00:00Z",
            },
            {
                id: 3,
                name: "Văn học nước ngoài",
                description: "Tác phẩm văn học được dịch từ nước ngoài",
                imageUrl: "/placeholder.svg?height=60&width=60",
                parentId: 1,
                isShowOnHomepage: false,
                homepageDisplayOrder: 0,
                isShowOnNavigationBar: false,
                navigationDisplayOrder: 0,
                subCategories: [],
                createdAt: "2024-01-15T10:00:00Z",
                updatedAt: "2024-01-15T10:00:00Z",
            },
        ],
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
    },
    {
        id: 4,
        name: "Khoa học - Công nghệ",
        description: "Sách về khoa học và công nghệ",
        imageUrl: "/placeholder.svg?height=60&width=60",
        parentId: undefined,
        isShowOnHomepage: true,
        homepageDisplayOrder: 2,
        isShowOnNavigationBar: true,
        navigationDisplayOrder: 2,
        subCategories: [],
        createdAt: "2024-01-16T10:00:00Z",
        updatedAt: "2024-01-16T10:00:00Z",
    },
    {
        id: 5,
        name: "Kinh tế",
        description: "Sách về kinh tế và quản lý",
        imageUrl: "/placeholder.svg?height=60&width=60",
        parentId: undefined,
        isShowOnHomepage: false,
        homepageDisplayOrder: 0,
        isShowOnNavigationBar: true,
        navigationDisplayOrder: 3,
        subCategories: [],
        createdAt: "2024-01-17T10:00:00Z",
        updatedAt: "2024-01-17T10:00:00Z",
    },
]

export default function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>(mockCategories)
    const [flatCategories, setFlatCategories] = useState<Category[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const [totalPages, setTotalPages] = useState(10)

    const router = useNavigate()
    useEffect(() => {
        loadCategories()
    }, [currentPage])

    useEffect(() => {
        const flatten = (cats: Category[], level = 0): Category[] => {
            let result: Category[] = []
            cats.forEach((cat) => {
                result.push({ ...cat, level } as Category & { level: number })
                if (cat.subCategories && cat.subCategories.length > 0) {
                    result = result.concat(flatten(cat.subCategories, level + 1))
                }
            })
            return result
        }
        setFlatCategories(flatten(categories))
    }, [categories])

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

    const loadCategories = async () => {
        try {
            setLoading(true)
            const response = await fetch("http://localhost/api/admin/categories/search",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({keyword : searchTerm, pageIndex: currentPage - 1, pageSize: itemsPerPage}),
            })
            const data = await response.json()
            setCategories(data.items)
            setTotalPages(data.totalPages)
        } catch (error) {
            console.log(error)
            toast("Không thể tải danh sách danh mục")
        } finally {
            setLoading(false)
        }
    }

    const  handleSearch = async () => {
        setCurrentPage(1)
        loadCategories()
    }

    const handleAdd = () => {
        router("/admin/categories/add")
    }

    const handleEdit = (category: Category) => {
        router("/admin/categories/"+category.id + "/edit")
    }

    const handleDelete = async (categoryId: number) => {
        try {
            setLoading(true)
            await fetch(`http://localhost/api/admin/categories/${categoryId}`, {
              method: "DELETE"
            })
            toast("Xóa danh mục thành công!")
            loadCategories()
        } catch (error) {
            console.error("Delete category failed:", error)
            toast("Có lỗi xảy ra khi xóa danh mục!")
        } finally {
            setLoading(false)
        }
    }


    const getCategoryLevel = (category: Category & { level?: number }) => {
        return "—".repeat((category.level || 0) * 2)
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

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
                    <p className="text-gray-600 mt-1">Quản lý danh mục sản phẩm và cấu trúc phân cấp</p>
                </div>
                <Button onClick={handleAdd} disabled={loading} className="flex items-center gap-2">
                    <Plus className="h-4 w-4"/>
                    Thêm danh mục
                </Button>
            </div>

            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex gap-2 max-w-md">
                        <Input
                            placeholder="Tìm kiếm theo tên danh mục..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className=""
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
                                <TableHead>Tên danh mục</TableHead>
                                <TableHead>Mô tả</TableHead>
                                <TableHead>Hình ảnh</TableHead>
                                <TableHead>Hiển thị</TableHead>
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
                            ) : categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <div className="text-gray-500">
                                            {searchTerm ? "Không tìm thấy danh mục nào phù hợp" : "Chưa có danh mục nào"}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((category) => (
                                    <TableRow key={category.id} className="hover:bg-gray-50">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-mono text-sm">
                          {getCategoryLevel(category as Category & { level: number })}
                        </span>
                                                <div>
                                                    <div className="font-medium">{category.name}</div>
                                                    <div className="text-sm text-gray-500">ID: {category.id}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-xs">
                                                <div
                                                    className="text-sm truncate">{category.description || "Không có mô tả"}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {category.imageUrl ? (
                                                <img
                                                    src={category.imageUrl || "/placeholder.svg"}
                                                    alt={category.name}
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
                                            <div className="space-y-1">
                                                {category.isShowOnHomepage && (
                                                    <Badge variant="outline" className="text-xs">
                                                        <Eye className="h-3 w-3 mr-1"/>
                                                        Trang chủ
                                                    </Badge>
                                                )}
                                                {category.isShowOnNavigationBar && (
                                                    <Badge variant="outline" className="text-xs">
                                                        <Eye className="h-3 w-3 mr-1"/>
                                                        Menu
                                                    </Badge>
                                                )}
                                                {!category.isShowOnHomepage && !category.isShowOnNavigationBar && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        <EyeOff className="h-3 w-3 mr-1"/>
                                                        Ẩn
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm space-y-1">
                                                {category.isShowOnHomepage &&
                                                    <div>Trang chủ: {category.homepageDisplayOrder}</div>}
                                                {category.isShowOnNavigationBar &&
                                                    <div>Menu: {category.navigationDisplayOrder}</div>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div>{formatDate(category.createdAt)}</div>
                                                {category.updatedAt !== category.createdAt && (
                                                    <div className="text-xs text-gray-500">Cập
                                                        nhật: {formatDate(category.updatedAt)}</div>
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
                                                    <DropdownMenuItem onClick={() => handleEdit(category)}>
                                                        <Edit className="h-4 w-4 mr-2"/>
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600"
                                                                      onClick={() => handleDelete(category.id)}>
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
