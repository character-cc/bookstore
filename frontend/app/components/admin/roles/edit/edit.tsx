"use client"

import { useState, useEffect } from "react"
import {useParams} from "react-router";
import {RoleForm} from "~/components/admin/roles/components/role-form";
import { type Role, rolesApi } from "@/lib/roles-api"
import { Loader2 } from "lucide-react"

export default function EditRolePage() {
    const params = useParams()
    const roleId = Number.parseInt(params.id as string)

    const [role, setRole] = useState<Role | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadRole = async () => {
            try {
                const roleData = await rolesApi.getRole(roleId)
                setRole(roleData)
            } catch (error) {
                setError("Không thể tải thông tin role")
                console.error("Error loading role:", error)
            } finally {
                setLoading(false)
            }
        }

        if (roleId) {
            loadRole()
        }
    }, [roleId])

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (error || !role) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{error || "Không tìm thấy role"}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Chỉnh sửa Role</h1>
                <p className="text-muted-foreground">Chỉnh sửa thông tin role: {role.friendlyName}</p>
            </div>

            <RoleForm mode="edit" role={role} />
        </div>
    )
}
