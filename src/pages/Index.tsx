import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Clock, Users, Utensils, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // If user is logged in but hasn't completed onboarding
      if (!profile?.onboarding_completed) {
        navigate('/onboarding');
        return;
      }
      // If user is logged in and onboarded, go to dashboard
      navigate('/dashboard');
    }
  }, [user, profile, loading, navigate]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">SwiftEatz</span>
          </div>
          <Button asChild variant="outline">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your AI-Powered
            <span className="text-primary block">Meal Planning Companion</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create personalized meal plans, generate smart grocery lists, and order ingredients with just a few clicks. 
            Let AI handle the planning while you enjoy the cooking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <ChefHat className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>AI Meal Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get personalized weekly meal plans based on your dietary preferences, allergies, and cooking skills.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Utensils className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Recipe Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create and save your own recipes, or import them from URLs with AI-powered parsing.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Smart Grocery Lists</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Auto-generate grocery lists from your meal plans with smart ingredient substitutions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Family Friendly</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Scale recipes for any household size and accommodate multiple dietary preferences.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Preview */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-gray-600 mb-12">Start free and upgrade as you grow</p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="text-3xl font-bold">$0<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 1 AI meal plan per month</li>
                  <li>• Up to 5 custom recipes</li>
                  <li>• Basic grocery lists</li>
                  <li>• 1 Smart Suggest per month</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative border-primary">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white px-3 py-1 text-sm rounded-full">Most Popular</span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-3xl font-bold">$29.99<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 10 AI meal plans per month</li>
                  <li>• Up to 100 custom recipes</li>
                  <li>• Full grocery list export</li>
                  <li>• Unlimited Smart Suggest</li>
                  <li>• Grocery ordering integration</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Premium</CardTitle>
                <div className="text-3xl font-bold">$69.99<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Unlimited meal plans</li>
                  <li>• Unlimited recipes</li>
                  <li>• Advanced AI customization</li>
                  <li>• Bulk recipe import</li>
                  <li>• Family profiles</li>
                  <li>• Priority support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center space-x-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">SwiftEatz</span>
          </div>
          <p className="text-center text-gray-600 mt-4">
            Making meal planning effortless with AI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;