import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Grid3X3, Fullscreen, FlipHorizontal } from 'lucide-react';
interface TutorialPopupProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  isManualMode?: boolean;
}
const getTutorialSteps = (isManualMode: boolean) => {
  if (isManualMode) {
    return [{
      title: "Manual Detection Mode",
      content: "You're now in manual detection mode. This tutorial will guide you through drawing the floor boundary.",
      icon: "✋"
    }, {
      title: "Step 1: Point at Corners",
      content: "Click on the corners and edges of your driveway to create a boundary. Start from one corner and work your way around the perimeter.",
      icon: "📍"
    }, {
      title: "Step 2: Drawing Tools",
      content: "• Undo: Remove the last point you placed\n• Clear: Start over and remove all points\n• Complete: Finish drawing when you have at least 3 points\n• Cancel: Exit without saving",
      icon: "🛠️"
    }, {
      title: "Step 3: Complete the Boundary",
      content: "Once you've outlined the entire driveway area, click 'Complete' to finish. Make sure you have at least 3 points for a valid boundary.",
      icon: "✅"
    }, {
      title: "What's Next?",
      content: "After completing the boundary, you'll be able to browse materials from the catalog and see how they look on your driveway!",
      icon: "🎨"
    }];
  }
  return [{
    title: "Welcome to Driveway Visualizer!",
    content: "This tutorial will guide you through visualizing different materials on your driveway.",
    icon: "🏠"
  }, {
    title: "Step 1: Material Catalog",
    content: "Click the 'Catalog' button to browse and select different driveway materials like concrete, pavers, stones, and more.",
    icon: <Grid3X3 className="w-6 h-6" />
  }, {
    title: "Step 2: View Controls",
    content: "Use the 'Compare' button to see before/after views, and 'Full' button for fullscreen viewing.",
    icon: <FlipHorizontal className="w-6 h-6" />
  }, {
    title: "Step 3: Download Result",
    content: "Once you're happy with your visualization, click 'Download' to save the result to your device.",
    icon: "💾"
  }, {
    title: "Pro Tips",
    content: "• Try different materials to see what works best\n• Use fullscreen mode for better detail viewing\n• The comparison slider helps you see the transformation",
    icon: "💡"
  }];
};
export const TutorialPopup: React.FC<TutorialPopupProps> = ({
  isOpen,
  onClose,
  isMobile,
  isManualMode = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const tutorialSteps = getTutorialSteps(isManualMode);
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const currentTutorial = tutorialSteps[currentStep];
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-px my-0 px-[15px]">
        <DialogHeader>
          <DialogTitle>
            {isManualMode ? 'Manual Detection Tutorial' : 'Tutorial'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center text-2xl bg-blue-50 rounded-full">
              {typeof currentTutorial.icon === 'string' ? currentTutorial.icon : currentTutorial.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{currentTutorial.title}</h3>
            <p className="text-gray-600 text-sm whitespace-pre-line">
              {currentTutorial.content}
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            {tutorialSteps.map((_, index) => <div key={index} className={`w-2 h-2 rounded-full ${index === currentStep ? 'bg-blue-600' : 'bg-gray-300'}`} />)}
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <Button onClick={nextStep} className="flex items-center gap-2">
              {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
              {currentStep !== tutorialSteps.length - 1 && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};