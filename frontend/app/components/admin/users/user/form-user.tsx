"use client"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { ArrowLeft, Save, SaveIcon, Eye, EyeOff } from "lucide-react"
import {Link} from "react-router";
import {useNavigate} from "react-router";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select as SelectShad , SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import Select from "react-select"
import AdminUserSidebar from "~/components/admin/users/user/sidebar-user";
import {
    usersApi,
    addressesApi,
    ordersApi,
    paymentMethodsApi,
    notificationsApi,
    securityApi,
    type User,
    type Role,
    type RoleOption,
    type Address,
    type Order,
    type PaymentMethod,
    type NotificationSettings, type GenderOption,
} from "~/lib/api"
import {
    useUser,
    useAddresses,
    useOrders,
    usePaymentMethods,
    useNotifications,
    useRoles,
    type ApiError
} from "~/hooks/useApi"

import { format } from "date-fns";
import AddressManagement from "~/components/admin/users/user/address-management";
interface UserFormProps {
    mode: "add" | "edit"
    userId?: string
    section?: string
}



export default function AdminUserForm({ mode, userId, section = "general" }: UserFormProps) {
    const router = useNavigate()
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [user, setUser] = useState<User | null>(null)
    const [addresses, setAddresses] = useState<Address[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [selectedRoles , setSelectedRoles] = useState<number[]>([])
    const {error: errorUser, loading: userLoading, execute: executeUser } = useUser()
    const { loading: addressesLoading, execute: executeAddresses } = useAddresses()
    const { loading: ordersLoading, execute: executeOrders } = useOrders()
    const { loading: paymentsLoading, execute: executePayments } = usePaymentMethods()
    const { loading: notificationsLoading, execute: executeNotifications } = useNotifications()
    const [roles, setRoles] = useState<Role[]>([])
    const [roleOptions, setRoleOptions] = useState<RoleOption[]>([])
    const { loading : loadingRoles , execute: executeRoles } = useRoles()
    const [genders , setGenders] = useState<GenderOption[]>([])

    useEffect(() => {
        console.log("Roles đã được cập nhật:", roles);
        const options = roles.map(role => ({
            label: role.friendlyName,
            value: role.id,
        }));
        setRoleOptions(options);
    }, [roles]);


    useEffect(() => {
        loadRoles()
        loadGenders()
    },[])

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

    const loadGenders = async () => {
            try {
                const result = await executeUser(() =>
                    usersApi.getGenders()
                )
                if(result){
                    setGenders(result);
                }
            }
            catch (error) {
                console.log(error);
            }
    }

    const [formData, setFormData] = useState({
        id: 0,
        username: "",
        firstName: "",
        lastName: "",
        gender: 1,
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        dateOfBirth: "",
        isActive: true,
        selectedRoles: [] as number[],
        notes: "",
    })

    useEffect(() => {
        if (mode === "edit" && userId) {
            loadUserData()
        }
    }, [mode, userId])

    useEffect(() => {
        if (mode === "edit" && userId) {
            loadSectionData()
        }
    }, [section, userId])

    useEffect(() => {

    }, [errorUser])


    const loadUserData = async () => {
        if (!userId) return

        try {
            const userData  =  await executeUser(() => usersApi.getUser(Number(userId)), {
                errorMessage: "Không thể tải thông tin người dùng",
            }) as User

            if (userData) {
                setUser(userData)
                console.log(userData)
                setFormData({
                    id: userData.id,
                    username: userData.username,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    gender: userData.gender,
                    email: userData.email,
                    phoneNumber: userData.phoneNumber,
                    password: "",
                    confirmPassword: "",
                    dateOfBirth: userData.dateOfBirth,
                    isActive: userData.isActive,
                    selectedRoles:  userData.roles.map((role) => role.id),
                    notes: userData.notes || "",
                })
                setSelectedRoles(userData.roles.map((role) => role.id))
            }
        } catch (error) {
            console.error("Failed to load user:", error)
        }
    }

    const loadSectionData = async () => {
        if (!userId) return

        try {
            switch (section) {
                case "addresses":
                    const addressData = await executeAddresses(() => addressesApi.getUserAddresses(Number(userId)), {
                        errorMessage: "Không thể tải danh sách địa chỉ",
                    })
                    if (addressData) setAddresses(addressData)
                    break

                case "orders":
                    const orderData = await executeOrders(() => ordersApi.getUserOrders(Number(userId)), {
                        errorMessage: "Không thể tải lịch sử đơn hàng",
                    })
                    if (orderData) setOrders(orderData)
                    break

                case "payments":
                    const paymentData = await executePayments(() => paymentMethodsApi.getUserPaymentMethods(Number(userId)), {
                        errorMessage: "Không thể tải phương thức thanh toán",
                    })
                    if (paymentData) setPaymentMethods(paymentData)
                    break

                case "notifications":
                    const notifData = await executeNotifications(
                        () => notificationsApi.getUserNotificationSettings(Number(userId)),
                        { errorMessage: "Không thể tải cài đặt thông báo" },
                    )
                    if (notifData) setNotificationSettings(notifData)
                    break
            }
        } catch (error) {
            console.error("Failed to load section data:", error)
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.username.trim()) {
            newErrors.username = "Tên đăng nhập là bắt buộc."
        } else if (formData.username.length < 3) {
            newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự"
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"
        }

        if (!formData.firstName.trim()) {
            newErrors.firstName = "Tên là bắt buộc "
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Họ là bắt buộc"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email là bắt buộc"
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ"
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Số điện thoại là bắt buộc"
        } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Số điện thoại không hợp lệ (10-11 chữ số)"
        }

        if (mode === "add" || formData.password) {
            if (!formData.password) {
                newErrors.password = "Mật khẩu là bắt buộc"
            } else if (formData.password.length < 6) {
                newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Xác nhận mật khẩu không khớp"
            }
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = "Ngày sinh là bắt buộc"
        } else {
            const birthDate = new Date(formData.dateOfBirth)
            const today = new Date()
            const age = today.getFullYear() - birthDate.getFullYear()
            if (age < 13 || age > 120) {
                newErrors.dateOfBirth = "Tuổi phải từ 13 đến 120"
            }
        }

        if (selectedRoles.length === 0) {
            newErrors.roles = "Phải chọn ít nhất một vai trò"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (field: string, value: string | boolean | number[]) => {
        setFormData({ ...formData, [field]: value })
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" })
        }
    }


    const handleSave = async (continueEditing = false) => {
        if (section === "general" && !validateForm()) return

        try {
            const userData = {
                id: formData.id,
                username: formData.username,
                firstName: formData.firstName,
                lastName: formData.lastName,
                gender: formData.gender,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                dateOfBirth: formData.dateOfBirth,
                isActive: formData.isActive,
                roleIds : selectedRoles,
                notes: formData.notes,
                ...(formData.password && { password: formData.password }),
            }

            console.log(userData)

            if (mode === "add") {
                await executeUser(() => usersApi.createUser(userData), {
                    successMessage: "Tạo người dùng thành công!",
                    onSuccess: () => {
                        if (!continueEditing) {
                            router("/admin/users")
                        }
                    },
                })
            } else if (userId) {
                await executeUser(() => usersApi.updateUser(userData), {
                    successMessage: "Cập nhật thông tin thành công!",
                    onSuccess: (updatedUser) => {
                        setUser(updatedUser)
                        if (!continueEditing) {
                            router("/admin/users")
                        }
                    },
                })
            }


        } catch (err) {
            console.error("Save failed:", err)

            const error = err as ApiError
            if (error?.errors) {
                const newErrors: Record<string, string> = {}

                for (const [key, messages] of Object.entries(error.errors)) {
                    if (key in formData || key === "roles") {
                        newErrors[key] = messages.join(". ") + "."
                    } else {
                        messages.forEach((msg) => toast.error(msg))
                    }
                }

                setErrors(newErrors)
            } else if (errorUser?.message) {
                toast.error(errorUser.message)
            }

        }
    }

    const handleNotificationChange = async (setting: keyof NotificationSettings, value: boolean) => {
        if (!userId || !notificationSettings) return

        try {
            const updatedSettings = await executeNotifications(
                () =>
                    notificationsApi.updateNotificationSettings(Number(userId), {
                        ...notificationSettings,
                        [setting]: value,
                    }),
                {
                    successMessage: "Cập nhật cài đặt thông báo thành công!",
                },
            )

            if (updatedSettings) {
                setNotificationSettings(updatedSettings)
            }
        } catch (error) {
            console.error("Failed to update notification settings:", error)
        }
    }

    const handleSecurityAction = async (action: "resetPassword" | "enable2FA" | "disable2FA" | "logoutAll") => {
        if (!userId) return

        try {
            switch (action) {
                case "resetPassword":
                    await executeUser(() => securityApi.sendPasswordResetEmail(Number(userId)), {
                        successMessage: "Đã gửi email đặt lại mật khẩu!",
                    })
                    break
                case "enable2FA":
                    await executeUser(() => securityApi.enable2FA(Number(userId)), {
                        successMessage: "Đã kích hoạt xác thực 2 bước!",
                    })
                    break
                case "disable2FA":
                    await executeUser(() => securityApi.disable2FA(Number(userId)), { successMessage: "Đã tắt xác thực 2 bước!" })
                    break
                case "logoutAll":
                    await executeUser(() => securityApi.logoutAllDevices(Number(userId)), {
                        successMessage: "Đã đăng xuất tất cả thiết bị!",
                    })
                    break
            }
        } catch (error) {
            console.error("Security action failed:", error)
        }
    }

    const renderSectionContent = () => {
        const isLoading = userLoading || addressesLoading || ordersLoading || paymentsLoading || notificationsLoading

        switch (section) {
            case "general":
                return (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin cơ bản</CardTitle>
                                <CardDescription>Thông tin cá nhân và liên hệ của người dùng</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Username */}
                                <div className="grid gap-2">
                                    <Label htmlFor="username">
                                        Tên đăng nhập <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="username"
                                        value={formData.username}
                                        onChange={(e) => handleInputChange("username", e.target.value)}
                                        placeholder="Nhập tên đăng nhập"
                                        className={errors.username ? "border-red-500" : ""}
                                        disabled={isLoading || mode === "edit"} // Disable username editing
                                    />
                                    {errors.username && <span className="text-sm text-red-500">{errors.username}</span>}
                                    {mode === "edit" && <span className="text-xs text-gray-500">Tên đăng nhập không thể thay đổi</span>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="firstName">
                                            Tên <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                                            placeholder="Nhập tên"
                                            className={errors.firstName ? "border-red-500" : ""}
                                            disabled={isLoading}
                                        />
                                        {errors.firstName && <span className="text-sm text-red-500">{errors.firstName}</span>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="lastName">
                                            Họ <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                                            placeholder="Nhập họ"
                                            className={errors.lastName ? "border-red-500" : ""}
                                            disabled={isLoading}
                                        />
                                        {errors.lastName && <span className="text-sm text-red-500">{errors.lastName}</span>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="gender">Giới tính</Label>
                                        <SelectShad
                                            value={formData.gender.toString()}
                                            onValueChange={(value) => handleInputChange("gender", value)}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn giới tính" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/*<SelectItem value="Male">Nam</SelectItem>*/}
                                                {/*<SelectItem value="Female">Nữ</SelectItem>*/}
                                                {/*<SelectItem value="Other">Khác</SelectItem>*/}
                                                {genders.map(gender => (
                                                    <SelectItem value={gender.value.toString()}>
                                                        {gender.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </SelectShad>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="dateOfBirth">
                                            Ngày sinh <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="dateOfBirth"
                                            type="date"
                                        value={formData.dateOfBirth ? format(new Date(formData.dateOfBirth), "yyyy-MM-dd") : ""}
                                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                                            className={errors.dateOfBirth ? "border-red-500" : ""}
                                            disabled={isLoading}
                                        />
                                        {errors.dateOfBirth && <span className="text-sm text-red-500">{errors.dateOfBirth}</span>}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        Email <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        placeholder="example@email.com"
                                        className={errors.email ? "border-red-500" : ""}
                                        disabled={isLoading}
                                    />
                                    {errors.email && <span className="text-sm text-red-500">{errors.email}</span>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phoneNumber">
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                        placeholder="0901234567"
                                        className={errors.phoneNumber ? "border-red-500" : ""}
                                        disabled={isLoading}
                                    />
                                    {errors.phoneNumber && <span className="text-sm text-red-500">{errors.phoneNumber}</span>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{mode === "add" ? "Mật khẩu" : "Thay đổi mật khẩu"}</CardTitle>
                                <CardDescription>
                                    {mode === "add" ? "Tạo mật khẩu cho tài khoản mới" : "Để trống nếu không muốn thay đổi mật khẩu"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">
                                            Mật khẩu {mode === "add" && <span className="text-red-500">*</span>}
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => handleInputChange("password", e.target.value)}
                                                placeholder="Nhập mật khẩu"
                                                className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                                                disabled={isLoading}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={isLoading}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        {errors.password && <span className="text-sm text-red-500">{errors.password}</span>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="confirmPassword">
                                            Xác nhận mật khẩu {mode === "add" && <span className="text-red-500">*</span>}
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                                placeholder="Nhập lại mật khẩu"
                                                className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                                                disabled={isLoading}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                disabled={isLoading}
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        {errors.confirmPassword && <span className="text-sm text-red-500">{errors.confirmPassword}</span>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Cài đặt tài khoản</CardTitle>
                                <CardDescription>Vai trò và trạng thái của tài khoản người dùng</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Account Status */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Trạng thái tài khoản</Label>
                                        <div className="text-sm text-gray-600">
                                            {formData.isActive ? "Tài khoản đang hoạt động" : "Tài khoản bị vô hiệu hóa"}
                                        </div>
                                    </div>
                                    <Switch
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                                        disabled={isLoading}
                                    />
                                </div>

                                <Separator />

                                <div className="grid gap-3">
                                    <Label>
                                        Vai trò <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <Select
                                            required
                                            options={roleOptions}
                                            isMulti
                                            value={roleOptions.filter(o => selectedRoles.includes(o.value))}
                                            onChange={(selected) => setSelectedRoles(selected.map((s) => s.value))}
                                        />
                                    </div>
                                    {errors.roles && <span className="text-sm text-red-500">{errors.roles}</span>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Ghi chú</CardTitle>
                                <CardDescription>Ghi chú nội bộ về người dùng (chỉ admin xem được)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Ghi chú</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange("notes", e.target.value)}
                                        placeholder="Thêm ghi chú về người dùng này..."
                                        className="min-h-[100px]"
                                        disabled={isLoading}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )

            case "addresses":
                return <AddressManagement userId={Number(userId)} />

            case "orders":
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Lịch sử đơn hàng</CardTitle>
                            <CardDescription>Quản lý và theo dõi đơn hàng của khách hàng</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                    <span className="ml-2">Đang tải...</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium">#{order.id}</h4>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded ${
                                                        order.status === "completed"
                                                            ? "bg-green-100 text-green-800"
                                                            : order.status === "shipping"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : order.status === "pending"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                          {order.status === "completed"
                              ? "Hoàn thành"
                              : order.status === "shipping"
                                  ? "Đang giao"
                                  : order.status === "pending"
                                      ? "Chờ xử lý"
                                      : "Đã hủy"}
                        </span>
                                            </div>
                                            <p className="text-sm text-gray-600">Ngày đặt: {order.orderDate}</p>
                                            <p className="text-sm text-gray-600">
                                                Tổng tiền:{" "}
                                                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                                    order.totalAmount,
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-600">{order.itemCount} sản phẩm</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )

            case "payments":
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Phương thức thanh toán</CardTitle>
                            <CardDescription>Quản lý thông tin thanh toán và giao dịch</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                    <span className="ml-2">Đang tải...</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {paymentMethods.map((payment) => (
                                        <div key={payment.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium">{payment.displayName}</h4>
                                                {payment.isDefault && (
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Mặc định</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">{payment.details}</p>
                                        </div>
                                    ))}

                                    <Button variant="outline" className="w-full">
                                        + Thêm phương thức thanh toán
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )

            case "notifications":
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt thông báo</CardTitle>
                            <CardDescription>Quản lý thông báo email và SMS</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                    <span className="ml-2">Đang tải...</span>
                                </div>
                            ) : notificationSettings ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Email khuyến mãi</h4>
                                            <p className="text-sm text-gray-600">Nhận thông báo về các chương trình khuyến mãi</p>
                                        </div>
                                        <Checkbox
                                            checked={notificationSettings.emailPromotions}
                                            onCheckedChange={(checked) => handleNotificationChange("emailPromotions", checked as boolean)}
                                            disabled={notificationsLoading}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">SMS đơn hàng</h4>
                                            <p className="text-sm text-gray-600">Nhận SMS cập nhật trạng thái đơn hàng</p>
                                        </div>
                                        <Checkbox
                                            checked={notificationSettings.smsOrders}
                                            onCheckedChange={(checked) => handleNotificationChange("smsOrders", checked as boolean)}
                                            disabled={notificationsLoading}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Email sản phẩm mới</h4>
                                            <p className="text-sm text-gray-600">Thông báo về sách mới và bestseller</p>
                                        </div>
                                        <Checkbox
                                            checked={notificationSettings.emailNewProducts}
                                            onCheckedChange={(checked) => handleNotificationChange("emailNewProducts", checked as boolean)}
                                            disabled={notificationsLoading}
                                        />
                                    </div>
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                )

            case "security":
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Bảo mật tài khoản</CardTitle>
                            <CardDescription>Quản lý mật khẩu và cài đặt bảo mật</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label>Đổi mật khẩu</Label>
                                    <Button
                                        variant="outline"
                                        className="w-full mt-2"
                                        onClick={() => handleSecurityAction("resetPassword")}
                                        disabled={userLoading}
                                    >
                                        {userLoading ? "Đang gửi..." : "Gửi email đặt lại mật khẩu"}
                                    </Button>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="font-medium mb-2">Xác thực 2 bước</h4>
                                    <p className="text-sm text-gray-600 mb-2">Chưa kích hoạt</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSecurityAction("enable2FA")}
                                        disabled={userLoading}
                                    >
                                        {userLoading ? "Đang kích hoạt..." : "Kích hoạt"}
                                    </Button>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="font-medium mb-2">Phiên đăng nhập</h4>
                                    <p className="text-sm text-gray-600 mb-2">Đăng nhập cuối: {user?.lastLogin || "Không xác định"}</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSecurityAction("logoutAll")}
                                        disabled={userLoading}
                                    >
                                        {userLoading ? "Đang xử lý..." : "Đăng xuất tất cả thiết bị"}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )

            case "notes":
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Ghi chú nội bộ</CardTitle>
                            <CardDescription>Ghi chú và nhận xét về khách hàng (chỉ admin xem được)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="notes">Ghi chú</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange("notes", e.target.value)}
                                        placeholder="Thêm ghi chú về khách hàng này..."
                                        className="min-h-[120px] mt-2"
                                        disabled={isLoading}
                                    />
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="font-medium mb-2">Lịch sử ghi chú</h4>
                                    <div className="space-y-2">
                                        <div className="border-l-4 border-blue-200 pl-3 py-2">
                                            <p className="text-sm">Khách hàng VIP, thường xuyên mua sách văn học</p>
                                            <p className="text-xs text-gray-500">Admin - 15/01/2024</p>
                                        </div>
                                        <div className="border-l-4 border-gray-200 pl-3 py-2">
                                            <p className="text-sm">Yêu cầu giao hàng nhanh, sẵn sàng trả phí thêm</p>
                                            <p className="text-xs text-gray-500">Admin - 10/01/2024</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )

            default:
                return null
        }
    }

    const getSectionTitle = () => {
        const titles = {
            general: "Thông tin chung",
            addresses: "Quản lý địa chỉ",
            orders: "Quản lý đơn hàng",
            payments: "Phương thức thanh toán",
            notifications: "Cài đặt thông báo",
            security: "Bảo mật tài khoản",
            notes: "Ghi chú nội bộ",
        }
        return titles[section as keyof typeof titles] || "Chỉnh sửa người dùng"
    }

    const isLoading = userLoading || addressesLoading || ordersLoading || paymentsLoading || notificationsLoading

    return (
        <div className="container mx-auto py-6 max-w-7xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/admin/users">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{mode === "add" ? "Thêm người dùng mới" : getSectionTitle()}</h1>
                    <p className="text-gray-600">
                        {mode === "add"
                            ? "Nhập thông tin để tạo tài khoản người dùng mới"
                            : `${user?.firstName} ${user?.lastName} (@${user?.username}) - ID: ${userId}`}
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {mode === "edit" && (
                    <div className="lg:col-span-1">
                        <AdminUserSidebar userId={userId!} />
                    </div>
                )}

                <div className={mode === "edit" ? "lg:col-span-2" : "lg:col-span-3"}>{renderSectionContent()}</div>

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hành động</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button onClick={() => handleSave(false)} className="w-full" disabled={isLoading}>
                                <Save className="h-4 w-4 mr-2" />
                                {isLoading ? "Đang lưu..." : mode === "add" ? "Tạo người dùng" : "Lưu thay đổi"}
                            </Button>

                            {/*{mode === "edit" && (*/}
                            {/*    <Button variant="outline" onClick={() => handleSave(true)} className="w-full" disabled={isLoading}>*/}
                            {/*        <SaveIcon className="h-4 w-4 mr-2" />*/}
                            {/*        Lưu & Tiếp tục chỉnh sửa*/}
                            {/*    </Button>*/}
                            {/*)}*/}

                            <Separator />

                            <Button variant="outline" className="w-full" asChild>
                                <Link to="/admin/users">Hủy</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {mode === "edit" && user && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin tài khoản</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">ID người dùng</Label>
                                    <p className="text-sm">{user.id}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Tên đăng nhập</Label>
                                    <p className="text-sm">@{user.username}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Ngày tham gia</Label>
                                    <p className="text-sm">{user.createdAt}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Đăng nhập cuối</Label>
                                    <p className="text-sm">{user.lastLogin}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Vai trò</Label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                      {/*                  {user.roles.map((role) => (*/}
                      {/*                      <span key={role.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">*/}
                      {/*  {role.name}*/}
                      {/*</span>*/}
                      {/*                  ))}*/}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Trợ giúp</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-gray-600 space-y-2">
                            <p>• Tên đăng nhập phải duy nhất và không thể thay đổi</p>
                            <p>• Mật khẩu phải có ít nhất 6 ký tự</p>
                            <p>• Email phải là địa chỉ email hợp lệ</p>
                            <p>• Số điện thoại phải có 10-11 chữ số</p>
                            <p>• Phải chọn ít nhất một vai trò</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
