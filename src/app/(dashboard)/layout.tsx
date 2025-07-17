"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  Bell,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
  Shield,
  CheckCircle,
} from "lucide-react";
import {
  OptimizedMotion,
  MotionDiv,
  fadeInUp,
} from "@/components/performance/LazyMotion";
import { PerformanceMonitor } from "@/components/performance/PerformanceMonitor";
import { debounce } from "@/lib/performance";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";

const businessNavItems = [
  { icon: Home, label: "Dashboard", href: "/business" },
  { icon: Zap, label: "Campaigns", href: "/business/campaigns" },
  { icon: Users, label: "Applications", href: "/business/applications" },
  { icon: BarChart3, label: "Analytics", href: "/business/analytics" },
  { icon: MessageSquare, label: "Messages", href: "/business/messages" },
  { icon: CreditCard, label: "Payments", href: "/business/payments" },
];

const influencerNavItems = [
  { icon: Home, label: "Dashboard", href: "/influencer" },
  { icon: Zap, label: "Campaigns", href: "/influencer/campaigns" },
  { icon: Search, label: "Applications", href: "/influencer/applications" },
  { icon: BarChart3, label: "Analytics", href: "/influencer/analytics" },
  {
    icon: CheckCircle,
    label: "Verification",
    href: "/influencer/verification",
  },
  { icon: CreditCard, label: "Bank Details", href: "/influencer/bank-details" },
  { icon: MessageSquare, label: "Messages", href: "/influencer/messages" },
  { icon: DollarSign, label: "Earnings", href: "/influencer/earnings" },
];

const adminNavItems = [
  { icon: Home, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Zap, label: "Campaigns", href: "/admin/campaigns" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Shield, label: "Verifications", href: "/admin/verifications" },
  { icon: MessageSquare, label: "Messages", href: "/admin/messages" },
  { icon: Settings, label: "System", href: "/admin/system" },
];

function normalizePath(path: string) {
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

function isActivePath(pathname: string, href: string) {
  const normalizedPathname = normalizePath(pathname);
  const normalizedHref = normalizePath(href);

  if (
    normalizedHref === "/business" ||
    normalizedHref === "/influencer" ||
    normalizedHref === "/admin"
  ) {
    // Only match exact for top-level dashboard
    return normalizedPathname === normalizedHref;
  }

  // Match exact or nested routes for other nav items
  return (
    normalizedPathname === normalizedHref ||
    normalizedPathname.startsWith(`${normalizedHref}/`)
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Changed default to false for mobile
  const [initial, setInitial] = useState("U");
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, loading, signOut } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  // Debounced sidebar toggle for better performance
  const debouncedToggleSidebar = debounce(() => {
    setSidebarOpen((prev) => !prev);
  }, 100);

  useEffect(() => {
    if ((userProfile as any)?.first_name) {
      setInitial((userProfile as any)?.first_name?.[0] || "U");
    } else if (userProfile?.email) {
      setInitial(userProfile.email[0].toUpperCase());
    }
  }, [userProfile]);

  // Set sidebar open by default on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on mobile when pathname changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  const handleLogout = async () => {
    console.log("Logout clicked - starting logout process");
    console.log("signOut function:", signOut);
    console.log("typeof signOut:", typeof signOut);
    try {
      console.log("Calling signOut function...");
      const result = await signOut();
      console.log("SignOut result:", result);
      console.log("SignOut completed, redirecting to login...");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      // Force redirect even if signOut fails
      router.push("/login");
    }
  };

  const chartBarHeights = [16, 24, 20, 28, 18, 22];

  // Get user role from profile, default to influencer if not available
  const userRole = userProfile?.user_role || "influencer";
  const navItems =
    userRole === "business"
      ? businessNavItems
      : userRole === "admin"
        ? adminNavItems
        : influencerNavItems;

  // Show loading state while auth is loading
  if (loading) {
    return (
      <>
        <PerformanceMonitor />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <OptimizedMotion>
      <PerformanceMonitor />
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-green-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-cal font-semibold text-gray-900">
                  Pitchype
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* User Role Badge */}
            <div className="px-6 py-4">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {userRole === "business" ? (
                  <>
                    <Building2 className="mr-1 h-3 w-3" />
                    Business Account
                  </>
                ) : userRole === "admin" ? (
                  <>
                    <Settings className="mr-1 h-3 w-3" />
                    Admin Account
                  </>
                ) : (
                  <>
                    <Users className="mr-1 h-3 w-3" />
                    Creator Account
                  </>
                )}
              </Badge>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
              {navItems.map((item) => {
                const isActive = isActivePath(pathname, item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <MotionDiv
                      whileHover={{ x: 4 }}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-white shadow-apple"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </MotionDiv>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="p-4 border-t border-gray-200">
              <Link href={`/${userRole}/settings`}>
                <MotionDiv
                  whileHover={{ x: 4 }}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </MotionDiv>
              </Link>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        }`}>
          {/* Top bar */}
          <header className="fixed top-0 right-0 left-0 bg-white border-b border-gray-200 h-16 flex-shrink-0 z-30 transition-all duration-300 ease-in-out" style={{
            left: sidebarOpen ? '256px' : '0px'
          }}>
            <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-cal font-semibold text-gray-900">
                  {userRole === "business"
                    ? "Business Dashboard"
                    : userRole === "admin"
                      ? "Admin Dashboard"
                      : "Creator Dashboard"}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                {/* Notifications Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex items-center justify-between">
                      <span>Notifications</span>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {unreadCount} new
                          </Badge>
                        )}
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={markAllAsRead}
                          >
                            Mark all read
                          </Button>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <DropdownMenuItem
                            key={notification.id}
                            className="flex-col items-start p-3 cursor-pointer"
                            onClick={() => {
                              if (!notification.is_read) {
                                markAsRead(notification.id);
                              }
                            }}
                          >
                            <div className="flex items-start justify-between w-full">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-sm font-medium">
                                    {notification.title}
                                  </h4>
                                  {!notification.is_read && (
                                    <div className="h-2 w-2 bg-blue-500 rounded-full" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No notifications
                        </div>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-center justify-center">
                      View all notifications
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-green-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {initial}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex flex-col">
                      <span className="font-medium">
                        {(userProfile as any)?.first_name &&
                        (userProfile as any)?.last_name
                          ? `${(userProfile as any).first_name} ${(userProfile as any).last_name}`
                          : userProfile?.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {userProfile?.email}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/${userRole}/settings`}
                        className="flex items-center"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/${userRole}`} className="flex items-center">
                        <Home className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" style={{ paddingTop: '80px' }}>
            {children}
          </main>
        </div>
      </div>
    </OptimizedMotion>
  );
}