import styled, { keyframes } from 'styled-components';
import { Download, RefreshCw, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { PWAState } from '../../hooks/usePWA';

// ─── Animations ───────────────────────────────────────────────────────────────

const slideDown = keyframes`
  from { transform: translateY(-110%); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const popIn = keyframes`
  from { opacity: 0; transform: scale(0.92) translateY(12px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);    }
`;

// ─── Install Banner (top bar) ─────────────────────────────────────────────────

const InstallBanner = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  animation: ${slideDown} 0.35s ease;
  background: var(--surface);
  border-bottom: 2px solid var(--border);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
`;

const InstallIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--accent-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  svg { color: var(--accent); }
`;

const InstallText = styled.div`
  flex: 1;
  min-width: 0;
  strong {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
    line-height: 1.3;
  }
  span {
    display: block;
    font-size: 11px;
    color: var(--text-secondary);
    margin-top: 2px;
  }
`;

const InstallBtn = styled.button`
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover { opacity: 0.85; }
`;

const DismissBtn = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  &:hover { color: var(--text); }
`;

// ─── Update Modal ─────────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 3000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 0 24px;
  animation: ${fadeIn} 0.2s ease;

  @media (min-width: 480px) {
    align-items: center;
    padding: 24px;
  }
`;

const ModalCard = styled.div`
  background: var(--surface);
  border-radius: 24px 24px 16px 16px;
  padding: 28px 24px 24px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  animation: ${popIn} 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);

  @media (min-width: 480px) {
    border-radius: 24px;
  }
`;

const UpdateIconWrap = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  text-align: center;
`;

const ModalSubtitle = styled.p`
  margin: 4px 0 16px;
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.55;
`;

const UpdateNowBtn = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
  transition: transform 0.15s, box-shadow 0.15s;
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
  }
  &:active { transform: scale(0.98); }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

const PostponeBtn = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 14px;
  background: transparent;
  border: 1.5px solid var(--border);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  &:hover {
    background: var(--bg);
    color: var(--text);
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

type PWABannersProps = Pick<PWAState, 'isInstallable' | 'isInstalled' | 'triggerInstall' | 'hasUpdate' | 'applyUpdate' | 'dismissUpdate'>;

const PWABanners = ({ isInstallable, isInstalled, triggerInstall, hasUpdate, applyUpdate, dismissUpdate }: PWABannersProps) => {
  const [installDismissed, setInstallDismissed] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = () => {
    setUpdating(true);
    applyUpdate();
  };

  // Update modal has highest priority
  if (hasUpdate) {
    return (
      <Overlay>
        <ModalCard onClick={e => e.stopPropagation()}>
          <UpdateIconWrap>
            <Zap size={28} color="#fff" strokeWidth={2.5} />
          </UpdateIconWrap>

          <ModalTitle>Nueva versión disponible</ModalTitle>
          <ModalSubtitle>
            Hay una actualización lista para Doctor Companion. Actualiza ahora para obtener las últimas mejoras.
          </ModalSubtitle>

          <UpdateNowBtn onClick={handleUpdate} disabled={updating}>
            <RefreshCw size={17} style={updating ? { animation: 'spin 1s linear infinite' } : undefined} />
            {updating ? 'Actualizando...' : 'Actualizar ahora'}
          </UpdateNowBtn>

          <PostponeBtn onClick={dismissUpdate}>
            Posponer
          </PostponeBtn>
        </ModalCard>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </Overlay>
    );
  }

  // Install banner (lower priority, top bar)
  if (isInstallable && !isInstalled && !installDismissed) {
    return (
      <InstallBanner>
        <InstallIcon>
          <Download size={18} />
        </InstallIcon>
        <InstallText>
          <strong>Instalar Doctor Companion</strong>
          <span>Accede desde tu pantalla de inicio sin internet.</span>
        </InstallText>
        <InstallBtn onClick={triggerInstall}>Instalar</InstallBtn>
        <DismissBtn onClick={() => setInstallDismissed(true)} aria-label="Cerrar">
          <X size={16} />
        </DismissBtn>
      </InstallBanner>
    );
  }

  return null;
};

export default PWABanners;
