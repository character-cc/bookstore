"use client"

import {useEffect, useState} from "react"
import {Link} from "react-router";
import {
    ArrowLeft,
    ShoppingCart,
    Heart,
    Share2,
    Truck,
    Shield,
    RotateCcw,
    ChevronLeft,
    ChevronRight, MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useParams} from "react-router";
import {toast} from "sonner";
import type {User} from "~/lib/api";

interface BookDetail {
    id: number
    name: string
    isbn: string
    costPrice: number
    originalPrice: number
    salePrice: number
    published: boolean
    publishedDate: string
    shortDescription: string
    fullDescription: string
    languageId: number
    languageName: string
    isGift: boolean
    pageCount: number
    inventoryManagementMethodId: number
    inventoryManagementMethodName: string
    stockQuantity: number
    lowStockThreshold: number
    markAsBestseller: boolean
    markAsNew: boolean
    isShowAsNewOnHome: boolean
    isShowAsBestsellerOnHome: boolean
    displayOrderBestseller: number
    displayOrderAsNew: number
    displayOrderAsSale: number
    createdAt: string
    updatedAt: string
    categories: Array<{
        id: number
        name: string
        description: string
        parentId: number | null
        isShowOnHomepage: boolean
        homepageDisplayOrder: number
        isShowOnNavigationBar: boolean
        navigationDisplayOrder: number
        imageUrl: string
    }>
    authors: Array<{
        id: number
        name: string
        biography: string
        imageUrl: string
    }>
    publishers: Array<{
        id: number
        name: string
        description: string
        website: string
        logoUrl: string
    }>
    images: Array<{
        id: number
        imageUrl: string
        thumbnailUrl: string
        altText: string
        title: string
    }>
    customAttributes: Array<{
        id: number
        productId: number
        name: string
        controlType: string
        tooltip: string
        isRequired:  boolean
        values: Array<{
            id: number
            attributeId: number
            value: string
            label: string
            priceAdjustment: number
            isPreSelected: boolean
            displayOrder: number
            isVariant: boolean
            customValue?: string
        }>
    }>
}

const mockBookData: BookDetail = {
    id: 1,
    name: "Lão Hạc",
    isbn: "9786041234567",
    costPrice: 50000,
    originalPrice: 100000,
    salePrice: 90000,
    published: true,
    publishedDate: "2025-01-01T00:00:00Z",
    shortDescription: "Truyện ngắn cảm động về lòng nhân hậu",
    fullDescription:
        "Lão Hạc là một tác phẩm kinh điển của Nam Cao, kể về cuộc đời của một ông lão nghèo khổ với tình yêu thương dành cho cậu Vàng, con chó mà ông coi như người bạn tri kỷ. Tác phẩm phản ánh hiện thực xã hội Việt Nam thời kỳ đầu thế kỷ 20, qua đó thể hiện tình người và những giá trị nhân văn sâu sắc.",
    languageId: 1,
    languageName: "Tiếng Việt",
    isGift: false,
    pageCount: 120,
    inventoryManagementMethodId: 1,
    inventoryManagementMethodName: "Theo dõi đơn giản",
    stockQuantity: 50,
    lowStockThreshold: 5,
    markAsBestseller: true,
    markAsNew: true,
    isShowAsNewOnHome: true,
    isShowAsBestsellerOnHome: true,
    displayOrderBestseller: 1,
    displayOrderAsNew: 1,
    displayOrderAsSale: 0,
    createdAt: "2025-06-14T15:50:00Z",
    updatedAt: "2025-06-14T15:50:00Z",
    categories: [
        {
            id: 1,
            name: "Văn học Việt Nam",
            description: "Các tác phẩm văn học nổi tiếng của Việt Nam",
            parentId: null,
            isShowOnHomepage: true,
            homepageDisplayOrder: 1,
            isShowOnNavigationBar: true,
            navigationDisplayOrder: 1,
            imageUrl: "https://example.com/images/van-hoc-vn.jpg",
        },
    ],
    authors: [
        {
            id: 1,
            name: "Nam Cao",
            biography: "Nam Cao là nhà văn hiện thực xuất sắc của Việt Nam",
            imageUrl: "https://example.com/images/nam-cao.jpg",
        },
    ],
    publishers: [
        {
            id: 1,
            name: "NXB Văn Học",
            description: "Nhà xuất bản chuyên về văn học",
            website: "https://nxbvanhoc.com",
            logoUrl: "https://example.com/images/nxb-vanhoc-logo.jpg",
        },
    ],
    images: [
        {
            id: 1,
            imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=500&fit=crop",
            thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&h=120&fit=crop",
            altText: "Bìa sách Lão Hạc",
            title: "Bìa trước",
        },
        {
            id: 2,
            imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=500&fit=crop",
            thumbnailUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=100&h=120&fit=crop",
            altText: "Bìa sau sách Lão Hạc",
            title: "Bìa sau",
        },
        {
            id: 3,
            imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
            thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=120&fit=crop",
            altText: "Trang mục lục",
            title: "Mục lục",
        },
        {
            id: 4,
            imageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=500&fit=crop",
            thumbnailUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=100&h=120&fit=crop",
            altText: "Trang nội dung",
            title: "Nội dung",
        },
    ],
    customAttributes: [
        {
            id: 1,
            productId: 1,
            name: "Định dạng",
            controlType: "dropdown",
            isRequired: true,
            tooltip: "Chọn định dạng sách",
            values: [
                {
                    id: 1,
                    attributeId: 1,
                    value: "Hardcover",
                    label: "Bìa cứng",
                    priceAdjustment: 0,
                    isPreSelected: true,
                    displayOrder: 1,
                    isVariant: true,
                },
                {
                    id: 2,
                    attributeId: 1,
                    value: "Ebook",
                    label: "Ebook",
                    priceAdjustment: -20000,
                    isPreSelected: false,
                    displayOrder: 2,
                    isVariant: true,
                },
            ],
        },
        {
            id: 2,
            productId: 1,
            name: "Dịch vụ bổ sung",
            controlType: "checkbox",
            isRequired: false,
            tooltip: "Chọn các dịch vụ bổ sung",
            values: [
                {
                    id: 3,
                    attributeId: 2,
                    value: "gift_wrap",
                    label: "Gói quà",
                    priceAdjustment: 10000,
                    isPreSelected: false,
                    displayOrder: 1,
                    isVariant: true,
                },
                {
                    id: 4,
                    attributeId: 2,
                    value: "express_shipping",
                    label: "Giao hàng nhanh",
                    priceAdjustment: 25000,
                    isPreSelected: false,
                    displayOrder: 2,
                    isVariant: true,
                },
                {
                    id: 5,
                    attributeId: 2,
                    value: "insurance",
                    label: "Bảo hiểm hàng hóa",
                    priceAdjustment: 15000,
                    isPreSelected: false,
                    displayOrder: 3,
                    isVariant: true,
                },
            ],
        },
        {
            id: 3,
            productId: 1,
            name: "Kích thước",
            controlType: "radio",
            isRequired: true,
            tooltip: "Chọn kích thước sách",
            values: [
                {
                    id: 5,
                    attributeId: 3,
                    value: "Small",
                    label: "Nhỏ (13x20cm)",
                    priceAdjustment: -10000,
                    isPreSelected: false,
                    displayOrder: 1,
                    isVariant: true,
                },
                {
                    id: 6,
                    attributeId: 3,
                    value: "Medium",
                    label: "Vừa (16x24cm)",
                    priceAdjustment: 0,
                    isPreSelected: true,
                    displayOrder: 2,
                    isVariant: true,
                },
                {
                    id: 7,
                    attributeId: 3,
                    value: "Large",
                    label: "Lớn (19x27cm)",
                    priceAdjustment: 15000,
                    isPreSelected: false,
                    displayOrder: 3,
                    isVariant: true,
                },
            ],
        },
        {
            id: 4,
            productId: 1,
            name: "Ghi chú đặc biệt",
            isRequired: true,
            controlType: "textbox",
            tooltip: "Nhập ghi chú đặc biệt cho đơn hàng (tối đa 100 ký tự)",
            values: [], // Textbox không cần values
        },
    ],
}



function SuggestedBookCard({ book }: { book: BookDetail }) {
    return (
        <Card className="h-full">
            <div className="p-4">
                <img
                    src={book.images[0]?.imageUrl || "/placeholder.svg"}
                    alt={book.name}
                    className="w-full h-48 object-cover rounded mb-3"
                />
            </div>
            <CardContent className="p-4 pt-0">
                <h3 className="font-semibold mb-1">{book.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{book.authors[0]?.name}</p>
                <div className="flex items-center gap-2">
                    {book.salePrice < book.originalPrice ? (
                        <>
                            <span className="font-bold text-primary">{book.salePrice.toLocaleString()}đ</span>
                            <span className="text-sm text-gray-500 line-through">{book.originalPrice.toLocaleString()}đ</span>
                        </>
                    ) : (
                        <span className="font-bold text-primary">{book.originalPrice.toLocaleString()}đ</span>
                    )}
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">

                <Button size="sm" className="w-full" asChild>
                    <Link to={"/books/" + book.id + "/detail"}>
                    Xem chi tiết
                    </Link>
                </Button>

            </CardFooter>
        </Card>
    )
}

export default function BookDetailPage() {
    const [book, setBook] = useState<BookDetail>(mockBookData)
    const [quantity, setQuantity] = useState(1)
    const [selectedAttributes, setSelectedAttributes] = useState<Record<number, any>>({})
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const [bookSuggested, setBookSuggested] = useState([])
    const { id } = useParams();
    const bookId = parseInt(id);
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadBookDetails()
        loadBookSuggested()
        loadUsers()
    },[])
    useEffect(() => {
        loadDefaultAttributes()
    },[
        book
    ])
    const loadUsers = async () => {
        try {
            const response = await fetch("/api/users/me")
            if (!response.ok) {
                throw new Error(response.statusText)
            }
            const data = await response.json()
            setUser(data)
        } catch (err) {
            console.log(err)
        }
    }
    const  loadBookSuggested = async () => {
        try {
            const bookCount = await fetch("http://localhost/api/books/count");

            const pageSize = 4;

            const countRes = await fetch("http://localhost/api/books/count");
            const dataTotal = await countRes.json();
            const totalCount = dataTotal.totalCount;

            const totalPages = Math.ceil(totalCount / pageSize);
            const randomPage = Math.floor(Math.random() * totalPages); // 0-based

            const booksRes = await fetch(`http://localhost/api/books?pageIndex=${randomPage}&pageSize=${pageSize}`);
            const data = await booksRes.json();
            setBookSuggested(data);
        }
        catch {

        }
    }
    const loadBookDetails = async () => {
        try {
            const response = await fetch("http://localhost/api/books/" + bookId + "/detail")
            if (!response.ok) {
                throw Error(response.statusText)
            }
            const data = await response.json()
            console.log(data)
            setBook(data)
        }
        catch(error) {
            console.log(error)
        }
    }
    const loadDefaultAttributes = () => {

            const defaultAttributes: Record<number, any> = {}
            book.customAttributes.forEach((attr) => {
                const preSelected = attr.values.find((v) => v.isPreSelected)
                console.log(preSelected)
                if (preSelected) {
                    defaultAttributes[attr.id] = preSelected
                }
            })
            setSelectedAttributes(defaultAttributes)

    }


    const calculateFinalPrice = () => {
        let finalPrice = book.salePrice
        Object.values(selectedAttributes).forEach((selectedValue: any) => {
            if (Array.isArray(selectedValue)) {
                selectedValue.forEach((item: any) => {
                    if (item?.priceAdjustment) {
                        finalPrice += item.priceAdjustment
                    }
                })
            } else if (selectedValue?.priceAdjustment) {
                finalPrice += selectedValue.priceAdjustment
            }
        })
        return finalPrice
    }

    const handleAttributeChange = (attributeId: number, value: any) => {
        setSelectedAttributes((prev) => ({
            ...prev,
            [attributeId]: value,
        }))
    }

    function normalizeAttributes(selectedAttributes : any) {
        const result = [];

        Object.entries(selectedAttributes).forEach(([attributeId, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => {
                    result.push({
                        attributeId: v.attributeId,
                        valueId: v.id,
                        value: v.value,
                        label: v.label,
                        priceAdjustment: v.priceAdjustment
                    });
                });
            } else if (value && typeof value === "object") {
                result.push({
                    attributeId: value.attributeId,
                    valueId: value.id,
                    value: value.value,
                    label: value.label,
                    priceAdjustment: value.priceAdjustment
                });
            }
        });

        return result;
    }

    const handleAddToCart = async () => {
        if (user == null) {
            toast("Bạn cần phải đăng nhập ")
            return
        }
        const missingRequiredAttributes = book.customAttributes
            .filter((attr) => attr.isRequired)
            .filter((attr) => {
                const selectedValue = selectedAttributes[attr.id]

                if (attr.controlType === "checkbox") {
                    return !selectedValue || (Array.isArray(selectedValue) && selectedValue.length === 0)
                } else if (attr.controlType === "textbox") {
                    return !selectedValue || !selectedValue.customValue || selectedValue.customValue.trim() === ""
                } else {
                    return !selectedValue
                }
            })

        if (missingRequiredAttributes.length > 0) {
            const missingNames = missingRequiredAttributes.map((attr) => attr.name).join(", ")
            toast.error(`Vui lòng chọn: ${missingNames}`)
            return
        }
        try {
            const cartItem = {
                bookId: book.id,
                quantity,
                attributeValueIds: normalizeAttributes(selectedAttributes).map(s => s.valueId),
            }

            const response = await fetch("http://localhost/api/cart",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(cartItem),
            });
            if (!response.ok) {
                toast.error(" Số lượng sản phẩm vừa thêm vượt quá  tồn kho  ")
                const  data = await response.json()
                if(data.quantity <= 0) setQuantity(1)
                else setQuantity(data.quantity)
                throw new Error("Sản phẩm hết")
            }
            toast.success("Thêm vào giỏ hàng thành công")
            console.log("Thêm vào giỏ hàng:", cartItem)
        }
        catch (error) {
            console.log(error);
        }

    }

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % book.images.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + book.images.length) % book.images.length)
    }

    const finalPrice = calculateFinalPrice()
    const discountPercent = Math.round(((book.originalPrice - finalPrice) / book.originalPrice) * 100)

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center gap-2 mb-6">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Trang chủ
                        </Link>
                    </Button>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600">{book.categories[0]?.name}</span>
                    <span className="text-gray-400">/</span>
                    <span className="font-medium">{book.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="relative">
                            <img
                                src={book.images[currentImageIndex]?.imageUrl || "/placeholder.svg"}
                                alt={book.images[currentImageIndex]?.altText || book.name}
                                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                            />
                            {book.markAsNew && <Badge className="absolute top-4 left-4 bg-blue-500">Mới</Badge>}
                            {book.markAsBestseller && <Badge className="absolute top-4 right-4 bg-red-500">Bestseller</Badge>}

                            {book.images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {book.images.map((image, index) => (
                                <button
                                    key={image.id}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`border-2 rounded ${index === currentImageIndex ? "border-primary" : "border-gray-200"}`}
                                >
                                    <img
                                        src={image.imageUrl || "/placeholder.svg"}
                                        alt={image.altText}
                                        className="w-full h-20 object-cover rounded"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{book.name}</h1>
                            <p className="text-gray-600 mb-4">{book.shortDescription}</p>

                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-3xl font-bold text-primary">{finalPrice.toLocaleString()}đ</span>
                                {book.originalPrice > finalPrice && (
                                    <>
                                        <span className="text-lg text-gray-500 line-through">{book.originalPrice.toLocaleString()}đ</span>
                                        <Badge variant="destructive">-{discountPercent}%</Badge>
                                    </>
                                )}
                            </div>
                        </div>

                        <Card>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Tác giả:</span>
                                        <span className="font-medium ml-2">{book.authors[0]?.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">NXB:</span>
                                        <span className="font-medium ml-2">{book.publishers[0]?.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Số trang:</span>
                                        <span className="font-medium ml-2">{book.pageCount}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Ngôn ngữ:</span>
                                        <span className="font-medium ml-2">{book.language}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">ISBN:</span>
                                        <span className="font-medium ml-2">{book.isbn}</span>
                                    </div>
                                    {/*<div>*/}
                                    {/*    <span className="text-gray-600">Tồn kho:</span>*/}
                                    {/*    <span className="font-medium ml-2">{book.stockQuantity} cuốn</span>*/}
                                    {/*</div>*/}
                                </div>
                            </CardContent>
                        </Card>

                        {book.customAttributes.map((attribute) => (
                            <div key={attribute.id} className="space-y-2">
                                <Label className="text-base font-medium">{attribute.name}</Label>

                                {attribute.controlType === "dropdown" && (
                                    <Select
                                        value={selectedAttributes[attribute.id]?.value || ""}
                                        required={attribute.isRequired}
                                        onValueChange={(value) => {
                                            const selectedValue = attribute.values.find((v) => v.value === value)
                                            handleAttributeChange(attribute.id, selectedValue)
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={`Chọn ${attribute.name.toLowerCase()}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {attribute.values.map((value) => (
                                                <SelectItem key={value.id} value={value.value}>
                                                    {value.label}
                                                    {value.priceAdjustment !== 0 && (
                                                        <span className="ml-2 text-sm text-gray-500">
                              ({value.priceAdjustment > 0 ? "+" : ""}
                                                            {value.priceAdjustment.toLocaleString()}đ)
                            </span>
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {attribute.controlType === "checkbox" && (
                                    <div className="space-y-2">
                                        {attribute.values.map((value) => (
                                            <div key={value.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`attr-${value.id}`}
                                                    checked={
                                                        Array.isArray(selectedAttributes[attribute.id])
                                                            ? selectedAttributes[attribute.id].some((item: any) => item.id === value.id)
                                                            : selectedAttributes[attribute.id]?.id === value.id
                                                    }
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            // Thêm vào mảng
                                                            const currentValues = Array.isArray(selectedAttributes[attribute.id])
                                                                ? selectedAttributes[attribute.id]
                                                                : selectedAttributes[attribute.id]
                                                                    ? [selectedAttributes[attribute.id]]
                                                                    : []
                                                            handleAttributeChange(attribute.id, [...currentValues, value])
                                                        } else {
                                                            // Xóa khỏi mảng
                                                            const currentValues = Array.isArray(selectedAttributes[attribute.id])
                                                                ? selectedAttributes[attribute.id]
                                                                : selectedAttributes[attribute.id]
                                                                    ? [selectedAttributes[attribute.id]]
                                                                    : []
                                                            handleAttributeChange(
                                                                attribute.id,
                                                                currentValues.filter((item: any) => item.id !== value.id),
                                                            )
                                                        }
                                                    }}
                                                />
                                                <Label htmlFor={`attr-${value.id}`} className="flex items-center gap-2">
                                                    {value.label}
                                                    {value.priceAdjustment !== 0 && (
                                                        <span className="text-sm text-gray-500">
                              ({value.priceAdjustment > 0 ? "+" : ""}
                                                            {value.priceAdjustment.toLocaleString()}đ)
                            </span>
                                                    )}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {attribute.controlType === "radio" && (
                                    <div className="space-y-2">
                                        {attribute.values.map((value) => (
                                            <div key={value.id} className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id={`attr-${value.id}`}
                                                    name={`attribute-${attribute.id}`}
                                                    value={value.value}
                                                    checked={selectedAttributes[attribute.id]?.id === value.id}
                                                    onChange={() => handleAttributeChange(attribute.id, value)}
                                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                                />
                                                <Label htmlFor={`attr-${value.id}`} className="flex items-center gap-2">
                                                    {value.label}
                                                    {value.priceAdjustment !== 0 && (
                                                        <span className="text-sm text-gray-500">
                              ({value.priceAdjustment > 0 ? "+" : ""}
                                                            {value.priceAdjustment.toLocaleString()}đ)
                            </span>
                                                    )}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {attribute.controlType === "textbox" && (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            id={`attr-${attribute.id}`}
                                            placeholder={`Nhập ${attribute.name.toLowerCase()}`}
                                            value={selectedAttributes[attribute.id]?.customValue || ""}
                                            onChange={(e) => {
                                                const customValue = e.target.value
                                                // Tạo object giả cho textbox
                                                const textboxValue = {
                                                    id: `custom-${attribute.id}`,
                                                    attributeId: attribute.id,
                                                    value: customValue,
                                                    label: customValue,
                                                    priceAdjustment: 0,
                                                    isPreSelected: false,
                                                    displayOrder: 1,
                                                    isVariant: false,
                                                    customValue: customValue,
                                                }
                                                handleAttributeChange(attribute.id, textboxValue)
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                        />
                                        {attribute.tooltip && <p className="text-sm text-gray-500">{attribute.tooltip}</p>}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="space-y-2">
                            <Label className="text-base font-medium">Số lượng</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuantity(quantity - 1)}
                                    disabled={quantity <= 1}
                                >
                                    -
                                </Button>
                                <span className="px-4 py-2 border rounded text-center min-w-[60px]">{quantity}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuantity( quantity + 1)}
                                >
                                    +
                                </Button>
                                <span className="text-sm text-gray-500 ml-2">(Còn {book.stockQuantity} cuốn)</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={book.stockQuantity === 0}>
                                <ShoppingCart className="h-5 w-5 mr-2" />
                                Thêm vào giỏ hàng
                            </Button>

                            <div className="flex gap-2">
                                {/*<Button variant="outline" size="sm" className="flex-1">*/}
                                {/*    <Heart className="h-4 w-4 mr-2" />*/}
                                {/*    Yêu thích*/}
                                {/*</Button>*/}
                                {/*<Button variant="outline" size="sm" className="flex-1">*/}
                                {/*    <Share2 className="h-4 w-4 mr-2" />*/}
                                {/*    Chia sẻ*/}
                                {/*</Button>*/}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm">
                                <Truck className="h-4 w-4 text-green-600" />
                                <span>Giao hàng 1 - 3 ngày</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Shield className="h-4 w-4 text-blue-600" />
                                <span>Bảo hành chất lượng</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <MessageSquare className="h-4 w-4 text-orange-600" />
                                <span>Hỗ trợ nhiệt tình </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12">
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-2xl font-bold mb-4">Mô tả sách</h2>
                            <div className="prose max-w-none">
                                <p className="text-gray-700 leading-relaxed"><pre>{book.fullDescription}</pre></p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">Có thể bạn thích</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {bookSuggested.map((book) => (
                            <SuggestedBookCard key={book.id} book={book} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
