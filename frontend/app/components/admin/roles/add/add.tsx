import {RoleForm} from "~/components/admin/roles/components/role-form";

export default function AddRolePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Thêm Role Mới</h1>
                <p className="text-muted-foreground">Tạo role mới cho hệ thống</p>
            </div>

            <RoleForm mode="create" />
        </div>
    )
}
