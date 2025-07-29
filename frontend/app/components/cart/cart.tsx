"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useNavigate } from "react-router"
import { toast } from "sonner"


export default function ShoppingCartComponent() {
    const [showDiscountDialog, setShowDiscountDialog] = useState(false)
    const [showDiscountCodeDialog, setShowDiscountCodeDialog] = useState(false)
    const [pendingDiscountCode, setPendingDiscountCode] = useState("")
    const [currentDiscount, setCurrentDiscount] = useState()
    const [cartData, setCartData] = useState([])
    const [discountCode, setDiscountCode] = useState("")
    const [selectedItems, setSelectedItems] = useState<string[]>([])
    const [total, setTotal] = useState(null)
    const [availableDiscounts, setAvailableDiscounts] = useState([])

    const router = useNavigate()

    useEffect(() => {
        loadDataCart()
        loadAvailableDiscounts()
    }, [])

    useEffect(() => {
        if (total != null) {
            if (total.isValid) loadDiscount()
            else setDiscountCode("")
        }
    }, [total])

    useEffect(() => {
        loadTotal()
        loadAvailableDiscounts()
    }, [selectedItems])

    const loadAvailableDiscounts = async () => {
        try {
            const response = await fetch("http://localhost/api/discounts/available",{
                method : "POST",
                headers : {
                    "Content-Type": "application/json",
                },
                body : JSON.stringify({
                    cartItemIds: selectedItems.map((item) => Number(item))
                })
            })
            if (!response.ok) {
                throw new Error("Failed to fetch available discounts")
            }
            const data = await response.json()
            console.log(data)
            if(data.length > availableDiscounts.length) {
                toast("Bạn vừa được thêm mã giảm giá mới")
            }
            setAvailableDiscounts(data)
        } catch (error) {
            console.log(error)
        }
    }

    const loadDiscount = async () => {
        try {
            if (discountCode.length > 0) {
                const response = await fetch("http://localhost/api/discounts/by-code/" + discountCode)
                if (!response.ok) {
                    throw new Error("Failed to fetch discount code")
                }
                const data = await response.json()
                console.log(data)
                setCurrentDiscount(data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const loadDataCart = async () => {
        try {
            const response = await fetch("http://localhost/api/cart")
            const data = await response.json()
            if (!response.ok) {
                throw new Error(response.statusText)
            }
            console.log(data)
            setCartData(data)
        } catch (error) {
            console.log(error)
        }
    }

    const checkout = async () => {
        try {
            const response = await fetch("http://localhost/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cartItemIds: selectedItems.map((item) => Number(item)),
                    discountCode,
                }),
            })
            if (!response.ok) {
                throw new Error(response.statusText)
            }
            toast("Đang chuyển hướng ")
            router("/checkout")
        } catch (error) {
            loadDataCart()
            setSelectedItems([])
            console.log(error)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
    }

    const updateQuantityCartItem = async (id, newQuantity: number) => {
        try {
            const response = await fetch("http://localhost/api/cart/" + id + "/quantity", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ quantity: newQuantity }),
            })
            if (!response.ok) {
                throw new Error(response.statusText)
            }
            const data = await response.json()
            loadAvailableDiscounts()
            setCartData((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
            loadTotal()
        } catch (error) {
            toast("Đã vượt quá tồn kho của sách ")
            console.log(error)
            throw error

        }
    }

    const loadTotal = async () => {
        try {
            const data = {
                discountCode,
                cartItemIds: selectedItems,
            }
            console.log(data)
            const response = await fetch("http://localhost/api/discounts/check", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
            if (!response.ok) {
                throw new Error(response.statusText)
            }
            const j = await response.json()
            console.log(j)
            if (j.message.length > 0) {
                toast(j.message)
            }
            setTotal(j)
        } catch (error) {
            console.log(error)
        }
    }

    const updateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity < 1) return

        try {
            console.log(newQuantity)
            updateQuantityCartItem(id, newQuantity)


        }
        catch (error) {
            console.log(error)
        }

    }

    const removeItem  = async (id: string) => {
        try {
            const response = await fetch(`http://localhost/api/cart/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                }
            })
            if(!response.ok){
                throw new Error(response.statusText)
            }
            toast("Đã xóa thành công")
            setCartData((prev) => prev.filter((item) => item.id !== id))
        }
        catch(error) {
            console.log(error)
        }

    }

    const toggleSelectItem = (id: string) => {
        setSelectedItems((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
    }

    useEffect(() => {
        console.log("Selected items:", selectedItems)
    }, [selectedItems])

    const toggleSelectAll = () => {
        if (selectedItems.length === cartData.length) {
            setSelectedItems([])
        } else {
            setSelectedItems(cartData.map((item) => item.id.toString()))
        }
    }

    const getSelectedItemsTotal = () => {
        return cartData
            .filter((item) => selectedItems.includes(item.id.toString()))
            .reduce((total, item) => total + item.itemPrice, 0)
    }

    const getSelectedItemsCount = () => {
        return selectedItems.length
    }

    const handleApplyDiscount = () => {
        if (!discountCode.trim()) {
            toast("Vui lòng nhập mã giảm giá")
            return
        }

        if (currentDiscount) {
            setPendingDiscountCode(discountCode)
            setShowDiscountDialog(true)
            return
        }

        applyNewDiscount(discountCode)
    }

    const applyNewDiscount = (code: string) => {
        console.log("Đã gọi")
        loadTotal()
        // loadDiscount()
        // if (discount) {
        //     setDiscountCode("")
        //     toast('Đã áp dụng mã giảm giá ${code}' )
        // } else {
        //     toast("Mã giảm giá không hợp lệ hoặc đã hết hạn")
        // }
    }

    const confirmChangeDiscount = () => {
        applyNewDiscount(pendingDiscountCode)
        setShowDiscountDialog(false)
        setPendingDiscountCode("")
    }

    const removeDiscount = () => {
        setCurrentDiscount(null)
        toast("Đã xóa mã giảm giá")
    }

    const selectDiscountCode = (code: string) => {
        setDiscountCode(code)
        setShowDiscountCodeDialog(false)
        handleApplyDiscount()
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex items-center gap-2 mb-6">
                <Checkbox
                    checked={selectedItems.length === cartData.length && cartData.length > 0}
                    onCheckedChange={toggleSelectAll}
                />
                <h1 className="text-2xl font-bold">Giỏ hàng của bạn</h1>
                <Badge variant="secondary">{cartData.length} sản phẩm</Badge>
                <Badge variant="outline">{getSelectedItemsCount()} đã chọn</Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    {cartData.map((item) => (
                        <Card key={item.id}>
                            <CardContent className="p-4">
                                <div className="flex gap-4">
                                    <Checkbox
                                        checked={selectedItems.includes(item.id.toString())}
                                        onCheckedChange={() => toggleSelectItem(item.id.toString())}
                                        className="mt-2"
                                    />
                                    <div className="w-20 h-20 bg-gray-100 rounded-md flex-shrink-0">
                                        <img
                                            src={item.book.images.length > 0 ? item.book.images[0].imageUrl : ""}
                                            alt={item.book.name}
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover rounded-md"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold">{item.book.name}</h3>
                                                <p className="text-sm text-gray-600">
                                                    Tác giả: {item.book.authors.length > 0 ? item.book.authors[0].name : "Nhiều tác giả"}
                                                </p>
                                                <p className="text-sm text-gray-600">ISBN: {item.book.isbn}</p>

                                                {item.bookAttributeValues.length > 0 && (
                                                    <div className="mt-2">
                                                        {item.bookAttributeValues.map((attr) => (
                                                            <Badge key={attr.id} variant="outline" className="mr-1">
                                                                {attr.label} (+{formatPrice(attr.priceAdjustment)})
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="flex justify-between items-center mt-4">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                                                    className="w-16 text-center"
                                                    min="1"
                                                />
                                                <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">
                                                    {formatPrice(item.itemPrice)} x {item.quantity}
                                                </p>
                                                <p className="font-semibold">{formatPrice(item.itemPrice * item.quantity)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tóm tắt đơn hàng</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Discount Code */}
                            <div>
                                <label className="text-sm font-medium">Mã giảm giá</label>
                                {currentDiscount ? (
                                    <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-md">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="font-medium text-green-800">{currentDiscount.code}</span>
                                                <p className="text-sm text-green-600">
                                                    Giảm{" "}
                                                    {currentDiscount.isPercentage
                                                        ? currentDiscount.discountPercentage + "%"
                                                        : currentDiscount.discountAmount}{" "}
                                                    (tối đa {formatPrice(currentDiscount.maxDiscountAmount)})
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={removeDiscount}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Xóa
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2 mt-1">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Nhập mã giảm giá"
                                                value={discountCode}
                                                onChange={(e) => setDiscountCode(e.target.value)}
                                            />
                                            <Button variant="outline" onClick={handleApplyDiscount}>
                                                Áp dụng
                                            </Button>
                                        </div>

                                        <Dialog open={showDiscountCodeDialog} onOpenChange={setShowDiscountCodeDialog}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm" className="w-full text-blue-600">
                                                    Xem mã giảm giá có sẵn
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Chọn mã giảm giá</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                                    {availableDiscounts.map((discount) => (
                                                        <div
                                                            key={discount.id}
                                                            className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                                                            onClick={() => selectDiscountCode(discount.code)}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <span className="font-medium text-blue-600">{discount.code}</span>
                                                                    <p className="text-sm text-gray-600 mt-1">{discount.description}</p>
                                                                    <p className="text-sm text-green-600">
                                                                        Giảm{" "}
                                                                        {discount.isPercentage
                                                                            ? discount.discountPercentage + "%"
                                                                            : formatPrice(discount.discountAmount)}
                                                                        {discount.maxDiscountAmount > 0 &&
                                                                            ` (tối đa ${formatPrice(discount.maxDiscountAmount)})`}
                                                                    </p>
                                                                </div>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {discount.isActive ? "Có hiệu lực" : "Hết hạn"}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {availableDiscounts.length === 0 && (
                                                        <p className="text-center text-gray-500 py-4">Không có mã giảm giá nào khả dụng</p>
                                                    )}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Sản phẩm đã chọn:</span>
                                    <span>
                    {getSelectedItemsCount()}/{cartData.length}
                  </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Tạm tính:</span>
                                    <span>{total?.totalBeforeDiscount}</span>
                                </div>

                                {currentDiscount && selectedItems.length > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Giảm giá ({currentDiscount.code}):</span>
                                        <span>{total?.discountAmount}</span>
                                    </div>
                                )}

                                <Separator />

                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Tổng cộng:</span>
                                    <span>{total?.totalAfterDiscount}</span>
                                </div>
                            </div>

                            <Button className="w-full " size="lg" disabled={selectedItems.length === 0} onClick={checkout}>
                               Thanh toán ({getSelectedItemsCount()} sản phẩm)
                            </Button>

                            {/*<Button variant="outline" className="w-full">*/}
                            {/*    Tiếp tục mua sắm*/}
                            {/*</Button>*/}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Thay đổi mã giảm giá</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn đã áp dụng mã giảm giá "{currentDiscount?.code}". Chỉ được áp dụng một mã giảm giá cho mỗi đơn hàng.
                            Bạn có muốn thay đổi sang mã "{pendingDiscountCode}" không?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowDiscountDialog(false)}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmChangeDiscount}>Thay đổi</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
