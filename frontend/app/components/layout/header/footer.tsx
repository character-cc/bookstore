"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router"
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

interface StoreDto {
    id: number
    name: string
    description: string
    fullAddress: string
    provinceId: number
    districtId: number
    wardId: number
    streetAddress: string
    phoneNumber: string
    email: string
    managerName: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

interface CategoryDto {
    id: number
    name: string
    description: string
    imageUrl: string
    parentId?: number
    isShowOnHomepage: boolean
    homepageDisplayOrder: number
    isShowOnNavigationBar: boolean
    navigationDisplayOrder: number
    subCategories: CategoryDto[]
    createdAt: string
    updatedAt: string
}

export default function Footer() {
    const [storeInfo, setStoreInfo] = useState<StoreDto | null>(null)
    const [categories, setCategories] = useState<CategoryDto[]>([])

    useEffect(() => {
        loadStoreInfo()
        loadCategories()
    }, [])

    const loadStoreInfo = async () => {
        try {
            const response = await fetch("http://localhost/api/stores")
            if (response.ok) {
                const data = await response.json()
                setStoreInfo(data)
            }
        } catch (error) {
            console.error("Error loading store info:", error)
        }
    }

    const loadCategories = async () => {
        try {
            const response = await fetch("http://localhost/api/categories")
            if (response.ok) {
                const data = await response.json()
                const mainCategories = data.filter((cat: CategoryDto) => !cat.parentId).slice(0, 6)
                setCategories(mainCategories)
            }
        } catch (error) {
            console.error("Error loading categories:", error)
        }
    }

    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-2">
                        <h3 className="text-xl font-bold mb-4">
                            {storeInfo?.name || "BookStore"}
                        </h3>
                        {storeInfo?.description && (
                            <p className="text-gray-300 mb-4 leading-relaxed">
                                {storeInfo.description}
                            </p>
                        )}

                        <div className="space-y-3">
                            {storeInfo?.fullAddress && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-300">{storeInfo.fullAddress}</span>
                                </div>
                            )}

                            {storeInfo?.phoneNumber && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-green-400 flex-shrink-0" />
                                    <a
                                        href={`tel:${storeInfo.phoneNumber}`}
                                        className="text-gray-300 hover:text-white transition-colors"
                                    >
                                        {storeInfo.phoneNumber}
                                    </a>
                                </div>
                            )}

                            {storeInfo?.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-red-400 flex-shrink-0" />
                                    <a
                                        href={`mailto:${storeInfo.email}`}
                                        className="text-gray-300 hover:text-white transition-colors"
                                    >
                                        {storeInfo.email}
                                    </a>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                                <span className="text-gray-300">Thứ 2 - Chủ nhật: 8:00 - 22:00</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Danh mục sách</h3>
                        <ul className="space-y-2">
                            {categories.map((category) => (
                                <li key={category.id}>
                                    <Link
                                        to={`/categories/${category.id}`}
                                        className="text-gray-300 hover:text-white transition-colors block py-1"
                                    >
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/about"
                                    className="text-gray-300 hover:text-white transition-colors block py-1"
                                >
                                    Giới thiệu
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="text-gray-300 hover:text-white transition-colors block py-1"
                                >
                                    Liên hệ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/shipping"
                                    className="text-gray-300 hover:text-white transition-colors block py-1"
                                >
                                    Chính sách giao hàng
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/return"
                                    className="text-gray-300 hover:text-white transition-colors block py-1"
                                >
                                    Chính sách đổi trả
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/privacy"
                                    className="text-gray-300 hover:text-white transition-colors block py-1"
                                >
                                    Chính sách bảo mật
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                    <p className="text-gray-400">
                        © {new Date().getFullYear()} {storeInfo?.name || "BookStore"}.
                        Tất cả quyền được bảo lưu.
                    </p>
                </div>
            </div>
        </footer>
    )
}