import React, { useEffect, useMemo, useState } from 'react';
import { HeroImageRecord, heroImagesApi } from '../lib/api';

type Props = {
  isAdmin?: boolean;
  onManageHero?: () => void;
  [key: string]: any;
};

const fallbackImages: HeroImageRecord[] = [
  {
    id: 'fallback-1',
    image_url: '/campus-life/post-001.svg',
    alt_text: 'Jamiaati hero image',
    title: 'Hero 1',
    sort_order: 0,
    is_active: 1,
  } as HeroImageRecord,
  {
    id: 'fallback-2',
    image_url: '/campus-life/post-002.svg',
    alt_text: 'Jamiaati hero image',
    title: 'Hero 2',
    sort_order: 1,
    is_active: 1,
  } as HeroImageRecord,
];

export default function HeroCarousel(props: Props) {
  const [images, setImages] = useState<HeroImageRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let alive = true;

    const loadImages = async () => {
      try {
        const savedImages = await heroImagesApi.getPublic();
        const activeImages = Array.isArray(savedImages) && savedImages.length > 0
          ? savedImages.filter((img: any) => img?.is_active !== 0)
          : [];

        if (!alive) return;

        if (activeImages.length > 0) {
          setImages(activeImages);
        } else {
          setImages(fallbackImages);
        }
      } catch {
        if (!alive) return;
        setImages(fallbackImages);
      }
    };

    loadImages();
    return () => {
      alive = false;
    };
  }, []);

  const heroImages = useMemo(() => {
    return images.length > 0 ? images : fallbackImages;
  }, [images]);

  useEffect(() => {
    if (heroImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [heroImages]);

  useEffect(() => {
    if (currentIndex >= heroImages.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, heroImages.length]);

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  };

  const current = heroImages[currentIndex] || fallbackImages[0];

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-[2rem] border-2 border-orange-200 bg-white shadow-xl">
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full">
          <img
            src={current?.image_url}
            alt={current?.alt_text || current?.title || 'Hero image'}
            className="w-full h-full object-cover"
            style={{
              opacity: 1,
              filter: 'none',
            }}
          />

          {heroImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous slide"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/55 hover:bg-black/70 text-white text-xl font-black shadow-lg flex items-center justify-center"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={goNext}
                aria-label="Next slide"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/55 hover:bg-black/70 text-white text-xl font-black shadow-lg flex items-center justify-center"
              >
                ›
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Go to slide ${idx + 1}`}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      idx === currentIndex ? 'w-7 bg-orange-500' : 'w-2.5 bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {props.isAdmin && typeof props.onManageHero === 'function' && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={props.onManageHero}
            className="rounded-2xl border-2 border-orange-200 bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-md hover:bg-orange-50"
          >
            Manage Hero Photos
          </button>
        </div>
      )}
    </div>
  );
}
