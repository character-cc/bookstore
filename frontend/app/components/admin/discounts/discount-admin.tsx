"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, MoreHorizontal, Plus, Search, X, Send } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useNavigate } from "react-router"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {toast} from "sonner";

const mockDiscounts = [
    {
        id: "d789e456-f89b-12d3-a456-426614174000",
        code: "SALE20",
        value: 20,
        isPercentage: true,
        maxDiscountAmount: 50000.0,
        description: "Giảm 20% cho sách văn học, tối đa 50,000 VNĐ",
        applicableBookIds: [1, 2, 3, 4],
        excludedBookIds: [5],
        startDate: "2025-06-01T00:00:00Z",
        endDate: "2025-06-30T23:59:59Z",
        isActive: true,
        minimumOrderAmount: 200000.0,
        maxUsagePerUser: 1,
        totalUsageLimit: 1000,
        currentUsageCount: 150,
        applicableRoles: [1],
        createdAt: "2025-05-25T10:00:00Z",
        updatedAt: "2025-05-26T15:30:00Z",
    },
    {
        id: "d789e456-f89b-12d3-a456-426614174001",
        code: "NEWUSER",
        value: 30000,
        isPercentage: false,
        maxDiscountAmount: 30000.0,
        description: "Giảm 30,000 VNĐ cho người dùng mới",
        applicableBookIds: [],
        excludedBookIds: [],
        startDate: "2025-06-01T00:00:00Z",
        endDate: "2025-12-31T23:59:59Z",
        isActive: true,
        minimumOrderAmount: 100000.0,
        maxUsagePerUser: 1,
        totalUsageLimit: 500,
        currentUsageCount: 75,
        applicableRoles: [2],
        createdAt: "2025-05-20T10:00:00Z",
        updatedAt: "2025-05-21T15:30:00Z",
    },
]

export default function DiscountAdmin() {
    const router = useNavigate()
    const [discounts, setDiscounts] = useState(mockDiscounts)
    const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([])
    const [searchCode, setSearchCode] = useState("")
    const [searchDescription, setSearchDescription] = useState("")
    const [searchType, setSearchType] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [isPercentage, setIsPercentage] = useState(false)
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const [showUserDialog, setShowUserDialog] = useState(false)
    const [selectedUsers, setSelectedUsers] = useState<number[]>([])
    const [userSearchTerm, setUserSearchTerm] = useState("")
    const [users, setUsers] = useState([])
    const [currentDiscountToSend, setCurrentDiscountToSend] = useState<any>(null)

    const [totalPages, setTotalPages] = useState(10)
    useEffect(() => {
        loadDiscounts()
    }, [currentPage, itemsPerPage])

    useEffect(() => {
        if (showUserDialog) {
            loadUsers()
        }
    }, [userSearchTerm, showUserDialog])

    const loadDiscounts = async () => {
        try {
            const response = await fetch("http://localhost/api/admin/discounts/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: searchCode,
                    startDate: fromDate || undefined,
                    endDate: toDate || undefined,
                    pageIndex: currentPage - 1,
                    pageSize: itemsPerPage,
                }),
            })
            if (!response.ok) {
                throw new Error("Failed to fetch discounts")
            }
            const data = await response.json()
            setDiscounts(data.items)
            setTotalPages(data.totalPages)
        } catch (error) {
            console.log(error)
        }
    }

    const loadUsers = async () => {
        try {
            const response = await fetch("http://localhost/api/admin/users/search-fordiscount", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    keyword: userSearchTerm,
                }),
            })
            const data = await response.json()
            console.log(data)
            setUsers(data.items || [])
        } catch (error) {
            console.log(error)
        }
    }

    const handleDeleteDiscount = async (discount: any) => {
        try {
            const response = await fetch(`http://localhost/api/admin/discounts/${discount.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                }
            })
            if (!response.ok) {
                throw new Error("Failed to delete discount")
            }
            loadDiscounts()
        }
        catch (error) {
            console.log(error)
        }
    }

    const renderPageButtons = () => {
        const pages = []
        const maxVisible = 3

        pages.push(
            <Button key={1} variant={currentPage === 1 ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(1)}>
                1
            </Button>,
        )

        if (currentPage > maxVisible + 2) {
            pages.push(<span key="start-ellipsis">...</span>)
        }

        const start = Math.max(2, currentPage - 1)
        const end = Math.min(totalPages - 1, currentPage + 1)

        for (let i = start; i <= end; i++) {
            pages.push(
                <Button key={i} variant={currentPage === i ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(i)}>
                    {i}
                </Button>,
            )
        }

        if (currentPage < totalPages - maxVisible - 1) {
            pages.push(<span key="end-ellipsis">...</span>)
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
                </Button>,
            )
        }

        return pages
    }

    const search = async () => {
        setCurrentPage(1)
        loadDiscounts()
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
    }

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })
    }

    const handleCreateDiscount = () => {
        router("/admin/discounts/add")
    }

    const handleEditDiscount = (discount: any) => {
        router(`/admin/discounts/edit/${discount.id}`)
    }

    const getStatusBadge = (discount: any) => {
        const now = new Date()
        const startDate = new Date(discount.startDate)
        const endDate = new Date(discount.endDate)

        if (!discount.isActive) {
            return <Badge variant="secondary">Tạm dừng</Badge>
        }

        if (now < startDate) {
            return <Badge variant="outline">Chưa bắt đầu</Badge>
        }

        if (now > endDate) {
            return <Badge variant="destructive">Hết hạn</Badge>
        }

        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Hoạt động</Badge>
    }

    const getTypeBadge = (isPercentage: boolean, value1: number , value2: number ) => {
        if (isPercentage) {
            return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Phần trăm {value1}%</Badge>
        }
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Cố định {formatPrice(value2)}</Badge>
    }

    const getUsageProgress = (current: number, total: number) => {
        const percentage = (current / total) * 100
        return (
            <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(percentage, 100)}%` }} />
                </div>
                <span className="text-sm text-gray-600">
          {current}/{total}
        </span>
            </div>
        )
    }

    const toggleSelectDiscount = (id: string) => {
        setSelectedDiscounts((prev) => (prev.includes(id) ? prev.filter((id) => id !== id) : [...prev, id]))
    }

    const toggleSelectAll = () => {
        if (selectedDiscounts.length === discounts.length) {
            setSelectedDiscounts([])
        } else {
            setSelectedDiscounts(discounts.map((discount) => discount.id))
        }
    }

    const clearFilters = () => {
        setSearchCode("")
        setSearchDescription("")
        setSearchType("")
        setStatusFilter("all")
        setFromDate("")
        setToDate("")
    }

    const handleSendToUser = (discount: any) => {
        setCurrentDiscountToSend(discount)
        setShowUserDialog(true)
    }

    const sendToSelectedUsers = async () => {
        if (!currentDiscountToSend || selectedUsers.length === 0) return

        try {
             fetch("http://localhost/api/admin/discounts/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    discountId: currentDiscountToSend.id,
                    userIds: selectedUsers,
                }),
            })

                toast("Đã gửi mã giảm giá thành công!")

        } catch (error) {
            console.log(error)
            toast("Có lỗi xảy ra khi gửi!")
        }

        setSelectedUsers([])
        setUserSearchTerm("")
        setShowUserDialog(false)
        setCurrentDiscountToSend(null)
    }



    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý mã giảm giá</h1>
                    <p className="text-gray-600 mt-1">Quản lý thông tin và trạng thái của tất cả mã giảm giá trong hệ thống</p>
                </div>
                <div className="flex gap-3">

                    <Button onClick={handleCreateDiscount} className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800">
                        <Plus className="h-4 w-4" />
                        Thêm mã giảm giá
                    </Button>
                </div>
            </div>

            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Tìm kiếm theo mã..."
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Từ ngày:</span>
                            <div className="relative">
                                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-40" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Đến ngày:</span>
                            <div className="relative">
                                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-40" />
                            </div>
                        </div>

                        <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                            <X className="h-4 w-4" />
                            Xóa bộ lọc
                        </Button>

                        <Button className="flex items-center gap-2" variant="outline" onClick={search}>
                            <Search className="h-4 w-4 mr-2" />
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
                                {/*<TableHead className="w-12">*/}
                                {/*    <Checkbox*/}
                                {/*        checked={selectedDiscounts.length === discounts.length && discounts.length > 0}*/}
                                {/*        onCheckedChange={toggleSelectAll}*/}
                                {/*    />*/}
                                {/*</TableHead>*/}
                                <TableHead>Mã giảm giá</TableHead>
                                <TableHead>Mô tả</TableHead>
                                <TableHead>Loại & Giá trị</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Sử dụng</TableHead>
                                <TableHead>Thời gian</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {discounts.map((discount) => (
                                <TableRow key={discount.id} className="hover:bg-gray-50">
                                    {/*<TableCell>*/}
                                    {/*    <Checkbox*/}
                                    {/*        checked={selectedDiscounts.includes(discount.id)}*/}
                                    {/*        onCheckedChange={() => toggleSelectDiscount(discount.id)}*/}
                                    {/*    />*/}
                                    {/*</TableCell>*/}
                                    <TableCell>
                                        <div>
                                            <div className="font-semibold">{discount.code}</div>
                                            <div className="text-sm text-gray-500">ID: {discount.id}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-xs">
                                            <div className="text-sm">{discount.description}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Đơn tối thiểu: {formatPrice(discount.minimumOrderAmount)}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {getTypeBadge(discount.isPercentage, discount.discountPercentage, discount.discountAmount)}
                                            <div className="text-xs text-gray-500">Tối đa: {formatPrice(discount.maxDiscountAmount)}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(discount)}</TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            {getUsageProgress(discount.currentUsageCount, discount.totalUsageLimit)}
                                            <div className="text-xs text-gray-500">Tối đa {discount.maxUsagePerUser}/người</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>Từ: {formatDate(discount.startDate)}</div>
                                            <div>Đến: {formatDate(discount.endDate)}</div>
                                            <div className="text-xs text-gray-500 mt-1">Tạo: {formatDate(discount.createdAt)}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleSendToUser(discount)}>
                                                    Gửi tới người dùng
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEditDiscount(discount)}>Chỉnh sửa</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteDiscount(discount)}>Xóa</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2">

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
            <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                <DialogContent className="max-w-2xl md:max-w-4xl lg:max-w-5xl">
                    <DialogHeader>
                        <DialogTitle>Gửi mã giảm giá tới người dùng</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {currentDiscountToSend && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="font-medium">Mã giảm giá: {currentDiscountToSend.code}</div>
                                <div className="text-sm text-gray-600">{currentDiscountToSend.description}</div>
                            </div>
                        )}

                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Tìm kiếm người dùng theo tên, email..."
                                value={userSearchTerm}
                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedUsers.length === users.length && users.length > 0}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedUsers(users.map((user) => user.id))
                                                    } else {
                                                        setSelectedUsers([])
                                                    }
                                                }}
                                            />
                                        </TableHead>
                                        <TableHead>Tên người dùng</TableHead>
                                        <TableHead>Email</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedUsers.includes(user.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setSelectedUsers((prev) => [...prev, user.id])
                                                        } else {
                                                            setSelectedUsers((prev) => prev.filter((id) => id !== user.id))
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>{user.fullName || user.userName}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {users.length === 0 && (
                                <div className="text-center py-4 text-gray-500">Không tìm thấy người dùng nào phù hợp</div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowUserDialog(false)
                                    setUserSearchTerm("")
                                    setSelectedUsers([])
                                    setCurrentDiscountToSend(null)
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="button"
                                onClick={sendToSelectedUsers}
                                disabled={selectedUsers.length === 0}
                                className="flex items-center gap-2"
                            >
                                <Send className="h-4 w-4" />
                                Gửi ({selectedUsers.length})
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
