
import { DrivewyVisualizer } from "@/components/DrivewyVisualizer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <DrivewyVisualizer />
      
      {/* Footer with branding and contact info */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <p className="text-gray-600">
            Made with love for{' '}
            <span className="font-bold text-yellow-600">CrownCrete</span>
          </p>
          <p className="text-sm text-gray-500">
            For business enquiries please email me at{' '}
            <a 
              href="mailto:noah.kosrav@gmail.com" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              noah.kosrav@gmail.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
