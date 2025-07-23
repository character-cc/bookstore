"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Save, Search, Check, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import {AddCombinationDialog} from "~/components/admin/products/components/add-combination-dialog";
import {EditCombinationDialog} from "~/components/admin/products/components/edit-combination-dialog";
import {GenerateCombinationsDialog} from "~/components/admin/products/components/generate-combinations-dialog";
import {useNavigate} from "react-router";
import { booksApi, type CustomAttribute, type AttributeCombination } from "@/lib/book-api"
import { useApi } from "@/hooks/useApi"

interface CustomAttributesProps {
    bookId?: number
}

export default function CustomAttributes({ bookId }: CustomAttributesProps) {
    const [attributes, setAttributes] = useState<CustomAttribute[]>([])
    const [combinations, setCombinations] = useState<AttributeCombination[]>([])

    const [activeTab, setActiveTab] = useState("attributes")
    const [searchTerm, setSearchTerm] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
    const [selectedAttributeValues, setSelectedAttributeValues] = useState<{ [attributeId: number]: number[] }>({})

    const router = useNavigate()

    const { loading: attributesLoading, execute: executeAttributes } = useApi<CustomAttribute[]>()
    const { loading: combinationsLoading, execute: executeCombinations } = useApi<AttributeCombination[]>()
    const { loading: generateLoading, execute: executeGenerate } = useApi<AttributeCombination[]>()
    const { loading: saveLoading, execute: executeSave } = useApi<any>()

    const [isAddCombinationOpen, setIsAddCombinationOpen] = useState(false)
    const [isEditCombinationOpen, setIsEditCombinationOpen] = useState(false)
    const [isGenerateCombinationsOpen, setIsGenerateCombinationsOpen] = useState(false)
    const [editingCombination, setEditingCombination] = useState<AttributeCombination | null>(null)


    useEffect(() => {
        loadAttributes()
        if (bookId) {
            loadCombinations()
        }
    }, [bookId])

    const loadAttributes = async () => {
        try {
            const result = await executeAttributes(() => booksApi.getCustomAttributes(bookId))
            console.log(result)
            if (result) {
                setAttributes(result.items)
            }

        } catch (error) {
            console.error("Failed to load attributes:", error)
            toast.error("Không thể tải thuộc tính")
        }
    }

    const loadCombinations = async () => {
        if (!bookId) return

        try {
            const result = await executeCombinations(() => booksApi.getAttributeCombinations(bookId))
            if (result) {
                setCombinations(result)
            }
        } catch (error) {
            console.error("Failed to load combinations:", error)
            toast.error("Không thể tải tổ hợp thuộc tính")
        }
    }

    const handleSave = async () => {
        if (!bookId) {
            toast.error("Cần có ID sách để lưu thuộc tính")
            return
        }

        setIsSaving(true)
        try {
            await executeSave(() => booksApi.updateBookAttributes(bookId, { attributes, combinations }), {
                successMessage: "Cập nhật thuộc tính thành công!",
            })
        } catch (error) {
            console.error("Failed to save attributes:", error)
            toast.error("Lỗi khi lưu thuộc tính")
        } finally {
            setIsSaving(false)
        }
    }

    const filteredCombinations = combinations.filter((combo) =>
        combo.sku.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const getAttributeName = (attributeId: number) => {
        return attributes.find((attr) => attr.id === attributeId)?.name || "Unknown"
    }

    const getAttributeValueName = (attributeId: number, valueId: number) => {
        const attribute = attributes.find((attr) => attr.id === attributeId)
        const value = attribute?.values?.find((val) => val.id === valueId)
        return value?.label || value?.name || "Unknown"
    }

    const getAttributeValuesByAttributeId = (attributeId: number) => {
        const attribute = attributes.find((attr) => attr.id === attributeId)
        return attribute?.values || []
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN").format(price)
    }

    const handleAddAttribute = () => {
        router(`/admin/books/${bookId}/attributes/add`)
    }

    const handleEditAttribute = (attribute: CustomAttribute) => {
        router(`/admin/books/${bookId}/attributes/edit/${attribute.id}`)
    }

    const handleAddCombination = () => {
        toast.info("Chức năng thêm tổ hợp sẽ được triển khai")
        setIsAddCombinationOpen(true)
    }

    const handleEditCombination = (combination: AttributeCombination) => {
        setEditingCombination(combination)
        setIsEditCombinationOpen(true)    }

    const handleDeleteCombination = async (combinationId: number) => {
        if (confirm("Bạn có chắc muốn xóa tổ hợp này?")) {
            try {
                await booksApi.deleteAttributeCombination(combinationId)
                await loadCombinations() // Reload data
                toast.success("Đã xóa tổ hợp thành công")
            } catch (error) {
                console.error("Failed to delete combination:", error)
                toast.error("Lỗi khi xóa tổ hợp")
            }
        }
    }

    const handleGenerateCombinations = () => {
        setIsGenerateCombinationsOpen(true)
    }

    const handleGenerateAllCombinations = async () => {
        if (!bookId) return

        if (confirm("Tạo tất cả tổ hợp có thể sẽ xóa các tổ hợp hiện tại. Bạn có chắc chắn?")) {
            try {
                const allSelections: { [attributeId: number]: number[] } = {}
                attributes.forEach((attr) => {
                    const values = getAttributeValuesByAttributeId(attr.id)
                    allSelections[attr.id] = values.map((val) => val.id)
                })

                const newCombinations = await executeGenerate(() =>
                    booksApi.generateAttributeCombinations(bookId, allSelections),
                )

                if (newCombinations) {
                    setCombinations(newCombinations)
                    toast.success("Đã tạo tất cả tổ hợp thành công")
                }
            } catch (error) {
                console.error("Failed to generate combinations:", error)
                toast.error("Lỗi khi tạo tổ hợp")
            }
        }
    }

    const handleAttributeValueSelection = (attributeId: number, valueId: number, checked: boolean) => {
        setSelectedAttributeValues((prev) => {
            const current = prev[attributeId] || []
            if (checked) {
                return { ...prev, [attributeId]: [...current, valueId] }
            } else {
                return { ...prev, [attributeId]: current.filter((id) => id !== valueId) }
            }
        })
    }

    const generateCombinationsFromSelection = async () => {
        if (!bookId) return

        const attributeIds = Object.keys(selectedAttributeValues).map(Number)
        if (attributeIds.length === 0) {
            toast.error("Vui lòng chọn ít nhất một thuộc tính")
            return
        }

        try {
            const newCombinations = await executeGenerate(() =>
                booksApi.generateAttributeCombinations(bookId, selectedAttributeValues),
            )

            if (newCombinations) {
                setCombinations([...combinations, ...newCombinations])
                toast.success("Đã tạo tổ hợp thành công")
            }

            setIsGenerateDialogOpen(false)
            setSelectedAttributeValues({})
        } catch (error) {
            console.error("Failed to generate combinations:", error)
            toast.error("Lỗi khi tạo tổ hợp")
        }
    }

    const isLoading = attributesLoading || combinationsLoading || generateLoading || saveLoading

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/*<TabsList className="grid ">*/}
                {/*    <TabsTrigger value="attributes">Thuộc tính</TabsTrigger>*/}
                {/*    /!*<TabsTrigger value="combinations">Tổ hợp thuộc tính</TabsTrigger>*!/*/}
                {/*</TabsList>*/}

                {/* Tab Attributes */}
                <TabsContent value="attributes" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Thuộc tính sản phẩm</CardTitle>
                                    <CardDescription>
                                        Thuộc tính sản phẩm là các khía cạnh có thể định lượng hoặc mô tả của sản phẩm (như màu sắc).
                                    </CardDescription>
                                </div>
                                <Button onClick={handleAddAttribute} size="sm" className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm thuộc tính mới
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {attributesLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                                    <span className="text-sm text-gray-500 mt-2">Đang tải thuộc tính...</span>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tên thuộc tính</TableHead>
                                            <TableHead>Bắt buộc</TableHead>
                                            <TableHead>Loại điều khiển</TableHead>
                                            <TableHead>Thứ tự hiển thị</TableHead>
                                            {/*<TableHead>Tooltip</TableHead>*/}
                                            <TableHead>Số giá trị</TableHead>
                                            <TableHead>Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attributes.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                    Không có thuộc tính nào
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            attributes.map((attribute) => (
                                                <TableRow key={attribute.id}>
                                                    <TableCell className="font-medium">{attribute.name}</TableCell>
                                                    <TableCell>
                                                        {attribute.isRequired ? (
                                                            <Check className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <X className="h-4 w-4 text-gray-400" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {attribute.customAttributeTypeId === 0 && "Danh sách thả xuống"}
                                                        {attribute.customAttributeTypeId == 1 && "Nút radio"}
                                                        {attribute.customAttributeTypeId === 2 && "Checkbox"}
                                                        {attribute.customAttributeTypeId === 3 && "Ô văn bản"}
                                                    </TableCell>
                                                    <TableCell>{attribute.displayOrder || "-"}</TableCell>
                                                    {/*<TableCell>{attribute.tooltip || "-"}</TableCell>*/}
                                                    <TableCell>{attribute.values?.length || 0}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-blue-600 hover:text-blue-700"
                                                            onClick={() => handleEditAttribute(attribute)}
                                                        >
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            Sửa
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>


            </Tabs>


            <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chọn một số giá trị thuộc tính để tạo tổ hợp cần thiết</DialogTitle>
                        <DialogDescription>Chọn các giá trị thuộc tính để tạo tổ hợp</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {attributes.map((attribute) => (
                            <div key={attribute.id} className="space-y-3">
                                <h3 className="font-medium">
                                    {attribute.name} {attribute.isRequired && <span className="text-red-500">*</span>}
                                </h3>
                                <div className="space-y-2">
                                    {getAttributeValuesByAttributeId(attribute.id).map((value) => (
                                        <div key={value.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`attr-${attribute.id}-val-${value.id}`}
                                                checked={selectedAttributeValues[attribute.id]?.includes(value.id) || false}
                                                onCheckedChange={(checked) =>
                                                    handleAttributeValueSelection(attribute.id, value.id, checked as boolean)
                                                }
                                            />
                                            <label htmlFor={`attr-${attribute.id}-val-${value.id}`} className="text-sm">
                                                {value.label || value.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button
                            onClick={generateCombinationsFromSelection}
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={generateLoading}
                        >
                            {generateLoading ? "Đang tạo..." : "Tạo"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <AddCombinationDialog
                open={isAddCombinationOpen}
                onOpenChange={setIsAddCombinationOpen}
                bookId={bookId}
                attributes={attributes}
                onSaved={loadCombinations}
            />

            <EditCombinationDialog
                open={isEditCombinationOpen}
                onOpenChange={setIsEditCombinationOpen}
                combination={editingCombination}
                bookId={bookId}
                attributes={attributes}
                onSaved={loadCombinations}
            />

            <GenerateCombinationsDialog
                open={isGenerateCombinationsOpen}
                onOpenChange={setIsGenerateCombinationsOpen}
                bookId={bookId}
                attributes={attributes}
                onSaved={loadCombinations}
            />
        </div>
    )
}
