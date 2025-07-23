"use client"

import type React from "react"
import { useEffect } from "react"
import { ChevronDown, Menu, Search, ShoppingCart, User, LogIn } from "lucide-react"
import { Link } from "react-router"
import { useState } from "react"
import {useNavigate} from "react-router";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {toast} from "sonner";

export default function EcommerceHeader() {
    const [searchQuery, setSearchQuery] = useState("")
    const [categories, setCategories] = useState([])
    const [users, setUsers] = useState()

    const router = useNavigate()
    useEffect(() => {
        loadCategories()
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            const response = await fetch("/api/users/me")
            if (!response.ok) {
                throw new Error(response.statusText)
            }
            const data = await response.json()
            setUsers(data)
        } catch (err) {
            console.log(err)
        }
    }

    const loadCategories = async () => {
        try {
            const response = await fetch("http://localhost/api/categories/navbar")
            if (!response.ok) {
                throw Error(response.statusText)
            }
            const data = await response.json()
            setCategories(data)
            console.log(data)
        } catch (error) {
            console.error(error)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Tìm kiếm:", searchQuery)
        router("/books/search?q=" + searchQuery)
    }

    const signOut = async () => {
        try {
            const response = await fetch("http://localhost/api/logout", {
                method: "POST",
            })
            if (!response.ok) {
                throw Error(response.statusText)
            }
            toast("Đăng xuất thành công ")
            setUsers(undefined)
            router("/")
        }
        catch (error) {
            console.error(error)
        }
    }

    return (
        <header className="w-full border-b bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between gap-4">
                    <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-xl">📚</span>
                        </div>
                        <div className="hidden sm:block">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Trí Tuệ
              </span>
                        </div>
                    </Link>

                    <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <Input
                                type="search"
                                placeholder="Tìm kiếm sách, tác giả, thể loại..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-200"
                            />
                            {searchQuery && (
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
                                >
                                    Tìm
                                </Button>
                            )}
                        </div>
                    </form>

                    <div className="flex items-center space-x-2">
                        <Link to="/cart">
                        {users && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative h-10 w-10 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <ShoppingCart className="h-5 w-5 text-gray-600" />
                                <span className="sr-only">Giỏ hàng</span>
                            </Button>
                        )}
                    </Link>
                        {users ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="h-10 px-3 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-2"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {users.firstName ? users.firstName.charAt(0).toUpperCase() : "U"}
                      </span>
                                        </div>
                                        <span className="hidden md:block text-sm font-medium text-gray-700">
                      {(users.firstName + users.lastName) || "Tài khoản"}
                    </span>
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 p-2">
                                    <DropdownMenuLabel className="px-3 py-2">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium">{users.name || "Người dùng"}</p>
                                            <p className="text-xs text-gray-500">{users.email || ""}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link to="/profile" className="w-full cursor-pointer flex items-center gap-2 px-3 py-2">
                                            <User className="h-4 w-4" />
                                            Thông tin cá nhân
                                        </Link>
                                    </DropdownMenuItem>
                                    {users?.roles?.some(role => role.systemName === "Administrators") && (
                                        <DropdownMenuItem asChild>
                                            <Link
                                                to="/admin/dashboard"
                                                className="w-full cursor-pointer flex items-center gap-2 px-3 py-2"
                                            >
                                                <User className="h-4 w-4" />
                                                Trang quản trị
                                            </Link>
                                        </DropdownMenuItem>
                                    )}


                                    <DropdownMenuItem asChild>
                                        <Link to="/me/orders" className="w-full cursor-pointer flex items-center gap-2 px-3 py-2">
                                            <ShoppingCart className="h-4 w-4" />
                                            Đơn hàng của tôi
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600 cursor-pointer px-3 py-2" onClick={signOut}>Đăng xuất</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button asChild variant="ghost" className="h-10 px-4 hover:bg-gray-100 rounded-xl transition-colors">
                                    <Link to="/login" className="flex items-center gap-2">
                                        <LogIn className="h-4 w-4" />
                                        <span className="hidden sm:block">Đăng nhập</span>
                                    </Link>
                                </Button>
                                <Button asChild className="h-10 px-4 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
                                    <Link to="/register">
                                        <span className="hidden sm:block">Đăng ký</span>
                                        <span className="sm:hidden">Đăng ký</span>
                                    </Link>
                                </Button>
                            </div>
                        )}

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden h-10 w-10 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-80 p-0">
                                <div className="flex flex-col h-full">
                                    <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                                                <span className="text-white font-bold text-xl">📚</span>
                                            </div>
                                            <span className="text-xl font-bold text-blue-800">Trí Tuệ</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6">
                                        <h2 className="text-lg font-semibold mb-4 text-gray-900">Danh mục sản phẩm</h2>
                                        <div className="space-y-3">
                                            {categories.map((category) => (
                                                <div key={category.name} className="space-y-2">
                                                    {category.subCategories && category.subCategories.length > 0 ? (
                                                        <div className="border rounded-lg p-3 bg-gray-50">
                                                            <h3 className="font-medium text-gray-900 mb-2">{category.name}</h3>
                                                            <div className="space-y-1">
                                                                {category.subCategories.map((sub) => (
                                                                    <Link
                                                                        key={sub.name}
                                                                        to={"/categories/" + sub.href}
                                                                        className="block text-sm text-gray-600 hover:text-blue-600 hover:bg-white px-2 py-1 rounded transition-colors"
                                                                    >
                                                                        {sub.name}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <Link
                                                            to={"/categories/" + category.href || "#"}
                                                            className="block font-medium text-gray-900 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                                                        >
                                                            {category.name}
                                                        </Link>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {!users && (
                                        <div className="p-6 border-t bg-gray-50">
                                            <div className="flex gap-3">
                                                <Button asChild variant="outline" className="flex-1 bg-transparent">
                                                    <Link to="/login">Đăng nhập</Link>
                                                </Button>
                                                <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
                                                    <Link to="/register">Đăng ký</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>

            <div className="hidden lg:block border-t bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex items-center space-x-1">
                        {categories.map((category) =>
                            category.subCategories && category.subCategories.length > 0 ? (
                                <DropdownMenu key={category.name}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="h-12 px-4 text-sm font-medium hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 data-[state=open]:bg-white data-[state=open]:shadow-sm"
                                        >
                                            {category.name}
                                            <ChevronDown className="ml-1 h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-64 p-3 shadow-lg" sideOffset={4}>
                                        <div className="grid grid-cols-1 gap-1">
                                            {category.subCategories.map((subcategory) => (
                                                <DropdownMenuItem key={subcategory.name} asChild>
                                                    <Link
                                                        to={"/categories/" + subcategory.id}
                                                        className="w-full cursor-pointer rounded-lg px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                                    >
                                                        {subcategory.name}
                                                    </Link>
                                                </DropdownMenuItem>
                                            ))}
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button
                                    asChild
                                    key={category.name}
                                    variant="ghost"
                                    className="h-12 px-4 text-sm font-medium hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200"
                                >
                                    <Link to={"/categories/" + category.id || "#"}>{category.name}</Link>
                                </Button>
                            ),
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}