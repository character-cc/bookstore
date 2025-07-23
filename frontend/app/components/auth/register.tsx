"use client"

import type React from "react"

import { useState } from "react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {useNavigate} from "react-router";

interface FormData {
    firstName: string
    lastName: string
    email: string
    phone: string
    gender: string
    dateOfBirth: string
    password: string
    confirmPassword: string
    username: string
}

interface FormErrors {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    gender?: string
    dateOfBirth?: string
    password?: string
    confirmPassword?: string
    username?: string
}

const RegisterForm = () => {
    const [showOTP, setShowOTP] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const [otp, setOtp] = useState("")
    const [otpError, setOtpError] = useState("")

    const router = useNavigate()
    // Form data state
    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gender: "",
        dateOfBirth: "",
        password: "",
        confirmPassword: "",
        username: "",
    })

    const [errors, setErrors] = useState<FormErrors>({})

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const validatePhone = (phone: string): boolean => {
        const phoneRegex = /^[0-9]+$/
        return phoneRegex.test(phone) && phone.length >= 10
    }

    const validateAge = (dateOfBirth: string): boolean => {
        const birthDate = new Date(dateOfBirth)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        return age >= 13
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.firstName.trim()) {
            newErrors.firstName = "Họ là bắt buộc"
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Tên là bắt buộc"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email là bắt buộc"
        } else if (!validateEmail(formData.email)) {
            newErrors.email = "Email không hợp lệ"
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Số điện thoại là bắt buộc"
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = "Số điện thoại phải có ít nhất 10 số và chỉ chứa số"
        }

        if (!formData.gender) {
            newErrors.gender = "Vui lòng chọn giới tính"
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = "Ngày sinh là bắt buộc"
        } else if (!validateAge(formData.dateOfBirth)) {
            newErrors.dateOfBirth = "Bạn phải từ 13 tuổi trở lên"
        }

        if (!formData.password) {
            newErrors.password = "Mật khẩu là bắt buộc"
        } else if (formData.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc"
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu không khớp"
        }

        if (!formData.username.trim()) {
            newErrors.username = "Tên người dùng là bắt buộc"
        } else if (formData.username.length < 4) {
            newErrors.username = "Tên người dùng phải từ 4 ký tự trở lên"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validateOTP = (): boolean => {
        if (!otp.trim()) {
            setOtpError("OTP là bắt buộc")
            return false
        }
        if (otp.length !== 6) {
            setOtpError("OTP phải có 6 số")
            return false
        }
        if (!/^[0-9]+$/.test(otp)) {
            setOtpError("OTP chỉ được chứa số")
            return false
        }
        setOtpError("")
        return true
    }

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))

        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: undefined,
            }))
        }
    }

    const startCountdown = () => {
        setCountdown(60)
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const sendOTPEmail = async (email: string, username : string) => {
        try {
            const re = await  fetch("/api/users/check",{
                method: "POST",
                headers : {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    username: username,
                })
            })

            if(!re.ok){
                throw await re.json()
            }

            const response = await fetch("/api/users/otp/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            })

            if (!response.ok) {
                throw await response.json()
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.log(error)
            toast(error?.message)
            console.error("Error sending OTP:", error)
            throw error
        }
    }

    const registerWithOTP = async (userData: FormData, otpCode: string) => {
        try {
            let genderId
            if (userData.gender === "male") {
                genderId = 1
            }
            if (userData.gender === "female") {
                genderId = 2
            }
            if (userData.gender === "other") {
                genderId = 3
            }
            const d = {
                username: userData.username,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phoneNumber: userData.phone,
                gender: genderId,
                dateOfBirth: userData.dateOfBirth,
                password: userData.password,
                otp: otpCode,
            }
            console.log(d)
            const response = await fetch("/api/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(d),
            })
            console.log(response)
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Đăng ký thất bại")
            }

            toast("Đăng ký thành công")

            router("/")


        } catch (error) {
            console.error("Error registering:", error)
            throw error
        }
    }

    const handleSubmitRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsLoading(true)
        try {
            await sendOTPEmail(formData.email, formData.username)
            setShowOTP(true)
            startCountdown()
            toast.success(`Mã OTP đã được gửi đến ${formData.email}`)
        } catch (error) {
            // toast.error("Không thể gửi mã OTP. Vui lòng thử lại.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmitOTP = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateOTP()) {
            return
        }

        setIsLoading(true)
        try {
            await registerWithOTP(formData, otp)
            toast.success("Đăng ký thành công!")

            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                gender: "",
                dateOfBirth: "",
                password: "",
                confirmPassword: "",
                username: "",
            })
            setOtp("")
            setShowOTP(false)
            setErrors({})
            setOtpError("")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Đăng ký thất bại")
        } finally {
            setIsLoading(false)
        }
    }

    const resendOTP = async () => {
        if (countdown > 0) return

        setIsLoading(true)
        try {
            await sendOTPEmail(formData.email,formData.username)
            startCountdown()
            toast.success("Mã OTP mới đã được gửi")
        } catch (error) {
            toast.error("Không thể gửi lại mã OTP")
        } finally {
            setIsLoading(false)
        }
    }

    const goBackToRegister = () => {
        setShowOTP(false)
        setOtp("")
        setOtpError("")
    }

    if (showOTP) {
        return (
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Xác thực OTP</CardTitle>
                    <p className="text-center text-gray-600">
                        Mã OTP đã được gửi đến email: <strong>{formData.email}</strong>
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmitOTP} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="otp">Mã OTP (6 số)</Label>
                            <Input
                                id="otp"
                                placeholder="Nhập mã OTP"
                                maxLength={6}
                                className="text-center text-lg tracking-widest"
                                value={otp}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "")
                                    setOtp(value)
                                    if (otpError) setOtpError("")
                                }}
                            />
                            {otpError && <p className="text-sm text-red-500">{otpError}</p>}
                        </div>

                        <div className="space-y-3">
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Đang xác thực..." : "Xác thực và Đăng ký"}
                            </Button>

                            <div className="flex justify-between items-center text-sm">
                                <Button type="button" variant="ghost" onClick={goBackToRegister} disabled={isLoading}>
                                    ← Quay lại
                                </Button>

                                <Button type="button" variant="ghost" onClick={resendOTP} disabled={isLoading || countdown > 0}>
                                    {countdown > 0 ? `Gửi lại (${countdown}s)` : "Gửi lại OTP"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Đăng ký tài khoản</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmitRegister} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Họ</Label>
                            <Input
                                id="firstName"
                                placeholder="Nhập họ"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                            />
                            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Tên</Label>
                            <Input
                                id="lastName"
                                placeholder="Nhập tên"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange("lastName", e.target.value)}
                            />
                            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Tên người dùng</Label>
                            <Input
                                id="username"
                                placeholder="Nhập tên người dùng"
                                value={formData.username}
                                onChange={(e) => handleInputChange("username", e.target.value)}
                            />
                            {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                            id="phone"
                            placeholder="0123456789"
                            value={formData.phone}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "")
                                handleInputChange("phone", value)
                            }}
                        />
                        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="gender">Giới tính</Label>
                            <Select onValueChange={(value) => handleInputChange("gender", value)} value={formData.gender}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn giới tính" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Nam</SelectItem>
                                    <SelectItem value="female">Nữ</SelectItem>
                                    <SelectItem value="other">Khác</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                            />
                            {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Nhập mật khẩu"
                                value={formData.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                            />
                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                            />
                            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Đang gửi OTP..." : "Đăng ký"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default RegisterForm
