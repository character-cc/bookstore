import { type RouteConfig, index } from "@react-router/dev/routes";
import {layout , route} from "@react-router/dev/routes";

export default [
    // index("routes/home.tsx"),

    layout("./components/layout-common.tsx", [
        route("/", "./components/homepage.tsx"),
    ]),

    layout("./components/auth/auth-layout.tsx", [
        route("login", "./components/auth/login.tsx"),
        route("register", "./components/auth/register.tsx"),
        route("books/:id/detail", "./components/products/page-book.tsx"),
        route("books/bestsellers" , "./components/products/bestsellers/page.tsx"),
        route("books/new", "./components/products/new-books/page.tsx"),
        route("books/sale" , "./components/products/sale-books/page.tsx"),
        route("books/search", "./components/search/page.tsx"),
        route("cart", "./components/cart/page.tsx"),
        route("categories/:id", "./components/categories/page.tsx"),
        route("admin/cart" , "./components/cart/cart.tsx"),

        route("checkout", "./components/checkout/page.tsx"),
        route("order-success" , "./components/checkout/page-order-success.tsx"),

        route("me/orders" , "./components/orders/page.tsx"),
        route("profile", "./components/profile/page.tsx"),

    ]),

    layout("./components/admin/layout.tsx", [
        route("admin/dashboard", "./components/admin/dashboard.tsx"),
        route("/admin/users" , "./components/admin/users/user/list-user.tsx"),
        route("/admin/users/role" , "./components/admin/users/role/list-role.tsx"),
        route("/admin/users/add" , "./components/admin/users/user/add/add-user.tsx"),
        route("/admin/users/edit/:id" , "./components/admin/users/user/edit/edit-user.tsx"),
        route("/admin/users/edit/:id/addresses" , "./components/admin/users/user/edit/edit-addresses.tsx"),

        //role
        route("/admin/roles" , "./components/admin/roles/page.tsx"),
        route("/admin/roles/add" , "./components/admin/roles/add/add.tsx"),
        route("admin/roles/:id/edit" , "./components/admin/roles/edit/edit.tsx"),
        //

        //address
        route("/admin/users/custom-attributes" , "./components/admin/users/custom-attributes/table-attributes.tsx"),
        route("admin/users/custom-attributes/add", "./components/admin/users/custom-attributes/add/add.tsx"),
        route("admin/users/custom-attributes/edit/:id", "./components/admin/users/custom-attributes/edit/edit.tsx"),
        //

        //books
        route("/admin/books" , "./components/admin/products/product-list.tsx"),
        route("/admin/books/edit/:id" , "./components/admin/products/edit/edit.tsx"),
        route("/admin/books/add" , "./components/admin/products/add/add.tsx"),
        route("/admin/books/:bookId/attributes/add" , "./components/admin/products/attributes/add.tsx"),
        route("/admin/books/:bookId/attributes/edit/:attributeId" , "./components/admin/products/attributes/edit.tsx"),
        route("/test" , "./components/test.tsx"),

        //

        //discount
        route("admin/discounts" , "./components/admin/discounts/page.tsx"),
        route("admin/discounts/add" , "./components/admin/discounts/add.tsx"),
        route("admin/discounts/edit/:id" , "./components/admin/discounts/edit.tsx"),

        //order
        route("admin/orders" , "./components/admin/orders/page.tsx"),
        route("admin/orders/:id" , "./components/admin/orders/page-order-detail.tsx"),
        route("admin/orders/:id/edit" , "./components/admin/orders/edit/edit.tsx"),

        //store
        route("admin/stores", "./components/admin/stores/store-management.tsx"),
        route("admin/stores/:id/edit", "./components/admin/stores/inventory-page.tsx"),

        //categories
        route("admin/categories", "./components/admin/categories/category-management.tsx"),
        route("admin/categories/:id/edit", "./components/admin/categories/edit.tsx"),
        route("admin/categories/add", "./components/admin/categories/add.tsx"),

        // authors
        route("admin/authors", "./components/admin/authors/author-management.tsx"),
        route("admin/authors/:id/edit", "./components/admin/authors/edit.tsx"),
        route("admin/authors/add", "./components/admin/authors/add.tsx"),

        //publishers
        route("admin/publishers", "./components/admin/publishers/publisher-management.tsx"),
        route("admin/publishers/:id/edit", "./components/admin/publishers/edit.tsx"),
        route("admin/publishers/add", "./components/admin/publishers/add.tsx"),

        // importBook
        route("admin/books/imports", "./components/admin/imports/import.tsx"),

        //proft
        route("admin/profit", "./components/admin/profit/profit.tsx"),
        route("admin/books/inventory", "./components/admin/imports/inventory-management.tsx"),
    ]),


] satisfies RouteConfig;
