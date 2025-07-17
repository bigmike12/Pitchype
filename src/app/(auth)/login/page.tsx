"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Building2,
  Users,
  Chrome,
  Facebook,
  Shield,
  Zap,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAllAuthStorage, useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"business" | "influencer">(
    "business"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error, data } = await signIn(email, password);

      if (error) {
        toast.error(error.message || "Failed to sign in");
        setIsLoading(false);
        return;
      }

      const loggedInUserType = data?.user?.user_metadata?.user_role as
        | "business"
        | "influencer"
        | "admin";

      if (loggedInUserType !== userType) {
        toast.error("Selected wrong account type!");
        clearAllAuthStorage();
        setIsLoading(false);
        return;
      }

      toast.success("Successfully signed in!");

      if (loggedInUserType === "business") {
        router.push("/business/");
      } else if (loggedInUserType === "influencer") {
        router.push("/influencer/");
      } else if (loggedInUserType === "admin") {
        router.push("/admin");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  // Optional: Add role validation before sign in
  const handleSubmitWithValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast.error(error.message || "Failed to sign in");
        setIsLoading(false);
        return;
      }

      // Wait a moment for the auth context to update with user profile
      setTimeout(() => {
        // The auth context will handle the redirect based on actual user role
        // If you want to validate the role matches selection, you can add logic here
        toast.success("Successfully signed in!");
        setIsLoading(false);
      }, 100);
    } catch (error) {
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="border-0 shadow-apple-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-green-400 rounded-2xl flex items-center justify-center shadow-apple">
              <span className="text-white font-bold text-2xl">P</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-cal font-bold text-gray-900">
            Welcome back
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to your Pitchype account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Role Selection - Optional: You can remove this if not needed */}
          <Tabs
            value={userType}
            onValueChange={(value) =>
              setUserType(value as "business" | "influencer")
            }
          >
            <TabsList className="grid w-full grid-cols-3 bg-gray-100">
              <TabsTrigger
                value="business"
                className="flex items-center space-x-2"
              >
                <Building2 className="h-4 w-4" />
                <span>Business</span>
              </TabsTrigger>
              <TabsTrigger
                value="influencer"
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Creator</span>
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="flex items-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-primary focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 border-gray-200 focus:border-primary focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 shadow-apple text-white font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-12 border-gray-200 hover:bg-gray-50"
            >
              <Chrome className="h-4 w-4 mr-2" />
              Google
            </Button>
            <Button
              variant="outline"
              className="h-12 border-gray-200 hover:bg-gray-50"
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>Fast</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>Trusted by 50K+</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
