
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Upload, Plus } from 'lucide-react';
import { textureCatalogs } from '@/data/textureCatalogs';

interface MobileTextureCatalogProps {
  onTextureSelect: (textureUrl: string) => void;
}

export const MobileTextureCatalog: React.FC<MobileTextureCatalogProps> = ({ onTextureSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState('concrete');
  const [selectedTexture, setSelectedTexture] = useState<string | null>(null);

  const handleTextureClick = (textureUrl: string) => {
    setSelectedTexture(textureUrl);
    onTextureSelect(textureUrl);
  };

  const handleCustomUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      handleTextureClick(url);
    }
  };

  const categoryKeys = Object.keys(textureCatalogs);
  const currentIndex = categoryKeys.indexOf(selectedCategory);

  const nextCategory = () => {
    const nextIndex = (currentIndex + 1) % categoryKeys.length;
    setSelectedCategory(categoryKeys[nextIndex]);
  };

  const prevCategory = () => {
    const prevIndex = currentIndex === 0 ? categoryKeys.length - 1 : currentIndex - 1;
    setSelectedCategory(categoryKeys[prevIndex]);
  };

  return (
    <div className="space-y-4">
      {/* Category Navigation */}
      <div className="flex items-center justify-between bg-black/20 rounded-xl p-4">
        <button
          onClick={prevCategory}
          className="p-2 text-white/70 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <h3 className="text-white font-semibold text-lg">
            {textureCatalogs[selectedCategory]?.name}
          </h3>
          <p className="text-white/60 text-xs">
            {currentIndex + 1} of {categoryKeys.length}
          </p>
        </div>
        
        <button
          onClick={nextCategory}
          className="p-2 text-white/70 hover:text-white"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Texture Grid */}
      <div className="grid grid-cols-2 gap-3">
        {textureCatalogs[selectedCategory]?.textures.map((texture) => (
          <div
            key={texture.id}
            onClick={() => handleTextureClick(texture.url)}
            className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${
              selectedTexture === texture.url
                ? 'ring-2 ring-blue-400 scale-105'
                : 'hover:scale-105'
            }`}
          >
            <div className="aspect-square">
              <img
                src={texture.url}
                alt={texture.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <p className="font-medium text-xs">{texture.name}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Custom Upload */}
        <div className="aspect-square relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleCustomUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="w-full h-full bg-white/10 border-2 border-dashed border-white/30 rounded-lg flex flex-col items-center justify-center">
            <Plus className="w-6 h-6 text-white/60 mb-1" />
            <p className="text-white/60 text-xs">Custom</p>
          </div>
        </div>
      </div>

      {/* Selected Info */}
      {selectedTexture && (
        <div className="bg-white/10 rounded-lg p-3 border border-white/20">
          <div className="flex items-center gap-2">
            <img
              src={selectedTexture}
              alt="Selected"
              className="w-8 h-8 rounded object-cover"
            />
            <div>
              <p className="text-white text-sm font-medium">Material Selected</p>
              <p className="text-white/60 text-xs">Ready to preview</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
