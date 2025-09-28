import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ProcessingStatus() {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("Initializing...");

  useEffect(() => {
    const stages = [
      "Analyzing image content...",
      "Applying AI transformations...",
      "Enhancing details...",
      "Finalizing results..."
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        
        // Update stage based on progress
        const stageProgress = Math.floor(newProgress / 25);
        if (stageProgress !== currentStage && stageProgress < stages.length) {
          currentStage = stageProgress;
          setStage(stages[currentStage]);
        }
        
        return Math.min(newProgress, 95); // Don't reach 100% until actually done
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Processing Image</span>
          <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="animate-spin">
            <span>⚙️</span>
          </div>
          <span>{stage}</span>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <span>Estimated completion: ~15 seconds</span>
        </div>
      </CardContent>
    </Card>
  );
}
