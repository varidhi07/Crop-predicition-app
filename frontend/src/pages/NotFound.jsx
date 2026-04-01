import { Link } from "react-router-dom";
import { Leaf, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
          <Leaf className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-6xl font-bold gradient-text">404</h1>
          <p className="text-muted-foreground mt-2">This field doesn't exist yet.</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold btn-glow hover:bg-primary/90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;