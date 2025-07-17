"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MotionDiv } from "@/components/performance/LazyMotion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setIsSubmitted(true);
  };

  const handleResend = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    alert("Reset link sent again!");
  };

  if (isSubmitted) {
    return (
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="border-0 shadow-apple-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-400 rounded-2xl flex items-center justify-center shadow-apple">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-cal font-bold text-gray-900">
              Check your email
            </CardTitle>
            <CardDescription className="text-gray-600">
              We've sent a password reset link to your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <Mail className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  We sent a reset link to
                </p>
                <p className="font-medium text-gray-900">{email}</p>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>The link will expire in 15 minutes</span>
                </div>
                <p>
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={handleResend}
                    disabled={isLoading}
                    className="text-primary hover:text-primary/80 font-medium underline disabled:opacity-50"
                  >
                    {isLoading ? "Sending..." : "resend it"}
                  </button>
                </p>
              </div>
            </div>

            {/* Back to Login */}
            <div className="pt-4 border-t border-gray-100">
              <Link
                href="/login"
                className="flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to sign in</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Mail className="h-3 w-3" />
                  <span>Encrypted</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Fast delivery</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionDiv>
    );
  }

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
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-cal font-bold text-gray-900">
            Forgot your password?
          </CardTitle>
          <CardDescription className="text-gray-600">
            No worries! Enter your email and we'll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-primary focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Send Reset Link Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 shadow-apple text-white font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending reset link...
                </>
              ) : (
                <>
                  Send reset link
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="text-center">
            <Link
              href="/login"
              className="flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to sign in</span>
            </Link>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Security note</p>
                <p className="text-blue-700">
                  For your security, we'll only send reset links to registered email addresses.
                  If you don't receive an email, the address might not be associated with an account.
                </p>
              </div>
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
                <Mail className="h-3 w-3" />
                <span>Encrypted</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Fast delivery</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  );
}