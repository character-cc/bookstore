"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, X, BookOpen, Gift, Link, Save, GripVertical } from "lucide-react"
import ProductSelectorDialog from "./product-selector-dialog"

interface ProductWithOrder {
    productId: number
    displayOrder: number
}

interface BundleProduct {
    productId: number
    quantity: number
    isFree: boolean
    overridePrice?: number
    displayOrder: number
}

interface ProductRelationsProps {
    bookId?: number
    onOpenProductSelector?: (type: "cross-sell" | "related" | "bundle") => void
}

const mockApi = {
    getBookRelations: async (bookId: number) => {
        return {
            crossSellProducts: [1, 2],
            relatedProducts: [2, 3],
            bundleProducts: [
                { productId: 1, quantity: 1, isFree: true, displayOrder: 1 },
                { productId: 3, quantity: 2, isFree: false, overridePrice: 200000, displayOrder: 2 },
            ],
        }
    },

    saveBookRelations: async (bookId: number, relations: any) => {
        // Mock save - replace with actual API call
        console.log("Saving relations for book", bookId, relations)
        return { success: true }
    },
}

export default function ProductRelations({ bookId, onOpenProductSelector }: ProductRelationsProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        crossSellProducts: [] as number[],
        relatedProducts: [] as number[],
        bundleProducts: [] as BundleProduct[],
    })

    const [selectorDialog, setSelectorDialog] = useState({
        open: false,
        type: "cross-sell" as "cross-sell" | "related" | "bundle",
    })

    useEffect(() => {
        if (bookId) {
            loadBookRelations()
        }
    }, [bookId])

    const loadBookRelations = async () => {
        if (!bookId) return

        setIsLoading(true)
        try {
            const relations = await mockApi.getBookRelations(bookId)
            setFormData(relations)
        } catch (error) {
            console.error("Failed to load book relations:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const getProductInfo = (productId: number) => ({
        id: productId,
        title: `Sách mẫu ${productId}`,
        price: 150000,
        image: "/placeholder.svg?height=60&width=45",
    })

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleOpenProductSelector = (type: "cross-sell" | "related" | "bundle") => {
        setSelectorDialog({ open: true, type })
        if (onOpenProductSelector) {
            onOpenProductSelector(type)
        }
    }

    const handleProductSelectorConfirm = (products: any[]) => {
        const { type } = selectorDialog

        if (type === "bundle") {
            handleInputChange("bundleProducts", products)
        } else if (type === "cross-sell") {
            const productIds = products.map((p) => p.productId)
            handleInputChange("crossSellProducts", productIds)
        } else if (type === "related") {
            const productIds = products.map((p) => p.productId)
            handleInputChange("relatedProducts", productIds)
        }

        setSelectorDialog({ open: false, type: "cross-sell" })
    }

    const removeProduct = (type: string, productId: number) => {
        const currentProducts = formData[type as keyof typeof formData] || []
        if (Array.isArray(currentProducts)) {
            handleInputChange(
                type,
                currentProducts.filter((id: number) => id !== productId),
            )
        }
    }

    const removeBundleProduct = (productId: number) => {
        const currentBundles = formData.bundleProducts || []
        handleInputChange(
            "bundleProducts",
            currentBundles.filter((bundle: any) => bundle.productId !== productId),
        )
    }

    // const handleSaveSection = async () => {
    //     if (!bookId) return
    //
    //     setIsSaving(true)
    //     try {
    //         await mockApi.saveBookRelations(bookId, formData)
    //     } catch (error) {
    //         console.error("Failed to save relations:", error)
    //     } finally {
    //         setIsSaving(false)
    //     }
    // }

    const getSortedProducts = (products: any[], type: string) => {
        if (type === "bundle") {
            return products.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        }
        return products.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    }

    const getCurrentSelectedProducts = () => {
        const { type } = selectorDialog
        if (type === "bundle") {
            return formData.bundleProducts.map((b) => b.productId)
        } else if (type === "cross-sell") {
            return formData.crossSellProducts
        } else if (type === "related") {
            return formData.relatedProducts
        }
        return []
    }

    return (
        <>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base font-medium flex items-center gap-2">
                                    <Link className="h-4 w-4" />
                                    Sản phẩm bán kèm (Cross-sell)
                                </Label>
                                <p className="text-sm text-gray-600">Sản phẩm gợi ý mua thêm khi khách hàng xem sản phẩm này</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenProductSelector("cross-sell")}
                                disabled={isLoading}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Thêm sản phẩm
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(formData.crossSellProducts || []).map((productId: number) => {
                                const product = getProductInfo(productId)
                                return (
                                    <div key={productId} className="flex items-center gap-3 p-3 border rounded-lg">
                                        <Avatar className="h-12 w-12 rounded-md">
                                            <AvatarImage src={product.image || "/placeholder.svg"} alt={product.title} />
                                            <AvatarFallback className="rounded-md">
                                                <BookOpen className="h-6 w-6" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{product.title}</p>
                                            <p className="text-sm text-gray-600">{product.price.toLocaleString()}đ</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeProduct("crossSellProducts", productId)}
                                            disabled={isLoading}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>

                        {(!formData.crossSellProducts || formData.crossSellProducts.length === 0) && (
                            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                                <p className="text-gray-500">Chưa có sản phẩm bán kèm nào</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base font-medium flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    Sản phẩm liên quan (Related)
                                </Label>
                                <p className="text-sm text-gray-600">Sản phẩm tương tự hoặc cùng chủ đề</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenProductSelector("related")}
                                disabled={isLoading}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Thêm sản phẩm
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(formData.relatedProducts || []).map((productId: number) => {
                                const product = getProductInfo(productId)
                                return (
                                    <div key={productId} className="flex items-center gap-3 p-3 border rounded-lg">
                                        <Avatar className="h-12 w-12 rounded-md">
                                            <AvatarImage src={product.image || "/placeholder.svg"} alt={product.title} />
                                            <AvatarFallback className="rounded-md">
                                                <BookOpen className="h-6 w-6" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{product.title}</p>
                                            <p className="text-sm text-gray-600">{product.price.toLocaleString()}đ</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeProduct("relatedProducts", productId)}
                                            disabled={isLoading}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>

                        {(!formData.relatedProducts || formData.relatedProducts.length === 0) && (
                            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                                <p className="text-gray-500">Chưa có sản phẩm liên quan nào</p>
                            </div>
                        )}
                    </div>

                    {/* Bundle Products */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base font-medium flex items-center gap-2">
                                    <Gift className="h-4 w-4" />
                                    Sản phẩm tặng kèm (Bundle)
                                </Label>
                                <p className="text-sm text-gray-600">Sản phẩm đi kèm khi mua sản phẩm này</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenProductSelector("bundle")}
                                disabled={isLoading}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Thêm sản phẩm
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {getSortedProducts(formData.bundleProducts || [], "bundle").map((bundle: any) => {
                                const product = getProductInfo(bundle.productId)
                                return (
                                    <div key={bundle.productId} className="flex items-center gap-3 p-3 border rounded-lg cursor-move">
                                        <GripVertical className="h-4 w-4 text-gray-400" />
                                        <Avatar className="h-12 w-12 rounded-md">
                                            <AvatarImage src={product.image || "/placeholder.svg"} alt={product.title} />
                                            <AvatarFallback className="rounded-md">
                                                <BookOpen className="h-6 w-6" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{product.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant={bundle.isFree ? "default" : "secondary"}>
                                                    {bundle.isFree
                                                        ? "Miễn phí"
                                                        : bundle.overridePrice
                                                            ? `${bundle.overridePrice.toLocaleString()}đ (Ghi đè)`
                                                            : `${product.price.toLocaleString()}đ`}
                                                </Badge>
                                                <Badge variant="outline">SL: {bundle.quantity}</Badge>
                                                <Badge variant="outline">Thứ tự: {bundle.displayOrder}</Badge>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeBundleProduct(bundle.productId)}
                                            disabled={isLoading}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>

                        {(!formData.bundleProducts || formData.bundleProducts.length === 0) && (
                            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                                <p className="text-gray-500">Chưa có sản phẩm tặng kèm nào</p>
                            </div>
                        )}
                    </div>

            <ProductSelectorDialog
                open={selectorDialog.open}
                onOpenChange={(open) => setSelectorDialog((prev) => ({ ...prev, open }))}
                type={selectorDialog.type}
                currentProductId={bookId}
                selectedProducts={getCurrentSelectedProducts()}
                bundleProducts={formData.bundleProducts}
                onConfirm={handleProductSelectorConfirm}
            />
        </>
    )
}
