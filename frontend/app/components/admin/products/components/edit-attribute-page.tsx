"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Save, Edit, Trash2, Check, X, Plus } from "lucide-react"
import {useNavigate} from "react-router";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

import { booksApi, type CustomAttribute } from "@/lib/book-api"
import { useApi } from "@/hooks/useApi"

interface AttributeValue {
    id: number
    attributeId: number
    name: string
    value: string
    label: string
    priceAdjustment: number
    isPreSelected: boolean
    displayOrder: number
    isVariant: boolean
    isEditing: boolean
    createdAt: string
    updatedAt: string
}

interface EditAttributePageProps {
    attributeId: number
    bookId?: number
    onBack?: () => void
}
export default function EditAttributeBookPage({ attributeId, bookId, onBack }: EditAttributePageProps) {
    const router = useNavigate()

    const [formData, setFormData] = useState<Partial<CustomAttribute>>({})
    const [attributeValues, setAttributeValues] = useState<AttributeValue[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [isValuesExpanded, setIsValuesExpanded] = useState(true)
    const [showValuesSection, setShowValuesSection] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { loading: loadLoading, execute: executeLoad } = useApi<CustomAttribute>()
    const { loading: saveLoading, execute: executeSave } = useApi<any>()

    useEffect(() => {
        loadAttributeData()
    }, [attributeId])

    useEffect(() => {
        setShowValuesSection(formData.controlType !== "textbox")
        if (formData.controlType === "textbox") {
            setAttributeValues([])
        }
    }, [formData.controlType])

    const loadAttributeData = async () => {
        try {
            const attribute = await executeLoad(() => booksApi.getCustomAttribute(bookId, attributeId))
            console.log(attribute)
            if (attribute) {
                let controlType
                if(attribute.customAttributeTypeId == 0) {
                    controlType = "dropdown"
                }
                if(attribute.customAttributeTypeId == 1) {
                    controlType = "checkbox"
                }
                if(attribute.customAttributeTypeId == 2) {
                    controlType = "radio"
                }
                if(attribute.customAttributeTypeId == 3) {
                    controlType = "textbox"
                }

                setFormData({
                    id: attribute.id,
                    name: attribute.name,
                    isRequired: attribute.isRequired,
                    controlType: controlType,
                    displayOrder: attribute.displayOrder,
                    tooltip: attribute.tooltip,
                    bookId: attribute.bookId,
                })

                console.log(attribute)
                const formValues: AttributeValue[] = (attribute.values || []).map((value) => ({
                    id: value.id,
                    attributeId: value.attributeId,
                    name: value.name,
                    value: value.value,
                    label: value.label,
                    priceAdjustment: value.priceAdjustment,
                    isPreSelected: value.isPreSelected,
                    displayOrder: value.displayOrder,
                    isVariant: value.isVariant,
                    isEditing: false,
                    createdAt: value.createdAt,
                    updatedAt: value.updatedAt,
                }))

                setAttributeValues(formValues)
            }
        } catch (error) {
            console.error("Failed to load attribute:", error)
            toast.error("Không thể tải thông tin thuộc tính")
        }
    }

    const handleInputChange = (field: keyof CustomAttribute, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        setError(null)
    }

    const handleValueChange = (valueId: number, field: keyof AttributeValue, value: any) => {
        setAttributeValues((prev) => prev.map((val) => (val.id === valueId ? { ...val, [field]: value } : val)))
    }

    const addNewValue = () => {
        if (!formData.controlType || formData.controlType === "textbox") {
            setError("Vui lòng chọn loại điều khiển khác Textbox trước khi thêm giá trị")
            return
        }

        const newValue: AttributeValue = {
            id: Date.now(),
            attributeId: formData.id || 0,
            name: "",
            value: "",
            label: "",
            priceAdjustment: 0,
            isPreSelected: false,
            displayOrder: attributeValues.length + 1,
            isVariant: true,
            isEditing: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        setAttributeValues((prev) => [...prev, newValue])
    }

    const deleteValue = async (valueId: number) => {
        if (confirm("Bạn có chắc muốn xóa giá trị này?")) {
            try {
                if (valueId > 1000000) {

                    setAttributeValues((prev) => prev.filter((val) => val.id !== valueId))
                } else {
                    await booksApi.deleteAttributeValue(valueId)
                    setAttributeValues((prev) => prev.filter((val) => val.id !== valueId))
                    toast.success("Đã xóa giá trị thành công")
                }
            } catch (error) {
                console.error("Failed to delete value:", error)
                toast.error("Lỗi khi xóa giá trị")
            }
        }
    }

    const toggleEditValue = (valueId: number) => {
        setAttributeValues((prev) => prev.map((val) => (val.id === valueId ? { ...val, isEditing: !val.isEditing } : val)))
    }

    const saveValue = (valueId: number) => {
        const value = attributeValues.find((v) => v.id === valueId)
        if (!value?.value.trim()) {
            setError("Tên giá trị không được để trống")
            return
        }
        if (!value?.label.trim()) {
            setError("Nhãn hiển thị không được để trống")
            return
        }

        console.log(value)
        setAttributeValues((prev) => prev.map((val) => (val.id === valueId ? { ...val, isEditing: false } : val)))
        setError(null)
    }

    const handleSave = async (continueEdit = false) => {
        if (!formData.name?.trim()) {
            setError("Vui lòng nhập tên thuộc tính")
            return
        }

        if (formData.controlType !== "textbox" && attributeValues.length === 0) {
            setError("Vui lòng thêm ít nhất một giá trị cho thuộc tính")
            return
        }

        const hasEditingValues = attributeValues.some((v) => v.isEditing)
        if (hasEditingValues) {
            setError("Vui lòng lưu tất cả các giá trị trước khi tiếp tục")
            return
        }

        setIsSaving(true)
        setError(null)

        try {
            if(formData.controlType === "dropdown") {
                formData.customAttributeTypeId = 0
            }
            if(formData.controlType === "radio") {
                formData.customAttributeTypeId = 1
            }
            if(formData.controlType === "checkbox") {
                formData.customAttributeTypeId = 2
            }
            if(formData.controlType === "textbox") {
                formData.customAttributeTypeId = 3
            }
            const attributeData = {
                ...formData,
                values: attributeValues.map((val) => ({
                    id: val.id > 1000000 ? undefined : val.id,
                    attributeId: val.attributeId,
                    name: val.name,
                    label: val.label,
                    value: val.value,
                    priceAdjustment: val.priceAdjustment,
                    isPreSelected: val.isPreSelected,
                    displayOrder: val.displayOrder,
                    isVariant: val.isVariant,
                })),
            }

            console.log(attributeData)
            await executeSave(() => booksApi.updateCustomAttribute(bookId, attributeData))

            if (continueEdit) {
                await loadAttributeData()
                toast.success("Đã cập nhật thuộc tính thành công!")
            } else {
                toast.success("Đã cập nhật thuộc tính thành công!")
                router("/admin/books/edit/" + bookId )

            }
        } catch (error) {
            console.error("Lỗi khi cập nhật thuộc tính:", error)
            setError("Lỗi khi cập nhật thuộc tính")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!formData.id) return

        if (confirm("Bạn có chắc muốn xóa thuộc tính này? Hành động này không thể hoàn tác.")) {
            try {
                const response = await fetch(`/api/admin/books/${bookId}/custom-attributes/${Number(formData.id)}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                })
                if(!response.ok) {
                    throw response
                }
                toast.success("Đã xóa thuộc tính thành công")
                router("/admin/books/edit/" + bookId )
            } catch (error) {
                console.error("Failed to delete attribute:", error)
                setError("Lỗi khi xóa thuộc tính")
            }
        }
    }

    const handleBack = () => {
        if (onBack) {
            onBack()
        } else {
            // router.back()
        }
    }

    if (loadLoading) {
        return (
            <div className="container mx-auto py-6 max-w-6xl">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <span className="text-sm text-gray-500 mt-2">Đang tải thông tin thuộc tính...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 max-w-6xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Chỉnh sửa thuộc tính: {formData.name}</h1>
                        <p className="text-gray-600">Cập nhật thông tin thuộc tính và các giá trị của nó</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={() => handleSave(false)} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="h-4 w-4 mr-2" />
                        Lưu
                    </Button>
                    {/*<Button onClick={() => handleSave(true)} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">*/}
                    {/*    <Save className="h-4 w-4 mr-2" />*/}
                    {/*    Lưu và tiếp tục chỉnh sửa*/}
                    {/*</Button>*/}
                    <Button onClick={handleDelete} variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                i
              </span>
                            Thông tin cơ bản
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="flex items-center gap-2">
                                    Tên thuộc tính <span className="text-red-500">*</span>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                        <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-help">
                          ?
                        </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Tên thuộc tính sản phẩm (ví dụ: Màu sắc, Kích thước)</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name || ""}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    placeholder="Nhập tên thuộc tính"
                                />
                            </div>

                            <div className="space-y-2">
                        {/*        <Label htmlFor="tooltip" className="flex items-center gap-2">*/}
                        {/*            Tooltip*/}
                        {/*            <TooltipProvider>*/}
                        {/*                <Tooltip>*/}
                        {/*                    <TooltipTrigger asChild>*/}
                        {/*<span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-help">*/}
                        {/*  ?*/}
                        {/*</span>*/}
                        {/*                    </TooltipTrigger>*/}
                        {/*                    <TooltipContent>*/}
                        {/*                        <p>Gợi ý hiển thị khi người dùng hover vào thuộc tính</p>*/}
                        {/*                    </TooltipContent>*/}
                        {/*                </Tooltip>*/}
                        {/*            </TooltipProvider>*/}
                        {/*        </Label>*/}
                        {/*        <Input*/}
                        {/*            id="tooltip"*/}
                        {/*            value={formData.tooltip || ""}*/}
                        {/*            onChange={(e) => handleInputChange("tooltip", e.target.value)}*/}
                        {/*            placeholder="Nhập tooltip (tùy chọn)"*/}
                        {/*        />*/}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    Bắt buộc
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                        <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-help">
                          ?
                        </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Người dùng phải chọn giá trị cho thuộc tính này</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isRequired"
                                        checked={formData.isRequired || false}
                                        onCheckedChange={(checked) => handleInputChange("isRequired", checked)}
                                    />
                                    <Label htmlFor="isRequired" className="text-sm">
                                        Bắt buộc
                                    </Label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="controlType" className="flex items-center gap-2">
                                    Loại điều khiển <span className="text-red-500">*</span>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                        <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-help">
                          ?
                        </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Cách hiển thị thuộc tính cho người dùng</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Label>
                                <Select
                                    value={formData.controlType || "dropdown"}
                                    onValueChange={(value: any) => handleInputChange("controlType", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="dropdown">Danh sách thả xuống</SelectItem>
                                        <SelectItem value="radio">Nút radio</SelectItem>
                                        <SelectItem value="checkbox">Hộp kiểm</SelectItem>
                                        <SelectItem value="textbox">Ô văn bản</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="displayOrder" className="flex items-center gap-2">
                                    Thứ tự hiển thị
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                        <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs cursor-help">
                          ?
                        </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Vị trí hiển thị của thuộc tính (số nhỏ hơn hiển thị trước)</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Label>
                                <Input
                                    id="displayOrder"
                                    type="number"
                                    value={formData.displayOrder || 0}
                                    onChange={(e) => handleInputChange("displayOrder", Number(e.target.value))}
                                    min="0"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {showValuesSection && (
                    <Card>
                        <Collapsible open={isValuesExpanded} onOpenChange={setIsValuesExpanded}>
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-gray-50">
                                    <CardTitle className="flex items-center gap-2">
                                        <Checkbox checked={isValuesExpanded} readOnly />
                                        Giá trị thuộc tính
                                    </CardTitle>
                                </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent>
                                    {attributeValues.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Tên giá trị</TableHead>
                                                        <TableHead>Nhãn hiển thị</TableHead>
                                                        <TableHead>Điều chỉnh giá</TableHead>
                                                        <TableHead>Chọn sẵn</TableHead>
                                                        {/*<TableHead>Là biến thể</TableHead>*/}
                                                        <TableHead>Thứ tự hiển thị</TableHead>
                                                        <TableHead>Thao tác</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {attributeValues.map((value) => (
                                                        <TableRow key={value.id}>
                                                            <TableCell>
                                                                {value.isEditing ? (
                                                                    <Input
                                                                        value={value.value}
                                                                        onChange={(e) => handleValueChange(value.id, "value", e.target.value)}
                                                                        className="w-32"
                                                                        placeholder="Tên giá trị"
                                                                    />
                                                                ) : (
                                                                    value.value
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {value.isEditing ? (
                                                                    <Input
                                                                        value={value.label}
                                                                        onChange={(e) => handleValueChange(value.id, "label", e.target.value)}
                                                                        className="w-32"
                                                                        placeholder="Nhãn hiển thị"
                                                                    />
                                                                ) : (
                                                                    value.label
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {value.isEditing ? (
                                                                    <Input
                                                                        type="number"
                                                                        value={value.priceAdjustment}
                                                                        onChange={(e) =>
                                                                            handleValueChange(value.id, "priceAdjustment", Number(e.target.value))
                                                                        }
                                                                        className="w-24"
                                                                    />
                                                                ) : (
                                                                    value.priceAdjustment
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex justify-center">
                                                                    {value.isEditing ? (
                                                                        <Checkbox
                                                                            checked={value.isPreSelected}
                                                                            onCheckedChange={(checked) =>
                                                                                handleValueChange(value.id, "isPreSelected", checked)
                                                                            }
                                                                        />
                                                                    ) : value.isPreSelected ? (
                                                                        <Check className="h-4 w-4 text-blue-600" />
                                                                    ) : (
                                                                        <X className="h-4 w-4 text-gray-400" />
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            {/*<TableCell>*/}
                                                            {/*    <div className="flex justify-center">*/}
                                                            {/*        {value.isEditing ? (*/}
                                                            {/*            <Checkbox*/}
                                                            {/*                checked={value.isVariant}*/}
                                                            {/*                onCheckedChange={(checked) => handleValueChange(value.id, "isVariant", checked)}*/}
                                                            {/*            />*/}
                                                            {/*        ) : value.isVariant ? (*/}
                                                            {/*            <Check className="h-4 w-4 text-blue-600" />*/}
                                                            {/*        ) : (*/}
                                                            {/*            <X className="h-4 w-4 text-gray-400" />*/}
                                                            {/*        )}*/}
                                                            {/*    </div>*/}
                                                            {/*</TableCell>*/}
                                                            <TableCell>
                                                                {value.isEditing ? (
                                                                    <Input
                                                                        type="number"
                                                                        value={value.displayOrder}
                                                                        onChange={(e) =>
                                                                            handleValueChange(value.id, "displayOrder", Number(e.target.value))
                                                                        }
                                                                        className="w-20"
                                                                        min="0"
                                                                    />
                                                                ) : (
                                                                    value.displayOrder
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex space-x-2">
                                                                    {value.isEditing ? (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => saveValue(value.id)}
                                                                            className="text-green-600 hover:text-green-700"
                                                                        >
                                                                            <Save className="h-4 w-4 mr-1" />
                                                                            Lưu
                                                                        </Button>
                                                                    ) : (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => toggleEditValue(value.id)}
                                                                            className="text-blue-600 hover:text-blue-700"
                                                                        >
                                                                            <Edit className="h-4 w-4 mr-1" />
                                                                            Sửa
                                                                        </Button>
                                                                    )}
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => deleteValue(value.id)}
                                                                        className="text-red-600 hover:text-red-700"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                                        Xóa
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>Chưa có giá trị nào</p>
                                            <p className="text-sm">Nhấn "Thêm giá trị mới" để bắt đầu</p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" disabled>
                                                Trước
                                            </Button>
                                            <Button variant="default" size="sm" className="bg-blue-600">
                                                1
                                            </Button>
                                            <Button variant="ghost" size="sm" disabled>
                                                Sau
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">Hiển thị</span>
                                            <select className="border rounded px-2 py-1 text-sm">
                                                <option>15</option>
                                            </select>
                                            <span className="text-sm">mục</span>
                                            <span className="text-sm text-gray-500 ml-4">
                        {attributeValues.length > 0
                            ? `1-${attributeValues.length} của ${attributeValues.length} mục`
                            : "0 mục"}
                      </span>
                                        </div>
                                    </div>

                                    <Button onClick={addNewValue} className="mt-4 bg-blue-600 hover:bg-blue-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thêm giá trị mới
                                    </Button>
                                </CardContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </Card>
                )}
            </div>
        </div>
    )
}
