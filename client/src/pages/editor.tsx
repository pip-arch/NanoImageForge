import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ImageUploader from "@/components/ImageUploader";
import BeforeAfterComparison from "@/components/BeforeAfterComparison";
import ProcessingStatus from "@/components/ProcessingStatus";
import TemplateSelector from "@/components/TemplateSelector";
import type { EditSession, Template, EditHistory } from "@shared/schema";

export default function Editor() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [quality, setQuality] = useState("high");
  const [outputFormat, setOutputFormat] = useState("png");
  const [processingSpeed, setProcessingSpeed] = useState("7");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current session
  const { data: currentSession, isLoading: sessionLoading } = useQuery<EditSession>({
    queryKey: ['/api/sessions', currentSessionId],
    enabled: !!currentSessionId,
  });

  // Fetch templates
  const { data: templates } = useQuery<Template[]>({
    queryKey: ['/api/templates'],
  });

  // Fetch edit history
  const { data: editHistory } = useQuery<EditHistory[]>({
    queryKey: ['/api/sessions', currentSessionId, 'history'],
    enabled: !!currentSessionId,
  });

  // Fetch recent sessions
  const { data: recentSessions } = useQuery<EditSession[]>({
    queryKey: ['/api/sessions'],
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: { originalImageUrl: string }) => {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create session');
      return response.json();
    },
    onSuccess: (session: EditSession) => {
      setCurrentSessionId(session.id);
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      toast({
        title: "Session created",
        description: "Ready to start editing!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create editing session",
        variant: "destructive",
      });
    },
  });

  // Process image mutation
  const processImageMutation = useMutation({
    mutationFn: async (data: { sessionId: string; prompt: string; imageUrl: string; settings?: any }) => {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to process image');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', currentSessionId] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', currentSessionId, 'history'] });
      toast({
        title: "Image processed!",
        description: `Completed in ${(data.processingTime / 1000).toFixed(1)}s`,
      });
      setShowComparison(true);
    },
    onError: (error) => {
      toast({
        title: "Processing failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageUploaded = useCallback((imageUrl: string) => {
    createSessionMutation.mutate({ originalImageUrl: imageUrl });
  }, [createSessionMutation]);

  const handleProcessImage = useCallback(() => {
    if (!currentSessionId || !currentSession || !prompt.trim()) {
      toast({
        title: "Missing information",
        description: "Please upload an image and enter a prompt",
        variant: "destructive",
      });
      return;
    }

    const settings = {
      quality,
      format: outputFormat,
      speed: parseInt(processingSpeed),
    };

    processImageMutation.mutate({
      sessionId: currentSessionId,
      prompt: prompt.trim(),
      imageUrl: currentSession.originalImageUrl,
      settings,
    });
  }, [currentSessionId, currentSession, prompt, quality, outputFormat, processingSpeed, processImageMutation]);

  const handleTemplateSelect = useCallback((template: Template) => {
    setPrompt(template.prompt);
    setShowTemplates(false);
    toast({
      title: "Template applied",
      description: `"${template.name}" template ready to use`,
    });
  }, []);

  const handleQuickAction = useCallback((action: string) => {
    const quickPrompts: Record<string, string> = {
      'remove-background': 'Remove the background completely, make it transparent',
      'enhance-quality': 'Enhance image quality, increase sharpness and clarity, improve lighting',
      'style-transfer': 'Apply artistic style transformation with enhanced colors and creative composition',
    };
    
    const actionPrompt = quickPrompts[action];
    if (actionPrompt) {
      setPrompt(actionPrompt);
      toast({
        title: "Quick action set",
        description: "Prompt ready for processing",
      });
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!currentSession?.currentImageUrl) return;
    
    const link = document.createElement('a');
    link.href = currentSession.currentImageUrl;
    link.download = `edited-image.${outputFormat}`;
    link.click();
    
    toast({
      title: "Download started",
      description: "Your edited image is downloading",
    });
  }, [currentSession?.currentImageUrl, outputFormat]);

  const suggestedPrompts = [
    "Remove background",
    "Enhance lighting", 
    "Add studio background",
    "Professional retouch"
  ];

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
            <Button variant="default" size="sm" data-testid="nav-editor">Editor</Button>
            <Link href="/gallery">
              <Button variant="ghost" size="sm" data-testid="nav-gallery">Gallery</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setShowTemplates(true)} data-testid="nav-templates">
              Templates
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Credits: <span className="font-semibold text-foreground">250</span></span>
          </div>
          <div className="w-8 h-8 bg-muted rounded-full"></div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar */}
        <aside className="w-80 bg-card border-r border-border p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Upload Image</h2>
              <ImageUploader onImageUploaded={handleImageUploaded} data-testid="image-uploader" />
            </div>

            {/* Quick Templates */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-foreground">Professional Templates</h3>
              <div className="grid grid-cols-2 gap-3">
                {templates?.slice(0, 4).map((template: Template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-center space-y-2"
                    onClick={() => handleTemplateSelect(template)}
                    data-testid={`template-${template.category}`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                      <span className="text-white text-lg">
                        {template.category === 'professional' ? '👔' :
                         template.category === 'product' ? '📦' :
                         template.category === 'social' ? '📱' : '🎨'}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-center">{template.name}</p>
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-foreground">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => handleQuickAction('remove-background')}
                  data-testid="quick-action-remove-bg"
                >
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 text-sm">✂️</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Remove Background</p>
                    <p className="text-xs text-muted-foreground">AI-powered background removal</p>
                  </div>
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => handleQuickAction('enhance-quality')}
                  data-testid="quick-action-enhance"
                >
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-green-600 text-sm">✨</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Enhance Quality</p>
                    <p className="text-xs text-muted-foreground">Upscale and sharpen image</p>
                  </div>
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => handleQuickAction('style-transfer')}
                  data-testid="quick-action-style"
                >
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-purple-600 text-sm">🎨</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Style Transfer</p>
                    <p className="text-xs text-muted-foreground">Apply artistic styles</p>
                  </div>
                </Button>
              </div>
            </div>

            {/* Recent Edits */}
            {recentSessions && recentSessions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-foreground">Recent Edits</h3>
                <div className="space-y-2">
                  {recentSessions.slice(0, 3).map((session: EditSession) => (
                    <div
                      key={session.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => setCurrentSessionId(session.id)}
                      data-testid={`recent-edit-${session.id}`}
                    >
                      <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                        {session.currentImageUrl ? (
                          <img 
                            src={session.currentImageUrl} 
                            alt="Recent edit" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-muted-foreground">📷</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {session.prompt || 'Untitled edit'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 flex flex-col bg-muted/30">
          {/* Canvas Toolbar */}
          <div className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" data-testid="btn-undo">
                  <span className="mr-2">↶</span>
                </Button>
                <Button variant="ghost" size="sm" data-testid="btn-redo">
                  <span className="mr-2">↷</span>
                </Button>
              </div>
              <div className="h-6 w-px bg-border"></div>
              <div className="flex items-center space-x-2">
                <Button variant="secondary" size="sm" data-testid="btn-fit">Fit</Button>
                <span className="text-sm text-muted-foreground">100%</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowComparison(!showComparison)}
                data-testid="btn-compare"
              >
                <span className="mr-2">⚖️</span>
                Compare
              </Button>
              {currentSession?.currentImageUrl && (
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={handleDownload}
                  data-testid="btn-download"
                >
                  <span className="mr-2">⬇️</span>
                  Download
                </Button>
              )}
            </div>
          </div>

          {/* Canvas Content */}
          <div className="flex-1 flex items-center justify-center p-6">
            {!currentSession ? (
              <div className="text-center space-y-6 max-w-md">
                <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <span className="text-3xl">📷</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">Start Your AI Edit</h3>
                  <p className="text-muted-foreground">Upload an image or choose from professional templates to begin editing with AI</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600" data-testid="btn-upload-image">
                    Upload Image
                  </Button>
                  <Button variant="outline" onClick={() => setShowTemplates(true)} data-testid="btn-browse-templates">
                    Browse Templates
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-4xl">
                <BeforeAfterComparison
                  originalImage={currentSession.originalImageUrl}
                  editedImage={currentSession.currentImageUrl}
                  showComparison={showComparison}
                />
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 bg-card border-l border-border overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* AI Text Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">AI Editor</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">Nano Banana</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to change... (e.g., 'Remove the background and replace with a professional studio setup')"
                  className="h-24 resize-none"
                  data-testid="prompt-textarea"
                />
                
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={handleProcessImage}
                    disabled={processImageMutation.isPending || !currentSession || !prompt.trim()}
                    data-testid="btn-process-image"
                  >
                    <span className="mr-2">✨</span>
                    Apply AI Edit
                  </Button>
                  <Button variant="outline" onClick={() => setPrompt("")} data-testid="btn-clear-prompt">
                    🗑️
                  </Button>
                </div>
              </div>
              
              {/* Suggestion Pills */}
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                    onClick={() => setPrompt(suggestion)}
                    data-testid={`suggestion-${suggestion.replace(' ', '-').toLowerCase()}`}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>

            {/* Processing Status */}
            {processImageMutation.isPending && (
              <ProcessingStatus />
            )}

            {/* Edit History */}
            {editHistory && editHistory.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-foreground">Edit History</h3>
                <div className="space-y-2">
                  {editHistory.map((edit) => (
                    <div
                      key={edit.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer group"
                      data-testid={`edit-history-${edit.id}`}
                    >
                      <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                        <span className="text-sm">✨</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{edit.prompt}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(edit.createdAt).toLocaleString()} • {edit.processingTime ? `${(edit.processingTime / 1000).toFixed(1)}s` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Settings */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-foreground">Settings</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Quality</span>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="ultra">Ultra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Output Format</span>
                  <Select value={outputFormat} onValueChange={setOutputFormat}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpg">JPG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* API Status */}
            <Card>
              <CardContent className="p-3">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">API Status</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Model</span>
                    <span className="font-medium">Nano Banana</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>

      {/* Template Selection Modal */}
      <TemplateSelector
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleTemplateSelect}
        templates={templates || []}
      />
    </div>
  );
}
