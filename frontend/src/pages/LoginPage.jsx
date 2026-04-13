import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, register } = useAuth();

  const from = location.state?.from?.pathname || "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  // ── Login ──────────────────────────────────────────────────────────────────
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await login(loginForm.email, loginForm.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "" });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await register(signupForm.name, signupForm.email, signupForm.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-linear-to-br from-primary/15 via-background to-accent/10" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-125 h-125 bg-primary/10 rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-md px-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-foreground">FarmAssist</h2>
          <p className="text-muted-foreground leading-relaxed">
            AI-powered agriculture intelligence. Make smarter decisions, grow better crops, and maximise your yield.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { val: "99%", lbl: "Accuracy" },
              { val: "50+", lbl: "Crops" },
              { val: "24/7", lbl: "Support" },
            ].map((s) => (
              <div key={s.lbl} className="glass-card p-3 text-center">
                <div className="text-lg font-bold text-primary">{s.val}</div>
                <div className="text-xs text-muted-foreground">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold">FarmAssist</span>
          </div>

          <Tabs defaultValue="login" className="w-full" onValueChange={() => setError(null)}>
            <TabsList className="w-full mb-8 bg-secondary/50">
              <TabsTrigger value="login"  className="flex-1">Log in</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Sign up</TabsTrigger>
            </TabsList>

            {/* ── Login ─────────────────────────────────────────────────────── */}
            <TabsContent value="login">
              <div className="mb-6">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Enter your credentials to access your dashboard.
                </p>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-email" type="email" placeholder="farmer@example.com"
                      className="pl-10" required
                      value={loginForm.email}
                      onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" className="pl-10 pr-10" required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                    />
                    <button
                      type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full btn-glow h-11 gap-2" disabled={loading}>
                  {loading ? "Signing in…" : <> Log in <ArrowRight className="w-4 h-4" /></>}
                </Button>
              </form>
            </TabsContent>

            {/* ── Sign Up ───────────────────────────────────────────────────── */}
            <TabsContent value="signup">
              <div className="mb-6">
                <h1 className="text-2xl font-bold">Create an account</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Start your smart farming journey today.
                </p>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-name" placeholder="John Farmer" className="pl-10" required
                      value={signupForm.name}
                      onChange={(e) => setSignupForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-email" type="email" placeholder="farmer@example.com"
                      className="pl-10" required
                      value={signupForm.email}
                      onChange={(e) => setSignupForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters" className="pl-10 pr-10"
                      minLength={6} required
                      value={signupForm.password}
                      onChange={(e) => setSignupForm((f) => ({ ...f, password: e.target.value }))}
                    />
                    <button
                      type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full btn-glow h-11 gap-2" disabled={loading}>
                  {loading ? "Creating account…" : <> Create Account <ArrowRight className="w-4 h-4" /></>}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-muted-foreground text-center mt-8">
            By continuing, you agree to our{" "}
            <span className="text-primary cursor-pointer hover:underline">Terms</span> and{" "}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
          </p>

          <p className="text-xs text-muted-foreground text-center mt-3">
            <Link to="/" className="text-primary hover:underline">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
