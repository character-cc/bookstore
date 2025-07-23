// app/auth/auth-layout.tsx
import {Outlet} from "react-router";
import Header from "~/components/layout/header/header";
import Footer from "~/components/layout/header/footer";

// import Page from "~/components/admin/dashboard";

export default function AuthLayout() {
    return ( <>
            <Header />

            <Outlet />
            <Footer />
            {/*<Page />*/}
        </>


    );
}
