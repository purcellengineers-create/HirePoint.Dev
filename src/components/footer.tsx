import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <BriefcaseBusiness className="h-5 w-5" />
              JobBoard
            </Link>
            <p className="text-sm text-muted-foreground">
              Find your next opportunity or hire top talent.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">For Job Seekers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/jobs" className="hover:text-foreground transition-colors">Browse Jobs</Link></li>
              <li><Link href="/categories" className="hover:text-foreground transition-colors">Categories</Link></li>
              <li><Link href="/register" className="hover:text-foreground transition-colors">Create Account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">For Employers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/jobs/post" className="hover:text-foreground transition-colors">Post a Job</Link></li>
              <li><Link href="/register" className="hover:text-foreground transition-colors">Employer Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} JobBoard. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
