import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">✨</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">NanoStudio</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-3">
              {user.profileImageUrl && (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                  data-testid="user-avatar"
                />
              )}
              <span className="text-sm text-muted-foreground" data-testid="user-name">
                {user.firstName || user.email || 'User'}
              </span>
            </div>
          )}
          <Button variant="ghost" onClick={handleLogout} data-testid="logout-button">
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Ready to create something amazing? Choose how you'd like to get started.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link href="/editor">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">🎨</span>
                  <span>Start Editing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Upload an image and start editing with our AI-powered tools
                </p>
                <Button className="mt-4 w-full" data-testid="start-editing">
                  Open Editor
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/gallery">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">📂</span>
                  <span>View Gallery</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Browse your previous edits and download your creations
                </p>
                <Button variant="outline" className="mt-4 w-full" data-testid="view-gallery">
                  Open Gallery
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/templates">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">📋</span>
                  <span>Templates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Explore professional templates for different use cases
                </p>
                <Button variant="outline" className="mt-4 w-full" data-testid="view-templates">
                  Browse Templates
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your recent edits and activity will appear here once you start using the editor.
            </p>
            <div className="mt-4">
              <Link href="/editor">
                <Button data-testid="create-first-edit">
                  Create Your First Edit
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}