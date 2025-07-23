import {AppSidebar} from "~/components/admin/sidebar/sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {Outlet} from "react-router";
import {NavUser} from "~/components/admin/sidebar/nav-user";
import {Link} from "react-router";
import {Button} from "~/components/ui/button";

export default function Page() {

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />

                    </div>
                    <div className="ml-auto flex items-center gap-2 px-4">
                        <Link to="/" > <Button>Trở về trang chủ</Button></Link>
                    </div>

                </header>
                <Outlet/>
            </SidebarInset>
        </SidebarProvider>
    )
}
