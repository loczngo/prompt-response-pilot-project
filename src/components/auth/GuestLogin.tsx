
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const GuestLogin = ({ onBack }: { onBack: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a valid email format using the username
      const email = `${username.toLowerCase()}@promptresponse.com`;

      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
              first_name: name || username,
              role: 'guest'
            }
          }
        });

        if (signUpError) throw signUpError;

        toast({
          title: "Account created",
          description: "You can now sign in with your credentials.",
        });
        
        setIsSignUp(false);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;
        
        // If sign in successful, refresh the page to trigger the auth context update
        // This will cause the Index component to render the appropriate interface
        if (data && data.user) {
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
          
          // Force a page reload to update auth context
          navigate('/');
          window.location.reload();
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      
      toast({
        title: "Error",
        description: error.message || "Authentication failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{isSignUp ? 'Create Guest Account' : 'Sign In as Guest'}</CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Create an account to join tables and respond to prompts' 
              : 'Welcome back! Sign in to continue'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">Your Name (Optional)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Password must be at least 6 characters
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex w-full space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={onBack}
            >
              Back
            </Button>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </div>
          
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Sign Up"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default GuestLogin;
