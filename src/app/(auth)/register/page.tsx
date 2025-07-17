"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  Users,
  ArrowRight,
  Chrome,
  Facebook,
  Shield,
  Zap,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { MotionDiv } from "@/components/performance/LazyMotion";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<"business" | "influencer">("business");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    agreeToTerms: false,
    agreeToMarketing: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }
    
    if (!formData.agreeToTerms) {
      toast.error("Please agree to the Terms of Service and Privacy Policy");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userData = {
        userType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: userType === 'business' ? formData.companyName : undefined,
      };

      const { error } = await signUp(formData.email, formData.password, userData);
      
      if (error) {
        toast.error(error.message || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      toast.success('Account created successfully! Please check your email to verify your account.');
      
      // Redirect to login page for email verification
      router.push('/login');
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MotionDiv
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
            Create your account
          </CardTitle>
          <CardDescription className="text-gray-600">
            Join thousands of creators and brands on Pitchype
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Role Selection */}
          <Tabs value={userType} onValueChange={(value) => setUserType(value as "business" | "influencer")}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger value="business" className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Business</span>
              </TabsTrigger>
              <TabsTrigger value="influencer" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Creator</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Company Name (for business users) */}
            {userType === "business" && (
              <div className="space-y-2">
                <label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                  Company name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Your company name"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-primary focus:ring-primary"
                  required
                />
              </div>
            </div>



            {/* Password Fields */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-primary focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-primary focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and Marketing */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:text-primary/80 underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:text-primary/80 underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="marketing"
                  checked={formData.agreeToMarketing}
                  onCheckedChange={(checked) => handleInputChange("agreeToMarketing", checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="marketing" className="text-sm text-gray-600">
                  I'd like to receive marketing emails about new features and updates
                </label>
              </div>
            </div>

            {/* Create Account Button */}
            <Button
              type="submit"
              disabled={!formData.agreeToTerms || isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 shadow-apple text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
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
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Registration */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 border-gray-200 hover:bg-gray-50">
              <Chrome className="h-4 w-4 mr-2" />
              Google
            </Button>
            <Button variant="outline" className="h-12 border-gray-200 hover:bg-gray-50">
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Demo Note */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-center">
              <h4 className="font-medium text-green-900 mb-2">Demo Registration</h4>
              <p className="text-sm text-green-700">
                This is a demo application. Fill out the form with any information to test the registration flow.
                You'll be automatically logged in after registration.
              </p>
            </div>
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
    </MotionDiv>
  );
}