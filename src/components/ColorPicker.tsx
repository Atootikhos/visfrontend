
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const PRESET_COLORS = [
  { name: 'Classic Gray', color: '#6B7280' },
  { name: 'Charcoal', color: '#374151' },
  { name: 'Slate Blue', color: '#475569' },
  { name: 'Warm Beige', color: '#D1C7B7' },
  { name: 'Brick Red', color: '#DC2626' },
  { name: 'Forest Green', color: '#059669' },
  { name: 'Navy Blue', color: '#1E40AF' },
  { name: 'Deep Purple', color: '#7C3AED' },
  { name: 'Chocolate Brown', color: '#92400E' },
  { name: 'Terracotta', color: '#EA580C' },
  { name: 'Sage Green', color: '#84CC16' },
  { name: 'Ocean Blue', color: '#0EA5E9' },
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorChange }) => {
  const [customColor, setCustomColor] = useState(selectedColor);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onColorChange(color);
  };

  return (
    <div className="space-y-6">
      {/* Preset Colors */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Popular Driveway Colors</Label>
        <div className="grid grid-cols-3 gap-3">
          {PRESET_COLORS.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              className={`h-auto p-3 flex flex-col items-center gap-2 transition-all duration-200 ${
                selectedColor === preset.color 
                  ? 'border-blue-500 bg-blue-50 shadow-md scale-105' 
                  : 'hover:scale-102 hover:shadow-sm'
              }`}
              onClick={() => onColorChange(preset.color)}
            >
              <div 
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: preset.color }}
              />
              <span className="text-xs font-medium text-center leading-tight">
                {preset.name}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Color Picker */}
      <div className="border-t pt-6">
        <Label className="text-sm font-medium mb-3 block">Custom Color</Label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              className="h-12 w-full cursor-pointer border-2"
            />
          </div>
          <div className="flex-1">
            <Input
              type="text"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                  onColorChange(e.target.value);
                }
              }}
              placeholder="#4A90E2"
              className="font-mono"
            />
          </div>
        </div>
      </div>

      {/* Color Preview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <Label className="text-sm font-medium mb-2 block">Preview</Label>
        <div className="flex items-center gap-3">
          <div 
            className="w-16 h-16 rounded-lg border-2 border-white shadow-md"
            style={{ backgroundColor: selectedColor }}
          />
          <div>
            <p className="font-medium text-gray-900">Selected Color</p>
            <p className="text-sm text-gray-500 font-mono">{selectedColor}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
