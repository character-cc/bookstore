"use client"

import {useEffect, useState} from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Lock, Save } from "lucide-react"
import { toast } from "sonner"
import {useApi} from "~/hooks/useApi";
import {usersApi} from "~/lib/api";

interface UserProfile {
    id: number
    username: string
    firstName: string
    lastName: string
    gender: number
    email: string
    phoneNumber: string
    dateOfBirth: string | null
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile>({})

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isEditing, setIsEditing] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    const {execute} = useApi<any>()

    useEffect(() => {
        loadUsers()
    },[])
    const loadUsers = async () => {
        try {
            const response = await fetch("http://localhost/api/users/me/profile")
            if(!response.ok) {
                throw new Error("Could not fetch profile")
            }
            const data = await response.json()
            setProfile(data)
        }
        catch (error) {
            console.log(error)
        }
    }

    const updateProfile = async () => {
        try{
            const data = await execute(() => usersApi.updateUserProfile(profile))
        }
        catch (error) {
            console.log(error)
        }
    }


    const handleProfileChange = (field: string, value: string | number) => {
        setProfile((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }

    }

    const handlePasswordChange = (field: string, value: string) => {
        setPasswordForm((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    const validateProfile = () => {
        const newErrors: Record<string, string> = {}

        if (!profile.firstName.trim()) {
            newErrors.firstName = "Họ là bắt buộc"
        }
        if (!profile.lastName.trim()) {
            newErrors.lastName = "Tên là bắt buộc"
        }
        if (!profile.email.trim()) {
            newErrors.email = "Email là bắt buộc"
        } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
            newErrors.email = "Email không hợp lệ"
        }
        if (!profile.phoneNumber.trim()) {
            newErrors.phoneNumber = "Số điện thoại là bắt buộc"
        } else if (!/^[0-9]{10,11}$/.test(profile.phoneNumber)) {
            newErrors.phoneNumber = "Số điện thoại không hợp lệ"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const formatDateForInput = (value: string | null | undefined) => {
        if (!value) return "";

        const date = new Date(value);
        if (isNaN(date.getTime())) return "";

        return date.toISOString().split("T")[0]; // Lấy phần YYYY-MM-DD
    }

    const validatePassword = () => {
        const newErrors: Record<string, string> = {}

        if (!passwordForm.currentPassword) {
            newErrors.currentPassword = "Mật khẩu hiện tại là bắt buộc"
        }
        if (!passwordForm.newPassword) {
            newErrors.newPassword = "Mật khẩu mới là bắt buộc"
        } else if (passwordForm.newPassword.length < 6) {
            newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự"
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            newErrors.confirmPassword = "Xác nhận mật khẩu không khớp"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleUpdateProfile = async () => {
        if (!validateProfile()) return

        setLoading(true)
        try {
            updateProfile()

            setIsEditing(false)
            toast("Cập nhật thông tin thành công!")
        } catch (error) {
            toast("Có lỗi xảy ra khi cập nhật thông tin")
        } finally {
            setLoading(false)
        }
    }

    const handleChangePassword = async () => {
        if (!validatePassword()) return

        setLoading(true)
        try {

            const response = await fetch("http://localhost/api/users/me/password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body : JSON.stringify({
                    oldPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.confirmPassword,
                })
            })

            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            })
            setIsChangingPassword(false)

            if (!response.ok) {
                throw response
            }
            toast("Đổi mật khẩu thành công!")
        } catch (error) {
            toast("Mật khẩu cũ không hợp lệ ")
        } finally {
            setLoading(false)
        }
    }

    const getGenderLabel = (gender: number) => {
        switch (gender) {
            case 1:
                return "Nam"
            case 2:
                return "Nữ"
            default:
                return "Khác"
        }
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>
    </div>

    <div className="space-y-6">
        <Card>
        <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
        <div className="grid gap-2">
        <Label>Tên đăng nhập</Label>
    <div className="p-2 bg-gray-50 rounded border text-gray-600">{profile.username}</div>
        </div>

    <div className="grid grid-cols-2 gap-4">
    <div className="grid gap-2">
        <Label>Họ</Label>
    {isEditing ? (
            <>
                <Input
                    value={profile.firstName}
        onChange={(e) => handleProfileChange("firstName", e.target.value)}
        className={errors.firstName ? "border-red-500" : ""}
        />
        {errors.firstName && <span className="text-sm text-red-500">{errors.firstName}</span>}
            </>
        ) : (
            <div className="p-2 border rounded bg-gray-50">{profile.firstName || "Chưa cập nhật"}</div>
        )}
        </div>

        <div className="grid gap-2">
        <Label>Tên</Label>
        {isEditing ? (
                <>
                    <Input
                        value={profile.lastName}
            onChange={(e) => handleProfileChange("lastName", e.target.value)}
            className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && <span className="text-sm text-red-500">{errors.lastName}</span>}
                </>
            ) : (
                <div className="p-2 border rounded bg-gray-50">{profile.lastName || "Chưa cập nhật"}</div>
            )}
            </div>
            </div>

            <div className="grid gap-2">
                <Label>Giới tính</Label>
            {isEditing ? (
                    <Select
                        value={profile.gender.toString()}
                onValueChange={(value) => handleProfileChange("gender", Number(value))}
            >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="1">Nam</SelectItem>
                    <SelectItem value="2">Nữ</SelectItem>
                <SelectItem value="3">Khác</SelectItem>
                </SelectContent>
                </Select>
            ) : (
                <div className="p-2 border rounded bg-gray-50">{getGenderLabel(profile.gender)}</div>
            )}
            </div>

        <div className="grid gap-2">
            <Label>Email</Label>
            <div className="p-2 border rounded bg-gray-50">{profile.email || "Chưa cập nhật"}</div>

        </div>

        <div className="grid gap-2">
        <Label>Số điện thoại</Label>
                {isEditing ? (
                        <>
                            <Input
                                value={profile.phoneNumber}
                    onChange={(e) => handleProfileChange("phoneNumber", e.target.value)}
                    className={errors.phoneNumber ? "border-red-500" : ""}
                    />
                    {errors.phoneNumber && <span className="text-sm text-red-500">{errors.phoneNumber}</span>}
                        </>
                    ) : (
                        <div className="p-2 border rounded bg-gray-50">{profile.phoneNumber || "Chưa cập nhật"}</div>
                    )}
                    </div>

                    <div className="grid gap-2">
                        <Label>Ngày sinh</Label>
                    {isEditing ? (
                        <Input
                            type="date"
                            value={formatDateForInput(profile.dateOfBirth)}
                            onChange={(e) => handleProfileChange("dateOfBirth", e.target.value)}
                        />

                    ) : (
                        <div className="p-2 border rounded bg-gray-50">
                            {profile.dateOfBirth ? formatDateForInput(profile.dateOfBirth) : "Chưa cập nhật"}
                            </div>
                    )}
                    </div>

                    <div className="flex gap-2">
                        {isEditing ? (
                                <>
                                    <Button onClick={handleUpdateProfile} disabled={loading} className="flex-1">
                            <Save className="h-4 w-4 mr-2" />
                                {loading ? "Đang lưu..." : "Lưu thay đổi"}
                                </Button>
                                <Button
                            variant="outline"
                            onClick={() => {
                    setIsEditing(false)
                    setErrors({})
                }}
                    disabled={loading}
                    className="flex-1"
                        >
                        Hủy
                        </Button>
                        </>
                ) : (
                    <Button onClick={() => setIsEditing(true)} className="w-full">
                <User className="h-4 w-4 mr-2" />
                    Chỉnh sửa thông tin
                </Button>
                )}
                    </div>
                    </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                        Đổi mật khẩu
                </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!isChangingPassword ? (
                    <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">Nhấn nút bên dưới để đổi mật khẩu</p>
                <Button onClick={() => setIsChangingPassword(true)} variant="outline" className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                    Đổi mật khẩu
                </Button>
                </div>
                ) : (
                    <>
                        <div className="grid gap-2">
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại *</Label>
                <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                    className={errors.currentPassword ? "border-red-500" : ""}
                    />
                    {errors.currentPassword && <span className="text-sm text-red-500">{errors.currentPassword}</span>}
                        </div>

                        <div className="grid gap-2">
                    <Label htmlFor="newPassword">Mật khẩu mới *</Label>
                    <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                        className={errors.newPassword ? "border-red-500" : ""}
                        />
                        {errors.newPassword && <span className="text-sm text-red-500">{errors.newPassword}</span>}
                            </div>

                            <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới *</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                            className={errors.confirmPassword ? "border-red-500" : ""}
                            />
                            {errors.confirmPassword && <span className="text-sm text-red-500">{errors.confirmPassword}</span>}
                                </div>

                                <div className="flex gap-2">
                            <Button onClick={handleChangePassword} disabled={loading} className="flex-1">
                            <Lock className="h-4 w-4 mr-2" />
                                {loading ? "Đang đổi..." : "Đổi mật khẩu"}
                                </Button>
                                <Button
                                variant="outline"
                                onClick={() => {
                                setIsChangingPassword(false)
                                setPasswordForm({
                                    currentPassword: "",
                                    newPassword: "",
                                    confirmPassword: "",
                                })
                                setErrors({})
                            }}
                                disabled={loading}
                                className="flex-1"
                                    >
                                    Hủy
                                    </Button>
                                    </div>
                                    </>
                            )}
                            </CardContent>
                            </Card>
                            </div>
                            </div>
                        )
                        }
