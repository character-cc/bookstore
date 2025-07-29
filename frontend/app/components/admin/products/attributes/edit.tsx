import { useParams } from "react-router"
import EditAttributeBookPage from "~/components/admin/products/components/edit-attribute-page";

export default function EditAttributeRoute() {
    const { bookId, attributeId } = useParams<{ bookId: string; attributeId: string }>()

    return (
        <EditAttributeBookPage
            bookId={bookId ? Number(bookId) : undefined}
            attributeId={ Number(attributeId)}
        />
    )
}
