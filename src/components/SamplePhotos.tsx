
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon } from 'lucide-react';

interface SamplePhotosProps {
  onSampleSelect: (imageUrl: string) => void;
}

const samplePhotos = [
  {
    id: 1,
    url: '/lovable-uploads/d206077d-d633-499c-91a2-fc6d3c2c700f.png',
    title: 'Paver Stone Driveway',
    description: 'Modern paver stone driveway'
  },
  {
    id: 2,
    url: '/driveway2.png',
    title: 'Concrete Driveway',
    description: 'Traditional concrete driveway'
  }
];

export const SamplePhotos: React.FC<SamplePhotosProps> = ({ onSampleSelect }) => {
  return (
    <div className="mt-12">
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Don't have your own photo? Try these samples below!
          </h3>
          <p className="text-gray-600 text-sm">
            Click on any sample to start visualizing different materials
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {samplePhotos.map((photo) => (
            <div
              key={photo.id}
              className="group cursor-pointer"
              onClick={() => onSampleSelect(photo.url)}
            >
              <div className="relative overflow-hidden rounded-lg border-2 border-transparent group-hover:border-blue-400 transition-all duration-200">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    Try This Sample
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
      </Card>
    </div>
  );
};
