import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, Loader2, Grid3X3, Menu, Home, ZoomIn, ZoomOut, FlipHorizontal, RotateCcw, HelpCircle } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { DetectionModeSelector, DetectionMode } from './DetectionModeSelector';
import { ManualDetection } from './ManualDetection';
import { ImageComparisonSlider } from './ImageComparisonSlider';
import { MobileCatalogSheet } from './MobileCatalogSheet';
import { DesktopCatalogSidebar } from './DesktopCatalogSidebar';
import { BackButton } from './BackButton';
import { TutorialPopup } from './TutorialPopup';
import { detectFloor } from '@/utils/floorDetection';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const samplePhotos = [
  {
    id: 1,
    url: '/lovable-uploads/d206077d-d633-499c-91a2-fc6d3c2c700f.png',
    title: 'Modern Driveway',
    description: 'Paver stone driveway'
  },
  {
    id: 2,
    url: '/2.JPG',
    title: 'Traditional Home',
    description: 'Concrete driveway'
  },
  {
    id: 3,
    url: '/3.jpg',
    title: 'Contemporary Style',
    description: 'Curved driveway design'
  },
  {
    id: 4,
    url: '/4.jpg',
    title: 'Suburban Home',
    description: 'Standard concrete'
  },
  {
    id: 5,
    url: '/5.jpg',
    title: 'Large Driveway',
    description: 'Spacious layout'
  },
  {
    id: 6,
    url: '/6.jpg',
    title: 'Modern Garage',
    description: 'Clean lines'
  },
  {
    id: 7,
    url: '/7.jpg',
    title: 'Family Home',
    description: 'Classic design'
  },
  {
    id: 8,
    url: '/9.webp',
    title: 'Elegant Entry',
    description: 'Sophisticated look'
  }
];

export const DrivewyVisualizer = () => {
  // Initialize processing state from sessionStorage to survive HMR
  const [isProcessing, setIsProcessing] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('driveway-ai-processing') === 'true';
    }
    return false;
  });

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalImageBitmap, setOriginalImageBitmap] = useState<ImageBitmap | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [floorMask, setFloorMask] = useState<string | ImageData | null>(null);
  const [selectedTexture, setSelectedTexture] = useState<string | null>(null);
  const [detectionMode, setDetectionMode] = useState<DetectionMode>('auto');
  const [showManualDetection, setShowManualDetection] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showManualTutorial, setShowManualTutorial] = useState(false);
  const { toast } = useToast();
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [showCatalogSidebar, setShowCatalogSidebar] = useState(false);
  const [showMobileCatalog, setShowMobileCatalog] = useState(false);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [favoriteTextures, setFavoriteTextures] = useState<Set<string>>(new Set());
  const [isTextureProcessing, setIsTextureProcessing] = useState(false);
  const isMobile = useIsMobile();
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Check if we're in the visualization section
  const isInVisualizationSection = originalImage !== null;

  // Persist processing state to sessionStorage to survive HMR
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isProcessing) {
        sessionStorage.setItem('driveway-ai-processing', 'true');
        console.log('AI processing state saved to sessionStorage');
      } else {
        sessionStorage.removeItem('driveway-ai-processing');
        console.log('AI processing state cleared from sessionStorage');
      }
    }
  }, [isProcessing]);

  // Simplified mobile protection - only prevent navigation during processing
  useEffect(() => {
    if (!isMobile || !isProcessing) return;

    console.log('Setting up mobile navigation prevention during AI processing');

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProcessing) {
        e.preventDefault();
        e.returnValue = 'AI detection in progress. Please wait...';
        return 'AI detection in progress. Please wait...';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (isProcessing) {
        e.preventDefault();
        e.stopImmediatePropagation();
        window.history.pushState({ preventBack: true }, '', window.location.href);
        return false;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload, { passive: false });
    window.addEventListener('popstate', handlePopState, { passive: false });
    
    if (isProcessing) {
      window.history.pushState({ preventBack: true, aiProcessing: true }, '', window.location.href);
    }
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isProcessing, isMobile]);

  // Revoke object URL when the component unmounts or the image changes
  useEffect(() => {
    return () => {
      if (originalImage && originalImage.startsWith('blob:')) {
        URL.revokeObjectURL(originalImage);
      }
    };
  }, [originalImage]);

  // Revoke object URL when the component unmounts or the image changes
  useEffect(() => {
    return () => {
      if (processedImage && processedImage.startsWith('blob:')) {
        URL.revokeObjectURL(processedImage);
      }
    };
  }, [processedImage]);

  // Show tutorial for visualizer section (after auto detection or after manual detection completes)
  useEffect(() => {
    if (originalImage && !showManualDetection && floorMask) {
      const hasSeenVisualizerTutorial = localStorage.getItem('driveway-visualizer-tutorial-seen');
      if (!hasSeenVisualizerTutorial) {
        setShowTutorial(true);
        localStorage.setItem('driveway-visualizer-tutorial-seen', 'true');
      }
    }
  }, [originalImage, showManualDetection, floorMask]);

  // Show manual detection tutorial
  useEffect(() => {
    if (showManualDetection) {
      const hasSeenManualTutorial = localStorage.getItem('driveway-manual-tutorial-seen');
      if (!hasSeenManualTutorial) {
        setShowManualTutorial(true);
        localStorage.setItem('driveway-manual-tutorial-seen', 'true');
      }
    }
  }, [showManualDetection]);

  // Cleanup generated mask files from the server
  useEffect(() => {
    const maskToDelete = floorMask;

    return () => {
      // We only delete masks that are strings (i.e., URLs from the server)
      if (typeof maskToDelete === 'string') {
        const filename = maskToDelete.split('/').pop();
        if (filename) {
          console.log(`[CLEANUP] Deleting mask file from server: ${filename}`);
          fetch(`http://localhost:3001/api/delete-mask`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename }),
          }).catch(error => {
            console.error('Failed to delete mask file:', error);
          });
        }
      }
    };
  }, [floorMask]);

  const handleBackToUpload = useCallback(() => {
    // Only prevent during AI processing
    if (isProcessing) {
      console.log('Cannot navigate back during AI processing');
      return;
    }
    
    // Reset zoom state when going back
    setIsZoomedIn(false);
    setOriginalImage(null);
    setProcessedImage(null);
    setFloorMask(null);
    setSelectedTexture(null);
    setShowManualDetection(false);
    setUploadedFile(null);
    setShowCatalogSidebar(false);
    setShowMobileCatalog(false);
    setShowComparison(false);
  }, [isProcessing]);

  const handleSampleSelect = useCallback(async (imageUrl: string) => {
    if (isProcessing) {
      console.log('Cannot select sample during AI processing');
      return;
    }

    try {
      console.log('Loading sample image:', imageUrl);
      
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'sample.jpg', { type: 'image/jpeg' });
      setUploadedFile(file);

      const imageBitmap = await createImageBitmap(file);
      setOriginalImageBitmap(imageBitmap);
      setImageDimensions({ width: imageBitmap.width, height: imageBitmap.height });
      
      setOriginalImage(imageUrl);
      setFloorMask(null);
      setProcessedImage(null);
      
      if (detectionMode === 'auto') {
        console.log('Starting auto detection for sample...');
        await processAutoDetection(file);
      } else {
        setShowManualDetection(true);
      }
      
    } catch (error) {
      console.error('Error loading sample image:', error);
      toast({
        title: "Sample Load Failed",
        description: "Could not load the sample image. Please try again.",
        variant: "destructive",
      });
    }
  }, [detectionMode, toast, isProcessing]);

  const toggleZoom = useCallback(() => {
    setIsZoomedIn(prev => !prev);
  }, []);

  const toggleComparison = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowComparison(!showComparison);
  }, [showComparison]);

  const handleImageUpload = useCallback(async (file: File) => {
    // Prevent uploads during processing
    if (isProcessing) {
      console.log('Cannot upload during AI processing');
      return;
    }

    try {
      console.log('Starting image upload process...');
      setUploadedFile(file);
      
      const imageUrl = URL.createObjectURL(file);
      const imageBitmap = await createImageBitmap(file);
      setOriginalImageBitmap(imageBitmap);
      setImageDimensions({ width: imageBitmap.width, height: imageBitmap.height });
      setOriginalImage(imageUrl);
      setFloorMask(null);
      setProcessedImage(null);
      
      if (detectionMode === 'auto') {
        console.log('Starting auto detection...');
        await processAutoDetection(file);
      } else {
        console.log('Manual detection mode selected');
        setShowManualDetection(true);
      }
      
    } catch (error) {
      console.error('Error processing image:', error);
      setTimeout(() => {
        toast({
          title: "Upload Failed",
          description: "Could not process the image. Please try again.",
          variant: "destructive",
        });
      }, 0);
    }
  }, [detectionMode, toast, isProcessing]);

  const processAutoDetection = useCallback(async (file: File) => {
    try {
      console.log('Processing auto detection...');
      setIsProcessing(true);
      toast({
        title: "Processing Image",
        description: "Detecting the floor, please wait...",
      });

      const maskUrl = await detectFloor(file);
      console.log('Floor detection completed successfully');
      setFloorMask(maskUrl);

      if (isMobile) {
        setShowMobileCatalog(true);
      } else {
        setShowCatalogSidebar(true);
      }
    } catch (error) {
      console.error('Error during auto detection:', error);
      toast({
        title: "Detection Failed",
        description: error instanceof Error ? error.message : "Could not detect the driveway floor. Try manual detection instead.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isMobile, toast]);

  const handleModeChange = (mode: DetectionMode) => {
    setDetectionMode(mode);
    setFloorMask(null);
    setProcessedImage(null);
    setShowManualDetection(false);
  };

  const handleManualMaskCreated = async (maskData: ImageData) => {
    setFloorMask(maskData);
    setShowManualDetection(false);
    
    if (isMobile) {
      setShowMobileCatalog(true);
    } else {
      setShowCatalogSidebar(true);
    }

    setTimeout(() => {
      const hasSeenVisualizerTutorial = localStorage.getItem('driveway-visualizer-tutorial-seen');
      if (!hasSeenVisualizerTutorial) {
        setShowTutorial(true);
        localStorage.setItem('driveway-visualizer-tutorial-seen', 'true');
      }
    }, 500);
  };

  const handleManualDetectionCancel = () => {
    setShowManualDetection(false);
    setOriginalImage(null);
    setFloorMask(null);
    setProcessedImage(null);
    setUploadedFile(null);
  };

  const handleTextureSelect = useCallback(async (textureUrl: string) => {
    console.log('[MAIN] handleTextureSelect called with state:', { textureUrl, floorMask });
    if (!uploadedFile || !floorMask) {
      console.error('[MAIN] Aborting: floorMask or uploadedFile is null.');
      toast({
        title: "Operation Failed",
        description: "Could not apply texture because the floor mask or original image is missing.",
        variant: "destructive",
      });
      return;
    }

    setIsTextureProcessing(true);
    setSelectedTexture(textureUrl);
    setShowComparison(false);

    try {
      let maskBitmap: ImageBitmap;
      if (typeof floorMask === 'string') {
        const maskResponse = await fetch(floorMask);
        const maskBlob = await maskResponse.blob();
        maskBitmap = await createImageBitmap(maskBlob);
      } else {
        // It's an ImageData object from manual detection
        maskBitmap = await createImageBitmap(floorMask);
      }

      // Create a fresh ImageBitmap from the original file to avoid DataCloneError
      const freshImageBitmap = await createImageBitmap(uploadedFile);

      const { applyTexture } = await import('@/utils/floorDetection');
      const resultBitmap = await applyTexture(freshImageBitmap, maskBitmap, textureUrl);
      const canvas = document.createElement('canvas');
      canvas.width = resultBitmap.width;
      canvas.height = resultBitmap.height;
      const mainCtx = canvas.getContext('2d');
      if (mainCtx) {
        mainCtx.drawImage(resultBitmap, 0, 0);
        setProcessedImage(canvas.toDataURL('image/png'));
      }
    } catch (error) {
      console.error('Error applying texture:', error);
      toast({
        title: "Texture Failed",
        description: "Could not apply the selected texture.",
        variant: "destructive",
      });
    } finally {
      setIsTextureProcessing(false);
    }
  }, [uploadedFile, floorMask, toast]);

  const handleClearTexture = () => {
    setSelectedTexture(null);
    setProcessedImage(null);
    setShowComparison(false);
  };

  const downloadResult = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.download = 'driveway-visualization.png';
      link.href = processedImage;
      link.click();
    }
  };

  const handleToggleFavorite = useCallback((textureId: string) => {
    console.log('DrivewyVisualizer: Toggling favorite for texture ID:', textureId);
    
    setFavoriteTextures(prev => {
      const newFavorites = new Set(prev);
      
      if (newFavorites.has(textureId)) {
        newFavorites.delete(textureId);
        console.log('DrivewyVisualizer: Removed from favorites:', textureId);
      } else {
        newFavorites.add(textureId);
        console.log('DrivewyVisualizer: Added to favorites:', textureId);
      }
      
      console.log('DrivewyVisualizer: New favorites set:', Array.from(newFavorites));
      
      return newFavorites;
    });
  }, []);

  if (showManualDetection && originalImage) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <TutorialPopup
          isOpen={showManualTutorial}
          onClose={() => setShowManualTutorial(false)}
          isMobile={isMobile}
          isManualMode={true}
        />

        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <BackButton onClick={handleBackToUpload} />
          </div>
          
          <Card className="p-6 shadow-lg bg-white">
            <ManualDetection
              imageUrl={originalImage}
              onMaskCreated={handleManualMaskCreated}
              onCancel={() => {
                setShowManualDetection(false);
                setOriginalImage(null);
                setFloorMask(null);
                setProcessedImage(null);
                setUploadedFile(null);
              }}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <TutorialPopup
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        isMobile={isMobile}
      />

      {/* Navigation header - hidden when zoomed in */}
      {originalImage && !isZoomedIn && (
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <BackButton onClick={handleBackToUpload} />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTutorial(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Help</span>
                </Button>
                
                {!isMobile && floorMask && (
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowCatalogSidebar(true);
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Grid3X3 className="w-4 h-4" />
                    Catalog
                  </Button>
                )}

                {isMobile && floorMask && (
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowMobileCatalog(true);
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Grid3X3 className="w-4 h-4" />
                    Catalog
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed top buttons for mobile zoom mode - positioned at top of screen */}
      {isZoomedIn && isMobile && (
        <div className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
          <BackButton onClick={handleBackToUpload} />
          <Button
            onClick={toggleZoom}
            variant="outline"
            size="sm"
            className="bg-white hover:bg-gray-50 shadow-md"
          >
            <ZoomOut className="w-4 h-4 mr-2" />
            Zoom Out
          </Button>
        </div>
      )}

      <div className={`max-w-7xl mx-auto ${isZoomedIn ? 'p-0' : 'p-4'}`}>
        {!originalImage ? (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <img 
                  src="/lovable-uploads/f1d48e60-2455-49c1-a22a-f0f92c4a9e5e.png" 
                  alt="CrownCrete Logo" 
                  className="h-16 w-auto"
                />
              </div>
              
              <p className="text-gray-500 mb-8">
                Please Upload a photo of your Driveway/Garage or you can use the samples down below
              </p>
              
              {/* Upload Section */}
              <div className="max-w-md mx-auto mb-8">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                  <p className="text-gray-700 mb-6">Upload photo in PNG or JPG format.</p>
                  
                  <DetectionModeSelector
                    selectedMode={detectionMode}
                    onModeChange={(mode: DetectionMode) => {
                      setDetectionMode(mode);
                      setFloorMask(null);
                      setProcessedImage(null);
                      setShowManualDetection(false);
                    }}
                  />
                  
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    isProcessing={isProcessing}
                  />

                  {isProcessing && (
                    <div className="flex items-center justify-center gap-3 mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-blue-800 font-medium">Detecting the floor, please wait...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sample Photos Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Don't have a photo? Try these samples below!
              </h2>
              <p className="text-gray-600">
                Click on any sample to start visualizing different materials
              </p>
            </div>

            {/* Sample Photos Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {samplePhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group cursor-pointer"
                  onClick={() => handleSampleSelect(photo.url)}
                >
                  <div className="relative overflow-hidden rounded-lg border-2 border-transparent group-hover:border-blue-400 transition-all duration-200 bg-white shadow-sm">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-32 md:h-40 object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        Try Sample
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <h4 className="font-medium text-gray-900 text-sm">{photo.title}</h4>
                    <p className="text-xs text-gray-500">{photo.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Preview Section
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div 
                ref={previewContainerRef}
                className={`relative bg-gray-100 ${isZoomedIn && isMobile ? 'pt-20' : ''}`}
                style={{ height: isZoomedIn ? '100vh' : '600px' }}
              >
                {isTextureProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
                    <div className="text-center bg-white/95 backdrop-blur-sm text-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
                      <p className="font-medium text-gray-900">Applying texture, please wait...</p>
                    </div>
                  </div>
                )}

                {processedImage && showComparison ? (
                  <ImageComparisonSlider
                    originalImage={originalImage!}
                    processedImage={processedImage}
                  />
                ) : processedImage && !showComparison ? (
                  <img src={processedImage} alt="Processed" className="w-full h-full object-contain" />
                ) : (
                  <>
                    {originalImage && (
                      <img src={originalImage} alt="Original" className="w-full h-full object-contain" />
                    )}
                    {!floorMask && originalImage && !processedImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                        <div className="text-center bg-white/95 backdrop-blur-sm text-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200">
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
                              <p className="font-medium text-gray-900">Detecting the floor, please wait...</p>
                            </>
                          ) : detectionMode === 'manual' ? (
                            <p className="font-medium text-gray-900">Use Manual Detection to draw the floor area.</p>
                          ) : (
                            <p className="font-medium text-gray-900">Starting automatic detection...</p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Download button positioned at top-left of image section (desktop only) - hidden when zoomed in */}
                {processedImage && !isMobile && !isZoomedIn && (
                  <div className="absolute top-4 left-4 z-40">
                    <Button 
                      onClick={() => {
                        if (processedImage) {
                          const link = document.createElement('a');
                          link.download = 'driveway-visualization.png';
                          link.href = processedImage;
                          link.click();
                        }
                      }} 
                      className="bg-blue-600 hover:bg-blue-700 shadow-md"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}

                {/* Back button and Zoom out button when zoomed in on desktop */}
                {isZoomedIn && !isMobile && (
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-40">
                    <BackButton onClick={handleBackToUpload} />
                    <Button
                      onClick={toggleZoom}
                      variant="outline"
                      size="sm"
                      className="bg-white/90 hover:bg-white shadow-md"
                    >
                      <ZoomOut className="w-4 h-4 mr-2" />
                      Zoom Out
                    </Button>
                  </div>
                )}

                {/* Control Buttons positioned at bottom of preview - hidden when zoomed in */}
                {!isZoomedIn && (
                  <div className="absolute bottom-4 left-4 right-4 flex flex-col items-center gap-2 z-40">
                    {/* Download button for mobile - positioned above other controls */}
                    {processedImage && isMobile && (
                      <div className="w-full flex justify-center">
                        <Button
                          onClick={() => {
                            if (processedImage) {
                              const link = document.createElement('a');
                              link.download = 'driveway-visualization.png';
                              link.href = processedImage;
                              link.click();
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 shadow-md"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    )}
                    
                    {/* Other control buttons */}
                    <div className="flex justify-between items-center w-full">
                      <div className="flex gap-2">
                        <Button
                          onClick={toggleZoom}
                          variant="outline"
                          size="sm"
                          className="bg-white/90 hover:bg-white shadow-md"
                        >
                          <ZoomIn className="w-4 h-4 mr-2" />
                          Zoom In
                        </Button>
                        
                        {processedImage && (
                          <Button
                            onClick={() => setShowComparison(!showComparison)}
                            variant="outline"
                            size="sm"
                            className={`shadow-md ${
                              showComparison 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-white/90 hover:bg-white'
                            }`}
                          >
                            <FlipHorizontal className="w-4 h-4 mr-2" />
                            Compare
                          </Button>
                        )}

                        {selectedTexture && (
                          <Button
                            onClick={handleClearTexture}
                            variant="outline"
                            size="sm"
                            className="bg-white/90 hover:bg-white shadow-md"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Catalog Sheet - hidden when zoomed in */}
      {isMobile && !isZoomedIn && (
        <MobileCatalogSheet
          onTextureSelect={handleTextureSelect}
          selectedTexture={selectedTexture}
          isOpen={showMobileCatalog}
          onOpenChange={setShowMobileCatalog}
          favoriteTextures={favoriteTextures}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Desktop Catalog Sidebar - hidden when zoomed in */}
      {!isZoomedIn && (
        <DesktopCatalogSidebar
          onTextureSelect={handleTextureSelect}
          selectedTexture={selectedTexture}
          isOpen={showCatalogSidebar}
          onClose={() => setShowCatalogSidebar(false)}
          favoriteTextures={favoriteTextures}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
};
