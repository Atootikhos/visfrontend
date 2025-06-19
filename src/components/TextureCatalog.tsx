
import React, { useState } from 'react';
import { Upload, Plus } from 'lucide-react';
import { textureCatalogs } from '@/data/textureCatalogs';
import { Button } from '@/components/ui/button';

interface TextureCatalogProps {
  onTextureSelect: (textureUrl: string) => void;
}

export const TextureCatalog: React.FC<TextureCatalogProps> = ({ onTextureSelect }) => {
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

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-2 p-1 bg-black/20 rounded-xl">
        {Object.entries(textureCatalogs).map(([key, catalog]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              selectedCategory === key
                ? 'bg-white text-gray-900 shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {catalog.name}
          </button>
        ))}
      </div>

      {/* Texture Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {textureCatalogs[selectedCategory]?.textures.map((texture) => (
          <div
            key={texture.id}
            onClick={() => handleTextureClick(texture.url)}
            className={`group relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 ${
              selectedTexture === texture.url
                ? 'ring-2 ring-blue-400 shadow-xl shadow-blue-400/25'
                : 'hover:shadow-xl'
            }`}
          >
            <div className="aspect-square relative">
              <img
                src={texture.url}
                alt={texture.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="font-medium text-sm">{texture.name}</p>
                <p className="text-xs text-white/80">{texture.description}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Custom Upload Card */}
        <div className="aspect-square relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleCustomUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="w-full h-full bg-white/10 border-2 border-dashed border-white/30 rounded-xl flex flex-col items-center justify-center hover:bg-white/20 hover:border-white/50 transition-all group">
            <Plus className="w-8 h-8 text-white/60 group-hover:text-white/80 mb-2" />
            <p className="text-white/60 group-hover:text-white/80 text-sm font-medium">Upload Custom</p>
          </div>
        </div>
      </div>

      {/* Selected Texture Info */}
      {selectedTexture && (
        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <p className="text-white font-medium mb-2">Selected Material</p>
          <div className="flex items-center gap-3">
            <img
              src={selectedTexture}
              alt="Selected texture"
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <p className="text-white/90 text-sm">Ready to apply to your driveway</p>
              <p className="text-white/60 text-xs">Click on the preview to see the result</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
