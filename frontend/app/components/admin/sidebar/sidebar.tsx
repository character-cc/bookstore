"use client"

import * as React from "react"
import {
    AudioWaveform,
    BookOpen,
    Bot,
    Command,
    Frame,
    GalleryVerticalEnd,
    Map,
    PieChart,
    Settings2,
    SquareTerminal,
} from "lucide-react"

import {NavUser} from "~/components/admin/sidebar/nav-user";
import {NavMain} from "~/components/admin/sidebar/nav-main";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"

const data = {
    user: {
        name: "Admin",
        email: "admin@gmail.com",
        avatar: "/avatars/shadcn.jpg",
    },

    navMain: [
        {
            title: "Dashboard",
            url: "admin/dashboard",
        },
        {
            title: "Quản lý Người Dùng ",
            url: "/admin/users",

        },
        {
            title: "Quản lý Quyền ",
            url: "/admin/roles",
        },
        {
            title: "Quản lý Danh Mục ",
            url: "/admin/categories",
        },
        {
            title: "Quản lý Tác Giả ",
            url: "/admin/authors",
        },
        {
            title: "Quản lý Nhà Xuất Bản  ",
            url: "/admin/publishers",
        },
        {
            title: "Quản Lý Sách",
            url: "/admin/books",
        },
        {
            title: "Quản Lý Giảm Giá",
            url: "/admin/discounts",
        },
        {
            title: "Quản Lý Đơn Hàng",
            url: "/admin/orders",
        },
        {
            title: "Quản Lý Cửa Hàng",
            url: "/admin/stores",
        },
        {
            title: "Quản Lý Nhập Kho",
            url: "admin/books/imports"
        },
        {
            title: "Thống Kê Lợi Nhuận",
            url: "admin/profit"
        },
        {
            title: "Quản Lý Tồn Kho ",
            url: "admin/books/inventory"
        },

    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                {/*<TeamSwitcher teams={data.teams} />*/}
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                {/*<NavProjects projects={data.projects} />*/}
            </SidebarContent>
            {/*<SidebarFooter>*/}
            {/*    <NavUser user={data.user} />*/}
            {/*</SidebarFooter>*/}
            <SidebarRail />
        </Sidebar>
    )
}
