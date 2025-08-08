import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const userEmail = session?.user?.email ?? null;
      setEmail(userEmail);
      if (!userEmail) navigate("/auth", { replace: true });
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      const userEmail = session?.user?.email ?? null;
      setEmail(userEmail);
      if (!userEmail) navigate("/auth", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to SwiftEatz</h1>
        <p className="text-lg text-muted-foreground">Your personalized meal planning hub.</p>
        {email ? (
          <div className="space-y-2">
            <p className="text-sm">Signed in as {email}</p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={signOut}>Sign out</Button>
            </div>
          </div>
        ) : (
          <Button asChild>
            <Link to="/auth">Log in</Link>
          </Button>
        )}
      </section>
    </main>
  );
};

export default Index;
