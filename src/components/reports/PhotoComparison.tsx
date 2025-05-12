import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';

interface PhotoComparisonProps {
  beforePhotos: string[];
  afterPhotos: string[];
  title?: string;
}

const PhotoComparison: React.FC<PhotoComparisonProps> = ({
  beforePhotos,
  afterPhotos,
  title = 'Comparaison avant/après'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [view, setView] = useState<'before' | 'after' | 'split'>('split');

  const maxIndex = Math.max(beforePhotos.length, afterPhotos.length) - 1;

  const nextPhoto = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const hasBeforePhoto = beforePhotos.length > currentIndex;
  const hasAfterPhoto = afterPhotos.length > currentIndex;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('before')}
            className={`px-3 py-1 text-xs rounded-md ${
              view === 'before' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Avant
          </button>
          <button
            onClick={() => setView('split')}
            className={`px-3 py-1 text-xs rounded-md ${
              view === 'split' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Comparaison
          </button>
          <button
            onClick={() => setView('after')}
            className={`px-3 py-1 text-xs rounded-md ${
              view === 'after' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Après
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Photo Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevPhoto}
            disabled={currentIndex === 0}
            className="p-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-gray-500">
            Photo {currentIndex + 1} sur {maxIndex + 1}
          </span>
          <button
            onClick={nextPhoto}
            disabled={currentIndex === maxIndex}
            className="p-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        {/* Photo Display */}
        <div className={`flex ${view === 'split' ? 'space-x-4' : ''}`}>
          {(view === 'before' || view === 'split') && (
            <div className={`${view === 'split' ? 'w-1/2' : 'w-full'}`}>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                {hasBeforePhoto ? (
                  <img 
                    src={beforePhotos[currentIndex]} 
                    alt={`Avant ${currentIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Camera className="h-8 w-8 text-gray-400" />
                    <span className="ml-2 text-gray-500">Pas de photo</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Avant
                </div>
              </div>
            </div>
          )}
          
          {(view === 'after' || view === 'split') && (
            <div className={`${view === 'split' ? 'w-1/2' : 'w-full'}`}>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                {hasAfterPhoto ? (
                  <img 
                    src={afterPhotos[currentIndex]} 
                    alt={`Après ${currentIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Camera className="h-8 w-8 text-gray-400" />
                    <span className="ml-2 text-gray-500">Pas de photo</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Après
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoComparison;