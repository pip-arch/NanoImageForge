import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { EditSession } from "@shared/schema";

export default function Gallery() {
  const { data: sessions, isLoading } = useQuery<EditSession[]>({
    queryKey: ['/api/sessions'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">✨</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">NanoStudio</h1>
          </div>
          <nav className="hidden md:flex space-x-1">
            <Link href="/editor">
              <Button variant="ghost" size="sm" data-testid="nav-editor">Editor</Button>
            </Link>
            <Button variant="default" size="sm" data-testid="nav-gallery">Gallery</Button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Credits: <span className="font-semibold text-foreground">250</span></span>
          </div>
          <div className="w-8 h-8 bg-muted rounded-full"></div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Your Creations</h2>
          <p className="text-muted-foreground">Browse through your AI-edited images and previous sessions</p>
        </div>

        {!sessions || sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🖼️</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No edits yet</h3>
            <p className="text-muted-foreground mb-6">Start creating amazing AI-edited images</p>
            <Link href="/editor">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" data-testid="btn-start-editing">
                Start Editing
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sessions.map((session: EditSession) => (
              <Card key={session.id} className="group cursor-pointer hover:shadow-lg transition-shadow" data-testid={`gallery-item-${session.id}`}>
                <CardContent className="p-0">
                  <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
                    {session.currentImageUrl ? (
                      <img 
                        src={session.currentImageUrl} 
                        alt="Edited image" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : session.originalImageUrl ? (
                      <img 
                        src={session.originalImageUrl} 
                        alt="Original image" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-60"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl text-muted-foreground">📷</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        session.status === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : session.status === 'processing'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : session.status === 'error'
                          ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                      }`}>
                        {session.status === 'completed' ? '✅ Completed' :
                         session.status === 'processing' ? '⏳ Processing' :
                         session.status === 'error' ? '❌ Failed' : '⏸️ Idle'}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium text-foreground mb-1 line-clamp-2">
                      {session.prompt || 'Untitled Edit'}
                    </p>
                    
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.createdAt).toLocaleDateString()} • {new Date(session.createdAt).toLocaleTimeString()}
                    </p>
                    
                    {session.processingCompletedAt && session.processingStartedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Processing: {Math.round((new Date(session.processingCompletedAt).getTime() - new Date(session.processingStartedAt).getTime()) / 1000 * 10) / 10}s
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
