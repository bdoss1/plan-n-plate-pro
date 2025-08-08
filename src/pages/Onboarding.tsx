import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ChefHat, ArrowRight, ArrowLeft } from 'lucide-react';

const DIETARY_PREFERENCES = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'plant-based', label: 'Plant-based' },
  { id: 'keto', label: 'Keto' },
  { id: 'low-carb', label: 'Low Carb' },
  { id: 'paleo', label: 'Paleo' },
  { id: 'gluten-free', label: 'Gluten-free' },
  { id: 'dairy-free', label: 'Dairy-free' },
  { id: 'mediterranean', label: 'Mediterranean' },
  { id: 'low-sodium', label: 'Low Sodium' }
];

const COMMON_ALLERGIES = [
  { id: 'nuts', label: 'Nuts' },
  { id: 'peanuts', label: 'Peanuts' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'shellfish', label: 'Shellfish' },
  { id: 'fish', label: 'Fish' },
  { id: 'soy', label: 'Soy' },
  { id: 'gluten', label: 'Gluten' },
  { id: 'sesame', label: 'Sesame' }
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dietary_preferences: [] as string[],
    allergies: [] as string[],
    budget_range: '',
    cooking_skill_level: '',
    meals_per_week: 7,
    household_size: 1
  });
  
  const { user, profile, fetchProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // If user already completed onboarding, redirect to dashboard
    if (profile?.onboarding_completed) {
      navigate('/');
    }
  }, [user, profile, navigate]);

  const handleDietaryPreferenceChange = (preferenceId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      dietary_preferences: checked 
        ? [...prev.dietary_preferences, preferenceId]
        : prev.dietary_preferences.filter(id => id !== preferenceId)
    }));
  };

  const handleAllergyChange = (allergyId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      allergies: checked 
        ? [...prev.allergies, allergyId]
        : prev.allergies.filter(id => id !== allergyId)
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to save your preferences. Please try again.",
          variant: "destructive"
        });
        return;
      }

      await fetchProfile();
      
      toast({
        title: "Welcome to SwiftEatz!",
        description: "Your preferences have been saved. Let's start meal planning!",
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true; // Dietary preferences are optional
      case 2:
        return formData.budget_range && formData.cooking_skill_level;
      case 3:
        return formData.household_size >= 1 && formData.meals_per_week >= 1;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Dietary Preferences</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select any dietary preferences that apply to you (optional):
              </p>
              <div className="grid grid-cols-2 gap-3">
                {DIETARY_PREFERENCES.map((preference) => (
                  <div key={preference.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={preference.id}
                      checked={formData.dietary_preferences.includes(preference.id)}
                      onCheckedChange={(checked) => 
                        handleDietaryPreferenceChange(preference.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={preference.id} className="text-sm">
                      {preference.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Allergies & Restrictions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select any foods you're allergic to or want to avoid:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {COMMON_ALLERGIES.map((allergy) => (
                  <div key={allergy.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={allergy.id}
                      checked={formData.allergies.includes(allergy.id)}
                      onCheckedChange={(checked) => 
                        handleAllergyChange(allergy.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={allergy.id} className="text-sm">
                      {allergy.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="budget_range" className="text-lg font-semibold">
                Budget Range
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                What's your typical weekly grocery budget?
              </p>
              <Select
                value={formData.budget_range}
                onValueChange={(value) => setFormData(prev => ({ ...prev, budget_range: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">$50 - $100 per week</SelectItem>
                  <SelectItem value="medium">$100 - $200 per week</SelectItem>
                  <SelectItem value="high">$200+ per week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cooking_skill" className="text-lg font-semibold">
                Cooking Skill Level
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                How would you describe your cooking experience?
              </p>
              <Select
                value={formData.cooking_skill_level}
                onValueChange={(value) => setFormData(prev => ({ ...prev, cooking_skill_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner - I'm just starting out</SelectItem>
                  <SelectItem value="intermediate">Intermediate - I can follow recipes well</SelectItem>
                  <SelectItem value="advanced">Advanced - I'm comfortable experimenting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="household_size" className="text-lg font-semibold">
                Household Size
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                How many people are you cooking for?
              </p>
              <Input
                id="household_size"
                type="number"
                min="1"
                max="10"
                value={formData.household_size}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  household_size: parseInt(e.target.value) || 1 
                }))}
                className="w-24"
              />
            </div>

            <div>
              <Label htmlFor="meals_per_week" className="text-lg font-semibold">
                Meals per Week
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                How many meals do you want to plan each week?
              </p>
              <Input
                id="meals_per_week"
                type="number"
                min="1"
                max="21"
                value={formData.meals_per_week}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  meals_per_week: parseInt(e.target.value) || 7 
                }))}
                className="w-24"
              />
              <p className="text-xs text-muted-foreground mt-2">
                This includes breakfast, lunch, and dinner (21 max per week)
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold text-primary">SwiftEatz</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Let's personalize your experience</h1>
          <p className="text-muted-foreground">
            Tell us about your preferences so we can create the perfect meal plans for you
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Step {currentStep} of 3</CardTitle>
              <div className="flex space-x-1">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full ${
                      step <= currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
            <CardDescription>
              {currentStep === 1 && "Dietary preferences and allergies"}
              {currentStep === 2 && "Budget and cooking experience"}
              {currentStep === 3 && "Household details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed() || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : currentStep === 3 ? (
                  'Complete Setup'
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;