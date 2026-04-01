import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sprout, BarChart3, Cloud, MessageSquare, Leaf, ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Sprout,
    title: "Smart Crop Prediction",
    description: "AI analyzes soil nutrients, climate data, and historical yields to recommend the perfect crops for your land.",
  },
  {
    icon: BarChart3,
    title: "Yield Forecasting",
    description: "Predict harvest output with precision using advanced machine learning models trained on real agricultural data.",
  },
  {
    icon: Cloud,
    title: "Weather Intelligence",
    description: "Real-time weather monitoring and forecasts tailored to your farm's exact location for better planning.",
  },
  {
    icon: MessageSquare,
    title: "AI Farm Assistant",
    description: "Get instant answers to farming questions from our intelligent chatbot, available 24/7.",
  },
];

const stats = [
  { value: "95%", label: "Prediction Accuracy" },
  { value: "10K+", label: "Active Farmers" },
  { value: "50+", label: "Crop Varieties" },
  { value: "24/7", label: "AI Support" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">FarmAssist</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Stats</a>
            <a href="#cta" className="hover:text-foreground transition-colors">Get Started</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="btn-glow">Sign up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-150 h-150 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-75 h-75 bg-accent/8 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Agriculture
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            Grow Smarter with{" "}
            <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              AI-Driven Insights
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            FarmAssist helps farmers make data-driven decisions with crop prediction, yield forecasting, and real-time weather intelligence — all powered by machine learning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="btn-glow text-base px-8 h-12 gap-2">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="text-base px-8 h-12">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card p-6 text-center">
              <div className="text-3xl font-extrabold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything Your Farm Needs
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Powerful AI tools designed for modern agriculture.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="glass-card-hover p-6 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-20 px-6">
        <div className="max-w-3xl mx-auto glass-card p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-accent/5 pointer-events-none" />
          <div className="relative z-10">
            <Shield className="w-10 h-10 text-primary mx-auto mb-5" />
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Farm?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands of farmers using AI to increase yields and reduce waste. Start free today.
            </p>
            <Link to="/login">
              <Button size="lg" className="btn-glow text-base px-10 h-12 gap-2">
                Start Now
                <TrendingUp className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-primary" />
            <span>FarmAssist © 2026</span>
          </div>
          <div className="flex gap-6">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}