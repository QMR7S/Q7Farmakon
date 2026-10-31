import { readCatalogue } from "@/lib/platform/catalogue";
import StudentHome from "@/components/platform/StudentHome";
export const dynamic = "force-dynamic";
export default async function Home() {
  return <StudentHome {...await readCatalogue()} />;
}
