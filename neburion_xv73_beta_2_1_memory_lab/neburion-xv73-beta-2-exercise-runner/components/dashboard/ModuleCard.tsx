import Link from "next/link";
export function ModuleCard({icon,title,text,progress}:{icon:string;title:string;text:string;progress:number}){return <Link className="card" href="/training"><div className="icon">{icon}</div><h3>{title}</h3><p>{text}</p><div className="progress"><span style={{width:`${progress}%`}}/></div></Link>}
