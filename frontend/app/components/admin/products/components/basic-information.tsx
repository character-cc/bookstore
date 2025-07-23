"use client"

import { useState, useEffect } from "react"
import { Upload, X, Save } from 'lucide-react'
import Select from "react-select"
import { toast } from "sonner"
import  {useNavigate} from "react-router";

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useApi } from "@/hooks/useApi"
import { booksApi } from "@/lib/book-api"

// Define interfaces based on the provided data structures
interface Category {
    id: number
    name: string
    description?: string
    parentId?: number
    isShowOnHomepage: boolean
    homepageDisplayOrder: number
    isShowOnNavigationBar: boolean
    navigationDisplayOrder: number
    subCategories: Category[]
    createdAt: string
    updatedAt: string
}

interface Author {
    id: number
    name: string
    biography?: string
    imageUrl?: string
    createdAt: string
    updatedAt: string
}

interface Publisher {
    id: number
    name: string
    description?: string
    logoUrl?: string
    website?: string
    createdAt: string
    updatedAt: string
}

interface SelectOption {
    value: number
    label: string
}

interface BookBasicInfo {
    id?: number
    name: string
    isbn: string
    costPrice: number
    originalPrice: number
    salePrice: number
    published: boolean
    publishedDate?: string
    shortDescription: string
    fullDescription: string
    language: number
    isGift: boolean
    pageCount: number
    inventoryManagementMethodId: number
    stockQuantity: number
    lowStockThreshold: number
    markAsBestseller: boolean
    markAsNew: boolean
    isShowAsNewOnHome: boolean
    isShowAsBestsellerOnHome: boolean
    displayOrderBestseller: number
    displayOrderAsNew: number
    displayOrderAsSale: number
    categoryIds: number[]
    authorIds: number[]
    publisherIds: number[]
    images: string[]
}

interface BasicInformationProps {
    bookId?: number
    onSaved?: (bookId: number) => void
}

export default function BasicInformation({ bookId, onSaved }: BasicInformationProps) {
    // State for form data\
    const  router =useNavigate()
    const [formData, setFormData] = useState({
        name: "",
        isbn: "",
        costPrice: 0,
        originalPrice: 0,
        salePrice: 0,
        published: true,
        publishedDate: new Date().toISOString().split("T")[0],
        shortDescription: "",
        fullDescription: "",
        language: 1,
        isGift: false,
        pageCount: 0,
        inventoryManagementMethodId: 1,
        // stockQuantity: 0,
        lowStockThreshold: 0,
        markAsBestseller: false,
        markAsNew: false,
        isShowAsNewOnHome: false,
        isShowAsBestsellerOnHome: false,
        displayOrderBestseller: 0,
        displayOrderAsNew: 0,
        displayOrderAsSale: 0,
        categoryIds: [],
        authorIds: [],
        publisherIds: [],
        images: [],
        // initialStockQuantity: 0,
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [newTag, setNewTag] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [tags, setTags] = useState<string[]>([])

    const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([])
    const [authorOptions, setAuthorOptions] = useState<SelectOption[]>([])
    const [publisherOptions, setPublisherOptions] = useState<SelectOption[]>([])

    const { loading: bookLoading, execute: executeBookLoad } = useApi<any>()
    const { loading: categoriesLoading, execute: executeCategories } = useApi<Category[]>()
    const { loading: authorsLoading, execute: executeAuthors } = useApi<Author[]>()
    const { loading: publishersLoading, execute: executePublishers } = useApi<Publisher[]>()
    const { loading: saveLoading, execute: executeSave } = useApi<any>()

    useEffect(() => {
        loadCategories()
        loadAuthors()
        loadPublishers()

        if (bookId) {
            loadBookData()
        }
    }, [bookId])

    const loadBookData = async () => {
        if (!bookId) return

        try {
            const book = await executeBookLoad(() => booksApi.getBook(bookId))
            console.log(book)
            if (book) {
                setFormData({
                    id: book.id,
                    name: book.name,
                    isbn: book.isbn,
                    costPrice: book.costPrice,
                    originalPrice: book.originalPrice,
                    salePrice: book.salePrice,
                    published: book.published,
                    publishedDate: book.publishedDate ? new Date(book.publishedDate).toISOString().split("T")[0] : undefined,
                    shortDescription: book.shortDescription || "",
                    fullDescription: book.fullDescription || "",
                    language: book.language,
                    isGift: book.isGift,
                    pageCount: book.pageCount,
                    // initialStockQuantity: book.initialStockQuantity ?? 0,
                    weight: book.weight ?? 0,
                    length: book.length ?? 0,
                    width: book.width ?? 0,
                    height: book.height ?? 0,
                    inventoryManagementMethodId: book.inventoryManagementMethodId,
                    // stockQuantity: book.stockQuantity,
                    lowStockThreshold: book.lowStockThreshold,
                    markAsBestseller: book.markAsBestseller,
                    markAsNew: book.markAsNew,
                    isShowAsNewOnHome: book.isShowAsNewOnHome,
                    isShowAsBestsellerOnHome: book.isShowAsBestsellerOnHome,
                    displayOrderBestseller: book.displayOrderBestseller,
                    displayOrderAsNew: book.displayOrderAsNew,
                    displayOrderAsSale: book.displayOrderAsSale,
                    categoryIds: book.categories?.map((c: Category) => c.id) || [],
                    authorIds: book.authors?.map((a: Author) => a.id) || [],
                    publisherIds: book.publishers?.map((p: Publisher) => p.id) || [],
                    images: book.images?.map((img: any) => img.imageUrl) || [],
                })

                if (book.tags) {
                    setTags(Array.isArray(book.tags) ? book.tags : [])
                }
            }
        } catch (error) {
            console.error("Failed to load book data:", error)
            toast.error("Không thể tải thông tin sách")
        }
    }

    const loadCategories = async () => {
        try {
            const categories = await executeCategories(() => booksApi.getCategories())
            if (categories) {
                const options: SelectOption[] = []

                const flattenCategory = (category: Category, parentPath = "") => {
                    const path = parentPath ? `${parentPath} -> ${category.name}` : category.name
                    options.push({ value: category.id, label: path })

                    if (category.subCategories && category.subCategories.length > 0) {
                        category.subCategories.forEach((subCategory) => {
                            flattenCategory(subCategory, path)
                        })
                    }
                }

                categories.forEach((category) => flattenCategory(category))
                setCategoryOptions(options)
            }
        } catch (error) {
            console.error("Failed to load categories:", error)
            toast.error("Không thể tải danh mục")
        }
    }

    const loadAuthors = async () => {
        try {
            const authors = await executeAuthors(() => booksApi.getAuthors())
            if (authors) {
                setAuthorOptions(authors.map((author) => ({ value: author.id, label: author.name })))
            }
        } catch (error) {
            console.error("Failed to load authors:", error)
            toast.error("Không thể tải tác giả")
        }
    }

    const loadPublishers = async () => {
        try {
            const publishers = await executePublishers(() => booksApi.getPublishers())
            if (publishers) {
                setPublisherOptions(publishers.map((publisher) => ({ value: publisher.id, label: publisher.name })))
            }
        } catch (error) {
            console.error("Failed to load publishers:", error)
            toast.error("Không thể tải nhà xuất bản")
        }
    }

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))

        if (errors[field]) {
            setErrors({ ...errors, [field]: "" })
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

    const handleTitleChange = (value: string) => {
        handleInputChange("name", value)
    }

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const formUpload = new FormData();

        for (let i = 0; i < files.length; i++) {
            formUpload.append("files", files[i]); // "files" là key name backend nhận
        }

        try {
            const response = await fetch("/api/uploads", {
                method: "POST",
                body: formUpload,
            });

            if (!response.ok) {
                throw new Error("Lỗi khi upload ảnh");
            }

            const uploadedUrls: string[] = await response.json();

            handleInputChange("images", [...(formData.images || []), uploadedUrls]);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Không thể upload ảnh. Vui lòng thử lại.");
        }
    };


    const removeImage = (index: number) => {
        const newImages = formData.images.filter((_: string, i: number) => i !== index)
        handleInputChange("images", newImages)
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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN").format(price)
    }

    const handleCategoryChange = (selectedOptions: any) => {
        const categoryIds = selectedOptions ? selectedOptions.map((option: SelectOption) => option.value) : []
        handleInputChange("categoryIds", categoryIds)
    }

    const handleAuthorChange = (selectedOptions: any) => {
        const authorIds = selectedOptions ? selectedOptions.map((option: SelectOption) => option.value) : []
        handleInputChange("authorIds", authorIds)
    }

    const handlePublisherChange = (selectedOptions: any) => {
        const publisherIds = selectedOptions ? selectedOptions.map((option: SelectOption) => option.value) : []
        handleInputChange("publisherIds", publisherIds)
    }

    const getSelectedCategories = () => {
        return categoryOptions.filter((option) => formData.categoryIds?.includes(option.value))
    }

    const getSelectedAuthors = () => {
        return authorOptions.filter((option) => formData.authorIds?.includes(option.value))
    }

    const getSelectedPublishers = () => {
        return publisherOptions.filter((option) => formData.publisherIds?.includes(option.value))
    }

    const hasDiscount =
        formData.originalPrice > 0 && formData.salePrice > 0 && formData.originalPrice > formData.salePrice

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name) newErrors.name = "Vui lòng nhập tên sách"
        if (!formData.isbn) newErrors.isbn = "Vui lòng nhập ISBN"
        if (!formData.fullDescription) newErrors.description = "Vui lòng nhập mô tả chi tiết"
        if (formData.pageCount <= 0) newErrors.pageCount = "Số trang phải lớn hơn 0"
        if (formData.originalPrice <= 0) newErrors.originalPrice = "Giá gốc phải lớn hơn 0"
        if (formData.salePrice <= 0) newErrors.salePrice = "Giá bán phải lớn hơn 0"
        if (formData.categoryIds.length === 0) newErrors.categoryIds = "Vui lòng chọn ít nhất một thể loại"
        if (formData.authorIds.length === 0) newErrors.authorIds = "Vui lòng chọn ít nhất một tác giả"
        if (formData.publisherIds.length === 0) newErrors.publisherIds = "Vui lòng chọn ít nhất một nhà xuất bản"

        if(!formData.language) newErrors.language  = "Vui lòng điền ngôn ngữ"
        // if (formData.initialStockQuantity <= 0)
        //     newErrors.initialStockQuantity = "Tồn kho ban đầu phải lớn hơn 0";
        if(formData.inventoryManagementMethodId == 0) {
            if (formData.costPrice <= 0) newErrors.costPrice = "Giá nhập phải lớn hơn 0"
        }

        if (formData.weight <= 0)
            newErrors.weight = "Khối lượng phải lớn hơn 0";

        if (formData.length <= 0)
            newErrors.length = "Chiều dài phải lớn hơn 0";

        if (formData.width <= 0)
            newErrors.width = "Chiều rộng phải lớn hơn 0";

        if (formData.height <= 0)
            newErrors.height = "Chiều cao phải lớn hơn 0";
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validateForm()) {
            toast.error("Vui lòng kiểm tra lại thông tin")
            return
        }

        setIsSaving(true)

        try {
            const bookData = {
                ...formData,
                tags,
                imageUrls: formData.images.flat()
            }

            console.log(bookData)
            let result

            if (bookId) {
                result = await executeSave(() => booksApi.updateBookBasicInfo(bookId, bookData))
                if (result) {
                    toast.success("Cập nhật thông tin cơ bản thành công")
                    if (onSaved) onSaved(bookId)
                }
            } else {
                result = await executeSave(() => booksApi.createBook(bookData))
                if (result && result.id) {
                    toast.success("Tạo sách mới thành công")
                    console.log(result)
                    if (onSaved) onSaved(result.id)

                }
            }
            router("/admin/books")
        } catch (error) {
            console.error("Failed to save book:", error)
            toast.error("Lỗi khi lưu thông tin sách")
        } finally {
            setIsSaving(false)
        }
    }

    const isLoading = bookLoading || categoriesLoading || authorsLoading || publishersLoading || saveLoading

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thông tin chung</h3>

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">
                            Tên sách <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name || ""}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="Nhập tên sách"
                            className={errors.name ? "border-red-500" : ""}
                            disabled={isLoading}
                        />
                        {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="shortDescription">Mô tả ngắn</Label>
                        <Input
                            id="shortDescription"
                            value={formData.shortDescription || ""}
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
                            value={formData.fullDescription || ""}
                            onChange={(e) => handleInputChange("fullDescription", e.target.value)}
                            placeholder="Mô tả chi tiết về nội dung sách"
                            className={`min-h-[120px] ${errors.description ? "border-red-500" : ""}`}
                            disabled={isLoading}
                        />
                        {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
                    </div>
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thể loại</h3>
                <div className="grid gap-2">
                    <Label htmlFor="categories">Chọn thể loại</Label>
                    <Select
                        id="categories"
                        isMulti
                        options={categoryOptions}
                        value={getSelectedCategories()}
                        onChange={handleCategoryChange}
                        placeholder="Chọn thể loại"
                        isDisabled={isLoading}
                        className={errors.categoryIds ? "border-red-500" : ""}
                        classNamePrefix="react-select"
                    />
                    {errors.categoryIds && <span className="text-sm text-red-500">{errors.categoryIds}</span>}
                    {(formData.categoryIds?.length || 0) === 0 && (
                        <p className="text-sm text-gray-500">Vui lòng chọn ít nhất một thể loại</p>
                    )}
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tác giả</h3>
                <div className="grid gap-2">
                    <Label htmlFor="authors">Chọn tác giả</Label>
                    <Select
                        id="authors"
                        isMulti
                        options={authorOptions}
                        value={getSelectedAuthors()}
                        onChange={handleAuthorChange}
                        placeholder="Chọn tác giả"
                        isDisabled={isLoading}
                        className={errors.authorIds ? "border-red-500" : ""}
                        classNamePrefix="react-select"
                    />
                    {errors.authorIds && <span className="text-sm text-red-500">{errors.authorIds}</span>}
                    {(formData.authorIds?.length || 0) === 0 && (
                        <p className="text-sm text-gray-500">Vui lòng chọn ít nhất một tác giả</p>
                    )}
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Nhà xuất bản</h3>
                <div className="grid gap-2">
                    <Label htmlFor="publishers">Chọn nhà xuất bản</Label>
                    <Select
                        id="publishers"
                        isMulti
                        options={publisherOptions}
                        value={getSelectedPublishers()}
                        onChange={handlePublisherChange}
                        placeholder="Chọn nhà xuất bản"
                        isDisabled={isLoading}
                        className={errors.publisherIds ? "border-red-500" : ""}
                        classNamePrefix="react-select"
                    />
                    {errors.publisherIds && <span className="text-sm text-red-500">{errors.publisherIds}</span>}
                    {(formData.publisherIds?.length || 0) === 0 && (
                        <p className="text-sm text-gray-500">Vui lòng chọn ít nhất một nhà xuất bản</p>
                    )}
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Chi tiết sách</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="isbn">
                            ISBN <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="isbn"
                            value={formData.isbn || ""}
                            onChange={(e) => handleInputChange("isbn", e.target.value)}
                            placeholder="9786041141234"
                            className={errors.isbn ? "border-red-500" : ""}
                            disabled={isLoading}
                        />
                        {errors.isbn && <span className="text-sm text-red-500">{errors.isbn}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="pageCount">
                            Số trang <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="pageCount"
                            type="number"
                            value={formData.pageCount || 0}
                            onChange={(e) => handleInputChange("pageCount", Number.parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className={errors.pageCount ? "border-red-500" : ""}
                            disabled={isLoading}
                        />
                        {errors.pageCount && <span className="text-sm text-red-500">{errors.pageCount}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Initial Stock Quantity */}
                    {/*<div className="grid gap-2 col-span-1">*/}
                    {/*    <Label htmlFor="initialStockQuantity">*/}
                    {/*        Số lượng ban đầu <span className="text-red-500">*</span>*/}
                    {/*    </Label>*/}
                    {/*    <Input*/}
                    {/*        id="initialStockQuantity"*/}
                    {/*        type="number"*/}
                    {/*        value={formData.initialStockQuantity || 0}*/}
                    {/*        onChange={(e) => handleInputChange("initialStockQuantity", Number.parseInt(e.target.value) || 0)}*/}
                    {/*        placeholder="Nhập số lượng ban đầu"*/}
                    {/*        className={errors.initialStockQuantity ? "border-red-500" : ""}*/}
                    {/*        disabled={isLoading}*/}
                    {/*    />*/}
                    {/*    {errors.initialStockQuantity && (*/}
                    {/*        <span className="text-sm text-red-500">{errors.initialStockQuantity}</span>*/}
                    {/*    )}*/}
                    {/*</div>*/}

                    {/* Weight */}
                    <div className="grid gap-2 col-span-1">
                        <Label htmlFor="weight">
                            Khối lượng (gram) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="weight"
                            type="number"
                            value={formData.weight || 0}
                            onChange={(e) => handleInputChange("weight", Number.parseInt(e.target.value) || 0)}
                            placeholder="Nhập khối lượng"
                            className={errors.weight ? "border-red-500" : ""}
                            disabled={isLoading}
                        />
                        {errors.weight && <span className="text-sm text-red-500">{errors.weight}</span>}
                    </div>

                    <div className="grid gap-2 col-span-1">
                        <Label htmlFor="length">
                            Chiều dài (cm) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="length"
                            type="number"
                            value={formData.length || 0}
                            onChange={(e) => handleInputChange("length", Number.parseInt(e.target.value) || 0)}
                            placeholder="Nhập chiều dài"
                            className={errors.length ? "border-red-500" : ""}
                            disabled={isLoading}
                        />
                        {errors.length && <span className="text-sm text-red-500">{errors.length}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="grid gap-2 col-span-1">
                        <Label htmlFor="width">
                            Chiều rộng (cm) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="width"
                            type="number"
                            value={formData.width || 0}
                            onChange={(e) => handleInputChange("width", Number.parseInt(e.target.value) || 0)}
                            placeholder="Nhập chiều rộng"
                            className={errors.width ? "border-red-500" : ""}
                            disabled={isLoading}
                        />
                        {errors.width && <span className="text-sm text-red-500">{errors.width}</span>}
                    </div>

                    <div className="grid gap-2 col-span-1">
                        <Label htmlFor="height">
                            Chiều cao (cm) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="height"
                            type="number"
                            value={formData.height || 0}
                            onChange={(e) => handleInputChange("height", Number.parseInt(e.target.value) || 0)}
                            placeholder="Nhập chiều cao"
                            className={errors.height ? "border-red-500" : ""}
                            disabled={isLoading}
                        />
                        {errors.height && <span className="text-sm text-red-500">{errors.height}</span>}
                    </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/*<div className="grid gap-2">*/}
                    {/*    <Label htmlFor="language">*/}
                    {/*        Ngôn ngữ (ID) <span className="text-red-500">*</span>*/}
                    {/*    </Label>*/}
                    {/*    <Input*/}
                    {/*        id="language"*/}
                    {/*        type="number"*/}
                    {/*        min={1}*/}
                    {/*        placeholder="Nhập ID ngôn ngữ (ví dụ: 1)"*/}
                    {/*        value={formData.language || 0}*/}
                    {/*        onChange={(e) => handleInputChange("language", Number.parseInt(e.target.value) || 0)}*/}
                    {/*        disabled={isLoading}*/}
                    {/*        className={errors.language ? "border-red-500" : ""}*/}
                    {/*    />*/}
                    {/*    {errors.language && <span className="text-sm text-red-500">{errors.language}</span>}*/}
                    {/*</div>*/}

                    <div className="grid gap-2">
                        <Label htmlFor="language">
                            Ngôn ngữ <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="language"
                            type="text"
                            placeholder="Nhập tên ngôn ngữ (ví dụ: Tiếng Việt)"
                            value={formData.language || ""}
                            onChange={(e) => handleInputChange("language", e.target.value)}
                            disabled={isLoading}
                            className={errors.language ? "border-red-500" : ""}
                        />
                        {errors.language && <span className="text-sm text-red-500">{errors.language}</span>}
                    </div>


                    <div className="grid gap-2">
                        <Label htmlFor="publishedDate">Ngày xuất bản</Label>
                        <Input
                            id="publishedDate"
                            type="date"
                            value={formData.publishedDate || ""}
                            onChange={(e) => handleInputChange("publishedDate", e.target.value)}
                            disabled={isLoading}
                            className="max-w-xs"
                        />
                    </div>
                </div>

                {/*<div className="flex items-center space-x-2">*/}
                {/*    <input*/}
                {/*        type="checkbox"*/}
                {/*        id="isGift"*/}
                {/*        checked={formData.isGift || false}*/}
                {/*        onChange={(e) => handleInputChange("isGift", e.target.checked)}*/}
                {/*        disabled={isLoading}*/}
                {/*        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"*/}
                {/*    />*/}
                {/*    <Label htmlFor="isGift">Là quà tặng</Label>*/}
                {/*</div>*/}
            </div>

            <Separator/>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Hình ảnh</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(formData.images || []).map((image: string, index: number) => (
                        <div key={index} className="relative group">
                            <div className="aspect-[3/4] relative overflow-hidden rounded-lg border">
                                <img src={image || "/placeholder.svg"} alt={`Book image ${index + 1}`}
                                     className="object-cover"/>
                            </div>

                            <div
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => removeImage(index)}
                                    disabled={isLoading}
                                >
                                    <X className="h-3 w-3"/>
                                </Button>
                            </div>
                        </div>
                    ))}

                    <div
                        className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                        <label className="cursor-pointer flex flex-col items-center p-4 text-center">
                            <Upload className="h-8 w-8 text-gray-400 mb-2"/>
                            <span className="text-sm text-gray-500 mb-1">Tải ảnh lên</span>
                            <span className="text-xs text-gray-400">PNG, JPG, WEBP</span>
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

                {(formData.images || []).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300"/>
                        <p>Chưa có hình ảnh nào</p>
                        <p className="text-sm">Tải lên ít nhất một hình ảnh</p>
                    </div>
                )}
            </div>

            <Separator/>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Giá & Kho hàng</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/*<div className="grid gap-2">*/}
                    {/*    <Label htmlFor="costPrice">Giá nhập (VNĐ)</Label>*/}
                    {/*    <Input*/}
                    {/*        id="costPrice"*/}
                    {/*        type="number"*/}
                    {/*        value={formData.costPrice || 0}*/}
                    {/*        onChange={(e) => handleInputChange("costPrice", Number.parseInt(e.target.value) || 0)}*/}
                    {/*        placeholder="0"*/}
                    {/*        disabled={isLoading}*/}
                    {/*    />*/}
                    {/*</div>*/}

                    <div className="grid gap-2">
                        <Label htmlFor="originalPrice">
                            Giá gốc (VNĐ) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="originalPrice"
                            type="number"
                            value={formData.originalPrice || 0}
                            onChange={(e) => handleInputChange("originalPrice", Number.parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className={errors.originalPrice ? "border-red-500" : ""}
                            disabled={isLoading}
                        />
                        {errors.originalPrice && <span className="text-sm text-red-500">{errors.originalPrice}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="salePrice">
                            Giá bán (VNĐ) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="salePrice"
                            type="number"
                            value={formData.salePrice || 0}
                            onChange={(e) => handleInputChange("salePrice", Number.parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className={errors.salePrice ? "border-red-500" : ""}
                            disabled={isLoading}
                        />
                        {errors.salePrice && <span className="text-sm text-red-500">{errors.salePrice}</span>}
                    </div>
                </div>

                {hasDiscount && (
                    <div className="space-y-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-700">
                                Giảm giá: {Math.round(((formData.originalPrice - formData.salePrice) / formData.originalPrice) * 100)}%
                                ({formatPrice(formData.originalPrice - formData.salePrice)} VNĐ)
                            </p>
                        </div>

                        <div className="grid gap-2 max-w-xs">
                            <Label htmlFor="displayOrderAsSale">Thứ tự hiển thị trong mục giảm giá</Label>
                            <Input
                                id="displayOrderAsSale"
                                type="number"
                                value={formData.displayOrderAsSale || 0}
                                onChange={(e) => handleInputChange("displayOrderAsSale", Number.parseInt(e.target.value) || 0)}
                                placeholder="0"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-4 border-t pt-4">
                    <div>
                        <Label className="text-base font-medium">Quản lý tồn kho</Label>
                        <p className="text-sm text-gray-600 mb-4">Chọn cách thức theo dõi tồn kho cho sản phẩm</p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="inventory-none"
                                name="inventoryType"
                                checked={formData.inventoryManagementMethodId === 0}
                                onChange={() => handleInputChange("inventoryManagementMethodId", 0)}
                                disabled={isLoading}
                            />
                            <Label htmlFor="inventory-none" className="flex-1">
                                <div>
                                    <div className="font-medium">Không theo dõi</div>
                                    <div className="text-sm text-gray-600">Khách hàng có thể mua không giới hạn số lượng</div>
                                </div>
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="inventory-simple"
                                name="inventoryType"
                                checked={formData.inventoryManagementMethodId === 1}
                                onChange={() => handleInputChange("inventoryManagementMethodId", 1)}
                                disabled={isLoading}
                            />
                            <Label htmlFor="inventory-simple" className="flex-1">
                                <div>
                                    <div className="font-medium">Theo dõi</div>
                                    <div className="text-sm text-gray-600">Nhập một số lượng tồn kho  cho sản phẩm</div>
                                </div>
                            </Label>
                        </div>

                        {/*<div className="flex items-center space-x-2">*/}
                        {/*    <input*/}
                        {/*        type="radio"*/}
                        {/*        id="inventory-attributes"*/}
                        {/*        name="inventoryType"*/}
                        {/*        checked={formData.inventoryManagementMethodId === 2}*/}
                        {/*        onChange={() => handleInputChange("inventoryManagementMethodId", 2)}*/}
                        {/*        disabled={isLoading}*/}
                        {/*    />*/}
                        {/*    <Label htmlFor="inventory-attributes" className="flex-1">*/}
                        {/*        <div>*/}
                        {/*            <div className="font-medium">Theo thuộc tính</div>*/}
                        {/*            <div className="text-sm text-gray-600">*/}
                        {/*                Quản lý tồn kho riêng cho từng tổ hợp thuộc tính (quản lý qua section Thuộc tính)*/}
                        {/*            </div>*/}
                        {/*        </div>*/}
                        {/*    </Label>*/}
                        {/*</div>*/}
                    </div>

                    {/* Simple Inventory Settings */}
                    {formData.inventoryManagementMethodId === 1 && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                            {/*<div className="grid gap-2">*/}
                            {/*    <Label htmlFor="stockQuantity">*/}
                            {/*        Số lượng tồn kho <span className="text-red-500">*</span>*/}
                            {/*    </Label>*/}
                            {/*    <Input*/}
                            {/*        id="stockQuantity"*/}
                            {/*        type="number"*/}
                            {/*        value={formData.stockQuantity || 0}*/}
                            {/*        onChange={(e) => handleInputChange("stockQuantity", Number.parseInt(e.target.value) || 0)}*/}
                            {/*        placeholder="0"*/}
                            {/*        className={errors.stockQuantity ? "border-red-500" : ""}*/}
                            {/*        disabled={isLoading}*/}
                            {/*    />*/}
                            {/*    {errors.stockQuantity && <span className="text-sm text-red-500">{errors.stockQuantity}</span>}*/}
                            {/*</div>*/}

                            <div className="grid gap-2">
                                <Label htmlFor="lowStockThreshold" className="text-sm">
                                    Ngưỡng cảnh báo hết hàng
                                </Label>
                                <Input
                                    id="lowStockThreshold"
                                    type="number"
                                    min="0"
                                    value={formData.lowStockThreshold || 0}
                                    onChange={(e) => handleInputChange("lowStockThreshold", Number.parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    className="max-w-xs"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    )}
                    {formData.inventoryManagementMethodId === 0 && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">

                            <div className="grid gap-2">
                                <Label htmlFor="lowStockThreshold" className="text-sm">
                                     Giá nhập
                                </Label>
                                <Input
                                    id="costPrice"
                                    type="number"
                                    min="0"
                                    value={formData.costPrice || 0}
                                    onChange={(e) => handleInputChange("costPrice", Number.parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    className="max-w-xs"
                                    disabled={isLoading}
                                />
                                {errors.costPrice && <span className="text-sm text-red-500">{errors.costPrice}</span>}

                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Separator />

            {/* Cài đặt hiển thị */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cài đặt hiển thị</h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Xuất bản</Label>
                            <div className="text-sm text-gray-600">Sản phẩm sẽ hiển thị trên website</div>
                        </div>
                        <Switch
                            checked={formData.published || false}
                            onCheckedChange={(checked) => handleInputChange("published", checked)}
                            disabled={isLoading}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Đánh dấu là Bestseller</Label>
                            <div className="text-sm text-gray-600">Sản phẩm sẽ được đánh dấu là bestseller</div>
                        </div>
                        <Switch
                            checked={formData.markAsBestseller || false}
                            onCheckedChange={(checked) => handleInputChange("markAsBestseller", checked)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Đánh dấu là sản phẩm mới</Label>
                            <div className="text-sm text-gray-600">Sản phẩm sẽ được đánh dấu là mới</div>
                        </div>
                        <Switch
                            checked={formData.markAsNew || false}
                            onCheckedChange={(checked) => handleInputChange("markAsNew", checked)}
                            disabled={isLoading}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Hiển thị là sản phẩm mới trên trang chủ</Label>
                        </div>
                        <Switch
                            checked={formData.isShowAsNewOnHome || false}
                            onCheckedChange={(checked) => handleInputChange("isShowAsNewOnHome", checked)}
                            disabled={isLoading}
                        />
                    </div>

                    {formData.isShowAsNewOnHome && (
                        <div className="ml-4 grid gap-2">
                            <Label htmlFor="displayOrderAsNew">Thứ tự hiển thị</Label>
                            <Input
                                id="displayOrderAsNew"
                                type="number"
                                value={formData.displayOrderAsNew || 0}
                                onChange={(e) => handleInputChange("displayOrderAsNew", Number.parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="w-48"
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Hiển thị là bestseller trên trang chủ</Label>
                        </div>
                        <Switch
                            checked={formData.isShowAsBestsellerOnHome || false}
                            onCheckedChange={(checked) => handleInputChange("isShowAsBestsellerOnHome", checked)}
                            disabled={isLoading}
                        />
                    </div>

                    {formData.isShowAsBestsellerOnHome && (
                        <div className="ml-4 grid gap-2">
                            <Label htmlFor="displayOrderBestseller">Thứ tự hiển thị</Label>
                            <Input
                                id="displayOrderBestseller"
                                type="number"
                                value={formData.displayOrderBestseller || 0}
                                onChange={(e) => handleInputChange("displayOrderBestseller", Number.parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="w-48"
                                disabled={isLoading}
                            />
                        </div>
                    )}
                </div>
            </div>

            <CardFooter className="flex justify-end border-t pt-4">
                <Button onClick={handleSave} disabled={isLoading || isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Đang lưu..." : "Lưu thông tin cơ bản"}
                </Button>
            </CardFooter>
        </div>
    )
}
