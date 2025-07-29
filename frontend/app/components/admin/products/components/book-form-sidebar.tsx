"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { FileText, Settings, Percent, Link, Info, AlertCircle, CheckCircle } from "lucide-react"

import type { FormSection } from "./book-form-layout"

interface BookFormSidebarProps {
    activeSection: FormSection
    onSectionChange: (section: FormSection) => void
    mode: "add" | "edit"
    hasErrors: (section: FormSection) => boolean
}

export default function BookFormSidebar({ activeSection, onSectionChange, mode, hasErrors }: BookFormSidebarProps) {
    const baseSections = [
        {
            id: "basic" as FormSection,
            label: "Thông tin cơ bản",
            icon: FileText,
            required: true,
            description: "Tên, mô tả, hình ảnh, giá, phân loại, hiển thị",
        },
    ];

    const additionalSections = [
        {
            id: "attributes" as FormSection,
            label: "Thuộc tính",
            icon: Settings,
            required: false,
            description: "Thuộc tính tùy chỉnh",
        },

    ];

    const editOnlySection = {
        id: "details" as FormSection,
        label: "Chi tiết sách",
        icon: Info,
        required: false,
        description: "Thống kê và thông tin",
    };

    const sections = mode === "edit"
        ? [...baseSections, ...additionalSections]
        : baseSections;



    const getStatusIcon = (section: FormSection) => {
        if (hasErrors(section)) {
            return <AlertCircle className="h-4 w-4 text-red-500" />
        }

        switch (section) {
            case "basic":
                return <CheckCircle className="h-4 w-4 text-green-500" />
            default:
                return null
        }
    }

    return (
        <Card className="sticky top-6">
            <CardContent className="p-4">
                <div className="space-y-2">
                    <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wide mb-4">Sections</h3>

                    {sections.map((section) => {
                        const Icon = section.icon
                        const isActive = activeSection === section.id
                        const hasError = hasErrors(section.id)

                        return (
                            <button
                                key={section.id}
                                onClick={() => onSectionChange(section.id)}
                                className={cn(
                                    "w-full text-left p-3 rounded-lg transition-colors",
                                    "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
                                    isActive && "bg-blue-50 border border-blue-200",
                                    hasError && "border border-red-200 bg-red-50",
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <Icon
                                        className={cn(
                                            "h-5 w-5 mt-0.5 flex-shrink-0",
                                            isActive ? "text-blue-600" : "text-gray-400",
                                            hasError && "text-red-500",
                                        )}
                                    />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                      <span
                          className={cn(
                              "font-medium text-sm",
                              isActive ? "text-blue-900" : "text-gray-900",
                              hasError && "text-red-900",
                          )}
                      >
                        {section.label}
                      </span>

                                            {section.required && (
                                                <Badge variant="outline" className="text-xs">
                                                    Bắt buộc
                                                </Badge>
                                            )}

                                            {getStatusIcon(section.id)}
                                        </div>

                                        <p
                                            className={cn(
                                                "text-xs mt-1",
                                                isActive ? "text-blue-700" : "text-gray-500",
                                                hasError && "text-red-700",
                                            )}
                                        >
                                            {section.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
