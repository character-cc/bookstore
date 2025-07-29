"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, ImageIcon, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {useNavigate} from "react-router";

interface Publisher {
    id: number
    name: string
    description: string
    website: string
    logoUrl: string
    createdAt: string
    updatedAt: string
}

const mockPublishers: Publisher[] = [
    {
        id: 1,
        name: "NXB Trẻ",
        description:
            "Nhà xuất bản Trẻ là một trong những nhà xuất bản hàng đầu Việt Nam, chuyên xuất bản sách văn học, giáo dục và phát triển bản thân.",
        website: "https://nxbtre.com.vn",
        logoUrl: "/placeholder.svg?height=60&width=60",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
    },
    {
        id: 2,
        name: "NXB Thế Giới",
        description:
            "Nhà xuất bản Thế Giới chuyên xuất bản các tác phẩm văn học nước ngoài được dịch sang tiếng Việt và sách khoa học xã hội.",
        website: "https://thegioi.vn",
        logoUrl: "/placeholder.svg?height=60&width=60",
        createdAt: "2024-01-16T10:00:00Z",
        updatedAt: "2024-01-16T10:00:00Z",
    },
    {
        id: 3,
        name: "NXB Tổng Hợp TP.HCM",
        description:
            "Nhà xuất bản Tổng hợp Thành phố Hồ Chí Minh xuất bản đa dạng các loại sách từ văn học, khoa học đến sách thiếu nhi.",
        website: "https://nxbhcm.com.vn",
        logoUrl: "/placeholder.svg?height=60&width=60",
        createdAt: "2024-01-17T10:00:00Z",
        updatedAt: "2024-01-17T10:00:00Z",
    },
    {
        id: 4,
        name: "NXB Kim Đồng",
        description:
            "Nhà xuất bản Kim Đồng chuyên xuất bản sách thiếu nhi, truyện tranh và các tác phẩm giáo dục dành cho trẻ em và thanh thiếu niên.",
        website: "https://kimdong.com.vn",
        logoUrl: "/placeholder.svg?height=60&width=60",
        createdAt: "2024-01-18T10:00:00Z",
        updatedAt: "2024-01-18T10:00:00Z",
    },
    {
        id: 5,
        name: "NXB Lao Động",
        description:
            "Nhà xuất bản Lao Động chuyên xuất bản sách về kinh tế, quản lý, kỹ năng sống và phát triển nghề nghiệp.",
        website: "https://nxblaodong.com.vn",
        logoUrl: "/placeholder.svg?height=60&width=60",
        createdAt: "2024-01-19T10:00:00Z",
        updatedAt: "2024-01-19T10:00:00Z",
    },
]

export default function PublisherManagement() {
    const [publishers, setPublishers] = useState<Publisher[]>(mockPublishers)
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const [totalPages, setTotalPages] = useState(10)
    const router = useNavigate()
    useEffect(() => {
        loadPublishers()
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


    const loadPublishers = async () => {
        try {
            setLoading(true)
            const response = await fetch("http://localhost/api/admin/publishers/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body : JSON.stringify({keyword : searchTerm, pageIndex : currentPage - 1, pageSize : itemsPerPage}),
            })
            const data = await response.json()
            setPublishers(data.items)
            setTotalPages(data.totalPages)
        } catch (error) {
            console.log(error)
            toast("Không thể tải danh sách nhà xuất bản")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {

        router("/admin/publishers/add")
    }

    const handleEdit = (publisher: Publisher) => {

        router("/admin/publishers/"+ publisher.id + "/edit")
    }

    const handleDelete = async (publisherId: number) => {
        try {
            setLoading(true)
            await fetch(`http://localhost/api/admin/publishers/${publisherId}`, {
              method: "DELETE"
            })


            toast("Xóa nhà xuất bản thành công!")
            loadPublishers()
        } catch (error) {
            console.error("Delete publisher failed:", error)
            toast("Có lỗi xảy ra khi xóa nhà xuất bản!")
        } finally {
            setLoading(false)
        }
    }

    const  handleSearch = async  () => {
        setCurrentPage(1)
        loadPublishers()
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
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý nhà xuất bản</h1>
                    <p className="text-gray-600 mt-1">Quản lý thông tin nhà xuất bản và đối tác</p>
                </div>
                <Button onClick={handleAdd} disabled={loading} className="flex items-center gap-2">
                    <Plus className="h-4 w-4"/>
                    Thêm nhà xuất bản
                </Button>
            </div>

            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex gap-2 max-w-md">
                        <Input
                            placeholder="Tìm kiếm nhà xuất bản theo tên "
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button onClick={handleSearch} disabled={loading} variant="outline">
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
                                <TableHead>Nhà xuất bản</TableHead>
                                <TableHead>Mô tả</TableHead>
                                <TableHead>Website</TableHead>
                                <TableHead>Logo</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <div
                                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                                        <span className="ml-2">Đang tải...</span>
                                    </TableCell>
                                </TableRow>
                            ) : publishers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <div className="text-gray-500">
                                            {searchTerm ? "Không tìm thấy nhà xuất bản nào phù hợp" : "Chưa có nhà xuất bản nào"}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                publishers.map((publisher) => (
                                    <TableRow key={publisher.id} className="hover:bg-gray-50">
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{publisher.name}</div>
                                                <div className="text-sm text-gray-500">ID: {publisher.id}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-md">
                                                <div
                                                    className="text-sm line-clamp-3">{publisher.description || "Không có mô tả"}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {publisher.website ? (
                                                <a
                                                    href={publisher.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                                                >
                                                    <ExternalLink className="h-3 w-3"/>
                                                    {publisher.website.replace(/^https?:\/\//, "")}
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Không có website</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {publisher.logoUrl ? (
                                                <img
                                                    src={publisher.logoUrl || "/placeholder.svg"}
                                                    alt={publisher.name}
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
                                            <div className="text-sm">
                                                <div>{formatDate(publisher.createdAt)}</div>
                                                {publisher.updatedAt !== publisher.createdAt && (
                                                    <div className="text-xs text-gray-500">Cập
                                                        nhật: {formatDate(publisher.updatedAt)}</div>
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
                                                    <DropdownMenuItem onClick={() => handleEdit(publisher)}>
                                                        <Edit className="h-4 w-4 mr-2"/>
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600"
                                                                      onClick={() => handleDelete(publisher.id)}>
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
