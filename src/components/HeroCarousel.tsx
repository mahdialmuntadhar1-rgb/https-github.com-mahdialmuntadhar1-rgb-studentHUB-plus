import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroImageRecord, heroImagesApi } from '../lib/api';

const DEFAULT_HERO_IMAGES: HeroImageRecord[] = [
  { id: 'fallback-1', image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1920', title: 'Campus community', alt_text: 'Students walking through a university campus', sort_order: 0, is_active: true, created_at: '', updated_at: '' },
  { id: 'fallback-2', image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1920', title: 'University life', alt_text: 'University building and graduation cap', sort_order: 1, is_active: true, created_at: '', updated_at: '' },
  { id: 'fallback-3', image_url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1920', title: 'Academic future', alt_text: 'Modern university campus exterior', sort_order: 2, is_active: true, created_at: '', updated_at: '' },
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heroImages, setHeroImages] = useState<HeroImageRecord[]>(DEFAULT_HERO_IMAGES);

  useEffect(() => {
    let active = true;
    const loadImages = async () => {
      try {
        const images = await heroImagesApi.getPublic();
        if (active) setHeroImages(images.length > 0 ? images : DEFAULT_HERO_IMAGES);
      } catch (error) {
        console.warn('Persistent hero images unavailable; using built-in defaults.', error);
        if (active) setHeroImages(DEFAULT_HERO_IMAGES);
      }
    };

    void loadImages();
    const handleUpdate = () => void loadImages();
    window.addEventListener('jamiaati_hero_images_updated', handleUpdate);
    return () => {
      active = false;
      window.removeEventListener('jamiaati_hero_images_updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    setCurrentIndex(index => Math.min(index, Math.max(0, heroImages.length - 1)));
    const timer = setInterval(() => {
      setCurrentIndex(previous => (previous + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const current = heroImages[currentIndex] || DEFAULT_HERO_IMAGES[0];

  return (
    <div className="relative h-64 w-full overflow-hidden bg-slate-900 sm:h-80 md:h-96 lg:h-[450px]">
      <img src={current.image_url} alt={current.alt_text || current.title || 'StudentHUB hero image'} className="h-full w-full object-cover transition-opacity duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />

      <button onClick={() => setCurrentIndex(previous => (previous - 1 + heroImages.length) % heroImages.length)} className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg" aria-label="Previous slide">
        <ChevronLeft className="h-5 w-5 text-slate-800" />
      </button>
      <button onClick={() => setCurrentIndex(previous => (previous + 1) % heroImages.length)} className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg" aria-label="Next slide">
        <ChevronRight className="h-5 w-5 text-slate-800" />
      </button>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {heroImages.map((image, index) => (
          <button key={image.id} onClick={() => setCurrentIndex(index)} className={`h-2.5 rounded-full transition-all ${index === currentIndex ? 'w-6 bg-white' : 'w-2.5 bg-white/50'}`} aria-label={`Go to slide ${index + 1}`} />
        ))}
      </div>
    </div>
  );
}
