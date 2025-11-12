import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import authImage from "@/assets/auth-image.jpg";
import vector from "@/assets/vector.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success("Welcome back!");
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex w-full flex-col justify-center">
        <div className="mx-auto w-full max-w-md px-4 py-8">
          <div className="mb-8">
            <img src={logo} alt="Maglo Logo" className="h-8 w-auto" />
          </div>

          <div className="w-full">
            <h1 className="mb-1 text-3xl sm:text-4xl font-bold">Welcome back</h1>
            <p className="mb-6 sm:mb-8 text-muted-foreground">Welcome back! Please enter your details</p>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Remember for 30 Days
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm font-medium text-foreground hover:underline">
                  Forgot password
                </Link>
              </div>

              <Button type="submit" className="h-12 w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              <div className="flex flex-col w-fit mx-auto space-y-2 mt-4">
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup" className="font-medium text-foreground underline">
                    Sign up for free
                  </Link>
                </p>
                <span className="justify-end flex">
                  <img src={vector} alt="vector image" className="object-contain" />
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2">
        <img src={authImage} alt="Authentication" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
