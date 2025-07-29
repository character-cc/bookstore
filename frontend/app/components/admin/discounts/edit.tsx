
import DiscountForm from "~/components/admin/discounts/discount-form";
import {useEffect, useState} from "react";
import {useParams} from "react-router";


interface EditDiscountPageProps {
    params: {
        id: string
    }
}
export default function EditDiscountPage({ params }: EditDiscountPageProps) {


    return <DiscountForm isEdit={true} />
}
