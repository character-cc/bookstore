// Mock API functions - Replace with real API calls
import {number, string} from "zod";

export const API_BASE_URL = "http://localhost" // hoặc lấy từ .env

export interface RoleOption {
    label: string
    value: number
}

export interface GenderOption {
    label: string
    value: number
    systemName: string
}

export interface User {
    id: number
    firstName: string
    lastName: string
    fullName: string
    username : string
    email: string
    phoneNumber: string
    gender: number
    isActive: boolean
    roles: Role[]
    dateOfBirth: string
    createdAt: string
    lastLogin: string
    avatar?: string
    notes?: string
}

export interface Role{
    id: number
    friendlyName: string
    systemName: string
    isActive: boolean
    isFreeShipping : boolean
    isSystemRole: boolean
}

export interface Address {
    id: number
    userId: number
    title: string // Tên địa chỉ (Nhà riêng, Công ty, etc.)
    recipientName: string // Tên người nhận
    recipientPhone: string // SĐT người nhận
    provinceId: number // Tỉnh/Thành phố
    districtId: number // Quận/Huyện
    wardId: number // Phường/Xã
    streetAddress: string // Địa chỉ chi tiết
    fullAddress: string // Địa chỉ đầy đủ (auto-generated)
    isDefault: boolean
    addressType: number
    notes?: string // Ghi chú giao hàng
    createdAt: string
    updatedAt: string
}

export interface CustomAttribute {
    id: number
    name: string
    label: string
    type: "text" | "number" | "select" | "multiselect" | "boolean" | "date" | "textarea"
    description?: string
    isRequired: boolean
    isActive: boolean
    sortOrder: number
    validation?: {
        minLength?: number
        maxLength?: number
        min?: number
        max?: number
        pattern?: string
    }
    createdAt: string
    updatedAt: string
    valuesCount: number // Số lượng giá trị có sẵn
}

export interface AttributeValue {
    id: number
    attributeId: number
    value: string
    label: string
    isDefault: boolean
    sortOrder: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface Order {
    id: string
    userId: number
    status: "completed" | "shipping" | "pending" | "cancelled"
    orderDate: string
    totalAmount: number
    itemCount: number
}

export interface PaymentMethod {
    id: number
    userId: number
    type: "credit_card" | "e_wallet" | "bank_transfer"
    displayName: string
    details: string
    isDefault: boolean
}

export interface NotificationSettings {
    userId: number
    emailPromotions: boolean
    smsOrders: boolean
    emailNewProducts: boolean
}

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const customAttributesApi = {
    getAttributes: async (filters?: {
        search?: string
        type?: string
        isActive?: boolean
        page?: number
        limit?: number
    }): Promise<{ data: CustomAttribute[]; total: number }> => {
        await delay(500)

        const mockAttributes: CustomAttribute[] = [
            {
                id: 1,
                name: "customer_level",
                label: "Cấp độ khách hàng",
                type: "select",
                description: "Phân loại cấp độ khách hàng dựa trên doanh số",
                isRequired: false,
                isActive: true,
                sortOrder: 1,
                createdAt: "2024-01-15",
                updatedAt: "2024-01-15",
                valuesCount: 4,
            },
            {
                id: 2,
                name: "preferred_genre",
                label: "Thể loại sách yêu thích",
                type: "multiselect",
                description: "Các thể loại sách mà khách hàng quan tâm",
                isRequired: false,
                isActive: true,
                sortOrder: 2,
                createdAt: "2024-01-16",
                updatedAt: "2024-01-16",
                valuesCount: 8,
            },
            {
                id: 3,
                name: "birth_year",
                label: "Năm sinh",
                type: "number",
                description: "Năm sinh của khách hàng",
                isRequired: false,
                isActive: true,
                sortOrder: 3,
                validation: {
                    min: 1900,
                    max: 2010,
                },
                createdAt: "2024-01-17",
                updatedAt: "2024-01-17",
                valuesCount: 0,
            },
            {
                id: 4,
                name: "newsletter_subscription",
                label: "Đăng ký nhận tin",
                type: "boolean",
                description: "Khách hàng có muốn nhận newsletter không",
                isRequired: false,
                isActive: true,
                sortOrder: 4,
                createdAt: "2024-01-18",
                updatedAt: "2024-01-18",
                valuesCount: 0,
            },
            {
                id: 5,
                name: "special_notes",
                label: "Ghi chú đặc biệt",
                type: "textarea",
                description: "Ghi chú đặc biệt về khách hàng",
                isRequired: false,
                isActive: false,
                sortOrder: 5,
                validation: {
                    maxLength: 500,
                },
                createdAt: "2024-01-19",
                updatedAt: "2024-01-20",
                valuesCount: 0,
            },
        ]

        let filteredAttributes = mockAttributes

        if (filters?.search) {
            filteredAttributes = filteredAttributes.filter(
                (attr) =>
                    attr.label.toLowerCase().includes(filters.search!.toLowerCase()) ||
                    attr.name.toLowerCase().includes(filters.search!.toLowerCase()),
            )
        }

        if (filters?.type && filters.type !== "all") {
            filteredAttributes = filteredAttributes.filter((attr) => attr.type === filters.type)
        }

        if (filters?.isActive !== undefined) {
            filteredAttributes = filteredAttributes.filter((attr) => attr.isActive === filters.isActive)
        }

        return {
            data: filteredAttributes,
            total: filteredAttributes.length,
        }
    },

    getAttribute: async (id: number): Promise<CustomAttribute> => {
        await delay(300)

        return {
            id,
            name: "customer_level",
            label: "Cấp độ khách hàng",
            type: "select",
            description: "Phân loại cấp độ khách hàng dựa trên doanh số",
            isRequired: false,
            isActive: true,
            sortOrder: 1,
            createdAt: "2024-01-15",
            updatedAt: "2024-01-15",
            valuesCount: 4,
        }
    },

    createAttribute: async (
        attributeData: Omit<CustomAttribute, "id" | "createdAt" | "updatedAt" | "valuesCount">,
    ): Promise<CustomAttribute> => {
        await delay(600)

        return {
            ...attributeData,
            id: Math.floor(Math.random() * 10000),
            createdAt: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString().split("T")[0],
            valuesCount: 0,
        }
    },

    updateAttribute: async (id: number, attributeData: Partial<CustomAttribute>): Promise<CustomAttribute> => {
        await delay(500)

        return {
            id,
            name: attributeData.name || "customer_level",
            label: attributeData.label || "Cấp độ khách hàng",
            type: attributeData.type || "select",
            description: attributeData.description,
            isRequired: attributeData.isRequired ?? false,
            isActive: attributeData.isActive ?? true,
            sortOrder: attributeData.sortOrder || 1,
            validation: attributeData.validation,
            createdAt: "2024-01-15",
            updatedAt: new Date().toISOString().split("T")[0],
            valuesCount: 4,
        }
    },

    deleteAttribute: async (id: number): Promise<void> => {
        await delay(400)
    },

    // Attribute Values API
    getAttributeValues: async (attributeId: number): Promise<AttributeValue[]> => {
        await delay(300)

        if (attributeId === 1) {
            // Customer level values
            return [
                {
                    id: 1,
                    attributeId,
                    value: "bronze",
                    label: "Đồng",
                    isDefault: true,
                    sortOrder: 1,
                    isActive: true,
                    createdAt: "2024-01-15",
                    updatedAt: "2024-01-15",
                },
                {
                    id: 2,
                    attributeId,
                    value: "silver",
                    label: "Bạc",
                    isDefault: false,
                    sortOrder: 2,
                    isActive: true,
                    createdAt: "2024-01-15",
                    updatedAt: "2024-01-15",
                },
                {
                    id: 3,
                    attributeId,
                    value: "gold",
                    label: "Vàng",
                    isDefault: false,
                    sortOrder: 3,
                    isActive: true,
                    createdAt: "2024-01-15",
                    updatedAt: "2024-01-15",
                },
                {
                    id: 4,
                    attributeId,
                    value: "platinum",
                    label: "Bạch kim",
                    isDefault: false,
                    sortOrder: 4,
                    isActive: true,
                    createdAt: "2024-01-15",
                    updatedAt: "2024-01-15",
                },
            ]
        } else if (attributeId === 2) {
            // Preferred genre values
            return [
                {
                    id: 5,
                    attributeId,
                    value: "literature",
                    label: "Văn học",
                    isDefault: false,
                    sortOrder: 1,
                    isActive: true,
                    createdAt: "2024-01-16",
                    updatedAt: "2024-01-16",
                },
                {
                    id: 6,
                    attributeId,
                    value: "business",
                    label: "Kinh doanh",
                    isDefault: false,
                    sortOrder: 2,
                    isActive: true,
                    createdAt: "2024-01-16",
                    updatedAt: "2024-01-16",
                },
                {
                    id: 7,
                    attributeId,
                    value: "technology",
                    label: "Công nghệ",
                    isDefault: false,
                    sortOrder: 3,
                    isActive: true,
                    createdAt: "2024-01-16",
                    updatedAt: "2024-01-16",
                },
                {
                    id: 8,
                    attributeId,
                    value: "self_help",
                    label: "Kỹ năng sống",
                    isDefault: false,
                    sortOrder: 4,
                    isActive: true,
                    createdAt: "2024-01-16",
                    updatedAt: "2024-01-16",
                },
            ]
        }

        return []
    },

    createAttributeValue: async (
        valueData: Omit<AttributeValue, "id" | "createdAt" | "updatedAt">,
    ): Promise<AttributeValue> => {
        await delay(400)

        return {
            ...valueData,
            id: Math.floor(Math.random() * 10000),
            createdAt: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString().split("T")[0],
        }
    },

    updateAttributeValue: async (id: number, valueData: Partial<AttributeValue>): Promise<AttributeValue> => {
        await delay(400)

        return {
            id,
            attributeId: valueData.attributeId || 1,
            value: valueData.value || "bronze",
            label: valueData.label || "Đồng",
            isDefault: valueData.isDefault ?? false,
            sortOrder: valueData.sortOrder || 1,
            isActive: valueData.isActive ?? true,
            createdAt: "2024-01-15",
            updatedAt: new Date().toISOString().split("T")[0],
        }
    },

    deleteAttributeValue: async (id: number): Promise<void> => {
        await delay(300)
    },
}
// Users API
export const usersApi = {
    getUsers: async (filters?: {
        fullNameSearch?: string
        emailSearch?: string
        phoneNumber?: string
        isActive?: boolean
        roleIds?: number[]
        dateFrom?: string
        dateTo?: string
        sortBy?: string
        sortDesc?: boolean
        page?: number
        limit?: number
    }) => {
        const requestBody = {
            fullName: filters?.fullNameSearch,
            email: filters?.emailSearch,
            phoneNumber: filters?.phoneNumber,
            isActive: filters?.isActive,
            userRoleId: filters?.roleIds,
            fromDate: filters?.dateFrom,
            toDate: filters?.dateTo,
            sortBy: filters?.sortBy,
            sortDesc: filters?.sortDesc,
            pageIndex: filters?.page || 0,
            pageSize: filters?.limit || 10,
        }

        console.log(JSON.stringify(requestBody))
        const response = await fetch("http://localhost/api/admin/users/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
            throw new Error("Lỗi khi gọi API getUsers")
        }
        const result = await response.json()
        return result
    },

    getUser : async (userId: number) => {
        const response = await fetch("http://localhost/api/users/" + userId)
        if (!response.ok) {
            throw new Error("Lỗi khi gọi API getUser")
        }
        return response.json()
    },

    getRoles: async () => {
        const response = await fetch("http://localhost/api/admin/users/roles");
        if (!response.ok) {
            throw new Error(" Lỗi khi gọi API getRoles ")
        }
        return await response.json()
    },

    updateUserProfile: async (data : any) => {
        const response = await fetch("http://localhost/api/users/me/profile",{
            method: "PUT",
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

    bulkSetIsActive: async (userIds: number[], isActive: boolean) => {
        const res = await fetch("http://localhost/api/admin/users/set-active", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userIds, isActive }),
        })
        if (!res.ok) {
            throw new Error("Failed to update active status")
        }
        return
    },

    getGenders: async () => {
        const response = await fetch("http://localhost/api/users/enum/genders");
        if (!response.ok) {
            throw new Error("Failed to get genders")
        }
        return await response.json()
    },

    createUser: async (userData : any) => {
        const response = await fetch("http://localhost/api/admin/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData)
        })
        if(!response.ok){
            throw response
        }
        return await response.json()
    },

    updateUser: async (userData : any) => {
        const response = await fetch("http://localhost/api/admin/users", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData)
        })
        if(!response.ok){
            throw response
        }
        return await response.json()
    },

    bulkDeleteUsers: async (userIds: number[]) => {
        const res = await fetch("http://localhost/api/admin/users/bulk-delete", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userIds }),
        })
        if (!res.ok) {
            throw new Error("Failed to delete users")
        }
        return
    },

    bulkUpdateUsers: async (userIds: number[], action: "activate" | "suspend" | "delete"): Promise<void> => {
        await delay(1000)
        // Mock bulk action
    },

}

// Addresses API
export const addressesApi = {
    getUserAddresses: async (userId: number) => {
       const response = await fetch("http://localhost/api/admin/users/" + userId +"/addresses")
        if (!response.ok) {
            throw new Error("Failed to get address")
        }
        return await response.json()
    },

    getAddressTypes: async ()=> {
        const response = await fetch("http://localhost/api/users/enum/address-types")
        if (!response.ok) {
            throw response
        }
        return await response.json()
    },

    createAddress: async (addressData : any , userId : number) => {
        const response = await fetch("http://localhost/api/admin/users/" + userId +"/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json",},
            body: JSON.stringify(addressData)
        })
        if(!response.ok){
            throw response
        }
        return await response.json()
    },

    updateAddress: async (addressData : any , userId: number) => {
        const response = await fetch("http://localhost/api/admin/users/" + userId +"/addresses", {
            method: "PUT",
            headers: { "Content-Type": "application/json",},
            body: JSON.stringify(addressData)
        })
        if(!response.ok){
            throw response
        }
        return await response.json()
    },

    deleteAddress: async (userId : number ,id: number)=> {
        const response = await fetch("http://localhost/api/admin/users/" + userId +"/addresses/" + id, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            }
        })
        if(!response.ok){
            throw response
        }
        return await response.json()
    },

    setDefaultAddress: async (userId: number, addressId: number) =>  {
        const response = await fetch("http://localhost/api/admin/users/" + userId + "/addresses/" + addressId +"/set-default", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
        })
        if(!response.ok){
            throw response
        }
        return await response.json()
    },
}
export const ordersApi = {
    getUserOrders: async (userId: number): Promise<Order[]> => {
        await delay(400)

        return [
            {
                id: "DH001234",
                userId,
                status: "completed",
                orderDate: "2024-01-15",
                totalAmount: 450000,
                itemCount: 3,
            },
            {
                id: "DH001235",
                userId,
                status: "shipping",
                orderDate: "2024-01-20",
                totalAmount: 320000,
                itemCount: 2,
            },
        ]
    },

    updateOrderStatus: async (orderId: string, status: Order["status"]): Promise<Order> => {
        await delay(500)

        return {
            id: orderId,
            userId: 1,
            status,
            orderDate: "2024-01-15",
            totalAmount: 450000,
            itemCount: 3,
        }
    },
}

// Payment Methods API
export const paymentMethodsApi = {
    getUserPaymentMethods: async (userId: number): Promise<PaymentMethod[]> => {
        await delay(300)

        return [
            {
                id: 1,
                userId,
                type: "credit_card",
                displayName: "Thẻ tín dụng",
                details: "**** **** **** 1234 - Visa - Hết hạn: 12/2025",
                isDefault: true,
            },
            {
                id: 2,
                userId,
                type: "e_wallet",
                displayName: "Ví điện tử",
                details: "MoMo: 0901234567",
                isDefault: false,
            },
        ]
    },

    createPaymentMethod: async (paymentData: Omit<PaymentMethod, "id">): Promise<PaymentMethod> => {
        await delay(600)

        return {
            ...paymentData,
            id: Math.floor(Math.random() * 10000),
        }
    },

    deletePaymentMethod: async (id: number): Promise<void> => {
        await delay(400)
    },
}

// Notifications API
export const notificationsApi = {
    getUserNotificationSettings: async (userId: number): Promise<NotificationSettings> => {
        await delay(200)

        return {
            userId,
            emailPromotions: true,
            smsOrders: true,
            emailNewProducts: false,
        }
    },

    updateNotificationSettings: async (
        userId: number,
        settings: Partial<NotificationSettings>,
    ): Promise<NotificationSettings> => {
        await delay(400)

        return {
            userId,
            emailPromotions: settings.emailPromotions ?? true,
            smsOrders: settings.smsOrders ?? true,
            emailNewProducts: settings.emailNewProducts ?? false,
        }
    },
}

// Security API
export const securityApi = {
    sendPasswordResetEmail: async (userId: number): Promise<void> => {
        await delay(800)
        // Mock sending password reset email
    },

    enable2FA: async (userId: number): Promise<{ qrCode: string; backupCodes: string[] }> => {
        await delay(1000)

        return {
            qrCode: "mock-qr-code-url",
            backupCodes: ["123456", "789012", "345678"],
        }
    },

    disable2FA: async (userId: number): Promise<void> => {
        await delay(500)
    },

    logoutAllDevices: async (userId: number): Promise<void> => {
        await delay(600)
    },
}
