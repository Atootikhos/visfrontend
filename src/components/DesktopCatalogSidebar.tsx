
import React, { useState } from 'react';
import { textureCatalogs } from '@/data/textureCatalogs';
import { Search, Grid3X3, List, Heart, X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DesktopCatalogSidebarProps {
  onTextureSelect: (textureUrl: string) => void;
  selectedTexture: string | null;
  isOpen: boolean;
  onClose: () => void;
  favoriteTextures: Set<string>;
  onToggleFavorite: (textureId: string) => void;
}

export const DesktopCatalogSidebar: React.FC<DesktopCatalogSidebarProps> = ({ 
  onTextureSelect, 
  selectedTexture,
  isOpen,
  onClose,
  favoriteTextures,
  onToggleFavorite
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const categories = Object.entries(textureCatalogs);
  const selectedCatalog = selectedCategory ? textureCatalogs[selectedCategory] : null;

  const handleCategorySelect = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    setShowFavoritesOnly(false); // Reset favorites filter when selecting a category
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setShowFavoritesOnly(false); // Reset favorites filter when going back
  };

  const handleTextureSelect = (textureUrl: string) => {
    onTextureSelect(textureUrl);
    // Auto-minimize the sidebar after selection
    onClose();
  };

  const handleToggleFavorite = (e: React.MouseEvent, textureId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Desktop: Toggling favorite for texture ID:', textureId);
    console.log('Desktop: Current favorites:', Array.from(favoriteTextures));
    onToggleFavorite(textureId);
  };

  const handleToggleFavoritesFilter = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    if (!showFavoritesOnly) {
      // When enabling favorites filter, go back to category view if needed
      setSelectedCategory(null);
    }
  };

  // Get all favorite textures across all categories
  const getAllFavoriteTextures = () => {
    const allFavorites: Array<{texture: any, categoryName: string}> = [];
    
    Object.entries(textureCatalogs).forEach(([categoryKey, catalog]) => {
      catalog.textures.forEach(texture => {
        if (favoriteTextures.has(texture.id)) {
          allFavorites.push({ texture, categoryName: catalog.name });
        }
      });
    });
    
    return allFavorites;
  };

  // Filter textures based on favorites
  const getFilteredTextures = () => {
    if (showFavoritesOnly) {
      return getAllFavoriteTextures();
    }
    
    if (selectedCatalog) {
      return selectedCatalog.textures.map(texture => ({ 
        texture, 
        categoryName: selectedCatalog.name 
      }));
    }
    
    return [];
  };

  const filteredTextures = getFilteredTextures();

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {(selectedCategory || showFavoritesOnly) && (
              <Button variant="ghost" size="sm" onClick={handleBackToCategories}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {showFavoritesOnly 
                ? 'Favorite Materials' 
                : selectedCategory 
                  ? selectedCatalog?.name 
                  : 'Material Catalog'
              }
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {(selectedCategory || showFavoritesOnly) && (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* View Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">View:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-2 py-1"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-2 py-1"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleToggleFavoritesFilter}
                  className={showFavoritesOnly ? 'text-red-500' : ''}
                >
                  <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          </>
        )}
        
        {!selectedCategory && !showFavoritesOnly && (
          <div className="flex items-center justify-end">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleToggleFavoritesFilter}
              className={showFavoritesOnly ? 'text-red-500' : ''}
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            </Button>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {!selectedCategory && !showFavoritesOnly ? (
          // Category Selection View
          <div className="grid grid-cols-1 gap-4">
            {categories.map(([categoryKey, catalog]) => (
              <div
                key={categoryKey}
                onClick={() => handleCategorySelect(categoryKey)}
                className="relative cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 p-4 hover:scale-105 transition-all shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/50">
                    <img
                      src={catalog.textures[0]?.url}
                      alt={catalog.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{catalog.name}</h3>
                    <p className="text-gray-600 text-sm">{catalog.textures.length} options</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Textures Grid View (both category and favorites)
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {filteredTextures.length === 0 && showFavoritesOnly ? (
              <div className="col-span-2 text-center py-8">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No favorite materials yet</p>
                <p className="text-gray-400 text-sm">Click the heart icon on any material to add it to your favorites</p>
              </div>
            ) : (
              filteredTextures.map(({ texture, categoryName }) => {
                const isFavorited = favoriteTextures.has(texture.id);
                console.log(`Desktop: Texture ${texture.name} (ID: ${texture.id}) is favorited:`, isFavorited);
                
                return (
                  <div
                    key={texture.id}
                    onClick={() => handleTextureSelect(texture.url)}
                    className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all hover:scale-105 ${
                      selectedTexture === texture.url
                        ? 'ring-2 ring-blue-500 shadow-lg'
                        : 'shadow-md hover:shadow-lg'
                    }`}
                  >
                    <div className={`relative bg-gray-100 ${viewMode === 'list' ? 'h-20' : ''}`}
                         style={viewMode === 'grid' ? { paddingTop: '100%' } : {}}
                    >
                      <img
                        src={texture.url}
                        alt={texture.name}
                        className={`object-cover ${viewMode === 'grid' ? 'absolute top-0 left-0 w-full h-full' : 'w-full h-full'}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className={`absolute ${viewMode === 'grid' ? 'bottom-3 left-3 right-3' : 'inset-3 flex items-end'}`}>
                        <div>
                          <h3 className="text-white font-medium text-sm">{texture.name}</h3>
                          <p className="text-white/80 text-xs">{categoryName}</p>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleToggleFavorite(e, texture.id)}
                          className={`w-8 h-8 p-0 rounded-full ${
                            isFavorited
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
