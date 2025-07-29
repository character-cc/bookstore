"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface DisplaySettingsProps {
    formData: any
    isLoading: boolean
    onInputChange: (field: string, value: any) => void
}

export default function DisplaySettings({ formData, isLoading, onInputChange }: DisplaySettingsProps) {
    const handleDisplaySettingChange = (field: string, value: boolean) => {
        onInputChange("displaySettings", {
            ...formData.displaySettings,
            [field]: value,
        })
    }

    const handleFeaturedOrderChange = (value: string) => {
        onInputChange("displaySettings", {
            ...formData.displaySettings,
            featuredOrder: Number.parseInt(value) || undefined,
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cài đặt hiển thị</CardTitle>
                <CardDescription>Thiết lập nơi sản phẩm sẽ được hiển thị trên website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Hiển thị trên trang chủ</Label>
                        <div className="text-sm text-gray-600">Sản phẩm sẽ xuất hiện trong các section của trang chủ</div>
                    </div>
                    <Switch
                        checked={formData.displaySettings?.showOnHomepage || false}
                        onCheckedChange={(checked) => handleDisplaySettingChange("showOnHomepage", checked)}
                        disabled={isLoading}
                    />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Sản phẩm nổi bật</Label>
                        <div className="text-sm text-gray-600">Hiển thị trong section "Sản phẩm nổi bật"</div>
                    </div>
                    <Switch
                        checked={formData.displaySettings?.showInFeatured || false}
                        onCheckedChange={(checked) => handleDisplaySettingChange("showInFeatured", checked)}
                        disabled={isLoading}
                    />
                </div>

                {formData.displaySettings?.showInFeatured && (
                    <div className="ml-4 grid gap-2">
                        <Label htmlFor="featuredOrder">Thứ tự hiển thị (tùy chọn)</Label>
                        <Input
                            id="featuredOrder"
                            type="number"
                            value={formData.displaySettings?.featuredOrder || ""}
                            onChange={(e) => handleFeaturedOrderChange(e.target.value)}
                            placeholder="Để trống sẽ sắp xếp tự động"
                            className="w-48"
                            disabled={isLoading}
                        />
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Mới phát hành</Label>
                        <div className="text-sm text-gray-600">Hiển thị trong section "Mới phát hành"</div>
                    </div>
                    <Switch
                        checked={formData.displaySettings?.showInNewReleases || false}
                        onCheckedChange={(checked) => handleDisplaySettingChange("showInNewReleases", checked)}
                        disabled={isLoading}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Bestseller</Label>
                        <div className="text-sm text-gray-600">Hiển thị trong section "Bestseller"</div>
                    </div>
                    <Switch
                        checked={formData.displaySettings?.showInBestsellers || false}
                        onCheckedChange={(checked) => handleDisplaySettingChange("showInBestsellers", checked)}
                        disabled={isLoading}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Sản phẩm giảm giá</Label>
                        <div className="text-sm text-gray-600">Hiển thị trong section "Giảm giá"</div>
                    </div>
                    <Switch
                        checked={formData.displaySettings?.showInDiscounted || false}
                        onCheckedChange={(checked) => handleDisplaySettingChange("showInDiscounted", checked)}
                        disabled={isLoading}
                    />
                </div>

                <Separator />

                <div className="space-y-4">
                    <Label className="text-base font-medium">Trạng thái sản phẩm</Label>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="isActive">Hoạt động</Label>
                        <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => onInputChange("isActive", checked)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="isFeatured">Nổi bật</Label>
                        <Switch
                            id="isFeatured"
                            checked={formData.isFeatured}
                            onCheckedChange={(checked) => onInputChange("isFeatured", checked)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="isNewRelease">Mới phát hành</Label>
                        <Switch
                            id="isNewRelease"
                            checked={formData.isNewRelease}
                            onCheckedChange={(checked) => onInputChange("isNewRelease", checked)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="isBestseller">Bestseller</Label>
                        <Switch
                            id="isBestseller"
                            checked={formData.isBestseller}
                            onCheckedChange={(checked) => onInputChange("isBestseller", checked)}
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
