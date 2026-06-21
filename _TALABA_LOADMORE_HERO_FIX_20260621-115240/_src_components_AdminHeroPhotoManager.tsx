import React, { useEffect, useState } from 'react';
import { BACKEND_URL } from '../lib/api';
import { Language } from '../types';

type HeroImage = {
  id: string;
  image_url: string;
  title?: string;
  alt_text?: string;
  sort_order?: number;
  is_active?: number | boolean;
};

type Props = {
  language: Language;
};

export default function AdminHeroPhotoManager({ language }: Props) {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [replaceId, setReplaceId] = useState('');
  const [title, setTitle] = useState('Jamiaati hero image');
  const [altText, setAltText] = useState('Students and universities across Iraq');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isRtl = language === 'ar' || language === 'ku';

  const label = {
    title: language === 'ar' ? 'إدارة صور الواجهة الرئيسية' : language === 'ku' ? 'بەڕێوەبردنی وێنەکانی سەرەکی' : 'Hero Photo Manager',
    subtitle: language === 'ar' ? 'ارفع أو استبدل صور السلايدر الرئيسي للتطبيق' : language === 'ku' ? 'وێنەکانی بەشی سەرەکی زیاد بکە یان بگۆڕە' : 'Upload or replace homepage hero photos',
    choose: language === 'ar' ? 'اختر صورة' : language === 'ku' ? 'وێنە هەڵبژێرە' : 'Choose photo',
    replace: language === 'ar' ? 'استبدال صورة موجودة' : language === 'ku' ? 'گۆڕینی وێنەیەکی هەبوو' : 'Replace existing photo',
    addNew: language === 'ar' ? 'إضافة كصورة جديدة' : language === 'ku' ? 'زیادکردن وەک وێنەی نوێ' : 'Add as new photo',
    save: language === 'ar' ? 'حفظ الصورة' : language === 'ku' ? 'پاشەکەوتکردنی وێنە' : 'Save photo',
    current: language === 'ar' ? 'الصور الحالية' : language === 'ku' ? 'وێنەکانی ئێستا' : 'Current hero photos',
    delete: language === 'ar' ? 'حذف' : language === 'ku' ? 'سڕینەوە' : 'Delete',
    active: language === 'ar' ? 'مفعّلة' : language === 'ku' ? 'چالاکە' : 'Active',
    hidden: language === 'ar' ? 'مخفية' : language === 'ku' ? 'شاراوەیە' : 'Hidden',
    noImages: language === 'ar' ? 'لا توجد صور بعد. ارفع أول صورة الآن.' : language === 'ku' ? 'هێشتا وێنە نییە. یەکەم وێنە بار بکە.' : 'No hero photos yet. Upload the first one now.',
  };

  const getToken = () => localStorage.getItem('admin_token') || localStorage.getItem('jamiaati_token') || '';

  const getHeaders = (): HeadersInit => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadImages = async () => {
    setError('');
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/hero-images`, {
        headers: getHeaders(),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to load hero images');
      setImages(Array.isArray(data.images) ? data.images : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load hero images');
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const uploadPhoto = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!file) {
      setError('Please choose an image first.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('alt_text', altText);
      if (replaceId) formData.append('replace_id', replaceId);

      const response = await fetch(`${BACKEND_URL}/api/admin/hero-images/upload`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to save hero image');

      setMessage(replaceId ? 'Hero photo replaced successfully.' : 'Hero photo uploaded successfully.');
      setFile(null);
      setReplaceId('');
      await loadImages();
    } catch (err: any) {
      setError(err.message || 'Failed to save hero photo');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (img: HeroImage) => {
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/hero-images/${encodeURIComponent(img.id)}`, {
        method: 'PUT',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: img.title || '',
          alt_text: img.alt_text || '',
          sort_order: img.sort_order || 0,
          is_active: img.is_active ? 0 : 1,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to update hero image');

      setMessage('Hero photo updated.');
      await loadImages();
    } catch (err: any) {
      setError(err.message || 'Failed to update hero photo');
    }
  };

  const deletePhoto = async (img: HeroImage) => {
    if (!window.confirm('Delete this hero photo?')) return;

    setMessage('');
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/hero-images/${encodeURIComponent(img.id)}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to delete hero image');

      setMessage('Hero photo deleted.');
      await loadImages();
    } catch (err: any) {
      setError(err.message || 'Failed to delete hero photo');
    }
  };

  return (
    <section dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-[#f8fafc] pb-24 px-4 py-5">
      <div className="max-w-5xl mx-auto rounded-[2rem] border-2 border-orange-200 bg-white shadow-xl overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-orange-50 via-white to-blue-50 border-b border-orange-100">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-600">
            Admin Dashboard
          </p>
          <h1 className="text-2xl font-black text-slate-950 mt-1">
            {label.title}
          </h1>
          <p className="text-sm font-bold text-slate-700 mt-1">
            {label.subtitle}
          </p>
        </div>

        <form onSubmit={uploadPhoto} className="p-5 grid gap-4 bg-[#fffaf3]">
          <div>
            <label className="block text-xs font-black text-slate-900 mb-2">
              {label.choose}
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="w-full rounded-2xl border-2 border-orange-200 bg-white p-3 text-sm font-bold text-slate-950"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-2">
                Title
              </label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-2xl border-2 border-orange-200 bg-white p-3 text-sm font-bold text-slate-950"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 mb-2">
                Alt Text
              </label>
              <input
                value={altText}
                onChange={(event) => setAltText(event.target.value)}
                className="w-full rounded-2xl border-2 border-orange-200 bg-white p-3 text-sm font-bold text-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 mb-2">
              {label.replace}
            </label>
            <select
              value={replaceId}
              onChange={(event) => setReplaceId(event.target.value)}
              className="w-full rounded-2xl border-2 border-orange-200 bg-white p-3 text-sm font-bold text-slate-950"
            >
              <option value="">{label.addNew}</option>
              {images.map((img, index) => (
                <option key={img.id} value={img.id}>
                  Replace photo #{index + 1} — {img.title || img.id}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-black text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-black text-emerald-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black px-5 py-4 shadow-lg disabled:opacity-60"
          >
            {loading ? 'Saving...' : label.save}
          </button>
        </form>

        <div className="p-5">
          <h2 className="text-xl font-black text-slate-950 mb-4">
            {label.current}
          </h2>

          {images.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-orange-300 bg-orange-50 p-6 text-center text-sm font-black text-slate-800">
              {label.noImages}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {images.map((img, index) => (
                <div key={img.id} className="rounded-3xl border border-orange-200 bg-white shadow-sm overflow-hidden">
                  <div className="aspect-[16/9] bg-slate-100">
                    <img
                      src={img.image_url}
                      alt={img.alt_text || img.title || 'Hero image'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-xs font-black text-orange-600">
                        Hero photo #{index + 1}
                      </p>
                      <h3 className="font-black text-slate-950">
                        {img.title || 'Untitled hero image'}
                      </h3>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setReplaceId(img.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-black text-xs border border-blue-200"
                      >
                        Replace this photo
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleActive(img)}
                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-900 font-black text-xs border border-slate-200"
                      >
                        {img.is_active ? label.active : label.hidden}
                      </button>

                      <button
                        type="button"
                        onClick={() => deletePhoto(img)}
                        className="px-4 py-2 rounded-xl bg-red-50 text-red-700 font-black text-xs border border-red-200"
                      >
                        {label.delete}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

