import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { preferences } = await req.json();

    // Check if OpenAI API key is available
    if (!openAIApiKey) {
      console.error("OpenAI API key not configured");
      return new Response(JSON.stringify({ 
        error: "AI meal planning service is not configured. Please contact support." 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = "You are a nutritionist and meal planner. Return ONLY valid JSON for a 7-day meal plan with breakfast, lunch, dinner, and snacks. Format: { \"days\": [ { \"day\": \"Monday\", \"meals\": { \"breakfast\": \"meal description\", \"lunch\": \"meal description\", \"dinner\": \"meal description\", \"snacks\": \"snack description\" }, \"calories\": 2000, \"notes\": \"any notes\" } ] }";
    
    const userPrompt = `Generate a weekly meal plan tailored to these preferences:
    - Dietary preferences: ${preferences.dietary_preferences?.join(', ') || 'None'}
    - Allergies: ${preferences.allergies?.join(', ') || 'None'}
    - Budget: ${preferences.budget_range || 'moderate'}
    - Cooking skill: ${preferences.cooking_skill_level || 'intermediate'}
    - Household size: ${preferences.household_size || 1}
    - Meals per week: ${preferences.meals_per_week || 7}
    - Target calories per day: ${preferences.calories_per_day || 2000}
    
    Make the meals practical, nutritious, and suitable for the specified preferences.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    // Parse and validate the JSON response
    const mealPlan = JSON.parse(content);
    
    return new Response(JSON.stringify(mealPlan), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (error: any) {
    console.error("Error in generate-meal-plan:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
