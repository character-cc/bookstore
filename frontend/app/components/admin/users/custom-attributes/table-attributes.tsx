"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, MoreHorizontal, Filter } from "lucide-react"
import {Link} from "react-router"
import {useNavigate}  from "react-router";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { customAttributesApi, type CustomAttribute } from "~/lib/api"
import { useApi } from "~/hooks/useApi"

export default function CustomAttributesManagement() {
    const router = useNavigate()
    const [attributes, setAttributes] = useState<CustomAttribute[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")

    const { loading, execute } = useApi<any>()

    useEffect(() => {
        loadAttributes()
    }, [searchTerm, typeFilter, statusFilter])

    const loadAttributes = async () => {
        try {
            const result = await execute(
                () =>
                    customAttributesApi.getAttributes({
                        search: searchTerm,
                        type: typeFilter,
                        isActive: statusFilter === "all" ? undefined : statusFilter === "active",
                    }),
                {
                    errorMessage: "Không thể tải danh sách thuộc tính",
                },
            )

            if (result) {
                setAttributes(result.data)
            }
        } catch (error) {
            console.error("Failed to load attributes:", error)
        }
    }

    const handleDelete = async (attributeId: number) => {
        try {
            await execute(() => customAttributesApi.deleteAttribute(attributeId), {
                successMessage: "Xóa thuộc tính thành công!",
                onSuccess: () => loadAttributes(),
            })
        } catch (error) {
            console.error("Delete attribute failed:", error)
        }
    }

    const getTypeLabel = (type: string) => {
        const labels = {
            text: "Văn bản",
            number: "Số",
            select: "Lựa chọn đơn",
            multiselect: "Lựa chọn nhiều",
            boolean: "Đúng/Sai",
            date: "Ngày tháng",
            textarea: "Văn bản dài",
        }
        return labels[type as keyof typeof labels] || type
    }

    const getTypeBadgeColor = (type: string) => {
        const colors = {
            text: "bg-blue-100 text-blue-800",
            number: "bg-green-100 text-green-800",
            select: "bg-purple-100 text-purple-800",
            multiselect: "bg-pink-100 text-pink-800",
            boolean: "bg-orange-100 text-orange-800",
            date: "bg-cyan-100 text-cyan-800",
            textarea: "bg-gray-100 text-gray-800",
        }
        return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
    }

    const needsValues = (type: string) => {
        return type === "select" || type === "multiselect"
    }

    const clearFilters = () => {
        setSearchTerm("")
        setTypeFilter("all")
        setStatusFilter("all")
    }

    return (
        <div className="container mx-auto py-6 max-w-7xl">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Quản lý thuộc tính khách hàng</h1>
                <Button asChild>
                    <Link to="/admin/custom-attributes/add">
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm thuộc tính
                    </Link>
                </Button>
            </div>

            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm thuộc tính..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                    disabled={loading}
                                />
                            </div>

                            <Select value={typeFilter} onValueChange={setTypeFilter} disabled={loading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Loại dữ liệu" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả loại</SelectItem>
                                    <SelectItem value="text">Văn bản</SelectItem>
                                    <SelectItem value="number">Số</SelectItem>
                                    <SelectItem value="select">Lựa chọn đơn</SelectItem>
                                    <SelectItem value="multiselect">Lựa chọn nhiều</SelectItem>
                                    <SelectItem value="boolean">Đúng/Sai</SelectItem>
                                    <SelectItem value="date">Ngày tháng</SelectItem>
                                    <SelectItem value="textarea">Văn bản dài</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="active">Đang hoạt động</SelectItem>
                                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button variant="outline" onClick={clearFilters} disabled={loading}>
                                <Filter className="h-4 w-4 mr-2" />
                                Xóa bộ lọc
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách thuộc tính</CardTitle>
                    <CardDescription>
                        Tạo và quản lý các thuộc tính tùy chỉnh để thu thập thông tin bổ sung về khách hàng
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Thuộc tính</TableHead>
                                    <TableHead>Loại dữ liệu</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Giá trị</TableHead>
                                    <TableHead>Thứ tự</TableHead>
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                                <span className="ml-2">Đang tải...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : attributes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                            <div className="space-y-4">
                                                <p>Không tìm thấy thuộc tính nào</p>
                                                <Button asChild variant="outline">
                                                    <Link to="/admin/custom-attributes/add">
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Thêm thuộc tính đầu tiên
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    attributes.map((attribute) => (
                                        <TableRow key={attribute.id} className="hover:bg-gray-50">
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{attribute.label}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {attribute.name}
                                                        {attribute.isRequired && <span className="text-red-500 ml-1">*</span>}
                                                    </div>
                                                    {attribute.description && (
                                                        <div className="text-xs text-gray-400 mt-1">{attribute.description}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getTypeBadgeColor(attribute.type)}>{getTypeLabel(attribute.type)}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={attribute.isActive ? "default" : "secondary"}>
                                                    {attribute.isActive ? "Hoạt động" : "Không hoạt động"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {needsValues(attribute.type) ? (
                                                    <span className="text-sm text-gray-600">{attribute.valuesCount} giá trị</span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">Không áp dụng</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{attribute.sortOrder}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-600">{attribute.createdAt}</span>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" disabled={loading}>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/admin/custom-attributes/${attribute.id}/edit`}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Chỉnh sửa
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(attribute.id)}>
                                                            <Trash2 className="h-4 w-4 mr-2" />
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
                </CardContent>
            </Card>
        </div>
    )
}
