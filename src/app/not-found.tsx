import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-8xl font-bold tracking-tighter text-muted-foreground/30">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className={buttonVariants()}>
          Back to Home
        </Link>
        <Link
          href="/jobs"
          className={buttonVariants({ variant: "outline" })}
        >
          Browse Jobs
        </Link>
      </div>
    </div>
  );
}
