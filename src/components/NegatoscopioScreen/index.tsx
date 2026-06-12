import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { X, Ruler, AlertTriangle, Plus, Minus, Save, Sliders, Grid } from 'lucide-react';

const FullScreenOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #ffffff;
  z-index: 9999;
  display: flex;
  flex-direction: column;
`;

const RulerCanvas = styled.canvas`
  position: absolute;
  top: 0; left: 0;
  pointer-events: none;
`;

const BottomRightControls = styled.div`
  position: absolute;
  bottom: 20px; right: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 10;
`;

const IconButton = styled.button`
  width: 48px; height: 48px;
  border-radius: 50%;
  background: rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.1);
  display: flex; align-items: center; justify-content: center;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: rgba(0,0,0,0.1); }
`;

const WarningBox = styled.div`
  position: absolute;
  bottom: 30px; left: 30px;
  background: #fff3e0;
  border: 1px solid #ffb74d;
  color: #e65100;
  padding: 12px 20px;
  border-radius: 12px;
  display: flex; align-items: center; gap: 12px;
  font-size: 14px; font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 10;
  max-width: 300px;
`;

const CalibrateOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  z-index: 20;
`;

const CardArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding-bottom: 20px;
`;

const BottomControlsArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
`;

const HowToCalibrateLink = styled.button`
  margin-top: 16px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  
  &:hover {
    color: var(--text);
  }
`;

const InstructionsModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(2px);
  padding: 20px;
`;

const InstructionsModal = styled.div`
  background: var(--surface);
  border-radius: 20px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  
  h3 { margin: 0 0 16px; font-size: 20px; color: var(--text); }
  p { margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: var(--text-secondary); }
  
  button {
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    background: var(--accent);
    color: white;
    border: none;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    &:active { transform: scale(0.98); }
  }
`;

const CardVisualizer = styled.div<{ $width: number; $height: number }>`
  width: ${p => p.$width}px;
  height: ${p => p.$height}px;
  flex-shrink: 0;
  background: var(--surface);
  border: 2px dashed var(--accent);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  position: relative;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  transition: width 0.1s, height 0.1s;
  
  &::after {
    content: 'Tarjeta';
    color: var(--text-muted);
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 1px;
    opacity: 0.7;
    transform: rotate(-90deg);
  }
`;

const ControlsBox = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ControlBtn = styled.button`
  width: 48px; height: 48px;
  border-radius: 24px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  box-shadow: 
    4px 4px 8px rgba(0, 0, 0, 0.05), 
    -4px -4px 8px rgba(255, 255, 255, 0.8);
  
  [data-theme='dark'] & {
    box-shadow: 
      4px 4px 8px rgba(0, 0, 0, 0.5), 
      -4px -4px 8px rgba(255, 255, 255, 0.05);
  }

  transition: all 0.15s;
  &:hover { color: var(--accent); }
  &:active { 
    transform: translateY(2px); 
    box-shadow: inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.5);
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
`;

const SaveBtn = styled.button`
  padding: 14px 32px;
  border-radius: 30px;
  border: none;
  background: var(--accent);
  color: white;
  font-size: 15px; font-weight: 700;
  display: flex; align-items: center; gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: transform 0.15s, background 0.15s;
  &:hover { opacity: 0.9; }
  &:active { transform: scale(0.98); }
`;

const CancelBtn = styled.button`
  padding: 14px 32px;
  border-radius: 30px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 15px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  &:hover { background: var(--surface-alt); color: var(--text); }
  &:active { transform: scale(0.98); }
`;

// Standard credit card physical sizes (Vertical)
const CARD_MM_WIDTH = 53.98;
const CARD_MM_HEIGHT = 85.60;
const CARD_RATIO = CARD_MM_HEIGHT / CARD_MM_WIDTH;

interface NegatoscopioProps {
  onClose: () => void;
}

export default function NegatoscopioScreen({ onClose }: NegatoscopioProps) {
  const [pixelsPerMm, setPixelsPerMm] = useState<number>(3.8); // Default approx fallback
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [showOffsetModal, setShowOffsetModal] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [offsetX, setOffsetX] = useState<string>('');
  const [offsetY, setOffsetY] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calibration state
  const [cardPxWidth, setCardPxWidth] = useState(300);

  useEffect(() => {
    // Check local storage for calibration
    const stored = localStorage.getItem('cm_negatoscopio_scale');
    if (stored && !isNaN(parseFloat(stored))) {
      setPixelsPerMm(parseFloat(stored));
      setIsCalibrated(true);
    } else {
      setIsCalibrated(false);
    }

    // Try to request fullscreen natively
    try {
      document.documentElement.requestFullscreen().catch(() => {});
    } catch(e) { /* ignore */ }

    return () => {
      // Exit fullscreen when closing
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      } catch(e) { /* ignore */ }
    };
  }, []);

  // Draw rulers when scale or window size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays for crisp lines
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);
    
    const numOffsetX = parseFloat(offsetX) || 0;
    const numOffsetY = parseFloat(offsetY) || 0;

    const originX = (numOffsetX * 10) * pixelsPerMm;
    const originY = (numOffsetY * 10) * pixelsPerMm;

    const minMmX = 0;
    const maxMmX = Math.ceil((rect.width - originX) / pixelsPerMm);
    const minMmY = 0;
    const maxMmY = Math.ceil((rect.height - originY) / pixelsPerMm);

    // Grid - Vertical Lines
    if (showGrid) {
      for (let i = minMmX; i <= maxMmX; i++) {
        const x = originX + i * pixelsPerMm;
        if (i % 10 === 0) {
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.lineWidth = 1;
        } else if (i % 5 === 0) {
          ctx.strokeStyle = 'rgba(0,0,0,0.1)';
          ctx.lineWidth = 1;
        } else {
          ctx.strokeStyle = 'rgba(0,0,0,0.03)';
          ctx.lineWidth = 1;
        }
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rect.height); ctx.stroke();
      }

      // Grid - Horizontal Lines
      for (let i = minMmY; i <= maxMmY; i++) {
        const y = originY + i * pixelsPerMm;
        if (i % 10 === 0) {
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.lineWidth = 1;
        } else if (i % 5 === 0) {
          ctx.strokeStyle = 'rgba(0,0,0,0.1)';
          ctx.lineWidth = 1;
        } else {
          ctx.strokeStyle = 'rgba(0,0,0,0.03)';
          ctx.lineWidth = 1;
        }
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rect.width, y); ctx.stroke();
      }
    }

    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.font = '10px Arial';

    // Top Ruler
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = minMmX; i <= maxMmX; i++) {
      const x = originX + i * pixelsPerMm;
      let tickHeight = 5;
      
      if (i % 10 === 0) {
        tickHeight = 15;
        if (i !== 0 || numOffsetX !== 0) {
          ctx.fillText((i / 10).toString(), x, 18);
        }
      } else if (i % 5 === 0) {
        tickHeight = 10;
      }
      
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, tickHeight); ctx.stroke();
    }

    // Left Ruler
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    for (let i = minMmY; i <= maxMmY; i++) {
      const y = originY + i * pixelsPerMm;
      let tickWidth = 5;
      
      if (i % 10 === 0) {
        tickWidth = 15;
        // avoid overlap at origin
        if (i !== 0 || numOffsetX !== 0 || numOffsetY !== 0) {
          ctx.fillText((i / 10).toString(), 18, y);
        }
      } else if (i % 5 === 0) {
        tickWidth = 10;
      }
      
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(tickWidth, y); ctx.stroke();
    }
  }, [pixelsPerMm, offsetX, offsetY, showGrid]);

  // Force re-render of canvas on window resize
  useEffect(() => {
    const handleResize = () => setPixelsPerMm(p => p); // Trigger effect
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const startCalibration = () => {
    // If we have a scale, start the card width near the current scale so it matches
    setCardPxWidth(pixelsPerMm * CARD_MM_WIDTH);
    setIsCalibrating(true);
  };

  const saveCalibration = () => {
    const newPixelsPerMm = cardPxWidth / CARD_MM_WIDTH;
    setPixelsPerMm(newPixelsPerMm);
    setIsCalibrated(true);
    localStorage.setItem('cm_negatoscopio_scale', newPixelsPerMm.toString());
    setIsCalibrating(false);
  };

  const cancelCalibration = () => {
    setIsCalibrating(false);
  };

  const adjustWidth = (amount: number) => {
    setCardPxWidth(prev => Math.max(50, prev + amount));
  };

  return (
    <FullScreenOverlay>
      {/* Canvas spans 100vw and 100vh */}
      <RulerCanvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />

      <BottomRightControls>
        <IconButton title={showGrid ? "Ocultar Cuadrícula" : "Mostrar Cuadrícula"} onClick={() => setShowGrid(!showGrid)}>
          <Grid size={20} />
        </IconButton>
        <IconButton title="Ajustar Offset" onClick={() => setShowOffsetModal(true)}>
          <Sliders size={20} />
        </IconButton>
        <IconButton title="Calibrar Pantalla" onClick={startCalibration}>
          <Ruler size={20} />
        </IconButton>
        <IconButton title="Cerrar Negatoscopio" onClick={onClose}>
          <X size={20} />
        </IconButton>
      </BottomRightControls>

      {!isCalibrated && !isCalibrating && (
        <WarningBox>
          <AlertTriangle size={24} />
          <div>
            La pantalla no está calibrada. Las medidas de la regla milimetrada podrían ser inexactas. Te recomendamos calibrarla.
          </div>
        </WarningBox>
      )}

      {isCalibrating && (
        <CalibrateOverlay>
          <CardArea>
            <CardVisualizer $width={cardPxWidth} $height={cardPxWidth * CARD_RATIO} />
          </CardArea>

          <BottomControlsArea>
            <ControlsBox>
              <ControlBtn onClick={() => adjustWidth(-10)} title="-10px"><Minus size={18} />10</ControlBtn>
              <ControlBtn onClick={() => adjustWidth(-1)} title="-1px"><Minus size={22} /></ControlBtn>
              <ControlBtn onClick={() => adjustWidth(1)} title="+1px"><Plus size={22} /></ControlBtn>
              <ControlBtn onClick={() => adjustWidth(10)} title="+10px"><Plus size={18} />10</ControlBtn>
            </ControlsBox>

            <ActionButtonsContainer>
              <CancelBtn onClick={cancelCalibration}>Cancelar</CancelBtn>
              <SaveBtn onClick={saveCalibration}>
                <Save size={20} /> Guardar
              </SaveBtn>
            </ActionButtonsContainer>
            
            <HowToCalibrateLink onClick={() => setShowInstructionsModal(true)}>
              ¿Cómo calibrar la pantalla?
            </HowToCalibrateLink>
          </BottomControlsArea>
        </CalibrateOverlay>
      )}

      {showInstructionsModal && (
        <InstructionsModalOverlay onClick={() => setShowInstructionsModal(false)}>
          <InstructionsModal onClick={e => e.stopPropagation()}>
            <h3>Calibración de Pantalla</h3>
            <p>
              Coloca una tarjeta de crédito o débito física de manera vertical sobre el recuadro que aparece en pantalla.<br/><br/>
              Usa los botones de <strong>+</strong> y <strong>-</strong> para agrandar o encoger el recuadro hasta que sus bordes coincidan exactamente con el tamaño real de tu tarjeta física.
            </p>
            <button onClick={() => setShowInstructionsModal(false)}>Entendido</button>
          </InstructionsModal>
        </InstructionsModalOverlay>
      )}

      {showOffsetModal && (
        <InstructionsModalOverlay onClick={() => setShowOffsetModal(false)}>
          <InstructionsModal onClick={e => e.stopPropagation()}>
            <h3>Ajustar Inicio de Regla</h3>
            <p style={{ marginBottom: '16px' }}>
              Define cuánto espacio (en centímetros) dejar en blanco antes de comenzar la regla desde el 0.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Inicio X (cm)</label>
                <input 
                  type="number" 
                  value={offsetX} 
                  onChange={e => setOffsetX(e.target.value)}
                  placeholder="0"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', outline: 'none' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Inicio Y (cm)</label>
                <input 
                  type="number" 
                  value={offsetY} 
                  onChange={e => setOffsetY(e.target.value)}
                  placeholder="0"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => { setOffsetX(''); setOffsetY(''); }}
                style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' }}
              >
                Resetear a 0
              </button>
              <button onClick={() => setShowOffsetModal(false)}>Aceptar</button>
            </div>
          </InstructionsModal>
        </InstructionsModalOverlay>
      )}
    </FullScreenOverlay>
  );
}
