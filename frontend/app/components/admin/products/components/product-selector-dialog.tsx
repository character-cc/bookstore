"use client"

import { useState, useEffect } from "react"
import { Search, BookOpen } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const mockBooksApi = {
    searchProductsForSelection: async (searchTerm: string, excludeId?: number) => {
        const mockBooks = [
            {
                id: 1,
                title: "Sách Lập Trình React",
                author: { name: "Nguyễn Văn A" },
                category: { name: "Công nghệ" },
                price: 250000,
                coverImage: "/placeholder.svg?height=60&width=45",
            },
            {
                id: 2,
                title: "Thiết Kế UI/UX",
                author: { name: "Trần Thị B" },
                category: { name: "Thiết kế" },
                price: 180000,
                coverImage: "/placeholder.svg?height=60&width=45",
            },
            {
                id: 3,
                title: "JavaScript Nâng Cao",
                author: { name: "Lê Văn C" },
                category: { name: "Công nghệ" },
                price: 320000,
                coverImage: "/placeholder.svg?height=60&width=45",
            },
        ]

        return mockBooks.filter(
            (book) =>
                book.id !== excludeId && (searchTerm === "" || book.title.toLowerCase().includes(searchTerm.toLowerCase())),
        )
    },
}

interface Book {
    id: number
    title: string
    author: { name: string }
    category: { name: string }
    price: number
    coverImage?: string
}

interface ProductSelectorDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    type: "cross-sell" | "related" | "bundle"
    currentProductId?: number
    selectedProducts: number[]
    bundleProducts?: { productId: number; quantity: number; isFree: boolean }[]
    onConfirm: (products: any[]) => void
}

export default function ProductSelectorDialog({
                                                  open,
                                                  onOpenChange,
                                                  type,
                                                  currentProductId,
                                                  selectedProducts,
                                                  bundleProducts = [],
                                                  onConfirm,
                                              }: ProductSelectorDialogProps) {
    const [search, setSearch] = useState("")
    const [products, setProducts] = useState<Book[]>([])
    const [tempSelected, setTempSelected] = useState<number[]>([])
    const [tempBundleSettings, setTempBundleSettings] = useState<{
        [key: number]: { quantity: number; isFree: boolean }
    }>({})
    const [displayOrder, setDisplayOrder] = useState<{ [key: number]: number }>({})
    const [overridePrices, setOverridePrices] = useState<{ [key: number]: number }>({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            setTempSelected([...selectedProducts])

            // Initialize bundle settings
            if (type === "bundle") {
                const settings: { [key: number]: { quantity: number; isFree: boolean } } = {}
                bundleProducts.forEach((bundle) => {
                    settings[bundle.productId] = {
                        quantity: bundle.quantity,
                        isFree: bundle.isFree,
                    }
                })
                setTempBundleSettings(settings)
            }

            loadProducts()
        }
    }, [open])

    useEffect(() => {
        if (open && search !== "") {
            const timeoutId = setTimeout(() => {
                loadProducts()
            }, 300)

            return () => clearTimeout(timeoutId)
        }
    }, [search, open])

    const loadProducts = async (searchTerm = search) => {
        setLoading(true)
        try {
            const result = await mockBooksApi.searchProductsForSelection(searchTerm, currentProductId)
            setProducts(result)
        } catch (error) {
            console.error("Failed to load products:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleProductToggle = (productId: number, checked: boolean) => {
        if (checked) {
            setTempSelected([...tempSelected, productId])

            if (type === "bundle") {
                setTempBundleSettings((prev) => ({
                    ...prev,
                    [productId]: { quantity: 1, isFree: false },
                }))
            }
        } else {
            setTempSelected(tempSelected.filter((id) => id !== productId))

            if (type === "bundle") {
                setTempBundleSettings((prev) => {
                    const newSettings = { ...prev }
                    delete newSettings[productId]
                    return newSettings
                })
            }
        }
    }

    const handleBundleSettingChange = (productId: number, field: "quantity" | "isFree", value: number | boolean) => {
        setTempBundleSettings((prev) => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value,
            },
        }))
    }

    const handleDisplayOrderChange = (productId: number, order: number) => {
        setDisplayOrder((prev) => ({
            ...prev,
            [productId]: order,
        }))
    }

    const handleOverridePriceChange = (productId: number, price: number) => {
        setOverridePrices((prev) => ({
            ...prev,
            [productId]: price,
        }))
    }

    const handleConfirm = () => {
        if (type === "bundle") {
            const bundleData = tempSelected.map((productId) => ({
                productId,
                quantity: tempBundleSettings[productId]?.quantity || 1,
                isFree: tempBundleSettings[productId]?.isFree || false,
                overridePrice: overridePrices[productId] || null,
                displayOrder: displayOrder[productId] || tempSelected.indexOf(productId) + 1,
            }))
            onConfirm(bundleData)
        } else {
            const productsWithOrder = tempSelected.map((productId) => ({
                productId,
                displayOrder: displayOrder[productId] || tempSelected.indexOf(productId) + 1,
            }))
            onConfirm(productsWithOrder)
        }
        onOpenChange(false)
    }

    const getDialogTitle = () => {
        switch (type) {
            case "cross-sell":
                return "Chọn sản phẩm bán kèm"
            case "related":
                return "Chọn sản phẩm liên quan"
            case "bundle":
                return "Chọn sản phẩm tặng kèm"
            default:
                return "Chọn sản phẩm"
        }
    }

    const getDialogDescription = () => {
        switch (type) {
            case "cross-sell":
                return "Chọn các sản phẩm sẽ được gợi ý mua thêm"
            case "related":
                return "Chọn các sản phẩm tương tự hoặc cùng chủ đề"
            case "bundle":
                return "Chọn các sản phẩm sẽ đi kèm khi mua sản phẩm này"
            default:
                return "Chọn sản phẩm từ danh sách"
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>{getDialogTitle()}</DialogTitle>
                    <DialogDescription>{getDialogDescription()}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Tìm kiếm sản phẩm..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto border rounded-lg">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                <span className="ml-2">Đang tải...</span>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">Không tìm thấy sản phẩm nào</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">Chọn</TableHead>
                                        <TableHead className="w-16">Hình</TableHead>
                                        <TableHead>Thông tin sản phẩm</TableHead>
                                        <TableHead className="w-24">Giá gốc</TableHead>
                                        <TableHead className="w-20">Thứ tự</TableHead>
                                        {type === "bundle" && <TableHead className="w-32">Cài đặt</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product, index) => {
                                        const isSelected = tempSelected.includes(product.id)
                                        const bundleSettings = tempBundleSettings[product.id]

                                        return (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={tempSelected.includes(product.id)}
                                                        onCheckedChange={(checked) => handleProductToggle(product.id, checked as boolean)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Avatar className="h-12 w-12 rounded-md">
                                                        <AvatarImage src={product.coverImage || "/placeholder.svg"} alt={product.title} />
                                                        <AvatarFallback className="rounded-md">
                                                            <BookOpen className="h-6 w-6" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{product.title}</p>
                                                        <p className="text-sm text-gray-600">{product.author.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="secondary">{product.category.name}</Badge>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{product.price.toLocaleString()}đ</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {tempSelected.includes(product.id) && (
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={displayOrder[product.id] || index + 1}
                                                            onChange={(e) => handleDisplayOrderChange(product.id, Number(e.target.value) || 1)}
                                                            className="w-16 h-8"
                                                        />
                                                    )}
                                                </TableCell>
                                                {type === "bundle" && (
                                                    <TableCell>
                                                        {tempSelected.includes(product.id) && (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Label className="text-xs">SL:</Label>
                                                                    <Input
                                                                        type="number"
                                                                        min="1"
                                                                        value={bundleSettings?.quantity || 1}
                                                                        onChange={(e) =>
                                                                            handleBundleSettingChange(product.id, "quantity", Number(e.target.value) || 1)
                                                                        }
                                                                        className="w-16 h-8"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Switch
                                                                        checked={bundleSettings?.isFree || false}
                                                                        onCheckedChange={(checked) =>
                                                                            handleBundleSettingChange(product.id, "isFree", checked)
                                                                        }
                                                                    />
                                                                    <Label className="text-xs">Miễn phí</Label>
                                                                </div>
                                                                {!bundleSettings?.isFree && (
                                                                    <div className="flex items-center gap-2">
                                                                        <Label className="text-xs">Giá:</Label>
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            placeholder={product.price.toString()}
                                                                            value={overridePrices[product.id] || ""}
                                                                            onChange={(e) =>
                                                                                handleOverridePriceChange(product.id, Number(e.target.value) || 0)
                                                                            }
                                                                            className="w-20 h-8"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                        <span className="text-sm text-gray-600">Đã chọn: {tempSelected.length} sản phẩm</span>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleConfirm} disabled={tempSelected.length === 0}>
                                Xác nhận
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
