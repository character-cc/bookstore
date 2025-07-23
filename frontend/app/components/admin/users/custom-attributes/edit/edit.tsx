import EditAttributePage from "~/components/admin/users/custom-attributes/edit/form-edit";

interface EditAttributePageProps {
    params: {
        id: string
    }
}

export default function EditAttribute({ params }: EditAttributePageProps) {
    return <EditAttributePage attributeId={Number(params.id)} />
}
