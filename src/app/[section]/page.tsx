import { notFound } from "next/navigation";
import Workspace from "@/components/platform/Workspace";
import { readCatalogue } from "@/lib/platform/catalogue";
import { destinations } from "@/lib/platform/navigation";
export const dynamic = "force-dynamic";
export default async function Section({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (
    ![
      ...destinations.map((d) => d[0].slice(1)),
      "search",
      "privacy",
      "terms",
      "courses",
    ].includes(section)
  )
    notFound();
  const data = ["my-courses", "learn", "search", "courses"].includes(section)
    ? await readCatalogue(section === "my-courses")
    : { courses: [], available: false, signedIn: false };
  return (
    <Workspace
      section={section === "courses" ? "my-courses" : section}
      {...data}
    />
  );
}
