import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "./ObjectUploader";
import type { EditSession, Template } from "@shared/schema";
import type { UploadResult } from "@uppy/core";
import { CheckCircle, Clock, AlertCircle, Download, Trash2 } from "lucide-react";

interface BatchProcessorProps {
  onBatchComplete?: (batchId: string) => void;
}

interface BatchSession extends EditSession {
  fileName?: string;
}

export default function BatchProcessor({ onBatchComplete }: BatchProcessorProps) {
  const [batchId, setBatchId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [quality, setQuality] = useState("high");
  const [outputFormat, setOutputFormat] = useState("png");
  const [processingSpeed, setProcessingSpeed] = useState([7]);
  const [uploadedFiles, setUploadedFiles] = useState<{url: string, name: string}[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate batch ID when component mounts
  useEffect(() => {
    const newBatchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setBatchId(newBatchId);
  }, []);

  // Fetch batch sessions with real-time progress tracking
  const { data: batchSessions, isLoading: sessionsLoading } = useQuery<BatchSession[]>({
    queryKey: ['/api/sessions/batch', batchId],
    queryFn: async () => {
      if (!batchId) throw new Error('No batch ID');
      const response = await fetch(`/api/sessions/batch/${batchId}`);
      if (!response.ok) throw new Error('Failed to fetch batch sessions');
      return response.json();
    },
    enabled: !!batchId,
    refetchInterval: (query) => {
      // Refetch every 2 seconds if any sessions are processing
      const data = query.state.data;
      const hasProcessing = data?.some((session: BatchSession) => session.status === 'processing');
      return hasProcessing ? 2000 : false;
    },
  });

  // Get upload parameters
  const getUploadParameters = useCallback(async () => {
    const response = await fetch('/api/objects/upload', {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }
    
    const { uploadURL } = await response.json();
    return {
      method: 'PUT' as const,
      url: uploadURL,
    };
  }, []);

  // Create batch sessions mutation
  const createBatchSessionsMutation = useMutation({
    mutationFn: async (files: {url: string, name: string}[]) => {
      if (!batchId) throw new Error('No batch ID');
      
      const sessions = await Promise.all(
        files.map(async (file) => {
          const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              batchId,
              originalImageUrl: file.url 
            }),
          });
          if (!response.ok) throw new Error(`Failed to create session for ${file.name}`);
          return response.json();
        })
      );
      return sessions;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/batch', batchId] });
      toast({
        title: "Sessions created",
        description: `Created ${uploadedFiles.length} editing sessions`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper function to process sessions with concurrency control
  const processSessionBatch = async (sessions: BatchSession[], concurrencyLimit = 3) => {
    const settings = {
      quality,
      format: outputFormat,
      speed: processingSpeed[0],
    };

    const results: PromiseSettledResult<any>[] = [];
    
    // Process in chunks to control concurrency
    for (let i = 0; i < sessions.length; i += concurrencyLimit) {
      const chunk = sessions.slice(i, i + concurrencyLimit);
      
      const chunkResults = await Promise.allSettled(
        chunk.map(async (session) => {
          // Update session to processing immediately for UI feedback
          queryClient.setQueryData(['/api/sessions/batch', batchId], (oldData: BatchSession[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map(s => 
              s.id === session.id ? { ...s, status: 'processing' as const } : s
            );
          });

          const response = await fetch('/api/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: session.id,
              prompt: prompt.trim(),
              imageUrl: session.originalImageUrl,
              settings,
            }),
          });
          
          if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to process ${session.id}: ${error}`);
          }
          
          return response.json();
        })
      );
      
      results.push(...chunkResults);
      
      // Small delay between chunks to be respectful to the API
      if (i + concurrencyLimit < sessions.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  };

  // Process batch mutation
  const processBatchMutation = useMutation({
    mutationFn: async () => {
      if (!batchSessions || !prompt.trim()) {
        throw new Error('Missing sessions or prompt');
      }

      // Process with concurrency control
      const results = await processSessionBatch(batchSessions);
      return results;
    },
    onSuccess: (results) => {
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/batch', batchId] });
      
      toast({
        title: "Batch processing complete",
        description: `${successful} successful, ${failed} failed`,
      });

      if (batchId) {
        onBatchComplete?.(batchId);
      }
    },
    onError: (error) => {
      toast({
        title: "Batch processing failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUploadComplete = useCallback((result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const newFiles = result.successful.map((file) => {
        const uploadURL = file.uploadURL;
        if (uploadURL) {
          // Convert upload URL to object path
          const url = new URL(uploadURL);
          const objectPath = `/objects${url.pathname.split('/').slice(2).join('/')}`;
          return {
            url: objectPath,
            name: file.name || `image-${Date.now()}`,
          };
        }
        return null;
      }).filter(Boolean) as {url: string, name: string}[];
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const handleCreateSessions = useCallback(() => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files uploaded",
        description: "Please upload some images first",
        variant: "destructive",
      });
      return;
    }
    createBatchSessionsMutation.mutate(uploadedFiles);
  }, [uploadedFiles, createBatchSessionsMutation]);

  const handleProcessBatch = useCallback(() => {
    if (!batchSessions || batchSessions.length === 0) {
      toast({
        title: "No sessions",
        description: "Please create sessions first",
        variant: "destructive",
      });
      return;
    }
    
    if (!prompt.trim()) {
      toast({
        title: "Missing prompt",
        description: "Please enter a prompt for processing",
        variant: "destructive",
      });
      return;
    }

    processBatchMutation.mutate();
  }, [batchSessions, prompt, processBatchMutation]);

  const handleDownloadAll = useCallback(() => {
    const completedSessions = batchSessions?.filter(s => s.status === 'completed' && s.currentImageUrl) || [];
    
    if (completedSessions.length === 0) {
      toast({
        title: "No completed images",
        description: "Process some images first",
        variant: "destructive",
      });
      return;
    }

    // Download each image
    completedSessions.forEach((session, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = session.currentImageUrl!;
        link.download = `batch-${batchId}-${index + 1}.${outputFormat}`;
        link.click();
      }, index * 500); // Stagger downloads
    });

    toast({
      title: "Download started",
      description: `Downloading ${completedSessions.length} images`,
    });
  }, [batchSessions, batchId, outputFormat]);

  const handleRemoveFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'idle': 'secondary',
      'processing': 'default',
      'completed': 'default',
      'error': 'destructive',
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const completedCount = batchSessions?.filter(s => s.status === 'completed').length || 0;
  const processingCount = batchSessions?.filter(s => s.status === 'processing').length || 0;
  const errorCount = batchSessions?.filter(s => s.status === 'error').length || 0;
  const totalCount = batchSessions?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6" data-testid="batch-processor">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Images for Batch Processing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ObjectUploader
            maxNumberOfFiles={10}
            onGetUploadParameters={getUploadParameters}
            onComplete={handleUploadComplete}
            buttonClassName="w-full"
          >
            Upload Multiple Images
          </ObjectUploader>
          
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Files ({uploadedFiles.length})</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <span className="text-sm font-medium">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      data-testid={`remove-file-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={handleCreateSessions}
                disabled={createBatchSessionsMutation.isPending}
                className="w-full"
                data-testid="create-sessions"
              >
                {createBatchSessionsMutation.isPending ? "Creating Sessions..." : "Create Sessions"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Section */}
      {batchSessions && batchSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Processing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Processing Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Enter your editing prompt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                data-testid="batch-prompt"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Quality</Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger data-testid="quality-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger data-testid="format-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Speed</Label>
                <Select value={processingSpeed[0].toString()} onValueChange={(value) => setProcessingSpeed([parseInt(value)])}>
                  <SelectTrigger data-testid="speed-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Fast</SelectItem>
                    <SelectItem value="7">Balanced</SelectItem>
                    <SelectItem value="10">Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleProcessBatch}
              disabled={processBatchMutation.isPending || !prompt.trim()}
              className="w-full"
              data-testid="process-batch"
            >
              {processBatchMutation.isPending ? "Processing..." : `Process ${totalCount} Images`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Progress Section */}
      {batchSessions && batchSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progress Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{processingCount}</div>
                <div className="text-sm text-muted-foreground">Processing</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{totalCount}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>

            {completedCount > 0 && (
              <Button 
                onClick={handleDownloadAll}
                className="w-full"
                data-testid="download-all"
              >
                <Download className="h-4 w-4 mr-2" />
                Download All ({completedCount} images)
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sessions List */}
      {batchSessions && batchSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {batchSessions.map((session, index) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(session.status)}
                    <span className="font-medium">Image {index + 1}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(session.status)}
                    {session.currentImageUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = session.currentImageUrl!;
                          link.download = `image-${index + 1}.${outputFormat}`;
                          link.click();
                        }}
                        data-testid={`download-${session.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}