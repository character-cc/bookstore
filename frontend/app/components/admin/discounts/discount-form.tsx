"use client"

import React, {useEffect} from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {toast} from "sonner";
import { Plus, Trash2, ArrowLeft, Search } from "lucide-react"

import {useNavigate, useParams} from "react-router";
// Mock data for books and roles
const mockBooks = [
    { id: 1, name: "Lão Hạc", isbn: "Nam Cao", category: "Văn học Việt Nam" },
    { id: 2, name: "Chí Phèo", isbn: "Nam Cao", category: "Văn học Việt Nam" },
    { id: 3, name: "Số Đỏ", isbn: "Vũ Trọng Phụng", category: "Văn học Việt Nam" },
    { id: 4, name: "Đời Mưa Gió", isbn: "Nam Cao", category: "Văn học Việt Nam" },
    { id: 5, name: "Tắt Đèn", isbn: "Ngô Tất Tố", category: "Văn học Việt Nam" },
    { id: 6, name: "Vợ Nhặt", isbn: "Kim Lân", category: "Văn học Việt Nam" },
    { id: 7, name: "Những Ngày Thơ Ấu", isbn: "Nguyễn Tuân", category: "Văn học Việt Nam" },
    { id: 8, name: "Cô Gái Đến Từ Hôm Qua", isbn: "Nguyễn Nhật Ánh", category: "Văn học thiếu nhi" },
]

const mockRoles = [
    { id: 1, name: "Khách hàng thường", description: "Khách hàng mới đăng ký" },
    { id: 2, name: "Khách hàng VIP", description: "Khách hàng mua nhiều" },
    { id: 3, name: "Khách hàng Premium", description: "Khách hàng cao cấp" },
]

interface DiscountFormProps {
    discount?: any
    isEdit?: boolean
}

export default function DiscountForm({  isEdit = false }: DiscountFormProps) {
    const router = useNavigate()
    const [discount, setDiscount] = useState();
    const { id } = useParams();

    const [bookTables, setBookTables] = useState([])
    const [excludedBookTables, setExcludedBookTables] = useState([])
    const [roleTables, setRoleTables] = useState([])
    const discountId = parseInt(id ?? "0", 10);
    useEffect(() => {
        loadDiscounts()

        loadBookTables()
        loadRoleTables()
        loadExcludedBookTables()
    },[])

    useEffect(() => {
        if (discount) {
            console.log("discount", discount)
            setFormData({
                id: discount.id ?? undefined,
                code: discount.code ?? "",
                value: discount.value ?? 0,
                IsPercentage: discount.isPercentage ?? true,
                discountAmount: discount.discountAmount ?? 0,
                maxDiscountAmount: discount.maxDiscountAmount ?? 0,
                discountPercentage: discount.discountPercentage ?? 0,
                description: discount.description ?? "",
                startDate: discount.startDate ? discount.startDate.slice(0, 16) : "",
                endDate: discount.endDate ? discount.endDate.slice(0, 16) : "",
                isPublic: discount.isPublic ?? false,
                isActive: discount.isActive ?? true,
                minimumOrderAmount: discount.minimumOrderAmount ?? 0,
                maxUsagePerUser: discount.maxUsagePerUser ?? 1,
                totalUsageLimit: discount.totalUsageLimit ?? 100,
                applicableBookIds: discount.applicableDiscountBookIds ?? [],
                excludedBookIds: discount.excludedDiscountBookIds ?? [],
                applicableRoles: discount.discountRoleIds ?? [],
            });
        }
    }, [discount]);
    const loadBookTables = async () => {
        try {
            const response = await fetch("http://localhost/api/admin/discounts/" + discountId + "/applicable-books");
            const data = await response.json();
            console.log(data);
            setBookTables(data)
        }
        catch (error) {
            console.log(error);
        }
    }

    const loadExcludedBookTables = async () => {
        try {
            const response = await fetch("http://localhost/api/admin/discounts/" + discountId + "/excluded-books");
            const data = await response.json();
            console.log(data);
            setExcludedBookTables(data)
        }
        catch (error) {
            console.log(error);
        }
    }

    const loadRoleTables = async () => {
        try {
            const response = await fetch("http://localhost/api/admin/discounts/" + discountId + "/roles");
            const data = await response.json();
            console.log(data);
            setRoleTables(data)
        }
        catch (error) {
            console.log(error);
        }
    }


    const loadDiscounts = async () => {
        try{
            const response = await fetch("http://localhost/api/admin/discounts/" +discountId);
            const data = await response.json();
            console.log(data);
            setDiscount(data);

        }
        catch(err){
            console.log(err);
        }
    }
    // const [formData, setFormData] = useState({
    //     id: discount?.id,
    //     code: discount?.code || "",
    //     value: discount?.value || 0,
    //     IsPercentage: discount?.IsPercentage || true ,
    //     discountAmount: discount?.discountAmount || 0,
    //     maxDiscountAmount: discount?.maxDiscountAmount || 0,
    //     description: discount?.description || "",
    //     startDate: discount?.startDate ? discount.startDate.slice(0, 16) : "",
    //     endDate: discount?.endDate ? discount.endDate.slice(0, 16) : "",
    //     isActive: discount?.isActive ?? true,
    //     minimumOrderAmount: discount?.minimumOrderAmount || 0,
    //     maxUsagePerUser: discount?.maxUsagePerUser || 1,
    //     totalUsageLimit: discount?.totalUsageLimit || 100,
    //     applicableBookIds: discount?.applicableBookIds || [],
    //     excludedBookIds: discount?.excludedBookIds || [],
    //     applicableRoles: discount?.applicableRoles || [],
    // })

    const [formData, setFormData] = useState({
        id: 0,
        code: "",
        value: 0,
        IsPercentage: true,
        discountAmount: 0,
        maxDiscountAmount: 0,
        discountPercentage: 0,
        description: "",
        startDate: "",
        endDate: "",
        isPublic : false,
        isActive: true,
        minimumOrderAmount: 0,
        maxUsagePerUser: 1,
        totalUsageLimit: 100,
        applicableBookIds: [],
        excludedBookIds: [],
        applicableRoles: [],
    });

    const [showBookDialog, setShowBookDialog] = useState(false)
    const [showExcludedBookDialog, setShowExcludedBookDialog] = useState(false)
    const [showRoleDialog, setShowRoleDialog] = useState(false)
    const [selectedBooks, setSelectedBooks] = useState<number[]>([])
    const [selectedExcludedBooks, setSelectedExcludedBooks] = useState<number[]>([])
    const [selectedRoles, setSelectedRoles] = useState<number[]>([])

    // Thêm state cho search
    const [bookSearchTerm, setBookSearchTerm] = useState("")
    const [excludedBookSearchTerm, setExcludedBookSearchTerm] = useState("")

    const [books , setBooks] = useState(mockBooks)
    const [excludedBooks , setExcludedBooks] = useState(mockBooks)
    const [roles, setRoles] = useState(mockRoles)

    // useEffect(() => {

    // }, [selectedBooks,selectedExcludedBooks,selectedRoles]);

    useEffect(() => {
        loadRoles()
        loadExcludedBooks()
        loadBooks()
    }, [bookSearchTerm,excludedBookSearchTerm]);

    const loadBooks = async () => {
        try {
            const response = await fetch("http://localhost/api/admin/discounts/select-books",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    keyword: bookSearchTerm,
                    discountId: discount?.id || undefined,
                })
            })
            const data = await response.json()
            console.log(data)
            setBooks(data)
        }
        catch (error) {
            console.log(error)
        }
    }

    const loadExcludedBooks = async () => {
        try {
            const response = await fetch("http://localhost/api/admin/discounts/select-books",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    keyword: bookSearchTerm,
                    discountId: discount?.id || undefined,
                    IsSelectingForApplicable: false
                })
            })
            const data = await response.json()
            console.log(data)
            setExcludedBooks(data)
        }
        catch (error) {
            console.log(error)
        }
    }

    const loadRoles = async () => {
        try {
            const response = await fetch("http://localhost/api/admin/roles/search", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({})
                }
            )
            const data = await response.json()
            console.log(data)
            setRoles(data.items)

        }
        catch (error) {
            console.log(error)
        }
    }
    const filteredBooks = mockBooks.filter(
        (book) =>
            book.name.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
            book.isbn.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
            book.category.toLowerCase().includes(bookSearchTerm.toLowerCase()),
    )

    const filteredExcludedBooks = mockBooks.filter(
        (book) =>
            book.name.toLowerCase().includes(excludedBookSearchTerm.toLowerCase()) ||
            book.isbn.toLowerCase().includes(excludedBookSearchTerm.toLowerCase()) ||
            book.category.toLowerCase().includes(excludedBookSearchTerm.toLowerCase()),
    )

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const data = {
            ...formData,
            discountAmount: formData.discountAmount,
            selectedBooks,
            selectedExcludedBooks,
            selectedRoles,
            roleIds: formData.applicableRoles
        }
        console.log("data gửi đi")
        console.log(data)
        // Validation
        if (!formData.code.trim()) {
            toast(
              "Vui lòng nhập mã giảm giá"
            )
            return
        }

        if (!formData.description.trim()) {
            toast(
                 "Vui lòng nhập mô tả"
            )
            return
        }

        if(formData.IsPercentage){
            if(formData.discountPercentage <= 0){
                toast(
                    "Giá trị giảm giá phải lớn hơn 0"
                )
                return
            }
            if(formData.discountPercentage > 100){
                " Giá trị giảm giá không được vượt quá 100 "
            }
        }
        else {
            if (formData.discountAmount <= 0) {
                toast(
                    "Giá trị giảm giá phải lớn hơn 0"
                )
                return
            }
        }


        console.log("Save discount:", formData)

        if (isEdit) {
            try {
                const response = await fetch("http://localhost/api/admin/discounts/" + discountId, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data)
                })
                if (!response.ok) {
                    throw await response.json()
                }
                toast(" Chỉnh sửa mã giảm giá thành công ")

                router("/admin/discounts/")

            }
            catch (error) {
                toast(error?.message)
                console.log(error)

            }
        }
        else {
            try {
                const response = await fetch("http://localhost/api/admin/discounts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data)
                })
                if (!response.ok) {
                    throw await response.json()
                }

                toast(" Thêm mã giảm giá thành công ")

                router("/admin/discounts/")
            }
            catch (error) {
                toast(error?.message)

                console.log(error)
            }
        }

    }

    const handleCancel = () => {
        router("/admin/discounts")
    }

    const getBookById = (id: number) => mockBooks.find((book) => book.id === id)
    const getRoleById = (id: number) => mockRoles.find((role) => role.id === id)

    const removeApplicableBook = (bookId: number) => {
        setFormData((prev) => ({
            ...prev,
            applicableBookIds: prev.applicableBookIds.filter((id: number) => id !== bookId),
        }))
    }

    const removeExcludedBook = (bookId: number) => {
        setFormData((prev) => ({
            ...prev,
            excludedBookIds: prev.excludedBookIds.filter((id: number) => id !== bookId),
        }))
    }

    const removeApplicableRole = (roleId: number) => {
        setFormData((prev) => ({
            ...prev,
            applicableRoles: prev.applicableRoles.filter((id: number) => id !== roleId),
        }))
    }

    const addApplicableBooks = () => {
        setFormData((prev) => ({
            ...prev,
            applicableBookIds: [...new Set([...prev.applicableBookIds, ...selectedBooks])],
        }))
        const selectedBookObjects = books.filter((b) => selectedBooks.includes(b.id));
        setBookTables((prev) => {
            // Ghép vào bảng cũ, tránh trùng
            const combinedBooks = [...prev, ...selectedBookObjects];
            const uniqueBooks = Array.from(new Map(combinedBooks.map(b => [b.id, b])).values());
            return uniqueBooks;
        });
        setSelectedBooks([])
        setBookSearchTerm("")
        setShowBookDialog(false)
    }

    const addExcludedBooks = () => {
        setFormData((prev) => ({
            ...prev,
            excludedBookIds: [...new Set([...prev.excludedBookIds, ...selectedExcludedBooks])],
        }))
        const selectedBookObjects = excludedBooks.filter((b) => selectedExcludedBooks.includes(b.id));
        setExcludedBookTables((prev) => {
            // Ghép vào bảng cũ, tránh trùng
            const combinedBooks = [...prev, ...selectedBookObjects];
            const uniqueBooks = Array.from(new Map(combinedBooks.map(b => [b.id, b])).values());
            return uniqueBooks;
        });
        setSelectedExcludedBooks([])
        setExcludedBookSearchTerm("")
        setShowExcludedBookDialog(false)
    }

    const addApplicableRoles = () => {
        setFormData((prev) => ({
            ...prev,
            applicableRoles: [...new Set([...prev.applicableRoles, ...selectedRoles])],
        }))
        const selectedRoleObjects = roles.filter(role => selectedRoles.includes(role.id));

        setRoleTables((prev) => {
            const combinedRoles = [...prev, ...selectedRoleObjects];
            const uniqueRoles = Array.from(new Map(combinedRoles.map(role => [role.id, role])).values());
            return uniqueRoles;
        });
        setSelectedRoles([])
        setShowRoleDialog(false)
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá mới"}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isEdit ? "Cập nhật thông tin mã giảm giá" : "Tạo mã giảm giá mới cho hệ thống"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="code">Mã giảm giá *</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                                    placeholder="VD: SALE20"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Mô tả *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    placeholder="Mô tả chi tiết về mã giảm giá"
                                    required
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                                />
                                <Label htmlFor="isActive">Kích hoạt mã giảm giá</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isPublic}
                                    onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
                                />
                                <Label htmlFor="isActive">Công khai</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt giảm giá</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="type">Loại giảm giá</Label>
                                <Select
                                    value={formData.IsPercentage ? "true" : "false"}
                                    onValueChange={(value) => handleInputChange("IsPercentage", value === "true")}
                                >
                                    <SelectTrigger>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Phần trăm (%)</SelectItem>
                                        <SelectItem value="false">Số tiền cố định (VNĐ)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="value">
                                    Giá trị {formData.IsPercentage ? "(%)" : "(VNĐ)"} *
                                </Label>
                                {formData.IsPercentage ? (
                                    <Input
                                        id="value"
                                        type="number"
                                        value={formData.discountPercentage}
                                        onChange={(e) => handleInputChange("discountPercentage", Number(e.target.value))}
                                        min="0"
                                        // step={formData.IsPercentage ? "1" : "1000"}
                                        required
                                    />
                                ) : (
                                    <Input
                                        id="value"
                                        type="number"
                                        value={formData.discountAmount}
                                        onChange={(e) => handleInputChange("discountAmount", Number(e.target.value))}
                                        min="0"
                                        // step={formData.IsPercentage ? "1" : "1000"}
                                        required
                                    />
                                )}

                            </div>

                            <div>
                                <Label htmlFor="maxDiscountAmount">Số tiền giảm tối đa (VNĐ)</Label>
                                <Input
                                    id="maxDiscountAmount"
                                    type="number"
                                    value={formData.maxDiscountAmount}
                                    onChange={(e) => handleInputChange("maxDiscountAmount", Number(e.target.value))}
                                    min="0"
                                    // step="1000"
                                />
                            </div>

                            <div>
                                <Label htmlFor="minimumOrderAmount">Đơn hàng tối thiểu (VNĐ)</Label>
                                <Input
                                    id="minimumOrderAmount"
                                    type="number"
                                    value={formData.minimumOrderAmount}
                                    onChange={(e) => handleInputChange("minimumOrderAmount", Number(e.target.value))}
                                    min="0"
                                    // step="1000"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Giới hạn sử dụng</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="totalUsageLimit">Tổng số lần sử dụng</Label>
                                <Input
                                    id="totalUsageLimit"
                                    type="number"
                                    value={formData.totalUsageLimit}
                                    onChange={(e) => handleInputChange("totalUsageLimit", Number(e.target.value))}
                                    min="1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="maxUsagePerUser">Số lần sử dụng tối đa/người</Label>
                                <Input
                                    id="maxUsagePerUser"
                                    type="number"
                                    value={formData.maxUsagePerUser}
                                    onChange={(e) => handleInputChange("maxUsagePerUser", Number(e.target.value))}
                                    min="1"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Thời gian áp dụng</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="startDate">Thời gian bắt đầu *</Label>
                                <Input
                                    id="startDate"
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="endDate">Thời gian kết thúc *</Label>
                                <Input
                                    id="endDate"
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Sách áp dụng
                            <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
                                <DialogTrigger asChild>
                                    <Button type="button" size="sm" className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Thêm sách
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Chọn sách áp dụng</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Tìm kiếm sách theo tên, tác giả, thể loại..."
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
                                                                checked={selectedBooks.length === books.length && books.length > 0}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        setSelectedBooks(books.map((book) => book.id))
                                                                    } else {
                                                                        setSelectedBooks([])
                                                                    }
                                                                }}
                                                            />
                                                        </TableHead>
                                                        <TableHead>Tên sách</TableHead>
                                                        <TableHead>Isbn</TableHead>
                                                        {/*<TableHead>Thể loại</TableHead>*/}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {books.map((book) => (
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
                                                            <TableCell>{book.name}</TableCell>
                                                            <TableCell>{book.isbn}</TableCell>
                                                            {/*<TableCell>{book.category}</TableCell>*/}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                            {books.length === 0 && (
                                                <div className="text-center py-4 text-gray-500">Không tìm thấy sách nào phù hợp</div>
                                            )}
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowBookDialog(false)
                                                    setBookSearchTerm("")
                                                    setSelectedBooks([])
                                                }}
                                            >
                                                Hủy
                                            </Button>
                                            <Button type="button" onClick={addApplicableBooks}>
                                                Thêm ({selectedBooks.length})
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {formData.applicableBookIds.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tên sách</TableHead>
                                        <TableHead>Isbn</TableHead>
                                        {/*<TableHead>Thể loại</TableHead>*/}
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookTables.map((book ) => {
                                        // const book = getBookById(bookId)
                                        return (
                                            <TableRow key={book?.id}>
                                                <TableCell>{book?.name || `Book ID: ${bookId}`}</TableCell>
                                                <TableCell>{book?.isbn || "-"}</TableCell>
                                                {/*<TableCell>{book?.category || "-"}</TableCell>*/}
                                                <TableCell>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeApplicableBook(bookId)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-gray-500 text-center py-4">
                                Chưa có sách nào được chọn. Để trống sẽ áp dụng cho tất cả sách.
                            </p>
                        )}
                    </CardContent>
                </Card>


                <div className="flex justify-end gap-4 sticky bottom-0 bg-white p-4 border-t">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                        Hủy
                    </Button>
                    <Button type="submit">{isEdit ? "Cập nhật" : "Tạo mới"}</Button>
                </div>
            </form>
        </div>
    )
}

