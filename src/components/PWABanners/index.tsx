import styled, { keyframes } from 'styled-components';
import { Download, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import { PWAState } from '../../hooks/usePWA';

// ─── Animations ───────────────────────────────────────────────────────────────

const slideDown = keyframes`
  from { transform: translateY(-110%); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
`;

// ─── Styled Components ────────────────────────────────────────────────────────

const Banner = styled.div<{ $variant: 'install' | 'update' }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  animation: ${slideDown} 0.35s ease;
  background: ${(p) => p.$variant === 'update' ? 'var(--accent)' : 'var(--surface)'};
  border-bottom: 2px solid ${(p) => p.$variant === 'update' ? 'rgba(0,0,0,0.1)' : 'var(--border)'};
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
`;

const BannerIcon = styled.div<{ $variant: 'install' | 'update' }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${(p) => p.$variant === 'update' ? 'rgba(255,255,255,0.2)' : 'var(--accent-bg)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    color: ${(p) => p.$variant === 'update' ? '#fff' : 'var(--accent)'};
  }
`;

const BannerText = styled.div<{ $variant: 'install' | 'update' }>`
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: ${(p) => p.$variant === 'update' ? '#fff' : 'var(--text)'};
    line-height: 1.3;
  }

  span {
    display: block;
    font-size: 11px;
    color: ${(p) => p.$variant === 'update' ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)'};
    margin-top: 2px;
  }
`;

const BannerBtn = styled.button<{ $variant: 'install' | 'update' }>`
  background: ${(p) => p.$variant === 'update' ? 'rgba(255,255,255,0.2)' : 'var(--accent)'};
  color: ${(p) => p.$variant === 'update' ? '#fff' : '#fff'};
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

const DismissBtn = styled.button<{ $variant: 'install' | 'update' }>`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: ${(p) => p.$variant === 'update' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'};
  display: flex;
  align-items: center;
  flex-shrink: 0;

  &:hover {
    color: ${(p) => p.$variant === 'update' ? '#fff' : 'var(--text)'};
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

type PWABannersProps = Pick<PWAState, 'isInstallable' | 'isInstalled' | 'triggerInstall' | 'hasUpdate' | 'applyUpdate'>;

const PWABanners = ({ isInstallable, isInstalled, triggerInstall, hasUpdate, applyUpdate }: PWABannersProps) => {
  const [installDismissed, setInstallDismissed] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = () => {
    setUpdating(true);
    applyUpdate();
  };

  // Show update banner first (higher priority)
  if (hasUpdate) {
    return (
      <Banner $variant="update">
        <BannerIcon $variant="update">
          <RefreshCw size={18} />
        </BannerIcon>
        <BannerText $variant="update">
          <strong>Actualización disponible</strong>
          <span>Hay una nueva versión de Doctor Companion lista.</span>
        </BannerText>
        <BannerBtn $variant="update" onClick={handleUpdate} disabled={updating}>
          {updating ? 'Actualizando...' : 'Actualizar'}
        </BannerBtn>
      </Banner>
    );
  }

  // Show install banner only if not already installed and not dismissed
  if (isInstallable && !isInstalled && !installDismissed) {
    return (
      <Banner $variant="install">
        <BannerIcon $variant="install">
          <Download size={18} />
        </BannerIcon>
        <BannerText $variant="install">
          <strong>Instalar Doctor Companion</strong>
          <span>Accede desde tu pantalla de inicio sin internet.</span>
        </BannerText>
        <BannerBtn $variant="install" onClick={triggerInstall}>
          Instalar
        </BannerBtn>
        <DismissBtn $variant="install" onClick={() => setInstallDismissed(true)} aria-label="Cerrar">
          <X size={16} />
        </DismissBtn>
      </Banner>
    );
  }

  return null;
};

export default PWABanners;
