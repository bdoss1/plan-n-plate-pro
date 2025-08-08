import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    // Get user profile for preferences
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    if (profileError) {
      throw new Error("Could not fetch user profile");
    }

    // Check subscription limits for Smart Suggest
    if (profile.subscription_tier === 'free' && profile.monthly_smart_suggests_used >= 1) {
      return new Response(JSON.stringify({ 
        error: "You've reached your monthly Smart Suggest limit. Upgrade to Pro for unlimited suggestions!",
        upgrade_required: true 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { ingredients } = await req.json();
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      throw new Error("No ingredients provided");
    }

    const prompt = `You are a smart grocery assistant. For the following grocery items, suggest better alternatives that are either:
    1. More cost-effective (cheaper but same quality)
    2. Healthier (better nutritional value)
    3. In-season (if applicable)
    
    Original items: ${ingredients.map(item => item.name || item).join(', ')}
    
    For each item, provide a suggestion in this JSON format:
    {
      "suggestions": [
        {
          "original": "original item name",
          "suggested": "suggested alternative name",
          "reason": "why this is better (cost/health/seasonal)",
          "estimated_savings": "dollar amount or percentage if cost-related"
        }
      ]
    }
    
    Only suggest items that are realistic substitutes. If an item is already optimal, you can skip it.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a grocery and nutrition expert. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const suggestionsContent = data.choices[0].message.content;
    let suggestions;
    
    try {
      suggestions = JSON.parse(suggestionsContent);
    } catch (parseError) {
      throw new Error('Failed to parse suggestions from AI');
    }

    // Update usage counter for free tier
    if (profile.subscription_tier === 'free') {
      await supabaseClient
        .from('profiles')
        .update({ 
          monthly_smart_suggests_used: (profile.monthly_smart_suggests_used || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userData.user.id);
    }

    return new Response(JSON.stringify({ 
      success: true,
      suggestions: suggestions.suggestions || [],
      usage: {
        used: profile.subscription_tier === 'free' ? (profile.monthly_smart_suggests_used || 0) + 1 : 0,
        limit: profile.subscription_tier === 'free' ? 1 : 999
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in smart-suggest:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate suggestions' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});