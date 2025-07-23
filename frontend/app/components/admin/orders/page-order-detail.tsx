import OrderDetailPage from "~/components/admin/orders/order-detail";

interface OrderDetailPageProps {
    params: {
        id: string
    }
}

export default function Page({ params }: OrderDetailPageProps) {
    return <OrderDetailPage orderId={params.id} />
}
