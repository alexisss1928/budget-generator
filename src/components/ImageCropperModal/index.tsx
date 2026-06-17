import { useState, useRef, useCallback, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { X, Upload, Camera, Check, RotateCcw } from 'lucide-react';

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeIn = keyframes`from { opacity: 0 } to { opacity: 1 }`;
const popIn = keyframes`
  from { opacity: 0; transform: scale(0.93) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
`;

// ─── Styled ────────────────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(4px);
  padding: 16px;
  animation: ${fadeIn} 0.18s ease;
`;

const Modal = styled.div`
  background: var(--surface);
  border-radius: 22px;
  width: 100%;
  max-width: 440px;
  padding: 22px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${popIn} 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-height: 95vh;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  .title {
    font-size: 16px;
    font-weight: 800;
    color: var(--text);
  }

  .close-btn {
    background: var(--surface-alt);
    border: 1px solid var(--border);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.15s;

    &:hover { background: var(--border); color: var(--text); }
  }
`;

const SourcePickerRow = styled.div`
  display: flex;
  gap: 10px;
`;

const SourceBtn = styled.button<{ $active?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid ${(p) => p.$active ? 'var(--accent)' : 'var(--border)'};
  background: ${(p) => p.$active ? 'var(--accent-bg)' : 'var(--bg)'};
  color: ${(p) => p.$active ? 'var(--accent)' : 'var(--text-secondary)'};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-bg);
  }
`;

const CropArea = styled.div`
  position: relative;
  width: 100%;
  background: #111;
  border-radius: 14px;
  overflow: hidden;
  user-select: none;
  touch-action: none;
`;

const CropCanvas = styled.canvas`
  display: block;
  width: 100%;
  height: auto;
  cursor: crosshair;
`;

const SelectionBox = styled.div`
  position: absolute;
  border: 2px solid #fff;
  box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);
  pointer-events: none;
`;

const Handle = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  pointer-events: all;
  cursor: pointer;
`;

const CropHint = styled.p`
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
  margin: -8px 0 0;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionBtn = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: ${(p) => p.$primary ? 'none' : '1px solid var(--border)'};
  background: ${(p) => p.$primary ? 'var(--accent)' : 'transparent'};
  color: ${(p) => p.$primary ? '#fff' : 'var(--text-secondary)'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-family: inherit;
  transition: all 0.18s;

  &:hover {
    opacity: ${(p) => p.$primary ? 0.88 : 1};
    background: ${(p) => p.$primary ? 'var(--accent)' : 'var(--surface-alt)'};
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface CropRect { x: number; y: number; w: number; h: number; }

interface Props {
  label: string;
  aspectHint?: string; // e.g. "1:1" | "libre"
  onConfirm: (dataUrl: string) => void;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageCropperModal({ label, aspectHint = 'libre', onConfirm, onClose }: Props) {
  const [step, setStep] = useState<'pick' | 'crop'>('pick');
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Crop state (in canvas-display coordinates)
  const [crop, setCrop] = useState<CropRect>({ x: 20, y: 20, w: 200, h: 200 });
  const [dragging, setDragging] = useState<'move' | 'se' | 'sw' | 'ne' | 'nw' | null>(null);
  const dragStart = useRef<{ mx: number; my: number; rect: CropRect } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasDisplaySize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  // Draw image on canvas whenever imageSrc changes
  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      // Fit image into max 380px wide
      const maxW = 380;
      const scale = Math.min(1, maxW / img.naturalWidth);
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvasDisplaySize.current = { w: canvas.width, h: canvas.height };
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Default crop: full image with 10px padding
      const pad = 10;
      setCrop({ x: pad, y: pad, w: canvas.width - pad * 2, h: canvas.height - pad * 2 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const loadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setStep('crop');
    };
    reader.readAsDataURL(file);
  };

  // ── Pointer events for crop ──────────────────────────────────────────────

  const getCanvasPos = useCallback((e: React.PointerEvent): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const HANDLE_SIZE = 14;

  const hitTest = (pos: { x: number; y: number }, c: CropRect): 'move' | 'se' | 'sw' | 'ne' | 'nw' | null => {
    const hs = HANDLE_SIZE;
    const corners: [string, number, number][] = [
      ['nw', c.x, c.y],
      ['ne', c.x + c.w, c.y],
      ['sw', c.x, c.y + c.h],
      ['se', c.x + c.w, c.y + c.h],
    ];
    for (const [dir, cx, cy] of corners) {
      if (Math.abs(pos.x - cx) <= hs && Math.abs(pos.y - cy) <= hs) return dir as any;
    }
    if (pos.x >= c.x && pos.x <= c.x + c.w && pos.y >= c.y && pos.y <= c.y + c.h) return 'move';
    return null;
  };

  const clampCrop = (c: CropRect): CropRect => {
    const { w: cw, h: ch } = canvasDisplaySize.current;
    const minSize = 20;
    let { x, y, w, h } = c;
    w = Math.max(minSize, w);
    h = Math.max(minSize, h);
    x = Math.max(0, Math.min(cw - w, x));
    y = Math.max(0, Math.min(ch - h, y));
    w = Math.min(cw - x, w);
    h = Math.min(ch - y, h);
    return { x, y, w, h };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const pos = getCanvasPos(e);
    const hit = hitTest(pos, crop);
    if (!hit) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(hit);
    dragStart.current = { mx: pos.x, my: pos.y, rect: { ...crop } };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !dragStart.current) return;
    const pos = getCanvasPos(e);
    const dx = pos.x - dragStart.current.mx;
    const dy = pos.y - dragStart.current.my;
    const r = dragStart.current.rect;
    let next: CropRect = { ...r };

    if (dragging === 'move') {
      next = { ...r, x: r.x + dx, y: r.y + dy };
    } else if (dragging === 'se') {
      next = { ...r, w: r.w + dx, h: r.h + dy };
    } else if (dragging === 'sw') {
      next = { x: r.x + dx, y: r.y, w: r.w - dx, h: r.h + dy };
    } else if (dragging === 'ne') {
      next = { x: r.x, y: r.y + dy, w: r.w + dx, h: r.h - dy };
    } else if (dragging === 'nw') {
      next = { x: r.x + dx, y: r.y + dy, w: r.w - dx, h: r.h - dy };
    }

    setCrop(clampCrop(next));
  };

  const onPointerUp = () => {
    setDragging(null);
    dragStart.current = null;
  };

  // ── Crop and export ──────────────────────────────────────────────────────

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    // Scale crop coords back to natural image size
    const scaleX = img.naturalWidth / canvas.width;
    const scaleY = img.naturalHeight / canvas.height;

    const sx = Math.round(crop.x * scaleX);
    const sy = Math.round(crop.y * scaleY);
    const sw = Math.round(crop.w * scaleX);
    const sh = Math.round(crop.h * scaleY);

    const out = document.createElement('canvas');
    out.width = sw;
    out.height = sh;
    const ctx = out.getContext('2d')!;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    onConfirm(out.toDataURL('image/png'));
  };

  const handleReset = () => {
    setImageSrc(null);
    setStep('pick');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // ── Canvas display coords → CSS % for overlay ───────────────────────────

  const cw = canvasDisplaySize.current.w || 1;
  const ch = canvasDisplaySize.current.h || 1;

  const selStyle = {
    left:   `${(crop.x / cw) * 100}%`,
    top:    `${(crop.y / ch) * 100}%`,
    width:  `${(crop.w / cw) * 100}%`,
    height: `${(crop.h / ch) * 100}%`,
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <Header>
          <span className="title">
            {step === 'pick' ? `Subir imagen — ${label}` : `Recortar imagen — ${label}`}
          </span>
          <button className="close-btn" onClick={onClose}><X size={15} /></button>
        </Header>

        {/* Step 1: Source picker */}
        {step === 'pick' && (
          <>
            <SourcePickerRow>
              <SourceBtn onClick={() => fileInputRef.current?.click()}>
                <Upload size={16} />
                Archivo
              </SourceBtn>
              <SourceBtn onClick={() => cameraInputRef.current?.click()}>
                <Camera size={16} />
                Cámara
              </SourceBtn>
            </SourcePickerRow>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => { if (e.target.files?.[0]) loadFile(e.target.files[0]); }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={(e) => { if (e.target.files?.[0]) loadFile(e.target.files[0]); }}
            />

            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
              Selecciona un archivo de tu dispositivo o usa la cámara para tomar una foto.
            </p>
          </>
        )}

        {/* Step 2: Crop */}
        {step === 'crop' && imageSrc && (
          <>
            <CropArea>
              <CropCanvas
                ref={canvasRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
              />
              {/* Overlay selection box */}
              <SelectionBox style={selStyle} />
              {/* Corner handles rendered as absolutely positioned dots */}
              {[
                { dir: 'nw', s: { left: selStyle.left, top: selStyle.top, transform: 'translate(-50%,-50%)' } },
                { dir: 'ne', s: { left: `calc(${selStyle.left} + ${selStyle.width})`, top: selStyle.top, transform: 'translate(-50%,-50%)' } },
                { dir: 'sw', s: { left: selStyle.left, top: `calc(${selStyle.top} + ${selStyle.height})`, transform: 'translate(-50%,-50%)' } },
                { dir: 'se', s: { left: `calc(${selStyle.left} + ${selStyle.width})`, top: `calc(${selStyle.top} + ${selStyle.height})`, transform: 'translate(-50%,-50%)' } },
              ].map(({ dir, s }) => (
                <Handle key={dir} style={{ ...s, pointerEvents: 'none' }} />
              ))}
            </CropArea>

            <CropHint>
              Arrastra los bordes o esquinas para ajustar el área de recorte · Aspecto: {aspectHint}
            </CropHint>

            <ActionRow>
              <ActionBtn onClick={handleReset}>
                <RotateCcw size={14} />
                Cambiar
              </ActionBtn>
              <ActionBtn $primary onClick={handleConfirm}>
                <Check size={14} />
                Confirmar
              </ActionBtn>
            </ActionRow>
          </>
        )}
      </Modal>
    </Overlay>
  );
}
