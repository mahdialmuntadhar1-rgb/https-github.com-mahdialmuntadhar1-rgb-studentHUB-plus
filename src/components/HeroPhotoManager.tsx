import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Loader2, Save, Trash2, Upload } from 'lucide-react';
import { Language } from '../types';
import { HeroImageRecord, heroImagesApi } from '../lib/api';
import { compressImageFile } from '../utils/imageCompression';

interface HeroPhotoManagerProps {
  language: Language;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export default function HeroPhotoManager({ language, showToast }: HeroPhotoManagerProps) {
  const [images, setImages] = useState<HeroImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [replaceId, setReplaceId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [altText, setAltText] = useState('');

  const previewUrl = useMemo(() => pendingFile ? URL.createObjectURL(pendingFile) : '', [pendingFile]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const loadImages = async () => {
    setLoading(true);
    try {
      setImages(await heroImagesApi.getAdmin(language));
    } catch (error: any) {
      showToast(error.message || 'Could not load hero images.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadImages(); }, []);

  const chooseFile = async (file: File | undefined, replacing?: HeroImageRecord) => {
    if (!file) return;

    if (!ALLOWED_TYPES.has(file.type)) {
      showToast('Use a JPG, JPEG, PNG, or WebP image.', 'error');
      return;
    }

    try {
      const compressedFile = await compressImageFile(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.78,
        maxBytes: 1200 * 1024
      });

      setPendingFile(compressedFile);
      setReplaceId(replacing?.id || null);
      setTitle(replacing?.title || file.name.replace(/\.[^.]+$/, '').slice(0, 120));
      setAltText(replacing?.alt_text || 'StudentHUB homepage hero image');

      if (compressedFile.size < file.size) {
        showToast(`Image compressed: ${Math.round(file.size / 1024)}KB → ${Math.round(compressedFile.size / 1024)}KB`, 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'Could not compress this hero image.', 'error');
    }
  };

  const cancelPending = () => {
    setPendingFile(null);
    setReplaceId(null);
    setTitle('');
    setAltText('');
  };

  const saveUpload = async () => {
    if (!pendingFile || !altText.trim()) {
      showToast('Choose an image and provide accessible alt text.', 'error');
      return;
    }
    setSaving(true);
    try {
      const replaced = images.find(image => image.id === replaceId);
      await heroImagesApi.upload(pendingFile, {
        title: title.trim(),
        altText: altText.trim(),
        sortOrder: replaced?.sort_order,
        replaceId: replaced?.id,
      }, language);
      cancelPending();
      await loadImages();
      window.dispatchEvent(new Event('jamiaati_hero_images_updated'));
      showToast(replaced ? 'Hero image replaced and saved permanently.' : 'Hero image uploaded and saved permanently.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Hero image could not be saved.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateImage = async (image: HeroImageRecord, changes: Partial<HeroImageRecord>) => {
    setSaving(true);
    try {
      await heroImagesApi.update(image.id, {
        title: String(changes.title ?? image.title),
        alt_text: String(changes.alt_text ?? image.alt_text),
        sort_order: Number(changes.sort_order ?? image.sort_order),
        is_active: Boolean(changes.is_active ?? image.is_active),
      }, language);
      await loadImages();
      window.dispatchEvent(new Event('jamiaati_hero_images_updated'));
    } catch (error: any) {
      showToast(error.message || 'Could not update hero image.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const moveImage = async (index: number, direction: -1 | 1) => {
    const otherIndex = index + direction;
    if (!images[otherIndex]) return;
    const current = images[index];
    const other = images[otherIndex];
    setSaving(true);
    try {
      await Promise.all([
        heroImagesApi.update(current.id, { title: current.title, alt_text: current.alt_text, sort_order: other.sort_order, is_active: Boolean(current.is_active) }, language),
        heroImagesApi.update(other.id, { title: other.title, alt_text: other.alt_text, sort_order: current.sort_order, is_active: Boolean(other.is_active) }, language),
      ]);
      await loadImages();
      window.dispatchEvent(new Event('jamiaati_hero_images_updated'));
    } catch (error: any) {
      showToast(error.message || 'Could not reorder hero images.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteImage = async (image: HeroImageRecord) => {
    if (!window.confirm(`Delete â€œ${image.title || 'this hero image'}â€ permanently?`)) return;
    setSaving(true);
    try {
      await heroImagesApi.remove(image.id, language);
      await loadImages();
      window.dispatchEvent(new Event('jamiaati_hero_images_updated'));
      showToast('Hero image deleted from R2 and D1.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Could not delete hero image.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4" id="admin-hero-photo-manager">
      <div className="rounded-3xl border-2 border-[#161A33] bg-white p-5 shadow-[3px_3px_0px_0px_#161A33]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-[#161A33]">Hero Photos / Hero Section Manager</h2>
            <p className="mt-1 text-[10px] font-bold leading-relaxed text-slate-500">Images are stored in Cloudflare R2; titles, order, and status are stored in D1.</p>
          </div>
          <ImagePlus className="h-7 w-7 shrink-0 text-[#6B25C9]" />
        </div>

        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#6B25C9] bg-violet-50 px-4 py-4 text-xs font-black text-[#6B25C9] hover:bg-violet-100">
          <Upload className="h-4 w-4" /> Upload new hero image
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={event => void chooseFile(event.target.files?.[0])} />
        </label>
        <p className="mt-2 text-[9px] font-bold text-slate-500">JPG, JPEG, PNG, or WebP Â· maximum 5MB</p>
      </div>

      {pendingFile && (
        <div className="rounded-3xl border-2 border-[#161A33] bg-white p-4 shadow-[3px_3px_0px_0px_#FFD21F]">
          <h3 className="text-xs font-black">Preview before saving {replaceId ? 'replacement' : 'upload'}</h3>
          <img src={previewUrl} alt="Pending hero preview" className="mt-3 aspect-video w-full rounded-2xl bg-slate-100 object-cover" />
          <input value={title} onChange={event => setTitle(event.target.value)} maxLength={120} placeholder="Image title" className="mt-3 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-xs font-bold" />
          <textarea value={altText} onChange={event => setAltText(event.target.value)} maxLength={240} rows={2} placeholder="Accessible alt text (required)" className="mt-2 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-xs font-bold" />
          <div className="mt-3 flex gap-2">
            <button disabled={saving} onClick={saveUpload} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#161A33] px-4 py-3 text-xs font-black text-white disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save permanently
            </button>
            <button disabled={saving} onClick={cancelPending} className="rounded-xl border-2 border-slate-200 px-4 py-3 text-xs font-black">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#6B25C9]" /></div>
      ) : images.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 text-center text-xs font-bold text-slate-500">No saved images yet. The homepage will continue using its built-in fallback images.</div>
      ) : (
        <div className="space-y-3">
          {images.map((image, index) => (
            <article key={image.id} className="rounded-3xl border-2 border-[#161A33] bg-white p-3 shadow-[2px_2px_0px_0px_#161A33]">
              <img src={image.image_url} alt={image.alt_text} className={`aspect-video w-full rounded-2xl bg-slate-100 object-cover ${image.is_active ? '' : 'grayscale opacity-50'}`} />
              <div className="mt-3 grid gap-2">
                <input value={image.title} onChange={event => setImages(current => current.map(item => item.id === image.id ? { ...item, title: event.target.value } : item))} maxLength={120} placeholder="Title" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold" />
                <textarea value={image.alt_text} onChange={event => setImages(current => current.map(item => item.id === image.id ? { ...item, alt_text: event.target.value } : item))} maxLength={240} rows={2} placeholder="Alt text" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button disabled={saving} onClick={() => updateImage(image, {})} className="rounded-xl bg-[#161A33] px-3 py-2 text-[10px] font-black text-white">Save text</button>
                <button disabled={saving} onClick={() => updateImage(image, { is_active: !Boolean(image.is_active) })} className="flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-2 text-[10px] font-black text-amber-800">
                  {image.is_active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />} {image.is_active ? 'Disable' : 'Enable'}
                </button>
                <button disabled={saving || index === 0} onClick={() => moveImage(index, -1)} className="rounded-xl border px-2 py-2 disabled:opacity-30" aria-label="Move up"><ArrowUp className="h-3 w-3" /></button>
                <button disabled={saving || index === images.length - 1} onClick={() => moveImage(index, 1)} className="rounded-xl border px-2 py-2 disabled:opacity-30" aria-label="Move down"><ArrowDown className="h-3 w-3" /></button>
                <label className="cursor-pointer rounded-xl bg-blue-50 px-3 py-2 text-[10px] font-black text-blue-800">
                  Replace
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={event => void chooseFile(event.target.files?.[0], image)} />
                </label>
                <button disabled={saving} onClick={() => deleteImage(image)} className="ml-auto flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-[10px] font-black text-red-700"><Trash2 className="h-3 w-3" /> Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}


