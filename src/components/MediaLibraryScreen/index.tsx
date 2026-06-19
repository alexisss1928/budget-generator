import { useState, useEffect, useCallback, useRef, KeyboardEvent } from 'react';
import styled, { keyframes } from 'styled-components';
import { Plus, X, Tag, Search, Trash2, Play, Image as ImageIcon, Film, ChevronLeft, Info, ChevronDown } from 'lucide-react';
import { MediaLibraryItem, getAllMediaItems, saveMediaItem, deleteMediaItem } from '../../db/clinicDB';

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const slideUp = keyframes`from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); }`;
const popIn = keyframes`from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); }`;

// ─── Layout ───────────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: var(--bg);
  margin: -20px -16px -100px;
`;

const TopBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg);
  padding: 14px 16px 12px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface-alt);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  &:hover { background: var(--accent-bg); color: var(--accent); }
`;


const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--accent) 35%, transparent);
  &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px color-mix(in srgb, var(--accent) 45%, transparent); }
  &:active { transform: translateY(0); }
`;

const SearchRow = styled.div`
  position: relative;
  svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
  input {
    width: 100%;
    box-sizing: border-box;
    padding: 9px 14px 9px 36px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text);
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
    &:focus { border-color: var(--accent); }
  }
`;

const TagFilterBar = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
  overflow-x: auto;
  padding-bottom: 2px;
  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;
`;

const TagFilterBtn = styled.button<{ $active?: boolean }>`
  background: ${p => p.$active ? 'var(--accent)' : 'var(--surface-alt)'};
  color: ${p => p.$active ? '#fff' : 'var(--text-secondary)'};
  border: 1px solid ${p => p.$active ? 'var(--accent)' : 'var(--border)'};
  border-radius: 20px;
  padding: 5px 13px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  font-family: inherit;
  &:hover { background: ${p => p.$active ? 'var(--accent)' : 'var(--border)'}; color: ${p => p.$active ? '#fff' : 'var(--text)'}; }
`;

// ─── Grid ─────────────────────────────────────────────────────────────────────

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
  padding: 16px;
  animation: ${slideUp} 0.25s ease;

  @media (min-width: 600px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
`;

const Card = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
  &:hover { box-shadow: var(--shadow-lg); transform: translateY(-3px); }
`;

const ThumbnailWrap = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 */
  background: var(--surface-alt);
  overflow: hidden;
`;

const ThumbnailImg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlayOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  transition: background 0.2s;
  ${Card}:hover & { background: rgba(0, 0, 0, 0.5); }
  svg { color: #fff; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5)); }
`;

const ImageOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  ${Card}:hover & svg { transform: scale(1.1); }
  svg { color: var(--text-muted); transition: transform 0.2s; }
`;

const PlaceholderThumb = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
  background: var(--surface-alt);
  color: var(--text-muted);
  font-size: 11px;
`;

const CardBody = styled.div`
  padding: 10px 12px;
`;

const CardTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const TagChip = styled.span`
  background: var(--accent-bg);
  color: var(--accent);
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 12px 10px;
`;

const DeleteBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: #ffebee; color: #e53935; }
`;

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  .icon { opacity: 0.3; }
  p { font-size: 14px; color: var(--text-secondary); line-height: 1.5; margin: 0; }
`;

// ─── Modal ────────────────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 300;
  backdrop-filter: blur(3px);
  animation: ${fadeIn} 0.2s ease;
  padding: 16px;

  @media (min-width: 600px) {
    align-items: center;
  }
`;

const ModalBox = styled.div`
  background: var(--surface);
  border-radius: 22px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 16px 60px rgba(0,0,0,0.25);
  animation: ${popIn} 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
  padding: 24px;
`;

const ModalTitle = styled.h2`
  margin: 0 0 20px;
  font-size: 17px;
  font-weight: 800;
  color: var(--text);
`;

const FormField = styled.div`
  margin-bottom: 16px;
  label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  input, textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--input-bg);
    color: var(--text);
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
    &:focus { border-color: var(--accent); }
    &::placeholder { color: var(--text-muted); }
  }
`;

const PreviewBox = styled.div`
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  background: var(--surface-alt);
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PreviewImg = styled.img`
  width: 100%;
  display: block;
  max-height: 200px;
  object-fit: cover;
`;

const TagInputWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--input-bg);
  cursor: text;
  transition: border-color 0.2s;
  &:focus-within { border-color: var(--accent); }

  input {
    border: none;
    background: transparent;
    outline: none;
    padding: 2px 4px;
    min-width: 120px;
    font-size: 14px;
    color: var(--text);
    font-family: inherit;
    flex: 1;
  }
`;

const TagChipRemovable = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--accent-bg);
  color: var(--accent);
  border-radius: 10px;
  padding: 3px 8px;
  font-size: 12px;
  font-weight: 700;
  button {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    color: var(--accent);
    opacity: 0.7;
    &:hover { opacity: 1; }
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const CancelModalBtn = styled.button`
  flex: 1;
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: transparent;
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  &:hover { background: var(--surface-alt); }
`;

const SaveModalBtn = styled.button`
  flex: 2;
  padding: 11px;
  border: none;
  border-radius: 12px;
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

// ─── Lightbox ─────────────────────────────────────────────────────────────────

const LightboxOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.92);
  z-index: 500;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.2s ease;
`;

const LightboxHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  flex-shrink: 0;
`;

const LightboxTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LightboxCloseBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.15);
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
  &:hover { background: rgba(255,255,255,0.25); }
`;

const LightboxContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 8px 16px 24px;
`;

const LightboxIframe = styled.iframe`
  width: 100%;
  max-width: 900px;
  height: 100%;
  max-height: 70vh;
  border: none;
  border-radius: 12px;
`;

const LightboxImage = styled.img`
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 12px;
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectType(url: string): 'video' | 'image' {
  const lower = url.toLowerCase();
  if (
    lower.includes('youtube.com') || lower.includes('youtu.be') ||
    lower.includes('vimeo.com')
  ) return 'video';
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?.*)?$/.test(lower)) return 'image';
  return 'video';
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

function getThumbnail(url: string, type: 'video' | 'image'): string {
  if (type === 'image') return url;
  const ytId = getYouTubeId(url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return ''; // Vimeo needs async fetch; will show placeholder
}

function getEmbedUrl(item: MediaLibraryItem): string | null {
  if (item.type === 'image') return null;
  const ytId = getYouTubeId(item.url);
  if (ytId) return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
  const vimeoId = getVimeoId(item.url);
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
  // Fallback: try to embed directly
  return item.url;
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  onBack: () => void;
}

export default function MediaLibraryScreen({ onBack }: Props) {
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<MediaLibraryItem | null>(null);

  // Form state
  const [formUrl, setFormUrl] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const [infoOpen, setInfoOpen] = useState(false);

  const load = useCallback(async () => {
    setItems(await getAllMediaItems());
  }, []);

  useEffect(() => { load(); }, [load]);

  // Derived
  const allTags = Array.from(new Set(items.flatMap(i => i.tags))).sort();

  const filtered = items.filter(item => {
    const matchesTag = activeTag ? item.tags.includes(activeTag) : true;
    const q = search.toLowerCase();
    const matchesSearch = !q || item.title.toLowerCase().includes(q) || item.tags.some(t => t.toLowerCase().includes(q));
    return matchesTag && matchesSearch;
  });

  // Preview in modal
  const previewType = formUrl ? detectType(formUrl) : null;
  const previewThumb = formUrl && previewType ? getThumbnail(formUrl, previewType) : '';

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !formTags.includes(trimmed)) {
      setFormTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && tagInput === '' && formTags.length > 0) {
      setFormTags(prev => prev.slice(0, -1));
    }
  };

  const resetForm = () => {
    setFormUrl('');
    setFormTitle('');
    setFormTags([]);
    setTagInput('');
  };

  const handleSave = async () => {
    if (!formUrl.trim()) return;
    setSaving(true);
    try {
      const type = detectType(formUrl);
      const thumbnail = getThumbnail(formUrl, type);
      const item: MediaLibraryItem = {
        url: formUrl.trim(),
        title: formTitle.trim() || formUrl.trim(),
        type,
        thumbnail,
        tags: formTags,
        createdAt: new Date().toISOString(),
      };
      await saveMediaItem(item);
      await load();
      setShowModal(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await deleteMediaItem(id);
    await load();
  };

  const handleCardClick = (item: MediaLibraryItem) => {
    setLightboxItem(item);
  };

  return (
    <>
      {/* ── Lightbox ─────────────────────────────────────────────── */}
      {lightboxItem && (
        <LightboxOverlay onClick={() => setLightboxItem(null)}>
          <LightboxHeader onClick={e => e.stopPropagation()}>
            <LightboxCloseBtn onClick={() => setLightboxItem(null)}>
              <X size={18} />
            </LightboxCloseBtn>
            <LightboxTitle>{lightboxItem.title}</LightboxTitle>
          </LightboxHeader>
          <LightboxContent onClick={e => e.stopPropagation()}>
            {lightboxItem.type === 'video' ? (
              <LightboxIframe
                src={getEmbedUrl(lightboxItem) || ''}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={lightboxItem.title}
              />
            ) : (
              <LightboxImage src={lightboxItem.url} alt={lightboxItem.title} />
            )}
          </LightboxContent>
        </LightboxOverlay>
      )}

      {/* ── Add Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <Overlay onClick={() => { setShowModal(false); resetForm(); }}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <ModalTitle>Agregar contenido</ModalTitle>

            <FormField>
              <label>URL del video o imagen</label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=... o https://..."
                value={formUrl}
                onChange={e => setFormUrl(e.target.value)}
                autoFocus
              />
            </FormField>

            {formUrl && (
              <PreviewBox>
                {previewType === 'video' && previewThumb ? (
                  <div style={{ position: 'relative', width: '100%' }}>
                    <PreviewImg src={previewThumb} alt="preview" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Play size={36} color="#fff" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }} />
                    </div>
                  </div>
                ) : previewType === 'image' ? (
                  <PreviewImg src={formUrl} alt="preview" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    <Film size={24} />
                  </div>
                )}
              </PreviewBox>
            )}

            <FormField>
              <label>Título</label>
              <input
                type="text"
                placeholder="Título del contenido"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
              />
            </FormField>

            <FormField>
              <label><Tag size={11} style={{ display: 'inline', marginRight: 4 }} />Tags (Enter para agregar)</label>
              <TagInputWrap onClick={() => tagInputRef.current?.focus()}>
                {formTags.map(tag => (
                  <TagChipRemovable key={tag}>
                    {tag}
                    <button type="button" onClick={() => setFormTags(p => p.filter(t => t !== tag))}>
                      <X size={10} />
                    </button>
                  </TagChipRemovable>
                ))}
                <input
                  ref={tagInputRef}
                  type="text"
                  placeholder={formTags.length === 0 ? 'ej: anatomía, corazón...' : ''}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={addTag}
                />
              </TagInputWrap>
            </FormField>

            <ModalActions>
              <CancelModalBtn onClick={() => { setShowModal(false); resetForm(); }}>Cancelar</CancelModalBtn>
              <SaveModalBtn onClick={handleSave} disabled={!formUrl.trim() || saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </SaveModalBtn>
            </ModalActions>
          </ModalBox>
        </Overlay>
      )}

      {/* ── Main Screen ─────────────────────────────────────────── */}
      <Wrapper>
        <TopBar>
          <TopRow>
            <BackBtn onClick={onBack}><ChevronLeft size={14} /> Inicio</BackBtn>
            <AddBtn onClick={() => setShowModal(true)}>
              <Plus size={15} /> Agregar
            </AddBtn>
          </TopRow>

          <SearchRow>
            <Search size={14} />
            <input
              type="text"
              placeholder="Buscar por título o tag..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </SearchRow>

          {allTags.length > 0 && (
            <TagFilterBar>
              <TagFilterBtn $active={activeTag === null} onClick={() => setActiveTag(null)}>
                Todos
              </TagFilterBtn>
              {allTags.map(tag => (
                <TagFilterBtn
                  key={tag}
                  $active={activeTag === tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                >
                  {tag}
                </TagFilterBtn>
              ))}
            </TagFilterBar>
          )}
        </TopBar>

        {/* Info banner (collapsible) */}
        <div
          onClick={() => setInfoOpen(p => !p)}
          style={{
            background: 'var(--accent-bg)',
            borderLeft: '3px solid var(--accent)',
            margin: '12px 16px 0',
            borderRadius: '0 8px 8px 0',
            padding: '12px 16px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <Info size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                {infoOpen ? 'Recursos Didácticos' : '¿Para qué sirve esta sección?'}
              </span>
              <ChevronDown size={14} color="var(--accent)" style={{ transition: 'transform 0.2s', transform: infoOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0, marginLeft: 8 }} />
            </div>
            {infoOpen && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '8px 0 0' }}>
                Agrega videos e imágenes para mostrar durante la consulta. Puedes agregar enlaces de YouTube, Vimeo o imágenes directas y organizarlos con etiquetas para encontrarlos rápidamente.
              </p>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState>
            <div className="icon"><Film size={52} strokeWidth={1.2} /></div>
            <p>
              {items.length === 0
                ? 'Aún no hay contenido.\nAgrega videos e imágenes para mostrar a tus pacientes.'
                : 'No hay resultados para tu búsqueda.'}
            </p>
          </EmptyState>
        ) : (
          <Grid>
            {filtered.map(item => (
              <Card key={item.id} onClick={() => handleCardClick(item)}>
                <ThumbnailWrap>
                  {item.thumbnail ? (
                    <>
                      <ThumbnailImg
                        src={item.thumbnail}
                        alt={item.title}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      {item.type === 'video' && (
                        <PlayOverlay>
                          <Play size={32} fill="white" />
                        </PlayOverlay>
                      )}
                      {item.type === 'image' && (
                        <ImageOverlay>
                          <ImageIcon size={28} />
                        </ImageOverlay>
                      )}
                    </>
                  ) : (
                    <PlaceholderThumb>
                      {item.type === 'video' ? <Film size={28} /> : <ImageIcon size={28} />}
                      <span>{item.type === 'video' ? 'Video' : 'Imagen'}</span>
                    </PlaceholderThumb>
                  )}
                </ThumbnailWrap>

                <CardBody>
                  <CardTitle>{item.title}</CardTitle>
                  {item.tags.length > 0 && (
                    <TagList>
                      {item.tags.map(tag => <TagChip key={tag}>{tag}</TagChip>)}
                    </TagList>
                  )}
                </CardBody>

                <CardFooter>
                  <DeleteBtn
                    onClick={(e) => handleDelete(e, item.id!)}
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </DeleteBtn>
                </CardFooter>
              </Card>
            ))}
          </Grid>
        )}
      </Wrapper>
    </>
  );
}
