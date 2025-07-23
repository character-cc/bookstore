"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, Truck, CreditCard, User, Edit, Printer } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useNavigate } from "react-router"

// Updated interfaces to match the new data structure
interface SelectedAttribute {
    AttributeId: number
    Value: string
    Label: string
    PriceAdjustment: number
    IsPreSelected: boolean
    DisplayOrder: number
    IsVariant: boolean
    Id: number
    CreatedAt: string
    UpdatedAt: string
}

interface OrderItem {
    id: number
    orderId: number
    bookId: number
    bookName: string
    pictureUrl: string
    shortDescription: string
    selectedAttributes: SelectedAttribute[] | string
    quantity: number
    unitPrice: number
}

interface TrackingInfo {
    id: number
    orderId: number
    trackingCode: string
    provider: string
    status: number
    createdAt: string
    updatedAt: string
}

interface Order {
    id: number
    userId: number
    shippingAddress: string
    transactionId: string
    status: number
    shippingFee: number
    isFreeShipping: boolean
    discountCode: string
    discountAmount: number
    totalAmount: number
    isComplete: boolean
    createdAt: string
    updatedAt: string
    customerName: string
    customerPhone: string
    customerEmail: string
    isPaid?: boolean
    items: OrderItem[]
    tracking: TrackingInfo[]
}

const mockOrder: Order = {
    id: 1,
    userId: 123,
    shippingAddress: "123 Đường ABC, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    transactionId: "TXN_001",
    status: 1, // Paid
    shippingFee: 30000,
    isFreeShipping: false,
    discountCode: "SALE20",
    discountAmount: 50000,
    totalAmount: 600000,
    isComplete: true,
    createdAt: "2025-06-20T10:30:00Z",
    updatedAt: "2025-06-20T11:00:00Z",
    customerName: "Nguyễn Văn A",
    customerPhone: "0901234567",
    customerEmail: "nguyenvana@email.com",
    isPaid: true,
    items: [
        {
            id: 1,
            orderId: 1,
            bookId: 1,
            bookName: "Lão Hạc",
            pictureUrl: "/placeholder.svg?height=80&width=80",
            shortDescription: "Tác phẩm kinh điển của Nam Cao",
            selectedAttributes: [
                {
                    AttributeId: 1,
                    Value: "Bìa mềm",
                    Label: "Loại bìa",
                    PriceAdjustment: 0.0,
                    IsPreSelected: false,
                    DisplayOrder: 0,
                    IsVariant: false,
                    Id: 1,
                    CreatedAt: "2025-06-30T10:57:21.91",
                    UpdatedAt: "2025-06-30T10:57:21.91",
                },
            ],
            quantity: 2,
            unitPrice: 120000,
        },
        {
            id: 2,
            orderId: 1,
            bookId: 2,
            bookName: "Chí Phèo",
            pictureUrl: "/placeholder.svg?height=80&width=80",
            shortDescription: "Truyện ngắn nổi tiếng",
            selectedAttributes: [
                {
                    AttributeId: 2,
                    Value: "Bìa cứng",
                    Label: "Loại bìa",
                    PriceAdjustment: 20000.0,
                    IsPreSelected: false,
                    DisplayOrder: 0,
                    IsVariant: false,
                    Id: 2,
                    CreatedAt: "2025-06-30T10:57:21.91",
                    UpdatedAt: "2025-06-30T10:57:21.91",
                },
                {
                    AttributeId: 0,
                    Value: "Audiobook",
                    Label: "Audiobook",
                    PriceAdjustment: 0.0,
                    IsPreSelected: false,
                    DisplayOrder: 0,
                    IsVariant: false,
                    Id: 3,
                    CreatedAt: "2025-06-30T10:57:21.91",
                    UpdatedAt: "2025-06-30T10:57:21.91",
                },
            ],
            quantity: 1,
            unitPrice: 250000,
        },
    ],
    tracking: [
        {
            id: 1,
            orderId: 1,
            trackingCode: "VN123456789",
            provider: "Viettel Post",
            status: 1, // Shipping
            createdAt: "2025-06-20T12:00:00Z",
            updatedAt: "2025-06-20T14:00:00Z",
        },
    ],
}

interface OrderDetailPageProps {
    orderId: string
}

export default function OrderDetailPage({ orderId }: OrderDetailPageProps) {
    const router = useNavigate()
    const [order, setOrder] = useState<Order>(mockOrder)

    const handlePrint = () => {

        const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Hóa đơn #${order.id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          padding: 20px;
          background: white;
        }
        
        .invoice-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
        }
        
        .invoice-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        
        .invoice-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        
        .info-section {
          border: 1px solid #000;
          padding: 15px;
        }
        
        .info-title {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 10px;
          text-transform: uppercase;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          padding: 2px 0;
        }
        
        .info-label {
          font-weight: normal;
        }
        
        .info-value {
          font-weight: bold;
        }
        
        .products-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        
        .products-table th,
        .products-table td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
        }
        
        .products-table th {
          background-color: #f5f5f5;
          font-weight: bold;
          text-align: center;
        }
        
        .products-table td:nth-child(4),
        .products-table td:nth-child(5),
        .products-table td:nth-child(6) {
          text-align: right;
        }
        
        .product-description {
          font-size: 10px;
          color: #666;
          margin-top: 2px;
        }
        
        .total-section {
          margin-left: auto;
          width: 300px;
        }
        
        .total-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .total-table td {
          padding: 5px 10px;
          border: none;
        }
        
        .total-row {
          border-top: 2px solid #000;
          font-weight: bold;
          font-size: 14px;
        }
        
        .total-row td {
          padding-top: 10px;
        }
        
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div class="invoice-title">Hóa đơn bán hàng</div>
        <div>Mã đơn hàng: #${order.id}</div>
        <div>Ngày: ${formatDate(order.createdAt)}</div>
      </div>

      <div class="invoice-info">
        <div class="info-section">
          <div class="info-title">Thông tin đơn hàng</div>
          <div class="info-row">
            <span class="info-label">Mã đơn hàng:</span>
            <span class="info-value">#${order.id}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Mã giao dịch:</span>
            <span class="info-value">${order.transactionId || "Chưa có"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Trạng thái:</span>
            <span class="info-value">${getOrderStatusLabel(order.status.toString())}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Ngày tạo:</span>
            <span class="info-value">${formatDate(order.createdAt)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Thanh toán:</span>
            <span class="info-value">${order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}</span>
          </div>
        </div>

        <div class="info-section">
          <div class="info-title">Thông tin khách hàng</div>
          <div class="info-row">
            <span class="info-label">Tên khách hàng:</span>
            <span class="info-value">${order.customerName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Số điện thoại:</span>
            <span class="info-value">${order.customerPhone}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Địa chỉ:</span>
            <span class="info-value">${order.shippingAddress}</span>
          </div>
        </div>
      </div>

      <table class="products-table">
        <thead>
          <tr>
            <th style="width: 5%">STT</th>
            <th style="width: 35%">Tên sản phẩm</th>
            <th style="width: 20%">Thuộc tính</th>
            <th style="width: 10%">SL</th>
            <th style="width: 15%">Đơn giá</th>
            <th style="width: 15%">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map(
                (item, index) => `
            <tr>
              <td style="text-align: center">${index + 1}</td>
              <td>
                <div><strong>${item.bookName}</strong></div>
                <div class="product-description">${item.shortDescription}</div>
              </td>
              <td>${formatSelectedAttributes(item.selectedAttributes)}</td>
              <td style="text-align: center">${item.quantity}</td>
              <td>${formatPrice(item.unitPrice)}</td>
              <td><strong>${formatPrice(item.unitPrice * item.quantity)}</strong></td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <div class="total-section">
        <table class="total-table">
          <tr>
            <td>Tạm tính:</td>
            <td style="text-align: right">${formatPrice(order.totalAmount - order.shippingFee + order.discountAmount)}</td>
          </tr>
          ${
            order.discountCode
                ? `
          <tr>
            <td>Giảm giá (${order.discountCode}):</td>
            <td style="text-align: right; color: #e74c3c">-${formatPrice(order.discountAmount)}</td>
          </tr>
          `
                : ""
        }
          <tr>
            <td>Phí vận chuyển:</td>
            <td style="text-align: right">${order.isFreeShipping ? "Miễn phí" : formatPrice(order.shippingFee)}</td>
          </tr>
          <tr class="total-row">
            <td><strong>TỔNG CỘNG:</strong></td>
            <td style="text-align: right"><strong>${formatPrice(order.totalAmount)}</strong></td>
          </tr>
        </table>
      </div>

      <p style="text-align: center; margin-top: 20px; font-size: 10px; color: #666;">In lúc: ${formatDate(new Date().toISOString())}</p>
    </body>
    </html>
  `

        const printWindow = window.open("", "_blank", "width=800,height=600")

        if (printWindow) {
            printWindow.document.write(printContent)
            printWindow.document.close()

            printWindow.onload = () => {
                printWindow.focus()
                printWindow.print()

                printWindow.onafterprint = () => {
                    printWindow.close()
                }
            }
        } else {
            alert("Không thể mở cửa sổ in. Vui lòng kiểm tra popup blocker.")
        }
    }

    useEffect(() => {
        loadOrderDetails()
    }, [])

    const getShippingStatusLabel = (status: string): string => {
        switch (status) {
            case "NotShipped":
                return "Chưa giao hàng";
            case "Shipping":
                return "Đang giao hàng";
            case "Delivered":
                return "Đã giao hàng";
            case "Failed":
                return "Giao hàng thất bại";
            case "Returned":
                return "Đã hoàn trả";
            default:
                return "Không xác định";
        }
    };

    const getOrderStatusLabel = (status: string): string => {
        console.log(status)
        switch (status) {
            case "Pending":
                return " Chờ xử lý "
            case "Shipping":
                return "Đang vận chuyển"
            case "Processing":
                return "Đang xử lý"
            case "Completed":
                return "Hoàn tất"
            case "Cancelled":
                return "Đã hủy"
            default:
                return "Không xác định"
        }
    }

    const loadOrderDetails = async () => {
        try {
            const response = await fetch("http://localhost/api/orders/" + orderId)
            if (!response.ok) {
                throw new Error(response.statusText)
            }

            const data = await response.json()
            console.log(data)
            setOrder(data)
        } catch (error) {
            console.log(error)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
    }

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })
    }

    const formatSelectedAttributes = (attributes: SelectedAttribute[] | string) => {
        if (typeof attributes === "string") {
            try {
                const parsed = JSON.parse(attributes)
                if (Array.isArray(parsed)) {
                    return parsed.map((attr) => attr.Value || attr.value || attr).join(", ")
                }
                return attributes
            } catch {
                return attributes
            }
        }

        if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
            return "Không có thuộc tính"
        }

        return attributes.map((attr) => attr.Value).join(", ")
    }

    const back = () => {
        router("/admin/orders")
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex items-center justify-between mb-6 print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="flex items-center gap-2 bg-transparent"  onClick={back}>
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng #{order.id}</h1>
                        <p className="text-gray-600 mt-1">Thông tin chi tiết và trạng thái đơn hàng</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="flex items-center gap-2 bg-transparent" onClick={handlePrint}>
                        <Printer className="h-4 w-4" />
                        In hóa đơn
                    </Button>
                    <Button onClick={() => router(`/admin/orders/${orderId}/edit`)} className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Cập nhật trạng thái
                    </Button>
                </div>
            </div>

            <div className="hidden print:block print-invoice-header">
                <div className="print-invoice-title">HÓA ĐƠN BÁN HÀNG</div>
                <div>Mã đơn hàng: #{order.id}</div>
                <div>Ngày: {formatDate(order.createdAt)}</div>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
                    <Card className="print:shadow-none print:border-black">
                        <CardHeader className="print:p-0 print:mb-2">
                            <CardTitle className="flex items-center gap-2 print:text-black print:text-lg print:font-bold">
                                <Package className="h-5 w-5 print:hidden" />
                                Thông tin đơn hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 print:p-0 print:space-y-1">
                            <div className="flex justify-between print:text-black">
                                <span>Mã đơn hàng:</span>
                                <span className="font-medium">#{order.id}</span>
                            </div>
                            <div className="flex justify-between print:text-black">
                                <span>Mã giao dịch:</span>
                                <span className="font-medium">{order.transactionId || "Chưa có"}</span>
                            </div>
                            <div className="flex justify-between print:text-black">
                                <span>Trạng thái:</span>
                                <span className="print:text-black">{getOrderStatusLabel(order.status.toString())}</span>
                            </div>
                            <div className="flex justify-between print:text-black">
                                <span>Ngày tạo:</span>
                                <span>{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex justify-between print:text-black">
                                <span>Cập nhật:</span>
                                <span>{formatDate(order.updatedAt)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="print:shadow-none print:border-black">
                        <CardHeader className="print:p-0 print:mb-2">
                            <CardTitle className="flex items-center gap-2 print:text-black print:text-lg print:font-bold">
                                <User className="h-5 w-5 print:hidden" />
                                Thông tin khách hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 print:p-0 print:space-y-1">
                            <div className="flex justify-between print:text-black">
                                <span>Tên khách hàng:</span>
                                <span className="font-medium">{order.customerName}</span>
                            </div>
                            <div className="flex justify-between print:text-black">
                                <span>Số điện thoại:</span>
                                <span>{order.customerPhone}</span>
                            </div>

                            <div className="flex items-start justify-between print:text-black">
                                <span>Địa chỉ giao hàng:</span>
                                <span className="text-right max-w-64">{order.shippingAddress}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="print:shadow-none print:border-black">
                    <CardHeader className="print:p-0 print:mb-2">
                        <CardTitle className="flex items-center gap-2 print:text-black print:text-lg print:font-bold">
                            <Package className="h-5 w-5 print:hidden" />
                            Danh sách sản phẩm
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="print:p-0">
                        {/* Table cho print */}
                        <div className="hidden print:block">
                            <table className="print-invoice-table">
                                <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Thuộc tính</th>
                                    <th>Số lượng</th>
                                    <th>Đơn giá</th>
                                    <th>Thành tiền</th>
                                </tr>
                                </thead>
                                <tbody>
                                {order.items.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div>{item.bookName}</div>
                                            <div style={{ fontSize: "10px", color: "#666" }}>{item.shortDescription}</div>
                                        </td>
                                        <td>{formatSelectedAttributes(item.selectedAttributes)}</td>
                                        <td>{item.quantity}</td>
                                        <td>{formatPrice(item.unitPrice)}</td>
                                        <td>{formatPrice(item.unitPrice * item.quantity)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="space-y-4 print:hidden">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                    <div className="w-16 h-16 bg-gray-100 rounded">
                                        <img
                                            src={item.pictureUrl || "/placeholder.svg"}
                                            alt={item.bookName}
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover rounded"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium">{item.bookName}</h4>
                                        <p className="text-sm text-gray-600">{item.shortDescription}</p>
                                        {item.selectedAttributes && (
                                            <div className="mt-1">
                                                <p className="text-sm text-blue-600">{formatSelectedAttributes(item.selectedAttributes)}</p>
                                                {/* Show price adjustments if any - only if it's an array */}
                                                {Array.isArray(item.selectedAttributes) &&
                                                    item.selectedAttributes.some((attr) => attr.PriceAdjustment > 0) && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {item.selectedAttributes
                                                                .filter((attr) => attr.PriceAdjustment > 0)
                                                                .map((attr) => `+${formatPrice(attr.PriceAdjustment)} (${attr.Value})`)
                                                                .join(", ")}
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{formatPrice(item.unitPrice)}</div>
                                        <div className="text-sm text-gray-600">SL: {item.quantity}</div>
                                        <div className="font-semibold">{formatPrice(item.unitPrice * item.quantity)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="print:shadow-none print:border-black">
                    <CardHeader className="print:p-0 print:mb-2">
                        <CardTitle className="flex items-center gap-2 print:text-black print:text-lg print:font-bold">
                            <CreditCard className="h-5 w-5 print:hidden" />
                            Thông tin thanh toán
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="print:p-0">
                        {/* Print layout */}
                        <div className="hidden print:block print-invoice-total">
                            <table>
                                <tbody>
                                <tr>
                                    <td>Tạm tính:</td>
                                    <td>{formatPrice(order.totalAmount - order.shippingFee + order.discountAmount)}</td>
                                </tr>
                                {order.discountCode && (
                                    <tr>
                                        <td>Giảm giá ({order.discountCode}):</td>
                                        <td>-{formatPrice(order.discountAmount)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td>Phí vận chuyển:</td>
                                    <td>{order.isFreeShipping ? "Miễn phí" : formatPrice(order.shippingFee)}</td>
                                </tr>
                                <tr className="total-row">
                                    <td>Tổng cộng:</td>
                                    <td>{formatPrice(order.totalAmount)}</td>
                                </tr>
                                <tr>
                                    <td>Trạng thái thanh toán:</td>
                                    <td>{order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="grid grid-cols-2 gap-4 print:hidden">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Tạm tính:</span>
                                    <span>{formatPrice(order.totalAmount - order.shippingFee + order.discountAmount)}</span>
                                </div>
                                {order.discountCode && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Giảm giá ({order.discountCode}):</span>
                                        <span>-{formatPrice(order.discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Phí vận chuyển:</span>
                                    <span>
                    {order.isFreeShipping ? <Badge variant="outline">Miễn phí</Badge> : formatPrice(order.shippingFee)}
                  </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Tổng cộng:</span>
                                    <span>{formatPrice(order.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Trạng thái thanh toán:</span>
                                    <Badge>{order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="print:hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Thông tin vận chuyển
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {order.tracking.length > 0 ? (
                            <div className="space-y-3">
                                {order.tracking.map((track) => (
                                    <div key={track.id} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-medium">{track.trackingCode}</div>
                                                <div className="text-sm text-gray-600">{track.provider}</div>
                                            </div>
                                            <Badge>{getShippingStatusLabel(track.status.toString())}</Badge>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            <div>Tạo: {formatDate(track.createdAt)}</div>
                                            <div>Cập nhật: {formatDate(track.updatedAt)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Truck className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p>Chưa có thông tin vận chuyển</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="hidden print:block print-footer">
                <div className="print:border-t print:pt-2">
                    <p>Cảm ơn quý khách đã mua hàng!</p>
                    <p>Hotline: 1900-xxxx | Email: support@bookstore.com</p>
                    <p>In lúc: {formatDate(new Date().toISOString())}</p>
                </div>
            </div>
        </div>
    )
}
