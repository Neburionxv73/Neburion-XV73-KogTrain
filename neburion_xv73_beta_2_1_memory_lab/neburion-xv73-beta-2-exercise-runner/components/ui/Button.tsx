import Link from "next/link";
import type { ReactNode } from "react";
export function Button({href,children,secondary=false}:{href:string;children:ReactNode;secondary?:boolean}){return <Link className={`btn ${secondary?"btn-secondary":"btn-primary"}`} href={href}>{children}</Link>}
