import AdminUserForm from "~/components/admin/users/user/form-user";
interface EditUserPageProps {
    params: {
        id: string
    }
}

export default function EditUserPage({ params }: EditUserPageProps) {
    return <AdminUserForm mode="edit" userId={params.id} section="general" />
}
