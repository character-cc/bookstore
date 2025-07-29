"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {useNavigate} from "react-router";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Info } from "lucide-react"
import { type Role, rolesApi } from "@/lib/roles-api"
import {type ApiError, useRoles} from "~/hooks/useApi";
import {toast} from "sonner";

interface RoleFormProps {
    role?: Role
    mode: "create" | "edit"
}

export function RoleForm({ role, mode }: RoleFormProps) {
    const router = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [systemNameAvailable, setSystemNameAvailable] = useState<boolean | null>(null)
    const [checkingSystemName, setCheckingSystemName] = useState(false)
    const {execute } = useRoles()
    const [formData, setFormData] = useState({
        id: role?.id || null,
        friendlyName: role?.friendlyName || "",
        systemName: role?.systemName || "",
        isActive: role?.isActive ?? true,
        isFreeShipping: role?.isFreeShipping ?? false,
    })

    // useEffect(() => {
    //     if (!formData.systemName || formData.systemName === role?.systemName) {
    //         setSystemNameAvailable(null)
    //         return
    //     }
    //
    //     const timeoutId = setTimeout(async () => {
    //         setCheckingSystemName(true)
    //         try {
    //             const available = await rolesApi.checkSystemNameAvailability(formData.systemName, role?.id)
    //             setSystemNameAvailable(available)
    //         } catch (error) {
    //             console.error("Error checking system name:", error)
    //         } finally {
    //             setCheckingSystemName(false)
    //         }
    //     }, 500)
    //
    //     return () => clearTimeout(timeoutId)
    // }, [formData.systemName, role?.systemName, role?.id])

    const handleSubmit = async (e: React.FormEvent, saveAndContinue = false) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            console.log(formData)
            if (mode === "create") {
                 await execute(() => rolesApi.createRole(formData))
                 toast.success("Tạo thành công")
            } else {
                 await execute(() => rolesApi.updateRole(role!.id, formData))
                toast.success("Chỉnh sửa thành công")

            }
            router("/admin/roles")
        } catch (err) {
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
            }
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const isSystemNameDisabled = mode === "edit" && role?.isSystemRole

    return (
        <div className="space-y-6">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin cơ bản</CardTitle>
                        <CardDescription>
                            {mode === "create" ? "Nhập thông tin cho role mới" : "Chỉnh sửa thông tin role"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="friendlyName">
                                    Tên hiển thị <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="friendlyName"
                                    value={formData.friendlyName}
                                    onChange={(e) => handleInputChange("friendlyName", e.target.value)}
                                    placeholder="Ví dụ: Khách hàng VIP"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="systemName">
                                    Tên hệ thống <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="systemName"
                                        value={formData.systemName}
                                        onChange={(e) => handleInputChange("systemName", e.target.value)}
                                        placeholder="Ví dụ: VIPCustomer"
                                        disabled={isSystemNameDisabled}
                                        required
                                    />
                                    {checkingSystemName && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />}
                                </div>

                                {isSystemNameDisabled && (
                                    <Alert>
                                        <Info className="h-4 w-4" />
                                        <AlertDescription>Không thể thay đổi tên hệ thống của role hệ thống</AlertDescription>
                                    </Alert>
                                )}

                                {systemNameAvailable === false && <p className="text-sm text-red-500">Tên hệ thống đã tồn tại</p>}
                                {systemNameAvailable === true && <p className="text-sm text-green-500">Tên hệ thống khả dụng</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cài đặt</CardTitle>
                        <CardDescription>Cấu hình quyền và tính năng cho role</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Trạng thái hoạt động</Label>
                                <p className="text-sm text-muted-foreground">Role có thể được gán cho người dùng</p>
                            </div>
                            <Switch
                                checked={formData.isActive}
                                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                            />
                        </div>

                        {/*<div className="flex items-center justify-between">*/}
                        {/*    <div className="space-y-0.5">*/}
                        {/*        <Label>Miễn phí vận chuyển</Label>*/}
                        {/*        <p className="text-sm text-muted-foreground">Người dùng có role này được miễn phí vận chuyển</p>*/}
                        {/*    </div>*/}
                        {/*    <Switch*/}
                        {/*        checked={formData.isFreeShipping}*/}
                        {/*        onCheckedChange={(checked) => handleInputChange("isFreeShipping", checked)}*/}
                        {/*    />*/}
                        {/*</div>*/}


                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => router("/admin/roles")} disabled={loading}>
                        Hủy
                    </Button>

                    <Button type="submit" disabled={loading || systemNameAvailable === false}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {mode === "create" ? "Tạo role" : "Cập nhật"}
                    </Button>

                    {/*{mode === "create" && (*/}
                    {/*    <Button*/}
                    {/*        type="button"*/}
                    {/*        variant="secondary"*/}
                    {/*        onClick={(e) => handleSubmit(e, true)}*/}
                    {/*        disabled={loading || systemNameAvailable === false}*/}
                    {/*    >*/}
                    {/*        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}*/}
                    {/*        Tạo & Tiếp tục chỉnh sửa*/}
                    {/*    </Button>*/}
                    {/*)}*/}
                </div>
            </form>
        </div>
    )
}
