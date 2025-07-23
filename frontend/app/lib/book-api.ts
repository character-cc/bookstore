// Thêm các interface mới vào file book-api.ts

export interface AttributeCombination {
    id: number
    bookId: number
    attributes: { [key: string]: number } // Dictionary of attribute ID -> value ID
    sku: string
    price: number
    lowStockThreshold: number
    stockQuantity: number
    isActive: boolean
    allowOutOfStock?: boolean
    overriddenPrice?: number
    notifyAdminForQuantityBelow?: number
    createdAt: string
    updatedAt: string
}

export interface InventoryTracking {
    type: "none" | "simple" | "by_attributes"
    trackQuantity: boolean
    allowBackorders: boolean
    lowStockThreshold?: number
    attributeCombinations?: InventoryAttributeCombination[]
}

export interface InventoryAttributeCombination {
    id: number
    attributeValues: { [attributeId: number]: number } // attributeId -> valueId
    sku: string
    quantity: number
    price?: number
}

export interface CustomAttribute {
    id: number
    bookId: number
    name: string
    textPrompt?: string
    isRequired?: boolean
    controlType: string
    customAttributeTypeId : number
    displayOrder?: number
    tooltip?: string
    values?: AttributeValue[]
    createdAt: string
    updatedAt: string
}

export interface AttributeValue {
    id: number
    attributeId: number
    value: string,
    name: string
    label: string
    priceAdjustment: number
    isPreSelected: boolean
    displayOrder: number
    isVariant: boolean
    createdAt: string
    updatedAt: string
}

export interface BookImage {
    id: number
    bookId: number
    imageUrl: string
    createdAt: string
    updatedAt: string
}

export interface Book {
    id: number;
    name: string;
    isbn: string;
    costPrice: number;
    originalPrice: number;
    salePrice: number;
    published: boolean;
    shortDescription: string;
    description: string;
    languageId: number;
    isDeleted: boolean;
    isGift: boolean;
    pageCount: number;
    inventoryManagementMethodId: number;
    stockQuantity: number;
    lowStockThreshold: number;
    markAsBestseller: boolean;
    markAsNew: boolean;
    isShowAsNewOnHome: boolean;
    isShowAsBestsellerOnHome: boolean;
    displayOrderBestseller: number;
    displayOrderAsNew: number;
    displayOrderAsSale: number;
    createdAt: string;
    updatedAt: string;
    categories: any[];
    authors: any[];
    publishers: any[];
    images: any[];
    attributes: any[];
    attributeCombinations: any[];
    tags: string[];
}

export interface Category {
    id: number
    name: string
    slug: string
    description?: string
    parentId?: number
    isActive: boolean
    sortOrder: number
    createdAt: string
    updatedAt: string
}

export interface Author {
    id: number
    name: string
    slug: string
    biography?: string
    avatar?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface Publisher {
    id: number
    name: string
    slug: string
    description?: string
    logo?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}



export interface SpecificationAttribute {
    id: number
    name: string
    displayName: string
    type: "text" | "number" | "select" | "boolean"
    isFilterable: boolean // Có thể dùng để filter không
    isActive: boolean
    sortOrder: number
    values?: SpecificationAttributeValue[]
}

export interface SpecificationAttributeValue {
    id: number
    attributeId: number
    value: string
    displayName: string
    sortOrder: number
    isActive: boolean
}

export interface Discount {
    id: number
    name: string
    type: "percentage" | "fixed" | "buy_x_get_y"
    value: number
    startDate: string
    endDate: string
    isActive: boolean
    minQuantity?: number
    maxUsage?: number
    currentUsage: number
}

export interface InventoryTracking {
    type: "none" | "simple" | "by_attributes"
    trackQuantity: boolean
    allowBackorders: boolean
    lowStockThreshold?: number
    attributeCombinations?: InventoryAttributeCombination[]
}

export interface InventoryAttributeCombination {
    id: number
    attributeValues: { [attributeId: number]: number } // attributeId -> valueId
    sku: string
    quantity: number
    price?: number // Giá riêng cho combination này
}

export interface DisplaySettings {
    showOnHomepage: boolean
    showInFeatured: boolean
    showInNewReleases: boolean
    showInBestsellers: boolean
    showInDiscounted: boolean
    featuredOrder?: number
}

export interface Book {
    id: number
    title: string
    slug: string
    description: string
    shortDescription: string
    isbn: string
    price: number
    originalPrice: number
    discountPercent: number
    stock: number
    pages: number
    weight: number
    dimensions: string
    language: string
    publishedDate: string
    coverImage: string
    images: string[]
    isActive: boolean
    isFeatured: boolean
    isNewRelease: boolean
    isBestseller: boolean
    viewCount: number
    soldCount: number
    rating: number
    reviewCount: number
    categoryId: number
    category: Category
    authorId: number
    author: Author
    publisherId: number
    publisher: Publisher
    tags: string[]

    displaySettings: DisplaySettings
    customAttributes: { [attributeId: number]: any }
    specificationAttributes: { [attributeId: number]: any }
    appliedDiscounts: number[] // Discount IDs
    inventoryTracking: InventoryTracking
    crossSellProducts: number[] // Product IDs
    relatedProducts: number[] // Product IDs
    bundleProducts: { productId: number; quantity: number; isFree: boolean }[]

    createdAt: string
    updatedAt: string
}

export interface BookReview {
    id: number
    bookId: number
    userId: number
    userName: string
    userAvatar?: string
    rating: number
    title: string
    content: string
    isVerifiedPurchase: boolean
    helpfulCount: number
    createdAt: string
    updatedAt: string
}

export interface BookFilter {
    search?: string
    categoryId?: number
    authorId?: number
    publisherId?: number
    minPrice?: number
    maxPrice?: number
    isActive?: boolean
    isFeatured?: boolean
    isNewRelease?: boolean
    isBestseller?: boolean
    specificationFilters?: { [attributeId: number]: any }
    sortBy?: string
    sortDesc?: boolean
    page?: number
    limit?: number
}

// export interface AttributeCombination {
//     id: number
//     productId: number
//     attributes: { [attributeId: number]: number }
//     stockQuantity: number
//     allowOutOfStock: boolean
//     sku: string
//     manufacturerPartNumber?: string
//     gtin?: string
//     overriddenPrice?: number
//     notifyAdminForQuantityBelow?: number
//     pictureId?: number
// }

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

// Thêm các API methods mới
export const booksApi = {
    // Các methods hiện có...

    getBooks : async (data : any) => {
        const response = await fetch("http://localhost/api/admin/books/search",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        if (!response.ok) {
            throw response
        }
        return await response.json()
    },

    createCustomAttribute : async(bookId :number,data : any) => {
        const response = await fetch("http://localhost/api/admin/books/" + bookId +"/custom-attributes",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw response;
        }
        return await response.json();
    },

    updateCustomAttribute : async(bookId :number,data : any) => {
        const response = await fetch("http://localhost/api/admin/books/" + bookId +"/custom-attributes",{
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        if (!response.ok) {
            throw response;
        }
        return await response.json();
    },
    // Custom Attributes API
    getCustomAttributes: async (bookId?: number) => {
       const response = await fetch("http://localhost/api/admin/books/" + bookId + "/custom-attributes");
       if (!response.ok) {
           throw response;
       }
       return await response.json();
    },

    getCustomAttribute: async (bookId: number , attributeId :number) => {
        const response = await fetch("http://localhost/api/admin/books/" + bookId + "/custom-attributes/" + attributeId );
        if (!response.ok) {
            throw response;
        }
        return await response.json();
    },

    getAttributeCombinations: async (bookId?: number): Promise<AttributeCombination[]> => {
        await delay(300)
        if (!bookId) return []

        // Mock data
        return [
            {
                id: 1,
                bookId,
                attributes: { "1": 1, "2": 4 }, // Đỏ, Nhỏ
                sku: "BOOK-RED-S",
                price: 100000,
                lowStockThreshold: 5,
                stockQuantity: 10,
                isActive: true,
                allowOutOfStock: false,
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01",
            },
            {
                id: 2,
                bookId,
                attributes: { "1": 1, "2": 5 }, // Đỏ, Vừa
                sku: "BOOK-RED-M",
                price: 110000,
                lowStockThreshold: 5,
                stockQuantity: 15,
                isActive: true,
                allowOutOfStock: false,
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01",
            },
            {
                id: 3,
                bookId,
                attributes: { "1": 2, "2": 5 }, // Xanh, Vừa
                sku: "BOOK-BLUE-M",
                price: 110000,
                lowStockThreshold: 5,
                stockQuantity: 8,
                isActive: true,
                allowOutOfStock: true,
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01",
            },
        ]
    },

    generateAttributeCombinations: async (
        bookId: number,
        attributeValues: { [attributeId: number]: number[] },
    ): Promise<AttributeCombination[]> => {
        await delay(500)
        // Mock implementation - in real app, this would generate combinations based on selected values
        return [
            {
                id: 4,
                bookId,
                attributes: { "1": 2, "2": 6 }, // Xanh, Lớn
                sku: "BOOK-BLUE-L",
                price: 125000,
                lowStockThreshold: 5,
                stockQuantity: 12,
                isActive: true,
                allowOutOfStock: false,
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01",
            },
            {
                id: 5,
                bookId,
                attributes: { "1": 3, "2": 5 }, // Lục, Vừa
                sku: "BOOK-GREEN-M",
                price: 110000,
                lowStockThreshold: 5,
                stockQuantity: 7,
                isActive: true,
                allowOutOfStock: false,
                createdAt: "2024-01-01",
                updatedAt: "2024-01-01",
            },
        ]
    },

    deleteAttributeCombination: async (combinationId: number): Promise<void> => {
        await delay(300)
        // Mock implementation - in real app, this would delete the combination
        console.log(`Deleted combination ${combinationId}`)
    },

    updateBookAttributes: async (bookId: number, attributesData: any): Promise<void> => {
        await delay(500)
        // Mock implementation - in real app, this would update the book's attributes
        console.log(`Updated attributes for book ${bookId}`, attributesData)
    },

    // Product Relations API
    getBookRelations: async (bookId: number): Promise<any> => {
        await delay(300)
        // Mock data
        return {
            crossSellProducts: [1, 2, 3],
            relatedProducts: [4, 5],
            bundleProducts: [
                { productId: 6, quantity: 1, isFree: true, displayOrder: 1 },
                { productId: 7, quantity: 2, isFree: false, overridePrice: 50000, displayOrder: 2 },
            ],
        }
    },

    updateBookRelations: async (bookId: number, relationsData: any): Promise<void> => {
        await delay(500)
        // Mock implementation - in real app, this would update the book's relations
        console.log(`Updated relations for book ${bookId}`, relationsData)
    },

    // Get book by ID with full details
    getBook: async (bookId: number): Promise<Book> => {
        const response = await fetch(`http://localhost/api/books/${bookId}`)
        if (!response.ok) throw response
        return response.json()
    },

    // Create a new book with basic information
    createBook: async (bookData: any): Promise<Book> => {
        const response = await fetch("http://localhost/api/admin/books",{

            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bookData),
        })
        if (!response.ok) throw response
        return response.json()
    },

    updateBook: async (bookId: number, bookData: any): Promise<Book> => {
        const response = await fetch(`http://localhost/api/admin/books/${bookId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bookData),
        })
        if (!response.ok) throw response
        return response.json()
    },

    getCategories: async () => {
        const response = await fetch("http://localhost/api/categories/all",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if(!response.ok){
            throw response;
        }
        return await response.json();
    },

    getAuthors: async () => {
        const response = await fetch("http://localhost/api/authors");
        if(!response.ok){
            throw response;
        }
        return await response.json();
    },

    getPublishers: async () => {
        const response = await fetch("http://localhost/api/publishers");
        if (!response.ok) {
            throw response;
        }
        return await response.json();
    },

    // Update basic information of an existing book
    updateBookBasicInfo: async (bookId: number, bookData: any): Promise<Book> => {
        const response = await fetch(`http://localhost/api/admin/books/${bookId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bookData)
        })
        if (!response.ok){
            throw response;
        }
        return await response.json();
    },

    // Update book attributes
    updateBookDiscounts: async (bookId: number, discountsData: any): Promise<void> => {
        await delay(500)
        // Mock implementation
        console.log(`Updated discounts for book ${bookId}`, discountsData)
    },
}
