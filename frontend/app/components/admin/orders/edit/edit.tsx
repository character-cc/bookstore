import OrderEditPage from "~/components/admin/orders/edit/order-edit";

interface OrderEditPageProps {
    params: {
        id: string
    }
}

export default function Page({ params }: OrderEditPageProps) {
    return <OrderEditPage orderId={params.id} />
}
