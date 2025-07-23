// Định nghĩa kiểu dữ liệu cho Role
export interface Role {
    id: number
    friendlyName: string
    systemName: string
    isActive: boolean
    isFreeShipping: boolean
    isSystemRole: boolean
    createdAt: string
    updatedAt: string
}

// Định nghĩa kiểu dữ liệu cho tham số lọc
interface RoleFilterParams {
    search?: string
    isActive?: boolean
}

// Định nghĩa kiểu dữ liệu cho dữ liệu tạo/cập nhật role
interface RoleData {
    friendlyName: string
    systemName: string
    isActive: boolean
    isFreeShipping: boolean
    isSystemRole: boolean
}

// Định nghĩa kiểu dữ liệu cho phản hồi danh sách
interface RolesResponse {
    data: Role[]
    total: number
    page: number
    limit: number
}

// Mock data cho roles
const mockRoles: Role[] = [
    {
        id: 1,
        friendlyName: "Quản trị viên",
        systemName: "Administrator",
        isActive: true,
        isFreeShipping: true,
        isSystemRole: true,
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-01T00:00:00.000Z",
    }
]

// Hàm trợ giúp để mô phỏng độ trễ mạng
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// API cho roles
export const rolesApi = {
    // Lấy danh sách roles với bộ lọc
     getRoles: async (params: RoleFilterParams = {}) => {
         const response = await fetch("http://localhost/api/admin/roles/search",{
             method: "POST",
             headers: {
                 "Content-Type": "application/json",
             },
             body: JSON.stringify(params)
         });
        if (!response.ok) {
            throw response
        }
        return response.json()
    },

    getRole: async (id: number)=> {
       const response = await fetch(`http://localhost/api/admin/roles/${id}`)
        if (!response.ok) {
            throw response
        }
        return response.json()
    },

    // Tạo role mới
    createRole : async (roleData : any)=> {
       const response = await fetch("http://localhost/api/admin/roles", {
           method: "POST",
           headers: {
               "Content-Type": "application/json",
           },
           body: JSON.stringify(roleData)
       })
        if (!response.ok) {
            throw response
        }
        return response.json()
    },

    updateRole: async (id: number, roleData: any) => {
        const response = await fetch("http://localhost/api/admin/roles", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(roleData)
        })
        if (!response.ok) {
            throw response
        }
        return response.json()
    },

    deleteRole: async (id: number) => {
        const response = await fetch("http://localhost/api/admin/roles/" + id , {
            method: "Delete",
            headers: {
                "Content-Type": "application/json",
            }
        })
        if (!response.ok) {
            throw response
        }
        console.log(response)
        return response.json()
    },

    // Kiểm tra tính khả dụng của tên hệ thống
    async checkSystemNameAvailability(systemName: string, excludeId?: number): Promise<boolean> {
        await delay(300) // Mô phỏng độ trễ mạng

        const existingRole = mockRoles.find((r) => r.systemName === systemName && r.id !== excludeId)
        return !existingRole
    },
}
