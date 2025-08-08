import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    document.title = isSignUp ? "Sign up | SwiftEatz" : "Log in | SwiftEatz";
  }, [isSignUp]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Sync session locally and redirect when authenticated
      if (session?.user) {
        navigate("/", { replace: true });
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate("/", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        if (error) throw error;
        toast({ title: "Check your email", description: "Confirm your email to finish signup." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back", description: "Signed in successfully." });
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      toast({ title: "Auth error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const oauthSignIn = async (provider: "google" | "facebook" | "twitter") => {
    try {
      const redirectTo = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
      if (error) throw error;
    } catch (err: any) {
      toast({ title: "OAuth error", description: err.message });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <section className="w-full max-w-md rounded-lg border border-input bg-card p-6 shadow-sm">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">{isSignUp ? "Create your account" : "Welcome back"}</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in with email or continue with social</p>
        </header>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : isSignUp ? "Sign up" : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 grid gap-2">
          <Button variant="outline" onClick={() => oauthSignIn("google")}>Continue with Google</Button>
          <Button variant="outline" onClick={() => oauthSignIn("facebook")}>Continue with Facebook</Button>
          <Button variant="outline" onClick={() => oauthSignIn("twitter")}>Continue with X (Twitter)</Button>
        </div>

        <footer className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "New to SwiftEatz?"} {" "}
          <button className="underline" onClick={() => setIsSignUp((v) => !v)}>
            {isSignUp ? "Sign in" : "Create one"}
          </button>
        </footer>
      </section>
    </main>
  );
};

export default Auth;
