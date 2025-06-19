import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bot, Hand } from 'lucide-react';
export type DetectionMode = 'auto' | 'manual';
interface DetectionModeSelectorProps {
  selectedMode: DetectionMode;
  onModeChange: (mode: DetectionMode) => void;
}
export const DetectionModeSelector: React.FC<DetectionModeSelectorProps> = ({
  selectedMode,
  onModeChange
}) => {
  return <Card className="p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">Detection Mode</h3>
      <div className="grid grid-cols-2 gap-3">
        <Button variant={selectedMode === 'auto' ? 'default' : 'outline'} onClick={() => onModeChange('auto')} className="h-auto p-4 flex flex-col gap-2">
          <Bot className="w-6 h-6" />
          <span className="font-medium">AI Detect</span>
          <span className="text-xs opacity-80">AI detects floor automatically</span>
        </Button>
        
        <Button variant={selectedMode === 'manual' ? 'default' : 'outline'} onClick={() => onModeChange('manual')} className="h-auto p-4 flex flex-col gap-2">
          <Hand className="w-6 h-6" />
          <span className="font-medium">Manual Draw</span>
          <span className="text-xs opacity-80">Manually Draw Floor</span>
        </Button>
      </div>
    </Card>;
};