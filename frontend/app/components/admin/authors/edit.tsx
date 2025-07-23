"use client"

import { useParams } from "react-router"
import AuthorForm from "~/components/admin/authors/author-form";

export default function EditAuthor() {
    const { id } = useParams()
    const authorId = Number.parseInt(id ?? "0", 10)



    return <AuthorForm authorId={authorId} isEdit={true} />
}
