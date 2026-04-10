"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Bell,
  BellOff,
  CheckCheck,
  Briefcase,
  MessageSquare,
  UserCheck,
  AlertCircle,
  Info,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  APPLICATION_RECEIVED: Briefcase,
  APPLICATION_UPDATE: Info,
  STATUS_CHANGE: AlertCircle,
  MESSAGE: MessageSquare,
  INTERVIEW: UserCheck,
};

export default function NotificationsPage() {
  const { data: session, status: authStatus } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error();
      setNotifications(await res.json());
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated") fetchNotifications();
  }, [authStatus, fetchNotifications]);

  async function markAsRead(ids: string[]) {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error();
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n))
      );
    } catch {
      toast.error("Failed to update notification");
    }
  }

  async function markAllRead() {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (!res.ok) throw new Error();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to update notifications");
    }
  }

  function handleClick(n: Notification) {
    if (!n.read) markAsRead([n.id]);
  }

  if (authStatus === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Sign in required</h1>
        <p className="text-muted-foreground mt-2">
          Please sign in to view your notifications.
        </p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-1.5 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <BellOff className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm text-muted-foreground mt-1">
              You&apos;re all caught up. We&apos;ll notify you when something
              happens.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="sr-only">
            <CardTitle>Notification List</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            {notifications.map((n) => {
              const Icon = typeIcons[n.type] || Bell;
              const inner = (
                <div
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 transition-colors",
                    !n.read && "bg-muted/40",
                    n.link && "hover:bg-muted/60 cursor-pointer"
                  )}
                  onClick={() => handleClick(n)}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full mt-0.5",
                      n.read
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm",
                        !n.read && "font-medium"
                      )}
                    >
                      {n.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatRelativeDate(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
              );

              return n.link ? (
                <Link key={n.id} href={n.link} className="block">
                  {inner}
                </Link>
              ) : (
                <div key={n.id}>{inner}</div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
