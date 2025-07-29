"use client"

import { useParams } from "react-router"
import CategoryForm from "./category-form"

export default function EditCategory() {
    const { id } = useParams()
    const categoryId = Number.parseInt(id ?? "0", 10)



    return <CategoryForm categoryId={categoryId} isEdit={true} />
}
