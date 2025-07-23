"use client"

import data_addresses from '@/assets/addresses-vn.json';
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, MapPin, Phone, User, Star, StarOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { addressesApi, type Address } from "~/lib/api"
import { useAddresses } from "~/hooks/useApi"

interface AddressManagementProps {
    userId: number
}

interface AddressTypeOption {
    systemName: string
    label: string
    value: number
}

export default function AddressManagement({ userId }: AddressManagementProps) {
    const [addresses, setAddresses] = useState<Address[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState<Address | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const {error, loading, execute } = useAddresses()
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [addressTypeOptions, setAddressTypeOptions] = useState<AddressTypeOption[]>([])


    const [formData, setFormData] = useState({
        id: 0,
        title: "",
        recipientName: "",
        recipientPhone: "",
        province: "",
        district: "",
        ward: "",
        streetAddress: "",
        addressType: "1",
        notes: "",
        isDefault: false,
    })

    const loadAddressTypes = async () => {
        try{
            const addressType = await execute(() =>
                addressesApi.getAddressTypes()
            )
            setAddressTypeOptions(addressType)
        }
        catch(err){
            console.log(err)
        }
    }

    useEffect(() => {
        loadAddressTypes()
        loadProvinces()
    }, []);

    const loadProvinces = async () => {
        try{
            const response = await fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/province",{
                method: "GET",
                headers: {
                    ContentType: "application/json; charset=UTF-8",
                    Token : "27379565-4dda-11f0-b5e1-defdee9f0d5d"
                }

            })
            if(!response.ok){
                throw new Error("Province not found")
            }
            const json = await response.json();
            console.log(json)
            setProvinces(json.data)
        }
        catch(err){
            console.log(err)
        }
    }

    const loadDistricts = async (provinceId : number) => {
        try {
            console.log(provinceId)
            const response = await fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/district",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                    "Token": "27379565-4dda-11f0-b5e1-defdee9f0d5d",

                },
                body: JSON.stringify({
                    province_id : provinceId
                })
            })
            if(!response.ok){
                throw new Error("Province not found")
            }
            const json = await response.json();
            console.log(json)
            setDistricts(json.data)
        }
        catch(err){
            console.log(err)
        }
    }

    const loadWards = async (districtId : number) => {
        console.log(districtId)

        try {
            const response = await fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                    "Token": "27379565-4dda-11f0-b5e1-defdee9f0d5d",

                },
                body: JSON.stringify({
                    district_id : districtId
                })
            })
            if(!response.ok){
                throw new Error("Province not found")
            }
            const json = await response.json();
            console.log(json)
            setWards(json.data)
        }
        catch(err){
            console.log(err)
        }
    }

    useEffect(() => {
        loadAddresses()
    }, [userId])

    const loadAddresses = async () => {
        try {
            const addressData = await execute(() => addressesApi.getUserAddresses(userId), {
                errorMessage: "Không thể tải danh sách địa chỉ",
            })
            if (addressData) {
                setAddresses(addressData)
            }
        } catch (error) {
            console.error("Failed to load addresses:", error)
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.title.trim()) {
            newErrors.title = "Tên địa chỉ là bắt buộc"
        }

        if (!formData.recipientName.trim()) {
            newErrors.recipientName = "Tên người nhận là bắt buộc"
        }

        if (!formData.recipientPhone.trim()) {
            newErrors.recipientPhone = "Số điện thoại là bắt buộc"
        } else if (!/^[0-9]{10,11}$/.test(formData.recipientPhone)) {
            newErrors.recipientPhone = "Số điện thoại không hợp lệ (10-11 chữ số)"
        }

        if (!formData.province) {
            newErrors.province = "Vui lòng chọn tỉnh/thành phố"
        }

        if (!formData.district) {
            newErrors.district = "Vui lòng chọn quận/huyện"
        }

        if (!formData.ward) {
            newErrors.ward = "Vui lòng chọn phường/xã"
        }

        if (!formData.streetAddress.trim()) {
            newErrors.streetAddress = "Địa chỉ chi tiết là bắt buộc"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = async (field: string, value: string | boolean ) => {
        setFormData({ ...formData, [field]: value })
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" })
        }

        if (field === "province") {
            console.log(value)

            await setDistricts([])
            await loadDistricts(Number(value))
            setFormData(prev => ({ ...prev, district: "", ward: "" }));
            setWards([]);

        } else if (field === "district") {
            console.log("DIstrict" + value)

            loadWards(Number(value))
            setFormData(prev => ({ ...prev, ward: "" }));
        }
    }

    const openAddDialog = () => {
        setEditingAddress(null)
        setFormData({
            id : 0,
            title: "",
            recipientName: "",
            recipientPhone: "",
            province: "",
            district: "",
            ward: "",
            streetAddress: "",
            addressType: "1",
            notes: "",
            isDefault: addresses.length === 0, // First address is default
        })
        setErrors({})
        setIsDialogOpen(true)
    }

    const openEditDialog = (address: Address) => {
        setEditingAddress(address)
        setFormData({
            id: address.id,
            title: address.title,
            recipientName: address.recipientName,
            recipientPhone: address.recipientPhone,
            province: address.provinceId.toString(),
            district: address.districtId.toString(),
            ward: address.wardId.toString(),
            streetAddress: address.streetAddress,
            addressType: address.addressType.toString(),
            notes: address.notes || "",
            isDefault: address.isDefault,
        })
        setDistricts([]);
        setWards([]);
        loadDistricts(Number(address.provinceId))
        loadWards(Number(address.districtId))
        setErrors({})
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        if (!validateForm()) return

        try {
            const provinceName = provinces.find(p => p.ProvinceID === Number(formData.province))?.ProvinceName
            const districtName = districts.find(d => d.DistrictID === Number(formData.district))?.DistrictName
            const  wardName = wards.find(d => d.WardCode === (formData.ward))?.WardName
            const addressData = {
                id: formData.id,
                userId: userId,
                title: formData.title,
                recipientName: formData.recipientName,
                recipientPhone: formData.recipientPhone,
                provinceId: formData.province,
                districtId: formData.district,
                wardId: formData.ward,
                streetAddress: formData.streetAddress,
                fullAddress: formData.streetAddress + ", " + wardName + ", " + districtName + ", " + provinceName ,
                addressType: Number(formData.addressType),
                notes: formData.notes,
                isDefault: formData.isDefault,
            }

            console.log(addressData)
            if (editingAddress) {
                await execute(() => addressesApi.updateAddress( addressData , userId), {
                    successMessage: "Cập nhật địa chỉ thành công!",
                    onSuccess: () => {
                        setIsDialogOpen(false)
                        loadAddresses()
                        loadProvinces()
                        setDistricts([])
                        setWards([]);
                    },
                })
            } else {
                await execute(() => addressesApi.createAddress(addressData , userId), {
                    successMessage: "Thêm địa chỉ thành công!",
                    onSuccess: () => {
                        setIsDialogOpen(false)

                        loadAddresses()
                        loadProvinces()
                        setDistricts([])
                        setWards([]);
                    },
                })
            }

            if (formData.isDefault) {
                await handleSetDefault(editingAddress?.id || 0)
            }
        } catch (error) {
            console.error("Save address failed:", error)
        }
    }

    const handleDelete = async (userId: number,addressId: number) => {
        try {
            await execute(() => addressesApi.deleteAddress(userId,addressId), {
                successMessage: "Xóa địa chỉ thành công!",
                onSuccess: () => loadAddresses(),
            })
        } catch (error) {
            console.error("Delete address failed:", error)
        }
    }

    const handleSetDefault = async (addressId: number) => {
        try {
            await execute(() => addressesApi.setDefaultAddress(userId, addressId), {
                successMessage: "Đã đặt làm địa chỉ mặc định!",
                onSuccess: () => loadAddresses(),
            })
        } catch (error) {
            console.error("Set default address failed:", error)
        }
    }

    // const getAddressTypeLabel = (type: number) => {
    //     const labels = {
    //         home: "Nhà riêng",
    //         office: "Công ty",
    //         other: "Khác",
    //     }
    //     return labels[type as keyof typeof labels] || type
    // }

    const getAddressTypeIcon = (type: number) => {
        switch (type) {
            case 1:
                return "🏠"
            case 2:
                return "🏢"
            default:
                return "📍"
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Quản lý địa chỉ</CardTitle>
                            <CardDescription>Địa chỉ giao hàng và thanh toán của khách hàng</CardDescription>
                        </div>
                        <Button onClick={openAddDialog} disabled={loading}>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm địa chỉ
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <div className="space-y-4">
                {loading ? (
                    <Card>
                        <CardContent className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                            <span className="ml-2">Đang tải...</span>
                        </CardContent>
                    </Card>
                ) : addresses.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-8">
                            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có địa chỉ nào</h3>
                            <p className="text-gray-600 mb-4">Thêm địa chỉ đầu tiên để bắt đầu</p>
                            <Button onClick={openAddDialog}>
                                <Plus className="h-4 w-4 mr-2" />
                                Thêm địa chỉ đầu tiên
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    addresses.map((address) => (
                        <Card key={address.id} className={address.isDefault ? "ring-2 ring-blue-500" : ""}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg">{getAddressTypeIcon(address.addressType)}</span>
                                            <h3 className="font-medium text-lg">{address.title}</h3>
                                            {address.isDefault && (
                                                <Badge variant="default" className="bg-blue-100 text-blue-800">
                                                    <Star className="h-3 w-3 mr-1" />
                                                    Mặc định
                                                </Badge>
                                            )}
                                            <Badge variant="outline">
                                                {addressTypeOptions.find(option => option.value === address.addressType)?.label ?? "Không xác định"}
                                            </Badge>

                                        </div>

                                        <div className="space-y-2 text-sm text-gray-600">
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

                                        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                                            <span>Tạo: {address.createdAt}</span>
                                            {address.updatedAt !== address.createdAt && <span>• Cập nhật: {address.updatedAt}</span>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!address.isDefault && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSetDefault(address.id)}
                                                disabled={loading}
                                            >
                                                <StarOff className="h-4 w-4 mr-1" />
                                                Đặt mặc định
                                            </Button>
                                        )}

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" disabled={loading}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => openEditDialog(address)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Chỉnh sửa
                                                </DropdownMenuItem>
                                                {!address.isDefault && (
                                                    <DropdownMenuItem onClick={() => handleSetDefault(address.id)}>
                                                        <Star className="h-4 w-4 mr-2" />
                                                        Đặt làm mặc định
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDelete(userId,address.id)}
                                                    disabled={address.isDefault}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}</DialogTitle>
                        <DialogDescription>
                            {editingAddress ? "Cập nhật thông tin địa chỉ" : "Nhập thông tin địa chỉ giao hàng mới"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">
                                Tên địa chỉ <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleInputChange("title", e.target.value)}
                                placeholder="VD: Nhà riêng, Công ty, Nhà bố mẹ..."
                                className={errors.title ? "border-red-500" : ""}
                            />
                            {errors.title && <span className="text-sm text-red-500">{errors.title}</span>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="recipientName">
                                    Tên người nhận <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="recipientName"
                                    value={formData.recipientName}
                                    onChange={(e) => handleInputChange("recipientName", e.target.value)}
                                    placeholder="Họ và tên người nhận"
                                    className={errors.recipientName ? "border-red-500" : ""}
                                />
                                {errors.recipientName && <span className="text-sm text-red-500">{errors.recipientName}</span>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="recipientPhone">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="recipientPhone"
                                    value={formData.recipientPhone}
                                    onChange={(e) => handleInputChange("recipientPhone", e.target.value)}
                                    placeholder="0901234567"
                                    className={errors.recipientPhone ? "border-red-500" : ""}
                                />
                                {errors.recipientPhone && <span className="text-sm text-red-500">{errors.recipientPhone}</span>}
                            </div>
                        </div>

                        {/*<div className="grid gap-2">*/}
                        {/*    <Label htmlFor="addressType">Loại địa chỉ</Label>*/}
                        {/*    <Select value={formData.addressType.toString()} onValueChange={(value) => handleInputChange("addressType", value)}>*/}
                        {/*        <SelectTrigger>*/}
                        {/*            <SelectValue placeholder="Chọn loại địa chỉ" />*/}
                        {/*        </SelectTrigger>*/}
                        {/*        <SelectContent>*/}
                        {/*            {addressTypeOptions.map((option) => (*/}
                        {/*                <SelectItem value= {option.value.toString()}>{option.label}</SelectItem>*/}
                        {/*            ))}*/}
                        {/*        </SelectContent>*/}
                        {/*    </Select>*/}
                        {/*</div>*/}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="province">
                                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.province}
                                    onValueChange={(value) => handleInputChange("province", value)}
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
                                {errors.province && (
                                    <span className="text-sm text-red-500">{errors.province}</span>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="district">
                                    Quận/Huyện <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.district}
                                    onValueChange={(value) => handleInputChange("district", value)}
                                    disabled={!formData.province}
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
                                {errors.district && (
                                    <span className="text-sm text-red-500">{errors.district}</span>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="ward">
                                    Phường/Xã <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.ward}
                                    onValueChange={(value) => handleInputChange("ward", value)}
                                    disabled={!formData.district}
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
                                {errors.ward && (
                                    <span className="text-sm text-red-500">{errors.ward}</span>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="streetAddress">
                                Địa chỉ chi tiết <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="streetAddress"
                                value={formData.streetAddress}
                                onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                                placeholder="Số nhà, tên đường..."
                                className={errors.streetAddress ? "border-red-500" : ""}
                            />
                            {errors.streetAddress &&
                                <span className="text-sm text-red-500">{errors.streetAddress}</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Ghi chú giao hàng</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => handleInputChange("notes", e.target.value)}
                                placeholder="VD: Giao hàng giờ hành chính, gọi trước khi giao..."
                                className="min-h-[80px]"
                            />
                        </div>

                        <Separator/>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={formData.isDefault}
                                onChange={(e) => handleInputChange("isDefault", e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="isDefault" className="text-sm font-normal cursor-pointer">
                                Đặt làm địa chỉ mặc định
                            </Label>
                        </div>
                        {formData.isDefault && (
                            <p className="text-xs text-blue-600">
                                Địa chỉ này sẽ được sử dụng làm địa chỉ giao hàng mặc định cho các đơn hàng mới
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={loading}>
                            Hủy
                        </Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? "Đang lưu..." : editingAddress ? "Cập nhật" : "Thêm địa chỉ"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
