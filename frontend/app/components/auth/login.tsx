"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"
import {useNavigate} from "react-router";
import {Link} from "react-router";

interface LoginFormData {
    email: string
    password: string
}

interface ForgotPasswordData {
    email: string
}

interface ResetPasswordData {
    otp: string
    newPassword: string
    confirmPassword: string
}

interface LoginErrors {
    email?: string
    password?: string
}

interface ForgotPasswordErrors {
    email?: string
}

interface ResetPasswordErrors {
    otp?: string
    newPassword?: string
    confirmPassword?: string
}

export default function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const [currentView, setCurrentView] = useState<"login" | "forgot" | "reset">("login")
    const [resetEmail, setResetEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const router = useNavigate()
    const [loginData, setLoginData] = useState<LoginFormData>({
        email: "",
        password: "",
    })
    const [loginErrors, setLoginErrors] = useState<LoginErrors>({})

    const [forgotData, setForgotData] = useState<ForgotPasswordData>({
        email: "",
    })
    const [forgotErrors, setForgotErrors] = useState<ForgotPasswordErrors>({})

    const [resetData, setResetData] = useState<ResetPasswordData>({
        otp: "",
        newPassword: "",
        confirmPassword: "",
    })
    const [resetErrors, setResetErrors] = useState<ResetPasswordErrors>({})

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const validateLoginForm = (): boolean => {
        const errors: LoginErrors = {}

        if (!loginData.email.trim()) {
            errors.email = "Email is required"
        } else if (!validateEmail(loginData.email)) {
            errors.email = "Invalid email format"
        }

        if (!loginData.password.trim()) {
            errors.password = "Password is required"
        } else if (loginData.password.length < 5) {
            errors.password = "Password must be at least 5 characters"
        }

        setLoginErrors(errors)
        return Object.keys(errors).length === 0
    }

    const validateForgotForm = (): boolean => {
        const errors: ForgotPasswordErrors = {}

        if (!forgotData.email.trim()) {
            errors.email = "Email is required"
        } else if (!validateEmail(forgotData.email)) {
            errors.email = "Invalid email format"
        }

        setForgotErrors(errors)
        return Object.keys(errors).length === 0
    }

    const validateResetForm = (): boolean => {
        const errors: ResetPasswordErrors = {}

        if (!resetData.otp.trim()) {
            errors.otp = "OTP is required"
        } else if (resetData.otp.length !== 6) {
            errors.otp = "OTP must be 6 digits"
        }

        if (!resetData.newPassword.trim()) {
            errors.newPassword = "Password is required"
        } else if (resetData.newPassword.length < 6) {
            errors.newPassword = "Password must be at least 6 characters"
        }

        if (!resetData.confirmPassword.trim()) {
            errors.confirmPassword = "Please confirm your password"
        } else if (resetData.newPassword !== resetData.confirmPassword) {
            errors.confirmPassword = "Mật khẩu không giống nhau"
        }

        setResetErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleLoginChange = (field: keyof LoginFormData, value: string) => {
        setLoginData((prev) => ({
            ...prev,
            [field]: value,
        }))

        if (loginErrors[field]) {
            setLoginErrors((prev) => ({
                ...prev,
                [field]: undefined,
            }))
        }
    }

    const handleForgotChange = (field: keyof ForgotPasswordData, value: string) => {
        setForgotData((prev) => ({
            ...prev,
            [field]: value,
        }))

        if (forgotErrors[field]) {
            setForgotErrors((prev) => ({
                ...prev,
                [field]: undefined,
            }))
        }
    }

    const handleResetChange = (field: keyof ResetPasswordData, value: string) => {
        setResetData((prev) => ({
            ...prev,
            [field]: value,
        }))

        if (resetErrors[field]) {
            setResetErrors((prev) => ({
                ...prev,
                [field]: undefined,
            }))
        }
    }

    const onLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateLoginForm()) {
            return
        }

        setLoading(true)
        try {

            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    usernameOrEmail: loginData.email,
                    password: loginData.password,
                }),
            })

            if (!response.ok) {
                throw new Error("Login failed")
            }

            const result = await response.json()
            toast.success("Đăng nhập thành công!")
            router("/")
        } catch (error) {
            toast.error("Đăng nhập thất bại.Tài khoản hoặc mật khẩu bị sai .")
        } finally {
            setLoading(false)
        }
    }

    const onForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForgotForm()) {
            return
        }

        setLoading(true)
        try {
            const response = await fetch("/api/users/otp/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(forgotData),
            })

            if (!response.ok) {
                throw await response.json()
            }

            setResetEmail(forgotData.email)
            setCurrentView("reset")
            toast.success("Mã OTP đã được gửi đến email của bạn!")
        } catch (error) {
            toast(error?.message)
        } finally {
            setLoading(false)
        }
    }

    const onResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateResetForm()) {
            return
        }

        setLoading(true)
        try {
            const response = await fetch("/api/users/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: resetEmail,
                    otp: resetData.otp,
                    newPassword: resetData.newPassword,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to reset password")
            }

            toast.success("Đặt lại mật khẩu thành công!")
            setCurrentView("login")
            setResetData({
                otp: "",
                newPassword: "",
                confirmPassword: "",
            })
            setResetErrors({})
        } catch (error) {
            toast.error("Không thể đặt lại mật khẩu. Vui lòng kiểm tra mã OTP.")
        } finally {
            setLoading(false)
        }
    }
    const renderLoginForm = () => (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Đăng nhập</CardTitle>
                <CardDescription>Nhập email và mật khẩu để đăng nhập vào tài khoản</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onLogin}>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={loginData.email}
                                onChange={(e) => handleLoginChange("email", e.target.value)}
                            />
                            {loginErrors.email && <span className="text-red-500 text-sm">{loginErrors.email}</span>}
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Mật khẩu</Label>
                                <button
                                    type="button"
                                    onClick={() => setCurrentView("forgot")}
                                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-blue-600"
                                >
                                    Quên mật khẩu?
                                </button>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={loginData.password}
                                onChange={(e) => handleLoginChange("password", e.target.value)}
                            />
                            {loginErrors.password && <span className="text-red-500 text-sm">{loginErrors.password}</span>}
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </Button>
                        {/*<Button variant="outline" className="w-full bg-transparent" type="button">*/}
                        {/*    Đăng nhập với Google*/}
                        {/*</Button>*/}
                    </div>
                    <div className="mt-4 text-center text-sm">
                        Chưa có tài khoản?{" "}
                        <Link to="/register" className="underline underline-offset-4 text-blue-600">
                            Đăng ký ngay
                        </Link>
                    </div>

                </form>
            </CardContent>
        </Card>
    )

    const renderForgotPasswordForm = () => (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Quên mật khẩu</CardTitle>
                <CardDescription>Nhập email để nhận mã OTP đặt lại mật khẩu</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onForgotPassword}>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="forgot-email">Email</Label>
                            <Input
                                id="forgot-email"
                                type="email"
                                placeholder="m@example.com"
                                value={forgotData.email}
                                onChange={(e) => handleForgotChange("email", e.target.value)}
                            />
                            {forgotErrors.email && <span className="text-red-500 text-sm">{forgotErrors.email}</span>}
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Đang gửi..." : "Gửi mã OTP"}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full bg-transparent"
                            type="button"
                            onClick={() => setCurrentView("login")}
                        >
                            Quay lại đăng nhập
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )

    const renderResetPasswordForm = () => (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Đặt lại mật khẩu</CardTitle>
                <CardDescription>Nhập mã OTP và mật khẩu mới cho email: {resetEmail}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onResetPassword}>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="otp">Mã OTP</Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="Nhập 6 số"
                                maxLength={6}
                                value={resetData.otp}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "")
                                    handleResetChange("otp", value)
                                }}
                            />
                            {resetErrors.otp && <span className="text-red-500 text-sm">{resetErrors.otp}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="newPassword">Mật khẩu mới</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Nhập mật khẩu mới"
                                value={resetData.newPassword}
                                onChange={(e) => handleResetChange("newPassword", e.target.value)}
                            />
                            {resetErrors.newPassword && <span className="text-red-500 text-sm">{resetErrors.newPassword}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Nhập lại mật khẩu mới"
                                value={resetData.confirmPassword}
                                onChange={(e) => handleResetChange("confirmPassword", e.target.value)}
                            />
                            {resetErrors.confirmPassword && (
                                <span className="text-red-500 text-sm">{resetErrors.confirmPassword}</span>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full bg-transparent"
                            type="button"
                            onClick={() => setCurrentView("login")}
                        >
                            Quay lại đăng nhập
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )

    return (
        <div className="w-1/2 m-auto">
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                {currentView === "login" && renderLoginForm()}
                {currentView === "forgot" && renderForgotPasswordForm()}
                {currentView === "reset" && renderResetPasswordForm()}
            </div>
        </div>
    )
}
