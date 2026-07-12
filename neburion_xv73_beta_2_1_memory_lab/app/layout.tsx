import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
export const metadata:Metadata={title:{default:"Neburion XV73",template:"%s · Neburion XV73"},description:"Adaptives kognitives Lernsystem mit transparentem Lerncoach.",manifest:"/manifest.webmanifest"};
export const viewport:Viewport={themeColor:"#5a2418",width:"device-width",initialScale:1,viewportFit:"cover"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="de"><body><ServiceWorkerRegister/>{children}</body></html>}
