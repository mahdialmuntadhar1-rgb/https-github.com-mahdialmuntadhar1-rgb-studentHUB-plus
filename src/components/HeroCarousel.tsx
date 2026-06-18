import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Settings, X, Plus, Trash2, Save, RotateCcw } from 'lucide-react';

const DEFAULT_HERO_IMAGES = [
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1607237138185-eedd9c632b0e?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&q=80&w=1920'
];

const ADMIN_EMAIL = 'safaribosafar@gmail.com';
const STORAGE_KEY = 'jamiaati_hero_images_v2';

// Safety guard for localStorage
function getSafeHeroImages(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_HERO_IMAGES;
    
    // Check if stored value is too large
    if (stored.length > 10000) {
      localStorage.removeItem(STORAGE_KEY);
      return DEFAULT_HERO_IMAGES;
    }
    
    const parsed = JSON.parse(stored);
    
    // Validate it's an array
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return DEFAULT_HERO_IMAGES;
    }
    
    // Validate each URL
    const validUrls = parsed
      .filter((url: any) => typeof url === 'string' && url.trim().length > 0)
      .filter((url: string) => url.startsWith('https://'))
      .slice(0, 5); // Max 5 images
    
    if (validUrls.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return DEFAULT_HERO_IMAGES;
    }
    
    return validUrls;
  } catch (e) {
    localStorage.removeItem(STORAGE_KEY);
    return DEFAULT_HERO_IMAGES;
  }
}

function isAdminUser(): boolean {
  try {
    const userEmail = localStorage.getItem('jamiaati_user_email');
    return userEmail === ADMIN_EMAIL;
  } catch {
    return false;
  }
}

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heroImages, setHeroImages] = useState<string[]>(DEFAULT_HERO_IMAGES);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [tempImages, setTempImages] = useState<string[]>([]);

  useEffect(() => {
    // Load safe hero images on mount
    const safeImages = getSafeHeroImages();
    setHeroImages(safeImages);
    setTempImages(safeImages);
    
    // Check admin status
    setIsAdmin(isAdminUser());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleAddImage = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('https://')) return;
    if (trimmed.length > 500) return;
    if (tempImages.length >= 5) return;
    
    setTempImages([...tempImages, trimmed]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setTempImages(tempImages.filter((_, i) => i !== index));
  };

  const handleSaveImages = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tempImages));
      setHeroImages(tempImages);
      setShowEditPanel(false);
    } catch (e) {
      console.error('Failed to save hero images:', e);
    }
  };

  const handleResetImages = () => {
    setTempImages(DEFAULT_HERO_IMAGES);
  };

  const handleCancelEdit = () => {
    setTempImages([...heroImages]);
    setShowEditPanel(false);
  };

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[450px] overflow-hidden bg-slate-900">
      {/* Main Image */}
      <div className="relative w-full h-full">
        <img
          src={heroImages[currentIndex]}
          alt={`Hero slide ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
        />
        {/* Gradient overlay for better contrast with navigation buttons */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-800" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-800" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white w-6 sm:w-8'
                : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Admin Edit Button - Only visible for safaribosafar@gmail.com */}
      {isAdmin && (
        <button
          onClick={() => setShowEditPanel(true)}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-20"
          aria-label="Edit Hero"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
        </button>
      )}

      {/* Admin Edit Panel */}
      {showEditPanel && isAdmin && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Edit Hero Images</h3>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Current Images List */}
            <div className="space-y-3 mb-4">
              <p className="text-sm font-semibold text-slate-600">Current Images ({tempImages.length}/5)</p>
              {tempImages.map((url, index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                  <img
                    src={url}
                    alt={`Hero ${index + 1}`}
                    className="w-16 h-12 object-cover rounded"
                  />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...tempImages];
                      newUrls[index] = e.target.value;
                      setTempImages(newUrls);
                    }}
                    className="flex-1 text-xs bg-white border border-slate-200 rounded px-2 py-1"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="p-1.5 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Image */}
            {tempImages.length < 5 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-600 mb-2">Add New Image URL</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                  />
                  <button
                    onClick={handleAddImage}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Must start with https://, max 500 chars</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleResetImages}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveImages}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
