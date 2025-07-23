"use client"

import { useParams } from "react-router"
import PublisherForm from "./publisher-form"

export default function EditPublisher() {
    const { id } = useParams()
    const publisherId = Number.parseInt(id ?? "0", 10)



    return <PublisherForm publisherId={publisherId} isEdit={true} />
}
