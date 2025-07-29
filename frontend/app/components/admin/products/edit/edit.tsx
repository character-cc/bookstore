import BookFormLayout from "~/components/admin/products/components/book-form-layout";

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function AdminEditBookPage({ params }: PageProps) {
    const { id } = await params
    return <BookFormLayout mode="edit" bookId={Number.parseInt(id)} />
}
