"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CreditCard, Truck, Plus, MapPin, User, Phone } from "lucide-react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash2 } from "lucide-react"

// Mock Vietnamese address data (simplified)

interface Address {
    id: number
    title: string
    recipientName: string
    recipientPhone: string
    fullAddress: string
    provinceId: string
    districtId: string
    wardId: string
    streetAddress: string
    addressType: number
    notes: string
    isDefault: boolean
}

export default function CheckoutPage() {
    const router = useNavigate()
    const [cartData, setCartData] = useState([])
    const [paymentMethod, setPaymentMethod] = useState("cod")
    const [isProcessing, setIsProcessing] = useState(false)

    // Address management states
    const [savedAddresses, setSavedAddresses] = useState([])
    const [selectedAddressId, setSelectedAddressId] = useState<number>(0)
    const [showAddressDialog, setShowAddressDialog] = useState(false)
    const [addressMode, setAddressMode] = useState<"select" | "new">("select")

    const [total, setTotal] = useState(null)
    // New address form states
    const [provinces, setProvinces] = useState([])
    const [districts, setDistricts] = useState<any[]>([])
    const [wards, setWards] = useState<any[]>([])

    const [storeId, setStoreId] = useState<number>(0)
    const [shipPrice, setShippingPrice] = useState()
    const [newAddressForm, setNewAddressForm] = useState({
        title: "",
        recipientName: "",
        recipientPhone: "",
        province: "",
        district: "",
        ward: "",
        streetAddress: "",
        notes: "",
        isDefault: false,
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const [editingAddress, setEditingAddress] = useState<Address | null>(null)

    useEffect(() => {
        loadDataCart()
        loadTotal()
        loadAddresses()
        loadProvinces()
    }, [])

    useEffect(() => {
        loadShipPrice()
    }, [selectedAddressId])

    const loadShipPrice = async () => {
        try {
            const response = await fetch("http://localhost/api/shipping", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    addressId: selectedAddressId,
                }),
            })
            if (!response.ok) {
                throw new Error("Failed to fetch shipping price")
            }
            const data = await response.json()
            console.log(data)
            setShippingPrice(data.totalShippingFee)
            setStoreId(data.storeId)
        } catch (error) {
            console.log(error)
        }
    }

    const loadProvinces = async () => {
        try {
            const response = await fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
                method: "GET",
                headers: {
                    ContentType: "application/json; charset=UTF-8",
                    Token: "27379565-4dda-11f0-b5e1-defdee9f0d5d",
                },
            })
            if (!response.ok) {
                throw new Error("Province not found")
            }
            const json = await response.json()
            console.log(json)
            setProvinces(json.data)
        } catch (err) {
            console.log(err)
        }
    }

    const loadDistricts = async (provinceId: number) => {
        try {
            console.log(provinceId)
            const response = await fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/district", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                    Token: "27379565-4dda-11f0-b5e1-defdee9f0d5d",
                },
                body: JSON.stringify({
                    province_id: provinceId,
                }),
            })
            if (!response.ok) {
                throw new Error("Province not found")
            }
            const json = await response.json()
            console.log(json)
            setDistricts(json.data)
        } catch (err) {
            console.log(err)
        }
    }

    const loadWards = async (districtId: number) => {
        console.log(districtId)

        try {
            const response = await fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                    Token: "27379565-4dda-11f0-b5e1-defdee9f0d5d",
                },
                body: JSON.stringify({
                    district_id: districtId,
                }),
            })
            if (!response.ok) {
                throw new Error("Province not found")
            }
            const json = await response.json()
            console.log(json)
            setWards(json.data)
        } catch (err) {
            console.log(err)
        }
    }
    const loadAddresses = async () => {
        try {
            const response = await fetch("http://localhost/api/users/me/addresses")
            if (!response.ok) {
                throw new Error("Failed to fetch address data")
            }
            const data = await response.json()
            setSavedAddresses(data)
            setSelectedAddressId(data.find((addr) => addr.isDefault)?.id || 0)
        } catch (error) {
            console.log(error)
        }
    }

    const loadTotal = async () => {
        try {
            const response = await fetch("http://localhost/api/checkout/calculate")
            if (!response.ok) {
                throw new Error("Failed to fetch checkout data.")
            }
            const data = await response.json()
            setTotal(data)
            if (data.message.length > 0) {
                toast(data.message)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const loadDataCart = async () => {
        try {
            const response = await fetch("http://localhost/api/checkout/items")
            const data = await response.json()
            if (!response.ok) {
                throw new Error(response.statusText)
            }
            console.log(data)
            setCartData(data)
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        if (newAddressForm.province && !editingAddress) {
            loadDistricts(Number(newAddressForm.province))
            setNewAddressForm((prev) => ({ ...prev, district: "", ward: "" }))
            setDistricts([])
            setWards([])
        }
    }, [newAddressForm.province, editingAddress])

    useEffect(() => {
        if (newAddressForm.district && !editingAddress) {
            loadWards(Number(newAddressForm.district))
            setNewAddressForm((prev) => ({ ...prev, ward: "" }))
            setWards([])
        }
    }, [newAddressForm.district, editingAddress])

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
    }

    const getSelectedAddress = () => {
        return savedAddresses.find((addr) => addr.id === selectedAddressId)
    }

    const getAddressTypeLabel = (type: number) => {
        switch (type) {
            case 1:
                return "Nhà riêng"
            case 2:
                return "Công ty"
            default:
                return "Khác"
        }
    }

    const handleNewAddressInputChange = (field: string, value: string | boolean) => {
        if (field === "province" && !editingAddress) {
            setDistricts([])
            setWards([])
            setNewAddressForm((prev) => ({
                ...prev,
                [field]: value,
                district: "",
                ward: "",
            }))
        } else if (field === "district" && !editingAddress) {
            setWards([])
            setNewAddressForm((prev) => ({
                ...prev,
                [field]: value,
                ward: "",
            }))
        } else if (field === "province" && editingAddress) {
            setDistricts([])
            setWards([])
            setNewAddressForm((prev) => ({
                ...prev,
                [field]: value,
                district: "",
                ward: "",
            }))
            if (value) {
                loadDistricts(Number(value))
            }
        } else if (field === "district" && editingAddress) {
            setWards([])
            setNewAddressForm((prev) => ({
                ...prev,
                [field]: value,
                ward: "",
            }))
            if (value) {
                loadWards(Number(value))
            }
        } else {
            setNewAddressForm((prev) => ({ ...prev, [field]: value }))
        }

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    const validateNewAddress = () => {
        const newErrors: Record<string, string> = {}

        if (!newAddressForm.title.trim()) {
            newErrors.title = "Tên địa chỉ là bắt buộc"
        }
        if (!newAddressForm.recipientName.trim()) {
            newErrors.recipientName = "Tên người nhận là bắt buộc"
        }
        if (!newAddressForm.recipientPhone.trim()) {
            newErrors.recipientPhone = "Số điện thoại là bắt buộc"
        }
        if (!newAddressForm.province) {
            newErrors.province = "Vui lòng chọn tỉnh/thành phố"
        }
        if (!newAddressForm.district) {
            newErrors.district = "Vui lòng chọn quận/huyện"
        }
        if (!newAddressForm.ward) {
            newErrors.ward = "Vui lòng chọn phường/xã"
        }
        if (!newAddressForm.streetAddress.trim()) {
            newErrors.streetAddress = "Địa chỉ chi tiết là bắt buộc"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const openEditDialog = async (address: Address) => {
        setEditingAddress(address)
        setErrors({})

        setNewAddressForm({
            title: address.title,
            recipientName: address.recipientName,
            recipientPhone: address.recipientPhone,
            province: address.provinceId.toString(),
            district: address.districtId.toString(),
            ward: address.wardId.toString(),
            streetAddress: address.streetAddress,
            notes: address.notes,
            isDefault: address.isDefault,
        })

        try {
            await loadDistricts(Number(address.provinceId))
            await loadWards(Number(address.districtId))
        } catch (error) {
            console.error("Error loading address data:", error)
        }

        setShowAddressDialog(true)
    }

    const openAddDialog = () => {
        setEditingAddress(null)
        setNewAddressForm({
            title: "",
            recipientName: "",
            recipientPhone: "",
            province: "",
            district: "",
            ward: "",
            streetAddress: "",
            notes: "",
            isDefault: false,
        })
        setErrors({})
        setShowAddressDialog(true)
    }

    const handleSaveAddress = async () => {
        if (!validateNewAddress()) return

        const provinceName = provinces.find((p) => p.ProvinceID === Number(newAddressForm.province))?.ProvinceName
        const districtName = districts.find((d) => d.DistrictID === Number(newAddressForm.district))?.DistrictName
        const wardName = wards.find((d) => d.WardCode === newAddressForm.ward)?.WardName

        const addressData: Address = {
            id: editingAddress?.id || 0,
            title: newAddressForm.title,
            recipientName: newAddressForm.recipientName,
            recipientPhone: newAddressForm.recipientPhone,
            fullAddress: `${newAddressForm.streetAddress}, ${wardName}, ${districtName}, ${provinceName}`,
            provinceId: newAddressForm.province,
            districtId: newAddressForm.district,
            wardId: newAddressForm.ward,
            streetAddress: newAddressForm.streetAddress,
            addressType: 1,
            notes: newAddressForm.notes,
            isDefault: newAddressForm.isDefault,
        }
        console.log(addressData)
        let updatedAddresses = savedAddresses

        if (editingAddress) {
            try {
                const response = await fetch("http://localhost/api/users/me/addresses", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(addressData),
                })
                if (!response.ok) {
                    throw new Error("Failed to update address")
                }
                loadShipPrice()
            } catch (error) {
                console.error(error)
            }
        } else {
            try {
                const response = await fetch("http://localhost/api/users/me/addresses", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(addressData),
                })
                if (!response.ok) {
                    throw new Error("Failed to update address")
                }
            } catch (error) {
                console.error(error)
            }
        }

        if (newAddressForm.isDefault) {
            updatedAddresses = updatedAddresses.map((addr) => ({
                ...addr,
                isDefault: addr.id === addressData.id,
            }))
        }

        setSavedAddresses(updatedAddresses)
        setSelectedAddressId(addressData.id)
        setShowAddressDialog(false)
        setEditingAddress(null)

        loadAddresses()
        setNewAddressForm({
            title: "",
            recipientName: "",
            recipientPhone: "",
            province: "",
            district: "",
            ward: "",
            streetAddress: "",
            notes: "",
            isDefault: false,
        })

        toast(editingAddress ? "Đã cập nhật địa chỉ" : "Đã thêm địa chỉ mới")
    }

    const handleDeleteAddress = async (addressId: number) => {
        try {
            const addressToDelete = savedAddresses.find((addr) => addr.id === addressId)
            if (addressToDelete?.isDefault) {
                toast("Không thể xóa địa chỉ mặc định")
                return
            }

            // setSavedAddresses((prev) => prev.filter((addr) => addr.id !== addressId))
            //
            // if (selectedAddressId === addressId) {
            //     const defaultAddress = savedAddresses.find((addr) => addr.isDefault)
            //     setSelectedAddressId(defaultAddress?.id || 0)
            // }
            const response = await fetch("http://localhost/api/users/me/addresses/" + addressId, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            if (!response.ok) {
                throw new Error("Failed to delete address")
            }

            toast("Đã xóa địa chỉ")
            loadAddresses()
        } catch (error) {
            console.error(error)
        }
    }

    const handleSetDefaultAddress = async (addressId: number) => {
        try {
            const response = await fetch("http://localhost/api/users/me/addresses/" + addressId + "/set-default", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            if (!response.ok) {
                throw new Error("Failed to update address")
            }
            setSavedAddresses((prev) => prev.map((addr) => ({ ...addr, isDefault: addr.id === addressId })))

            toast("Đã đặt làm địa chỉ mặc định")
        } catch (error) {
            console.error(error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsProcessing(true)

        const selectedAddress = getSelectedAddress()
        if (!selectedAddress) {
            toast("Vui lòng chọn địa chỉ giao hàng")
            setIsProcessing(false)
            return
        }

        try {
            await new Promise((resolve) => setTimeout(resolve, 2000))

            const orderData = {
                cartData,
                shippingAddress: selectedAddress,
                paymentMethod,
                orderId: `ORDER_${Date.now()}`,
            }

            console.log(selectedAddress)
            console.log("Order data:", orderData)

            if (paymentMethod === "zalopay") {
                toast("Đang chuyển đến ZaloPay...")

                console.log(selectedAddress.id)
                console.log(storeId)
                console.log(shipPrice)
                const addressId = selectedAddress.id
                const response = await fetch("http://localhost/api/zalopay/payment", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        addressId,
                        storeId,
                        totalShippingFee: shipPrice,
                    }),
                })

                if (!response.ok) {
                    throw new Error("Loi zalopay")
                }
                const data = await response.json()
                console.log(data)
                window.location.href = data.order_url
            } else {
                const addressId = selectedAddress.id
                console.log(storeId)
                console.log(shipPrice)
                const response = await fetch("http://localhost/api/orders/me", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ addressId, storeId, totalShippingFee: shipPrice }),
                })

                if (!response.ok) {
                    throw new Error("Loi zalopay")
                }
                const data = await response.json()
                console.log(data)
                toast(`Đơn hàng đã được tạo thành công!`)
                router("/order-success?status=1")
            }
        } catch (error) {
            toast("Sản phẩm đã hết hàng vui lòng đặt lại sau ")
        } finally {
            setIsProcessing(false)
        }
    }

    const shippingFee = 30000
    const totalWithShipping = cartData.totalFinalPrice + shippingFee

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="flex items-center gap-4 mb-6">
                {/*<Button variant="outline"  className="flex items-center gap-2 bg-transparent">*/}
                {/*    <ArrowLeft className="h-4 w-4" />*/}
                {/*    Quay lại giỏ hàng*/}
                {/*</Button>*/}
                <div>
                    <h1 className="text-2xl font-bold">Thanh toán</h1>
                    <p className="text-gray-600">Hoàn tất đơn hàng của bạn</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Địa chỉ giao hàng</CardTitle>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => openAddDialog()}
                                        className="flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Thêm địa chỉ
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {savedAddresses.length === 0 ? (
                                    <div className="text-center py-8">
                                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có địa chỉ nào</h3>
                                        <p className="text-gray-600 mb-4">Thêm địa chỉ đầu tiên để tiếp tục</p>
                                        <Button type="button" onClick={() => setShowAddressDialog(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Thêm địa chỉ
                                        </Button>
                                    </div>
                                ) : (
                                    <RadioGroup
                                        value={selectedAddressId.toString()}
                                        onValueChange={(value) => setSelectedAddressId(Number(value))}
                                    >
                                        {savedAddresses.map((address) => (
                                            <div key={address.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                                                <RadioGroupItem value={address.id.toString()} id={`address-${address.id}`} className="mt-1" />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {/*<span className="text-lg">{getAddressTypeIcon(address.addressType)}</span>*/}
                                                        <Label htmlFor={`address-${address.id}`} className="font-medium cursor-pointer">
                                                            {address.title}
                                                        </Label>
                                                        {address.isDefault && (
                                                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                                                                Mặc định
                                                            </Badge>
                                                        )}
                                                        {/*<Badge variant="outline">{getAddressTypeLabel(address.addressType)}</Badge>*/}
                                                    </div>

                                                    <div className="space-y-1 text-sm text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4" />
                                                            <span>{address.recipientName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4" />
                                                            <span>{address.recipientPhone}</span>
                                                        </div>
                                                        <div className="flex items-start gap-2">
                                                            <MapPin className="h-4 w-4 mt-0.5" />
                                                            <span>{address.fullAddress}</span>
                                                        </div>
                                                        {address.notes && (
                                                            <div className="flex items-start gap-2">
                                                                <span className="text-xs">💬</span>
                                                                <span className="italic">{address.notes}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-3">
                                                        {!address.isDefault && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleSetDefaultAddress(address.id)}
                                                            >
                                                                Đặt mặc định
                                                            </Button>
                                                        )}

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" size="sm">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => openEditDialog(address)}>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Chỉnh sửa
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-red-600"
                                                                    onClick={() => handleDeleteAddress(address.id)}
                                                                    disabled={address.isDefault}
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Xóa
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Phương thức thanh toán</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                                        <RadioGroupItem value="cod" id="cod" />
                                        <div className="flex items-center gap-3 flex-1">
                                            <Truck className="h-5 w-5 text-gray-600" />
                                            <div>
                                                <Label htmlFor="cod" className="font-medium cursor-pointer">
                                                    Thanh toán khi nhận hàng (COD)
                                                </Label>
                                                <p className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                                        <RadioGroupItem value="zalopay" id="zalopay" />
                                        <div className="flex items-center gap-3 flex-1">
                                            <CreditCard className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <Label htmlFor="zalopay" className="font-medium cursor-pointer">
                                                    ZaloPay
                                                </Label>
                                                <p className="text-sm text-gray-600">Thanh toán trực tuyến qua ZaloPay</p>
                                            </div>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Đơn hàng của bạn</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Order Items */}
                                <div className="space-y-3">
                                    {cartData.map((item) => (
                                        <div key={item.id} className="flex gap-3">
                                            <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0">
                                                <img
                                                    src={item.book.images[0]?.imageUrl || "/placeholder.svg"}
                                                    alt={item.book.name}
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full object-cover rounded-md"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm">{item.book.name}</h4>
                                                <p className="text-xs text-gray-600">
                                                    Tác giả: {item.book.authors.length > 0 ? item.book.authors[0].name : "Nhiều tác giả"}
                                                </p>
                                                {item.bookAttributeValues.length > 0 && (
                                                    <div className="mt-1">
                                                        {item.bookAttributeValues.map((attr) => (
                                                            <Badge key={attr.attributeId} variant="outline" className="text-xs mr-1">
                                                                {attr.label}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-sm text-gray-600">SL: {item.quantity}</span>
                                                    <span className="font-medium text-sm">{item.itemPrice}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Tạm tính:</span>
                                        {total && <span>{formatPrice(total.totalBeforeDiscount)}</span>}
                                    </div>

                                    {total && (
                                        <div className="flex justify-between text-sm ">
                                            <span>Giảm giá ({total.discountCode}):</span>
                                            <span>-{total.discountAmount}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-sm">
                                        <span>Phí vận chuyển:</span>
                                        {/*<span>{formatPrice(shippingFee)}</span>*/}
                                        <span>{shipPrice}</span>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between font-semibold">
                                        <span>Tổng cộng:</span>
                                        {total && <span className="text-lg">{formatPrice(total.totalAfterDiscount + shipPrice)}</span>}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    disabled={isProcessing || savedAddresses.length === 0}
                                >
                                    {isProcessing ? "Đang xử lý..." : paymentMethod === "zalopay" ? "Thanh toán với ZaloPay" : "Đặt hàng"}
                                </Button>

                                <p className="text-xs text-gray-500 text-center">
                                    Bằng việc đặt hàng, bạn đồng ý với{" "}
                                    <a href="#" className="text-blue-600 hover:underline">
                                        Điều khoản sử dụng
                                    </a>{" "}
                                    và{" "}
                                    <a href="#" className="text-blue-600 hover:underline">
                                        Chính sách bảo mật
                                    </a>{" "}
                                    của chúng tôi.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>

            <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Tên địa chỉ *</Label>
                            <Input
                                id="title"
                                value={newAddressForm.title}
                                onChange={(e) => handleNewAddressInputChange("title", e.target.value)}
                                placeholder="VD: Nhà riêng, Công ty..."
                                className={errors.title ? "border-red-500" : ""}
                            />
                            {errors.title && <span className="text-sm text-red-500">{errors.title}</span>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="recipientName">Tên người nhận *</Label>
                                <Input
                                    id="recipientName"
                                    value={newAddressForm.recipientName}
                                    onChange={(e) => handleNewAddressInputChange("recipientName", e.target.value)}
                                    placeholder="Họ và tên"
                                    className={errors.recipientName ? "border-red-500" : ""}
                                />
                                {errors.recipientName && <span className="text-sm text-red-500">{errors.recipientName}</span>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="recipientPhone">Số điện thoại *</Label>
                                <Input
                                    id="recipientPhone"
                                    value={newAddressForm.recipientPhone}
                                    onChange={(e) => handleNewAddressInputChange("recipientPhone", e.target.value)}
                                    placeholder="0901234567"
                                    className={errors.recipientPhone ? "border-red-500" : ""}
                                />
                                {errors.recipientPhone && <span className="text-sm text-red-500">{errors.recipientPhone}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="province">Tỉnh/Thành phố *</Label>
                                <Select
                                    value={newAddressForm.province}
                                    onValueChange={(value) => handleNewAddressInputChange("province", value)}
                                >
                                    <SelectTrigger className={errors.province ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Chọn tỉnh/thành" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {provinces.map((province) => (
                                            <SelectItem key={province.ProvinceID.toString()} value={province.ProvinceID.toString()}>
                                                {province.ProvinceName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.province && <span className="text-sm text-red-500">{errors.province}</span>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="district">Quận/Huyện *</Label>
                                <Select
                                    value={newAddressForm.district}
                                    onValueChange={(value) => handleNewAddressInputChange("district", value)}
                                    disabled={!newAddressForm.province}
                                >
                                    <SelectTrigger className={errors.district ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Chọn quận/huyện" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {districts.map((district) => (
                                            <SelectItem key={district.DistrictID.toString()} value={district.DistrictID.toString()}>
                                                {district.DistrictName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.district && <span className="text-sm text-red-500">{errors.district}</span>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="ward">Phường/Xã *</Label>
                                <Select
                                    value={newAddressForm.ward}
                                    onValueChange={(value) => handleNewAddressInputChange("ward", value)}
                                    disabled={!newAddressForm.district}
                                >
                                    <SelectTrigger className={errors.ward ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Chọn phường/xã" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {wards.map((ward) => (
                                            <SelectItem key={ward.WardCode.toString()} value={ward.WardCode.toString()}>
                                                {ward.WardName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.ward && <span className="text-sm text-red-500">{errors.ward}</span>}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="streetAddress">Địa chỉ chi tiết *</Label>
                            <Input
                                id="streetAddress"
                                value={newAddressForm.streetAddress}
                                onChange={(e) => handleNewAddressInputChange("streetAddress", e.target.value)}
                                placeholder="Số nhà, tên đường..."
                                className={errors.streetAddress ? "border-red-500" : ""}
                            />
                            {errors.streetAddress && <span className="text-sm text-red-500">{errors.streetAddress}</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Ghi chú giao hàng</Label>
                            <Textarea
                                id="notes"
                                value={newAddressForm.notes}
                                onChange={(e) => handleNewAddressInputChange("notes", e.target.value)}
                                placeholder="VD: Giao hàng giờ hành chính..."
                                className="min-h-[60px]"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={newAddressForm.isDefault}
                                onChange={(e) => handleNewAddressInputChange("isDefault", e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="isDefault" className="text-sm font-normal cursor-pointer">
                                Đặt làm địa chỉ mặc định
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowAddressDialog(false)}>
                            Hủy
                        </Button>
                        <Button type="button" onClick={handleSaveAddress}>
                            {editingAddress ? "Cập nhật" : "Thêm địa chỉ"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
