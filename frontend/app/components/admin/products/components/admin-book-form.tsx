"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import BasicInformation from "./basic-information"
import PricingInventory from "./pricing-inventory"
import DisplaySettings from "./display-settings"
import CustomAttributes from "./custom-attributes"
import DiscountManagement from "./discount-management"
import ProductRelations from "./product-relations"
import ProductSelectorDialog from "./product-selector-dialog"
import InventorySettingsDialog from "./inventory-settings-dialog"

import { booksApi, type Book, type InventoryTracking } from "@/lib/book-api"
import { useApi } from "@/hooks/useApi"

interface AdminBookFormProps {
    mode: "add" | "edit"
    bookId?: number
}
type InventoryTrackingType = "simple" | "none" | "by_attributes";

interface DisplaySettings {
    showOnHomepage: boolean;
    showInFeatured: boolean;
    showInNewReleases: boolean;
    showInBestsellers: boolean;
    showInDiscounted: boolean;
    featuredOrder?: number;
}

// interface InventoryTracking {
//     type: InventoryTrackingType;
//     trackQuantity: boolean;
//     allowBackorders: boolean;
//     lowStockThreshold?: number;
//     attributeCombinations: any[]; // hoặc định nghĩa rõ nếu biết
// }

interface BundleProduct {
    productId: number;
    quantity: number;
    isFree: boolean;
}

interface FormData {
    title: string;
    slug: string;
    description: string;
    shortDescription: string;
    isbn: string;
    price: number;
    originalPrice: number;
    stock: number;
    pages: number;
    weight: number;
    dimensions: string;
    language: string;
    publishedDate: string;
    coverImage: string;
    categoryId: number;
    authorId: number;
    publisherId: number;
    isActive: boolean;
    isFeatured: boolean;
    isNewRelease: boolean;
    isBestseller: boolean;
    displaySettings: DisplaySettings;
    customAttributes: Record<string, any>;
    appliedDiscounts: any[];
    inventoryTracking: InventoryTracking;
    crossSellProducts: number[];
    relatedProducts: number[];
    bundleProducts: BundleProduct[];
}

export default function AdminBookForm({ mode, bookId }: AdminBookFormProps) {
    const [book, setBook] = useState<Book | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const [productSelectorOpen, setProductSelectorOpen] = useState(false)
    const [productSelectorType, setProductSelectorType] = useState<"cross-sell" | "related" | "bundle">("cross-sell")
    const [inventorySettingsOpen, setInventorySettingsOpen] = useState(false)

    const { loading: bookLoading, execute: executeBook } = useApi<Book>()

    const [formData, setFormData] = useState<FormData>({
        title: "",
        slug: "",
        description: "",
        shortDescription: "",
        isbn: "",
        price: 0,
        originalPrice: 0,
        stock: 0,
        pages: 0,
        weight: 0,
        dimensions: "",
        language: "Tiếng Việt",
        publishedDate: "",
        coverImage: "",
        categoryId: 0,
        authorId: 0,
        publisherId: 0,
        isActive: true,
        isFeatured: false,
        isNewRelease: false,
        isBestseller: false,
        displaySettings: {
            showOnHomepage: false,
            showInFeatured: false,
            showInNewReleases: false,
            showInBestsellers: false,
            showInDiscounted: false,
            featuredOrder: undefined,
        },
        customAttributes: {},
        appliedDiscounts: [],
        inventoryTracking: {
            type: "simple",
            trackQuantity: true,
            allowBackorders: false,
            lowStockThreshold: undefined,
            attributeCombinations: [],
        },
        crossSellProducts: [],
        relatedProducts: [],
        bundleProducts: [],
    });

    useEffect(() => {
        if (mode === "edit" && bookId) {
            loadBook()
        }
    }, [mode, bookId])

    const loadBook = async () => {
        if (!bookId) return

        try {
            const bookData = await executeBook(() => booksApi.getBook(bookId))
            if (bookData) {
                setBook(bookData)
                setFormData({
                    title: bookData.title,
                    slug: bookData.slug,
                    description: bookData.description,
                    shortDescription: bookData.shortDescription || "",
                    isbn: bookData.isbn,
                    price: bookData.price,
                    originalPrice: bookData.originalPrice,
                    stock: bookData.stock,
                    pages: bookData.pages,
                    weight: bookData.weight,
                    dimensions: bookData.dimensions,
                    language: bookData.language,
                    publishedDate: bookData.publishedDate,
                    coverImage: bookData.coverImage,
                    categoryId: bookData.categoryId,
                    authorId: bookData.authorId,
                    publisherId: bookData.publisherId,
                    isActive: bookData.isActive,
                    isFeatured: bookData.isFeatured,
                    isNewRelease: bookData.isNewRelease,
                    isBestseller: bookData.isBestseller,
                    displaySettings: bookData.displaySettings,
                    customAttributes: bookData.customAttributes,
                    appliedDiscounts: bookData.appliedDiscounts,
                    inventoryTracking: bookData.inventoryTracking,
                    crossSellProducts: bookData.crossSellProducts,
                    relatedProducts: bookData.relatedProducts,
                    bundleProducts: bookData.bundleProducts,
                })
            }
        } catch (error) {
            console.error("Failed to load book:", error)
        }
    }

    const handleInputChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value })

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" })
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.title.trim()) {
            newErrors.title = "Tên sách là bắt buộc"
        }

        if (!formData.isbn.trim()) {
            newErrors.isbn = "ISBN là bắt buộc"
        }

        if (formData.price <= 0) {
            newErrors.price = "Giá bán phải lớn hơn 0"
        }

        if (formData.originalPrice <= 0) {
            newErrors.originalPrice = "Giá gốc phải lớn hơn 0"
        }

        if (formData.inventoryTracking.type === "simple" && formData.stock < 0) {
            newErrors.stock = "Số lượng tồn kho không được âm"
        }

        if (formData.pages <= 0) {
            newErrors.pages = "Số trang phải lớn hơn 0"
        }

        if (formData.categoryId === 0) {
            newErrors.categoryId = "Vui lòng chọn thể loại"
        }

        if (formData.authorId === 0) {
            newErrors.authorId = "Vui lòng chọn tác giả"
        }

        if (formData.publisherId === 0) {
            newErrors.publisherId = "Vui lòng chọn nhà xuất bản"
        }

        if (!formData.description.trim()) {
            newErrors.description = "Mô tả sách là bắt buộc"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validateForm()) return

        try {
            const bookData = {
                ...formData,
                discountPercent:
                    formData.originalPrice > 0
                        ? Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)
                        : 0,
            }

            if (mode === "add") {
                await executeBook(() => booksApi.createBook(bookData), {
                    successMessage: "Tạo sách thành công!",
                    onSuccess: () => {
                        // Navigate back to book list
                    },
                })
            } else if (bookId) {
                await executeBook(() => booksApi.updateBook(bookId, bookData), {
                    successMessage: "Cập nhật sách thành công!",
                    onSuccess: (updatedBook) => {
                        setBook(updatedBook)
                    },
                })
            }
        } catch (error) {
            console.error("Save failed:", error)
        }
    }

    const handleProductSelectorOpen = (type: "cross-sell" | "related" | "bundle") => {
        setProductSelectorType(type)
        setProductSelectorOpen(true)
    }

    const handleProductSelectorConfirm = (products: any[]) => {
        switch (productSelectorType) {
            case "cross-sell":
                handleInputChange("crossSellProducts", products)
                break
            case "related":
                handleInputChange("relatedProducts", products)
                break
            case "bundle":
                handleInputChange("bundleProducts", products)
                break
        }
    }

    const handleInventorySettingsConfirm = (settings: InventoryTracking) => {
        handleInputChange("inventoryTracking", settings)
    }

    const isLoading = bookLoading

    return (
        <div className="container mx-auto py-6 max-w-7xl">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{mode === "add" ? "Thêm sách mới" : "Chỉnh sửa sách"}</h1>
                    <p className="text-gray-600">
                        {mode === "add"
                            ? "Nhập thông tin để thêm sách mới vào hệ thống"
                            : `Chỉnh sửa thông tin sách: ${book?.title || ""}`}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <BasicInformation
                        formData={formData}
                        errors={errors}
                        isLoading={isLoading}
                        onInputChange={handleInputChange}
                    />

                    <PricingInventory
                        formData={formData}
                        errors={errors}
                        isLoading={isLoading}
                        onInputChange={handleInputChange}
                        onOpenInventorySettings={() => setInventorySettingsOpen(true)}
                    />

                    <CustomAttributes
                        formData={formData}
                        isLoading={isLoading}
                        onInputChange={handleInputChange}
                        onOpenAttributeManager={() => {
                            /* TODO: Open attribute manager */
                        }}
                    />

                    <DiscountManagement
                        formData={formData}
                        isLoading={isLoading}
                        onInputChange={handleInputChange}
                        onOpenDiscountManager={() => {
                        }}
                    />

                    <ProductRelations
                        formData={formData}
                        isLoading={isLoading}
                        onInputChange={handleInputChange}
                        onOpenProductSelector={handleProductSelectorOpen}
                    />
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hành động</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button onClick={handleSave} className="w-full" disabled={isLoading}>
                                <Save className="h-4 w-4 mr-2" />
                                {isLoading ? "Đang lưu..." : mode === "add" ? "Tạo sách" : "Lưu thay đổi"}
                            </Button>

                            <Button variant="outline" className="w-full">
                                Hủy
                            </Button>
                        </CardContent>
                    </Card>

                    <DisplaySettings formData={formData} isLoading={isLoading} onInputChange={handleInputChange} />

                    {mode === "edit" && book && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin sách</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">ID sách</span>
                                    <p className="text-sm">{book.id}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Lượt xem</span>
                                    <p className="text-sm">{book.viewCount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Đã bán</span>
                                    <p className="text-sm">{book.soldCount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Đánh giá</span>
                                    <p className="text-sm">
                                        {book.rating}/5 ({book.reviewCount} đánh giá)
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Ngày tạo</span>
                                    <p className="text-sm">{new Date(book.createdAt).toLocaleDateString("vi-VN")}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <ProductSelectorDialog
                open={productSelectorOpen}
                onOpenChange={setProductSelectorOpen}
                type={productSelectorType}
                currentProductId={bookId}
                selectedProducts={
                    productSelectorType === "cross-sell"
                        ? formData.crossSellProducts
                        : productSelectorType === "related"
                            ? formData.relatedProducts
                            : formData.bundleProducts.map((b) => b.productId)
                }
                bundleProducts={productSelectorType === "bundle" ? formData.bundleProducts : undefined}
                onConfirm={handleProductSelectorConfirm}
            />

            <InventorySettingsDialog
                open={inventorySettingsOpen}
                onOpenChange={setInventorySettingsOpen}
                inventoryTracking={formData.inventoryTracking}
                onConfirm={handleInventorySettingsConfirm}
            />
        </div>
    )
}
