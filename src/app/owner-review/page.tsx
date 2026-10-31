import { notFound } from "next/navigation";
import OwnerConsole from "../owner/OwnerConsole";
export const dynamic = "force-dynamic";
export default function OwnerReview() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return (
    <OwnerConsole
      courses={[]}
      summary={{
        courses: null,
        students: null,
        enrollments: null,
        coverage: false,
      }}
      university={[]}
      stages={[]}
      byCourse={[]}
      writesEnabled={false}
      review
    />
  );
}
