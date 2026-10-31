import {notFound} from "next/navigation";
import WorkspaceSection from "@/components/q7/WorkspaceSection";
const sections=["courses","learn","library","more","questions","ministerial","cases","ai","downloads","settings","notifications"];
export default async function SectionPage({params}:{params:Promise<{section:string}>}){const {section}=await params;if(!sections.includes(section))notFound();return <WorkspaceSection section={section}/>}
