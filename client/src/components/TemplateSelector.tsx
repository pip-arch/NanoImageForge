import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Template } from "@shared/schema";

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
  templates: Template[];
}

export default function TemplateSelector({ 
  isOpen, 
  onClose, 
  onSelect, 
  templates 
}: TemplateSelectorProps) {
  const handleTemplateSelect = (template: Template) => {
    onSelect(template);
    onClose();
  };

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'professional': return '👔';
      case 'product': return '📦';
      case 'social': return '📱';
      case 'artistic': return '🎨';
      default: return '✨';
    }
  };

  const getGradientClass = (category: string) => {
    switch (category) {
      case 'professional': return 'from-blue-500 to-purple-600';
      case 'product': return 'from-green-500 to-teal-600';
      case 'social': return 'from-pink-500 to-rose-600';
      case 'artistic': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Professional Templates</DialogTitle>
          <DialogDescription>
            Choose a template to get started with professional editing prompts
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[70vh] py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                onClick={() => handleTemplateSelect(template)}
                data-testid={`template-${template.category}-${template.id}`}
              >
                <CardContent className="p-0">
                  <div className={`relative aspect-[4/5] bg-gradient-to-br ${getGradientClass(template.category)} rounded-t-lg overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl opacity-30">
                        {getTemplateIcon(template.category)}
                      </span>
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          className="bg-white text-black hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTemplateSelect(template);
                          }}
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground capitalize">{template.category}</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateSelect(template);
                        }}
                      >
                        Select
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
