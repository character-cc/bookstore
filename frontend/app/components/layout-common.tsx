// app/auth/auth-layout.tsx
import {Outlet} from "react-router";
import Header from "~/components/layout/header/header";
import Footer from "~/components/layout/header/footer";

export default function LayoutCommon() {
    return (<>
            <Header/>
            <Outlet/>
            <Footer/>
        </>
        );
        }
