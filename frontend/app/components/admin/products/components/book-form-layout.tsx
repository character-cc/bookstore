"use client"

import { useState } from "react"
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from "react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import BookFormSidebar from "./book-form-sidebar"
import BasicInformation from "./basic-information"
import CustomAttributes from "./custom-attributes"
import ProductRelations from "./product-relations"

export type FormSection = "basic" | "attributes" | "discounts" | "relations" | "details" | "pricing"

interface BookFormLayoutProps {
    mode: "add" | "edit"
    bookId?: number
}

export default function BookFormLayout({ mode, bookId }: BookFormLayoutProps) {
    const router = useNavigate()
    const [activeSection, setActiveSection] = useState<FormSection>("basic")
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    const handleBack = () => {
        if (hasUnsavedChanges) {
            if (confirm("Bạn có thay đổi chưa lưu. Bạn có chắc muốn thoát?")) {
                router("/admin/books")
            }
        } else {
            router("/admin/books")
        }
    }

    const handleSectionSaved = () => {
        setHasUnsavedChanges(false)
        if (mode === "add") {
        }
    }

    const renderCurrentSection = () => {
        switch (activeSection) {
            case "basic":
                return <BasicInformation bookId={bookId} onSaved={handleSectionSaved} />

            case "attributes":
                return <CustomAttributes bookId={bookId} />

            case "relations":
                return <ProductRelations bookId={bookId} onOpenProductSelector={() => {}} />

            case "details":
                return <div>Chi tiết sách</div>

            default:
                return <BasicInformation bookId={bookId} onSaved={handleSectionSaved} />
        }
    }

    const getSectionTitle = (section: FormSection) => {
        switch (section) {
            case "basic":
                return "Thông tin cơ bản"
            case "attributes":
                return "Thuộc tính tùy chỉnh"
            case "discounts":
                return "Quản lý giảm giá"
            case "relations":
                return "Sản phẩm liên quan"
            case "details":
                return "Chi tiết sách"
            default:
                return "Thông tin cơ bản"
        }
    }

    return (
        <div className="container mx-auto py-6 max-w-7xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{mode === "add" ? "Thêm sách mới" : "Chỉnh sửa sách"}</h1>
                        <p className="text-gray-600">
                            {mode === "add"
                                ? "Nhập thông tin để thêm sách mới vào hệ thống"
                                : `Chỉnh sửa thông tin sách ID: ${bookId || ""}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {hasUnsavedChanges && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                            Có thay đổi chưa lưu
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <BookFormSidebar
                        activeSection={activeSection}
                        onSectionChange={setActiveSection}
                        mode={mode}
                        hasErrors={(section) => {
                            return false
                        }}
                    />
                </div>

                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>{getSectionTitle(activeSection)}</CardTitle>
                        </CardHeader>
                        <CardContent>{renderCurrentSection()}</CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
