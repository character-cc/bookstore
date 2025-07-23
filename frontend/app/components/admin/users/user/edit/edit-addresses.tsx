import AdminUserForm from "~/components/admin/users/user/form-user";
interface EditUserAddressesPageProps {
    params: {
        id: string
    }
}

export default function EditUserAddressesPage({ params }: EditUserAddressesPageProps) {
    return <AdminUserForm mode="edit" userId={params.id} section="addresses" />
}
