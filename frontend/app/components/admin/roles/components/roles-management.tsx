"use client"

import { useState, useEffect } from "react"
import {useNavigate} from "react-router";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Users, Shield, Truck, Loader2 } from "lucide-react"
import { type Role, rolesApi } from "@/lib/roles-api"
import {useRoles} from "~/hooks/useApi";
import {toast} from "sonner";

export function RolesManagement() {
    const router = useNavigate()
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

    const {execute} = useRoles()
    const [filters, setFilters] = useState({
        search: "",
        isActive: "all" as "all" | "true" | "false",
        // isSystemRole: "all" as "all" | "true" | "false",
    })

    const loadRoles = async () => {
        setLoading(true)
        try {
            const filterParams = {

                friendlyName : filters.search || undefined,
                systemName : filters.search || undefined,
                isActive: filters.isActive !== "all" ? filters.isActive === "true" : undefined,
                // isSystemRole: filters.isSystemRole !== "all" ? filters.isSystemRole === "true" : undefined,
            }

            const response = await rolesApi.getRoles(filterParams)
            console.log(response)
            setRoles(response.items)
        } catch (error) {
            console.error("Error loading roles:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadRoles()
    }, [])

    const searchRoles = async () => {
        loadRoles();
    }

    const handleDeleteRole = async () => {
        if (!roleToDelete) return

        setDeleteLoading(true)
        try {
            await execute(() => rolesApi.deleteRole(roleToDelete.id))
            toast.success("Xóa thành cong ")
            await loadRoles()
            setRoleToDelete(null)
        } catch (error) {
            console.error("Error deleting role:", error)
        } finally {
            setDeleteLoading(false)
        }
    }

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý Role</h1>
                    <p className="text-muted-foreground">Quản lý các role và quyền trong hệ thống</p>
                </div>
                <Button onClick={() => router("/admin/roles/add")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm role
                </Button>
            </div>

            {/*{console.log(roles)}*/}
            <Card>
                <CardHeader>
                    <CardTitle>Bộ lọc</CardTitle>
                    <CardDescription>Tìm kiếm và lọc danh sách role</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="search">Tìm kiếm</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                <Input
                                    id="search"
                                    placeholder="Tên role hoặc tên hệ thống..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange("search", e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Trạng thái</Label>
                            <Select value={filters.isActive}
                                    onValueChange={(value) => handleFilterChange("isActive", value)}>
                                <SelectTrigger>
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="true">Hoạt động</SelectItem>
                                    <SelectItem value="false">Không hoạt động</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end h-full">
                                <Button variant="outline" onClick={searchRoles} disabled={loading}>
                                    Tìm kiếm
                                </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách Role</CardTitle>
                    <CardDescription>{loading ? "Đang tải..." : `Tìm thấy ${roles.length} role`}</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tên role</TableHead>
                                    <TableHead>Tên hệ thống</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    {/*<TableHead>Tính năng</TableHead>*/}
                                    <TableHead>Loại</TableHead>
                                    {/*<TableHead>Số người dùng</TableHead>*/}
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell className="font-medium">{role.friendlyName}</TableCell>
                                        <TableCell>
                                            <code className="text-sm bg-muted px-2 py-1 rounded">{role.systemName}</code>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={role.isActive ? "default" : "secondary"}>
                                                {role.isActive ? "Hoạt động" : "Không hoạt động"}
                                            </Badge>
                                        </TableCell>
                                        {/*<TableCell>*/}
                                        {/*    <div className="flex gap-1">*/}
                                        {/*        {role.isFreeShipping && (*/}
                                        {/*            <Badge variant="outline" className="text-xs">*/}
                                        {/*                <Truck className="mr-1 h-3 w-3" />*/}
                                        {/*                Miễn phí ship*/}
                                        {/*            </Badge>*/}
                                        {/*        )}*/}
                                        {/*    </div>*/}
                                        {/*</TableCell>*/}
                                        <TableCell>
                                            <Badge variant={role.isSystemRole ? "destructive" : "outline"}>
                                                {role.isSystemRole ? (
                                                    <>
                                                        <Shield className="mr-1 h-3 w-3" />
                                                        Hệ thống
                                                    </>
                                                ) : (
                                                    "Tùy chỉnh"
                                                )}
                                            </Badge>
                                        </TableCell>
                                        {/*<TableCell>*/}
                                        {/*    <div className="flex items-center gap-1">*/}
                                        {/*        <Users className="h-4 w-4 text-muted-foreground" />*/}
                                        {/*        {role.usersCount || 0}*/}
                                        {/*    </div>*/}
                                        {/*</TableCell>*/}
                                        <TableCell>{new Date(role.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => router(`/admin/roles/${role.id}/edit`)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    {!role.isSystemRole && (
                                                        <DropdownMenuItem onClick={() => setRoleToDelete(role)} className="text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Xóa
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {!loading && roles.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">Không tìm thấy role nào</div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa role</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa role "{roleToDelete?.friendlyName}"? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteLoading}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteRole}
                            disabled={deleteLoading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
