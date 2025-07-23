"use client"

import { useState, useEffect } from "react"
import {toast, Toaster} from "sonner";
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
    UserCheck,
    UserX,
    Download,
} from "lucide-react"
import { Link } from "react-router"

import { Badge } from "@/components/ui/badge"
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
import {usersApi, type User, type Role} from "~/lib/api"
import {useApi, useRoles, useUsers} from "~/hooks/useApi"
import {number} from "zod";

export default function AdminUserTable() {
    const [nameSearch, setNameSearch] = useState("")
    const [emailSearch, setEmailSearch] = useState("")
    const [phoneSearch, setPhoneSearch] = useState("")
    const [users, setUsers] = useState<User[]>([])
    const [statusFilter, setStatusFilter] = useState<boolean| undefined>(undefined)
    const [roleFilter, setRoleFilter] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [selectedUsers, setSelectedUsers] = useState<number[]>([])
    const [sortField, setSortField] = useState<string>("")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
    const [dateFromFilter, setDateFromFilter] = useState("")
    const [dateToFilter, setDateToFilter] = useState("")
    const [totalUsers, setTotalUsers] = useState(0)
    const [roles, setRoles] = useState<Role[]>([])
    const { loading: loadingUsers, execute: executeUsers } = useUsers()
    const { loading : loadingRoles , execute: executeRoles } = useRoles()

    const [totalPages, setTotalPages] = useState(10)

    interface RoleBadgeProps {
        roles: Role[]
        roleFilter?: number
    }

    useEffect(() => {
        loadUsers()
    }, [
        // nameSearch,
        // emailSearch,
        // phoneSearch,
        // statusFilter,
        // roleFilter,
        // dateFromFilter,
        // dateToFilter,
        sortDirection,
        currentPage,
        itemsPerPage,
    ])

    useEffect(() => {
        loadRoles()
    },[])

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

    const loadRoles = async () => {
        try {
            const result = await executeRoles(() =>
                usersApi.getRoles()
            )
            if(result){
                setRoles(result);
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    const loadUsers = async () => {
        try {
            const result = await executeUsers(() =>
                usersApi.getUsers({
                    fullNameSearch : nameSearch == "" ? undefined : nameSearch,
                    emailSearch: emailSearch == "" ? undefined : emailSearch,
                    phoneNumber: phoneSearch == "" ? undefined : phoneSearch,
                    isActive: statusFilter,
                    roleIds: roleFilter ? [parseInt(roleFilter)] : undefined,
                    dateFrom: dateFromFilter == "" ? undefined : dateFromFilter,
                    dateTo: dateToFilter == "" ? undefined : dateToFilter,
                    sortBy: sortField == "" ? undefined : sortField,
                    sortDesc: sortDirection ? sortDirection === "desc" : undefined,
                    page: currentPage - 1,
                    limit: itemsPerPage,
                }),
            )

            if (result) {
                console.log(result)
                setUsers(result.items)
                setTotalUsers(result.totalCount)
                setTotalPages(result.totalPages)
            }
        } catch (error) {
            console.error("Failed to load users:", error)
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
            setSelectedUsers(users.map((user) => user.id))
        } else {
            setSelectedUsers([])
        }
    }

    const handleSelectUser = (userId: number, checked: boolean) => {
        if (checked) {
            setSelectedUsers([...selectedUsers, userId])
        } else {
            setSelectedUsers(selectedUsers.filter((id) => id !== userId))
        }
    }



    const handleBulkAction = async (
        action: "isActivate" | "delete",
        isActive?: boolean
    ) => {
        console.log("Triggered handleBulkAction", action, isActive)

        if (selectedUsers.length === 0) {
            toast.error("Vui lòng chọn ít nhất một người dùng")
            return
        }

        try {
            const apiCall = () => {
                console.log("Inside apiCall")
                if (action === "isActivate") {
                    console.log("Calling bulkSetIsActive")
                    return usersApi.bulkSetIsActive(selectedUsers, isActive!)
                } else if (action === "delete") {
                    console.log("Calling bulkDeleteUsers")
                    return usersApi.bulkDeleteUsers(selectedUsers)
                }
                throw new Error("Hành động không hợp lệ")
            }

            await executeUsers(apiCall, {
                successMessage:
                    action === "delete"
                        ? `Đã xóa ${selectedUsers.length} người dùng`
                        : isActive
                            ? `Đã kích hoạt ${selectedUsers.length} người dùng`
                            : `Đã khóa ${selectedUsers.length} người dùng`,
                onSuccess: () => {
                    console.log("onSuccess called")
                    setSelectedUsers([])
                    loadUsers()
                },
            })
        } catch (error) {
            console.error("Bulk action failed:", error)
            toast.error("Có lỗi xảy ra có thể do người dùng được chọn là quản trị viên hoặc bạn tự xóa chính mình  ")
        }
    }

    // const handleBulkAction = async (action: "activate" | "suspend" | "delete") => {
    //     if (selectedUsers.length === 0) {
    //         toast.error("Vui lòng chọn ít nhất một người dùng")
    //         return
    //     }
    //
    //     try {
    //         await executeUsers(() => usersApi.bulkUpdateUsers(selectedUsers, action), {
    //             successMessage: `Đã ${action === "activate" ? "kích hoạt" : action === "suspend" ? "tạm khóa" : "xóa"} ${selectedUsers.length} người dùng`,
    //             onSuccess: () => {
    //                 setSelectedUsers([])
    //                 loadUsers() // Reload the table
    //             },
    //         })
    //     } catch (error) {
    //         console.error("Bulk action failed:", error)
    //     }
    // }

    const handleUserAction = async (userId: number, action: "activate" | "suspend" | "delete") => {
        try {
            const  response = await fetch("http://localhost/api/admin/users/" + userId, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if(!response.ok) {
                throw response.json()
            }
            toast("Xóa người dùng thành công")
            loadUsers()
        } catch (error) {
            toast("Không được xóa chính mình hoặc quản trị viên")
            console.error("User action failed:", error)
        }
    }

    const search = () =>{
        loadUsers();
    }

    const clearFilters = () => {
        setNameSearch("")
        setEmailSearch("")
        setPhoneSearch("")
        setStatusFilter(undefined)
        setRoleFilter(null)
        setDateFromFilter("")
        setDateToFilter("")
        setCurrentPage(1)
    }


    const StatusBadge = ({ isActive }: { isActive: boolean }) => {
        const variant = isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        const label = isActive ? "Hoạt động" : "Tạm khóa"

        return <Badge className={variant}>{label}</Badge>
    }




    const generateColorFromString = (input: string): string => {
        let hash = 0
        for (let i = 0; i < input.length; i++) {
            hash = input.charCodeAt(i) + ((hash << 5) - hash)
        }
        const r = (hash >> 24) & 0xff
        const g = (hash >> 16) & 0xff
        const b = (hash >> 8) & 0xff
        return `rgb(${r}, ${g}, ${b})`
    }

    const RoleBadge = ({ roles, roleFilter }: RoleBadgeProps) => {
        // console.log(roles)
        if (!roles || roles.length === 0) return null

        const selectedRole = roleFilter
            ? roles.find((r) => r.id === roleFilter)
            : roles[0]

        if (!selectedRole) return null

        const bgColor = generateColorFromString(selectedRole.systemName)

        return (<>
                <Badge style={{ backgroundColor: bgColor, color: "#fff" }}>
                    {selectedRole.friendlyName}
                </Badge>
                <span>...</span></>
        )
    }


    return (
        <>


            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Quản lý người dùng</CardTitle>
                            <CardDescription>Quản lý thông tin và trạng thái của tất cả người dùng trong hệ thống</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                            {/*<Button variant="outline" size="sm" disabled={loadingUsers}>*/}
                            {/*    <Download className="h-4 w-4 mr-2" />*/}
                            {/*    Xuất Excel*/}
                            {/*</Button>*/}
                            <Button size="sm" asChild>
                                <Link to="/admin/users/add">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm người dùng
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm theo tên..."
                                    value={nameSearch}
                                    onChange={(e) => setNameSearch(e.target.value)}
                                    className="pl-10"
                                    disabled={loadingUsers}
                                />
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm theo email..."
                                    value={emailSearch}
                                    onChange={(e) => setEmailSearch(e.target.value)}
                                    className="pl-10"
                                    disabled={loadingUsers}
                                />
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm theo số điện thoại..."
                                    value={phoneSearch}
                                    onChange={(e) => setPhoneSearch(e.target.value)}
                                    className="pl-10"
                                    disabled={loadingUsers}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Select
                                value={statusFilter === undefined ? "all" : String(statusFilter)}
                                onValueChange={(value) => {
                                    if (value === "all") {
                                        setStatusFilter(undefined)
                                    } else {
                                        setStatusFilter(value === "true")
                                    }
                                }}
                                disabled={loadingUsers}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="true">Hoạt động</SelectItem>
                                    <SelectItem value="false">Bị khóa</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={roleFilter?.toString() ?? "all"} onValueChange={(value) => {
                                if (value === "all") {
                                    setRoleFilter(null);
                                } else {
                                    setRoleFilter(value);
                                }
                            }}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id.toString()}>
                                            {role.friendlyName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/*<div className="flex items-center gap-2">*/}
                            {/*    <Label className="text-sm whitespace-nowrap">Từ ngày:</Label>*/}
                            {/*    <Input*/}
                            {/*        type="date"*/}
                            {/*        value={dateFromFilter}*/}
                            {/*        onChange={(e) => setDateFromFilter(e.target.value)}*/}
                            {/*        className="w-[150px]"*/}
                            {/*        disabled={loadingUsers}*/}
                            {/*    />*/}
                            {/*</div>*/}

                            {/*<div className="flex items-center gap-2">*/}
                            {/*    <Label className="text-sm whitespace-nowrap">Đến ngày:</Label>*/}
                            {/*    <Input*/}
                            {/*        type="date"*/}
                            {/*        value={dateToFilter}*/}
                            {/*        onChange={(e) => setDateToFilter(e.target.value)}*/}
                            {/*        className="w-[150px]"*/}
                            {/*        disabled={loadingUsers}*/}
                            {/*    />*/}
                            {/*</div>*/}

                            <Button variant="outline" onClick={clearFilters} disabled={loadingUsers}>
                                Xóa bộ lọc
                            </Button>
                            <Button variant="outline" onClick={search} disabled={loadingUsers}>
                                Tìm kiếm
                            </Button>
                        </div>
                    </div>

                    {selectedUsers.length > 0 && (
                        <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm text-blue-700">Đã chọn {selectedUsers.length} người dùng</span>
                            <Button variant="outline" size="sm" onClick={() => handleBulkAction("isActivate" , true)} disabled={loadingUsers}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Kích hoạt
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleBulkAction("isActivate" , false)} disabled={loadingUsers}>
                                <UserX className="h-4 w-4 mr-2" />
                                Khóa tài khoản
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleBulkAction("delete")} disabled={loadingUsers}>
                                <Trash2 className="h-4 w-4 mr-2" />
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
                                            checked={selectedUsers.length === users.length && users.length > 0}
                                            onCheckedChange={handleSelectAll}
                                            disabled={loadingUsers}
                                        />
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("fullName")}>
                                        Người dùng
                                        {sortField === "fullName" && (
                                            <ChevronDown className={`inline h-4 w-4 ml-1 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                        )}
                                    </TableHead>
                                    <TableHead>Liên hệ</TableHead>
                                    <TableHead className="cursor-pointer hover:bg-gray-50" >
                                        Trạng thái
                                    </TableHead>
                                    <TableHead>Vai trò</TableHead>
                                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("joinDate")}>
                                        Ngày tham gia
                                    </TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingUsers ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                                <span className="ml-2">Đang tải...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                            Không tìm thấy người dùng nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedUsers.includes(user.id)}
                                                    onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                                                    disabled={loadingUsers}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={user.avatar || "/placeholder.svg"}
                                                        // alt={user.fullName}
                                                        className="h-8 w-8 rounded-full"
                                                    />
                                                    <div>
                                                        <div className="font-medium">{user.fullName}</div>
                                                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="text-sm">{user.email}</div>
                                                    <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge isActive={user.isActive} />
                                            </TableCell>
                                            <TableCell>
                                                <RoleBadge roles={user.roles} roleFilter={roleFilter ? parseInt(roleFilter) : undefined} />
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="text-sm">{user.createdAt}</div>
                                                    <div className="text-xs text-gray-500">Đăng nhập: {user.lastLogin}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" disabled={loadingUsers}>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                                        {/*<DropdownMenuItem>*/}
                                                        {/*    <Eye className="h-4 w-4 mr-2" />*/}
                                                        {/*    Xem chi tiết*/}
                                                        {/*</DropdownMenuItem>*/}
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/admin/users/edit/${user.id}`}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Chỉnh sửa
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {/*<DropdownMenuSeparator />*/}
                                                        {/*<DropdownMenuItem onClick={() => handleUserAction(user.id, "activate")}>*/}
                                                        {/*    <UserCheck className="h-4 w-4 mr-2" />*/}
                                                        {/*    Kích hoạt*/}
                                                        {/*</DropdownMenuItem>*/}
                                                        {/*<DropdownMenuItem onClick={() => handleUserAction(user.id, "suspend")}>*/}
                                                        {/*    <UserX className="h-4 w-4 mr-2" />*/}
                                                        {/*    Tạm khóa*/}
                                                        {/*</DropdownMenuItem>*/}
                                                        {/*<DropdownMenuSeparator />*/}
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleUserAction(user.id, "delete")}
                                                        >
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

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">

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
        </>
    )

}
