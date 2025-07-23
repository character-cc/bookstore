"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star, Eye, ShoppingCart, TrendingUp } from "lucide-react"

import type { Book } from "@/lib/book-api"

interface BookDetailsProps {
    book: Book
}

export default function BookDetails({ book }: BookDetailsProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const getStockStatus = () => {
        if (book.stock === 0) return { label: "Hết hàng", color: "bg-red-500" }
        if (book.stock < 10) return { label: "Sắp hết", color: "bg-yellow-500" }
        return { label: "Còn hàng", color: "bg-green-500" }
    }

    const stockStatus = getStockStatus()

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Eye className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Lượt xem</p>
                                <p className="text-xl font-bold">{book.viewCount.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <ShoppingCart className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Đã bán</p>
                                <p className="text-xl font-bold">{book.soldCount.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Star className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Đánh giá</p>
                                <p className="text-xl font-bold">{book.rating}/5</p>
                                <p className="text-xs text-gray-500">({book.reviewCount} đánh giá)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Tỷ lệ chuyển đổi</p>
                                <p className="text-xl font-bold">
                                    {book.viewCount > 0 ? ((book.soldCount / book.viewCount) * 100).toFixed(1) : 0}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin sản phẩm</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600">ID sản phẩm:</span>
                            <span className="font-medium">{book.id}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600">ISBN:</span>
                            <span className="font-medium">{book.isbn}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600">Ngày tạo:</span>
                            <span className="font-medium">{formatDate(book.createdAt)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600">Cập nhật lần cuối:</span>
                            <span className="font-medium">{formatDate(book.updatedAt)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600">Trạng thái kho:</span>
                            <Badge className={`${stockStatus.color} text-white`}>{stockStatus.label}</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Hiệu suất bán hàng</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">Tỷ lệ xem/mua</span>
                                <span className="text-sm font-medium">
                  {book.viewCount > 0 ? ((book.soldCount / book.viewCount) * 100).toFixed(1) : 0}%
                </span>
                            </div>
                            <Progress value={book.viewCount > 0 ? (book.soldCount / book.viewCount) * 100 : 0} className="h-2" />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">Đánh giá trung bình</span>
                                <span className="text-sm font-medium">{book.rating}/5</span>
                            </div>
                            <Progress value={(book.rating / 5) * 100} className="h-2" />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">Tồn kho</span>
                                <span className="text-sm font-medium">{book.stock} cuốn</span>
                            </div>
                            <Progress value={book.stock > 100 ? 100 : book.stock} className="h-2" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Trạng thái hiển thị</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {book.isActive && <Badge className="bg-green-500">Đang hoạt động</Badge>}
                        {book.isFeatured && <Badge className="bg-blue-500">Nổi bật</Badge>}
                        {book.isNewRelease && <Badge className="bg-purple-500">Mới phát hành</Badge>}
                        {book.isBestseller && <Badge className="bg-orange-500">Bestseller</Badge>}
                        {book.displaySettings.showOnHomepage && <Badge variant="outline">Hiển thị trang chủ</Badge>}
                        {book.displaySettings.showInFeatured && <Badge variant="outline">Section nổi bật</Badge>}
                        {book.displaySettings.showInNewReleases && <Badge variant="outline">Section mới</Badge>}
                        {book.displaySettings.showInBestsellers && <Badge variant="outline">Section bestseller</Badge>}
                        {book.displaySettings.showInDiscounted && <Badge variant="outline">Section giảm giá</Badge>}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
