
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { textureCatalogs } from '@/data/textureCatalogs';
import { Search, Grid3X3, List, Heart, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobileCatalogSheetProps {
  onTextureSelect: (textureUrl: string) => void;
  selectedTexture: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  favoriteTextures: Set<string>;
  onToggleFavorite: (textureId: string) => void;
}

export const MobileCatalogSheet: React.FC<MobileCatalogSheetProps> = ({ 
  onTextureSelect, 
  selectedTexture,
  isOpen,
  onOpenChange,
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
    setShowFavoritesOnly(false);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setShowFavoritesOnly(false);
  };

  const handleTextureSelect = (textureUrl: string) => {
    onTextureSelect(textureUrl);
    // Auto-close the sheet after selection on mobile
    onOpenChange(false);
  };

  const handleToggleFavorite = (e: React.MouseEvent, textureId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Mobile: Toggling favorite for texture ID:', textureId);
    onToggleFavorite(textureId);
  };

  const handleToggleFavoritesFilter = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    if (!showFavoritesOnly) {
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

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(selectedCategory || showFavoritesOnly) && (
                  <Button variant="ghost" size="sm" onClick={handleBackToCategories}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                )}
                <SheetTitle className="text-lg mr-2">
                  {showFavoritesOnly 
                    ? 'Favorite Materials' 
                    : selectedCategory 
                      ? selectedCatalog?.name 
                      : 'Material Catalog'
                  }
                </SheetTitle>
              </div>
              
              <div className="ml-auto">
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

            {(selectedCategory || showFavoritesOnly) && (
              <>
                {/* Search */}
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search materials..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* View Controls */}
                <div className="flex items-center justify-between mt-4">
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
                </div>
              </>
            )}
          </SheetHeader>
          
          <ScrollArea className="flex-1 p-4">
            {!selectedCategory && !showFavoritesOnly ? (
              // Category Selection View
              <div className="grid grid-cols-1 gap-4">
                {categories.map(([categoryKey, catalog]) => (
                  <div
                    key={categoryKey}
                    onClick={() => handleCategorySelect(categoryKey)}
                    className="relative cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 p-4 active:scale-95 transition-all shadow-md"
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
              // Textures Grid View
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
                    
                    return (
                      <div
                        key={texture.id}
                        onClick={() => handleTextureSelect(texture.url)}
                        className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all active:scale-95 ${
                          selectedTexture === texture.url
                            ? 'ring-2 ring-blue-500 shadow-lg'
                            : 'shadow-md'
                        }`}
                      >
                        <div className={`relative bg-gray-100 ${viewMode === 'grid' ? 'aspect-square' : 'h-20'}`}>
                          <img
                            src={texture.url}
                            alt={texture.name}
                            className="w-full h-full object-cover"
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
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};
