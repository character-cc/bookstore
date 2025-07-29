"use client"

import { useParams } from "react-router"
import AddAttributeBookPage from "~/components/admin/products/components/add-attribute-page";
export default function EditAttributeRoute() {
    const { bookId, attributeId } = useParams<{ bookId: string; attributeId: string }>()

    return (
        <AddAttributeBookPage   bookId={bookId ? Number(bookId) : undefined} />

    )
}

