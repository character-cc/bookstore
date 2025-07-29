"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Save, Upload, X, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

import { booksApi, type Book, type Category, type Author, type Publisher } from "@/lib/book-api"
import { useApi } from "@/hooks/useApi"

interface BookFormProps {
    mode: "add" | "edit"
    bookId?: number
}

export default function AdminBookForm({ mode, bookId }: BookFormProps) {
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [book, setBook] = useState<Book | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [authors, setAuthors] = useState<Author[]>([])
    const [publishers, setPublishers] = useState<Publisher[]>([])
    const [uploadedImages, setUploadedImages] = useState<string[]>([])
    const [tags, setTags] = useState<string[]>([])
    const [newTag, setNewTag] = useState("")

    const { loading: bookLoading, execute: executeBook } = useApi<Book>()
    const { loading: categoriesLoading, execute: executeCategories } = useApi<Category[]>()
    const { loading: authorsLoading, execute: executeAuthors } = useApi<Author[]>()
    const { loading: publishersLoading, execute: executePublishers } = useApi<Publisher[]>()

    const [formData, setFormData] = useState({
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
    })

    useEffect(() => {
        loadCategories()
        loadAuthors()
        loadPublishers()

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
                })
                setUploadedImages(bookData.images)
                setTags(bookData.tags)
            }
        } catch (error) {
            console.error("Failed to load book:", error)
        }
    }

    const loadCategories = async () => {
        try {
            const result = await executeCategories(() => booksApi.getCategories())
            if (result) setCategories(result)
        } catch (error) {
            console.error("Failed to load categories:", error)
        }
    }

    const loadAuthors = async () => {
        try {
            const result = await executeAuthors(() => booksApi.getAuthors())
            if (result) setAuthors(result)
        } catch (error) {
            console.error("Failed to load authors:", error)
        }
    }

    const loadPublishers = async () => {
        try {
            const result = await executePublishers(() => booksApi.getPublishers())
            if (result) setPublishers(result)
        } catch (error) {
            console.error("Failed to load publishers:", error)
        }
    }

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim()
    }

    const handleInputChange = (field: string, value: string | number | boolean) => {
        setFormData({ ...formData, [field]: value })

        if (field === "title" && typeof value === "string") {
            setFormData((prev) => ({ ...prev, title: value, slug: generateSlug(value) }))
        }

        if (errors[field]) {
            setErrors({ ...errors, [field]: "" })
        }
    }

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (files) {

            const newImages = Array.from(files).map(
                (file, index) => `/placeholder.svg?height=400&width=300&text=Image${uploadedImages.length + index + 1}`,
            )
            setUploadedImages([...uploadedImages, ...newImages])
        }
    }

    const removeImage = (index: number) => {
        const newImages = uploadedImages.filter((_, i) => i !== index)
        setUploadedImages(newImages)

        // If removing cover image, set first remaining image as cover
        if (index === 0 && newImages.length > 0) {
            setFormData({ ...formData, coverImage: newImages[0] })
        }
    }

    const setCoverImage = (imageUrl: string) => {
        setFormData({ ...formData, coverImage: imageUrl })
    }

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()])
            setNewTag("")
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove))
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

        if (formData.stock < 0) {
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
                images: uploadedImages,
                tags,
                discountPercent:
                    formData.originalPrice > 0
                        ? Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)
                        : 0,
            }

            if (mode === "add") {
                await executeBook(() => booksApi.createBook(bookData), {
                    successMessage: "Tạo sách thành công!",
                    onSuccess: () => {
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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN").format(price)
    }

    const isLoading = bookLoading || categoriesLoading || authorsLoading || publishersLoading

    return (
        <div className="container mx-auto py-6 max-w-7xl">
            {/* Header */}
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                            <CardDescription>Thông tin chính về sách</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">
                                    Tên sách <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange("title", e.target.value)}
                                    placeholder="Nhập tên sách"
                                    className={errors.title ? "border-red-500" : ""}
                                    disabled={isLoading}
                                />
                                {errors.title && <span className="text-sm text-red-500">{errors.title}</span>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug (URL)</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => handleInputChange("slug", e.target.value)}
                                    placeholder="slug-cua-sach"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="shortDescription">Mô tả ngắn</Label>
                                <Input
                                    id="shortDescription"
                                    value={formData.shortDescription}
                                    onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                                    placeholder="Mô tả ngắn gọn về sách"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">
                                    Mô tả chi tiết <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    placeholder="Mô tả chi tiết về nội dung sách"
                                    className={`min-h-[120px] ${errors.description ? "border-red-500" : ""}`}
                                    disabled={isLoading}
                                />
                                {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing and Inventory */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Giá và kho hàng</CardTitle>
                            <CardDescription>Thông tin về giá bán và số lượng tồn kho</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="originalPrice">
                                        Giá gốc (VNĐ) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="originalPrice"
                                        type="number"
                                        value={formData.originalPrice}
                                        onChange={(e) => handleInputChange("originalPrice", Number.parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        className={errors.originalPrice ? "border-red-500" : ""}
                                        disabled={isLoading}
                                    />
                                    {errors.originalPrice && <span className="text-sm text-red-500">{errors.originalPrice}</span>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="price">
                                        Giá bán (VNĐ) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => handleInputChange("price", Number.parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        className={errors.price ? "border-red-500" : ""}
                                        disabled={isLoading}
                                    />
                                    {errors.price && <span className="text-sm text-red-500">{errors.price}</span>}
                                </div>
                            </div>

                            {formData.originalPrice > 0 && formData.price > 0 && formData.originalPrice > formData.price && (
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-700">
                                        Giảm giá: {Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}%
                                        ({formatPrice(formData.originalPrice - formData.price)} VNĐ)
                                    </p>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="stock">
                                    Số lượng tồn kho <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => handleInputChange("stock", Number.parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    className={errors.stock ? "border-red-500" : ""}
                                    disabled={isLoading}
                                />
                                {errors.stock && <span className="text-sm text-red-500">{errors.stock}</span>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Chi tiết sách</CardTitle>
                            <CardDescription>Thông tin kỹ thuật và xuất bản</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="isbn">
                                        ISBN <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="isbn"
                                        value={formData.isbn}
                                        onChange={(e) => handleInputChange("isbn", e.target.value)}
                                        placeholder="9786041141234"
                                        className={errors.isbn ? "border-red-500" : ""}
                                        disabled={isLoading}
                                    />
                                    {errors.isbn && <span className="text-sm text-red-500">{errors.isbn}</span>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="pages">
                                        Số trang <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="pages"
                                        type="number"
                                        value={formData.pages}
                                        onChange={(e) => handleInputChange("pages", Number.parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        className={errors.pages ? "border-red-500" : ""}
                                        disabled={isLoading}
                                    />
                                    {errors.pages && <span className="text-sm text-red-500">{errors.pages}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="weight">Trọng lượng (g)</Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        value={formData.weight}
                                        onChange={(e) => handleInputChange("weight", Number.parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="dimensions">Kích thước</Label>
                                    <Input
                                        id="dimensions"
                                        value={formData.dimensions}
                                        onChange={(e) => handleInputChange("dimensions", e.target.value)}
                                        placeholder="20x14x2 cm"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="language">Ngôn ngữ</Label>
                                    <Select
                                        value={formData.language}
                                        onValueChange={(value) => handleInputChange("language", value)}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Tiếng Việt">Tiếng Việt</SelectItem>
                                            <SelectItem value="English">English</SelectItem>
                                            <SelectItem value="中文">中文</SelectItem>
                                            <SelectItem value="日本語">日本語</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="publishedDate">Ngày xuất bản</Label>
                                <Input
                                    id="publishedDate"
                                    type="date"
                                    value={formData.publishedDate}
                                    onChange={(e) => handleInputChange("publishedDate", e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Phân loại</CardTitle>
                            <CardDescription>Thể loại, tác giả và nhà xuất bản</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="categoryId">
                                        Thể loại <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.categoryId.toString()}
                                        onValueChange={(value) => handleInputChange("categoryId", Number.parseInt(value))}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Chọn thể loại" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.categoryId && <span className="text-sm text-red-500">{errors.categoryId}</span>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="authorId">
                                        Tác giả <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.authorId.toString()}
                                        onValueChange={(value) => handleInputChange("authorId", Number.parseInt(value))}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className={errors.authorId ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Chọn tác giả" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {authors.map((author) => (
                                                <SelectItem key={author.id} value={author.id.toString()}>
                                                    {author.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.authorId && <span className="text-sm text-red-500">{errors.authorId}</span>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="publisherId">
                                        Nhà xuất bản <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.publisherId.toString()}
                                        onValueChange={(value) => handleInputChange("publisherId", Number.parseInt(value))}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className={errors.publisherId ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Chọn NXB" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {publishers.map((publisher) => (
                                                <SelectItem key={publisher.id} value={publisher.id.toString()}>
                                                    {publisher.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.publisherId && <span className="text-sm text-red-500">{errors.publisherId}</span>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tags</CardTitle>
                            <CardDescription>Thêm các từ khóa để dễ tìm kiếm</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="Nhập tag mới"
                                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                                    disabled={isLoading}
                                />
                                <Button type="button" onClick={addTag} disabled={isLoading}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Hình ảnh</CardTitle>
                            <CardDescription>Tải lên hình ảnh sách (hình đầu tiên sẽ là ảnh bìa)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {uploadedImages.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <div className="aspect-[3/4] relative overflow-hidden rounded-lg border">
                                            <img
                                                src={image || "/placeholder.svg"}
                                                alt={`Book image ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {index === 0 && <Badge className="absolute top-2 left-2 bg-blue-500">Ảnh bìa</Badge>}
                                        </div>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => removeImage(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        {index !== 0 && (
                                            <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-6 text-xs"
                                                    onClick={() => setCoverImage(image)}
                                                >
                                                    Đặt làm bìa
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                    <label className="cursor-pointer flex flex-col items-center">
                                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-500">Tải ảnh lên</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={isLoading}
                                        />
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Trạng thái</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="isActive">Hoạt động</Label>
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="isFeatured">Nổi bật</Label>
                                <Switch
                                    id="isFeatured"
                                    checked={formData.isFeatured}
                                    onCheckedChange={(checked) => handleInputChange("isFeatured", checked)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="isNewRelease">Mới phát hành</Label>
                                <Switch
                                    id="isNewRelease"
                                    checked={formData.isNewRelease}
                                    onCheckedChange={(checked) => handleInputChange("isNewRelease", checked)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="isBestseller">Bestseller</Label>
                                <Switch
                                    id="isBestseller"
                                    checked={formData.isBestseller}
                                    onCheckedChange={(checked) => handleInputChange("isBestseller", checked)}
                                    disabled={isLoading}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {mode === "edit" && book && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin sách</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">ID sách</Label>
                                    <p className="text-sm">{book.id}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Lượt xem</Label>
                                    <p className="text-sm">{book.viewCount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Đã bán</Label>
                                    <p className="text-sm">{book.soldCount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Đánh giá</Label>
                                    <p className="text-sm">
                                        {book.rating}/5 ({book.reviewCount} đánh giá)
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Ngày tạo</Label>
                                    <p className="text-sm">{new Date(book.createdAt).toLocaleDateString("vi-VN")}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Trợ giúp</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-gray-600 space-y-2">
                            <p>• Tên sách và ISBN là bắt buộc</p>
                            <p>• Giá bán phải nhỏ hơn hoặc bằng giá gốc</p>
                            <p>• Hình ảnh đầu tiên sẽ được dùng làm ảnh bìa</p>
                            <p>• Tags giúp khách hàng tìm kiếm dễ dàng hơn</p>
                            <p>• Slug sẽ được tự động tạo từ tên sách</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
