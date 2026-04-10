"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, BriefcaseBusiness, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";

const publicLinks = [
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/categories", label: "Categories" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/notifications?unreadCount=true")
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.count ?? 0))
      .catch(() => {});
  }, [session, pathname]);

  const dashboardHref =
    session?.user?.role === "EMPLOYER" ? "/dashboard/employer" : "/dashboard";

  const initials = session?.user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BriefcaseBusiness className="h-6 w-6" />
            <span>JobBoard</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            {session?.user?.role === "EMPLOYER" && (
              <Link
                href="/jobs/post"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/jobs/post"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                Post a Job
              </Link>
            )}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {session?.user ? (
            <>
              <Link
                href="/dashboard/notifications"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "relative"
                )}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[11px] font-bold text-white flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <DropdownMenu>
                <MenuPrimitive.Trigger className="relative h-9 w-9 rounded-full cursor-pointer">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{initials || "U"}</AvatarFallback>
                  </Avatar>
                </MenuPrimitive.Trigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href={dashboardHref} className="w-full">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/profile" className="w-full">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost" })}
              >
                Sign in
              </Link>
              <Link href="/register" className={buttonVariants()}>
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetPrimitive.Trigger
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}
          >
            <Menu className="h-5 w-5" />
          </SheetPrimitive.Trigger>
          <SheetContent side="right" className="w-72">
            <nav className="flex flex-col gap-3 mt-8">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {session?.user ? (
                <>
                  <Link
                    href={dashboardHref}
                    className="text-sm font-medium py-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="text-sm font-medium py-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    Profile
                  </Link>
                  {session.user.role === "EMPLOYER" && (
                    <Link
                      href="/jobs/post"
                      className="text-sm font-medium py-2"
                      onClick={() => setMobileOpen(false)}
                    >
                      Post a Job
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => signOut()}
                    className="mt-2"
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={cn(buttonVariants({ variant: "outline" }), "mt-2")}
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className={buttonVariants()}
                    onClick={() => setMobileOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
