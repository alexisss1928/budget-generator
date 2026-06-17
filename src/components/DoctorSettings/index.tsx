import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  User, Stethoscope, Building2, MapPin, Phone, Mail, AtSign,
  IdCard, Save, ImagePlus, Info,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { getDoctorProfile, saveDoctorProfile, DoctorProfile, DEFAULT_DOCTOR_PROFILE } from '../../db/clinicDB';
import ImageCropperModal from '../ImageCropperModal';

// ─── Styled Components ────────────────────────────────────────────────────────

const Wrapper = styled.div`
  height: 100%;
  overflow-y: auto;
  background: var(--bg);
  padding: 0 0 100px;
`;

const InfoBanner = styled.div`
  background: var(--accent-bg);
  border-left: 3px solid var(--accent);
  padding: 14px 18px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 0;

  svg {
    flex-shrink: 0;
    margin-top: 1px;
    color: var(--accent);
  }

  p {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;

    strong {
      color: var(--text);
      font-weight: 600;
    }
  }
`;

const FormCard = styled.div`
  background: var(--surface);
  border-radius: 16px;
  margin: 16px 0 0;
  overflow: hidden;
  box-shadow: var(--shadow-card);
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 18px 14px;
  border-bottom: 1px solid var(--border);

  svg {
    color: var(--accent);
    flex-shrink: 0;
  }

  span {
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }
`;

const FieldRow = styled.div`
  display: flex;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    width: 120px;
    flex-shrink: 0;
  }

  input, select, textarea {
    flex: 1;
    min-width: 0;
    box-sizing: border-box;
    background: var(--input-bg) !important;
    color: var(--text) !important;
    border: none;
    border-radius: 8px;
    padding: 9px 12px;
    font-size: 13px;
    outline: none;
    transition: box-shadow 0.15s;
    font-family: 'Inter', sans-serif;

    &:focus {
      box-shadow: 0 0 0 2px var(--accent);
    }
  }

  textarea {
    resize: vertical;
    min-height: 70px;
  }
`;

const PrefixToggle = styled.div`
  display: flex;
  gap: 8px;
  flex: 1;
`;

const PrefixBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 9px;
  border-radius: 8px;
  border: 2px solid ${(p) => (p.$active ? 'var(--accent)' : 'var(--border)')};
  background: ${(p) => (p.$active ? 'var(--accent-bg)' : 'transparent')};
  color: ${(p) => (p.$active ? 'var(--accent)' : 'var(--text-secondary)')};
  font-size: 13px;
  font-weight: ${(p) => (p.$active ? '700' : '500')};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
`;

const ImageSection = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 18px;
  flex-wrap: wrap;
`;

const ImageUploadCard = styled.div`
  flex: 1;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ImageLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const ImagePreview = styled.div<{ $shape: 'circle' | 'square' | 'wide'; $hasImage: boolean }>`
  width: ${(p) => (p.$shape === 'wide' ? '100%' : '80px')};
  height: ${(p) => (p.$shape === 'wide' ? '50px' : '80px')};
  border-radius: ${(p) => (p.$shape === 'circle' ? '50%' : '10px')};
  background: var(--input-bg);
  border: 2px dashed ${(p) => (p.$hasImage ? 'var(--accent)' : 'var(--border)')};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.12s;

  &:hover {
    border-color: var(--accent);
    transform: scale(1.03);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  svg {
    color: var(--text-muted);
  }
`;

const SaveBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: calc(100% - 32px);
  margin: 20px 16px 0;
  padding: 15px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.12s;
  box-shadow: 0 4px 16px rgba(113,158,129,0.35);

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const OptionalTag = styled.span`
  font-size: 10px;
  background: var(--surface-raised);
  color: var(--text-muted);
  border-radius: 4px;
  padding: 2px 6px;
  margin-left: 6px;
  vertical-align: middle;
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface DoctorSettingsProps {
  onProfileSaved?: (profile: DoctorProfile) => void;
  isFullAccess?: boolean;
  onProRequired?: () => void;
}

const DoctorSettings = ({ onProfileSaved, isFullAccess, onProRequired }: DoctorSettingsProps) => {
  const { isTrial } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile>({ ...DEFAULT_DOCTOR_PROFILE });
  const [loaded, setLoaded] = useState(false);
  const [cropperState, setCropperState] = useState<{
    field: 'logoDataUrl' | 'selloDataUrl' | 'firmaDataUrl';
    label: string;
    aspect: string;
  } | null>(null);

  useEffect(() => {
    getDoctorProfile().then((saved) => {
      if (saved) setProfile(saved);
      setLoaded(true);
    });
  }, []);

  const set = (field: keyof DoctorProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const openCropper = (
    field: 'logoDataUrl' | 'selloDataUrl' | 'firmaDataUrl',
    label: string,
    aspect: string,
    accessAllowed = true
  ) => {
    if (!accessAllowed) { onProRequired?.(); return; }
    setCropperState({ field, label, aspect });
  };

  const handleCropConfirm = (dataUrl: string) => {
    if (!cropperState) return;
    setProfile((prev) => ({ ...prev, [cropperState.field]: dataUrl }));
    setCropperState(null);
  };

  const handleSave = async () => {
    await saveDoctorProfile(profile);
    onProfileSaved?.(profile);
  };

  if (!loaded) return null;

  return (
    <>
      {cropperState && (
        <ImageCropperModal
          label={cropperState.label}
          aspectHint={cropperState.aspect}
          onConfirm={handleCropConfirm}
          onClose={() => setCropperState(null)}
        />
      )}
    <Wrapper>
      {/* Info Banner */}
      <InfoBanner>
        <Info size={16} />
        <p>
          <strong>Datos del doctor:</strong> esta información aparecerá automáticamente
          en todos tus <strong>recipes</strong>, <strong>presupuestos</strong> e{' '}
          <strong>informes</strong> generados.
        </p>
      </InfoBanner>

      {/* ── Información personal ── */}
      <FormCard>
        <CardTitle>
          <User size={15} />
          <span>Información personal</span>
        </CardTitle>

        <FieldRow>
          <label>Prefijo</label>
          <PrefixToggle>
            <PrefixBtn
              $active={profile.prefix === 'Dr.'}
              onClick={() => set('prefix', 'Dr.')}
              type="button"
            >
              Dr.
            </PrefixBtn>
            <PrefixBtn
              $active={profile.prefix === 'Dra.'}
              onClick={() => set('prefix', 'Dra.')}
              type="button"
            >
              Dra.
            </PrefixBtn>
          </PrefixToggle>
        </FieldRow>

        <FieldRow>
          <label>Nombre</label>
          <input
            type="text"
            value={profile.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            placeholder="Nombre"
          />
        </FieldRow>

        <FieldRow>
          <label>Apellido</label>
          <input
            type="text"
            value={profile.apellido}
            onChange={(e) => set('apellido', e.target.value)}
            placeholder="Apellido"
          />
        </FieldRow>

        <FieldRow>
          <label>
            <Stethoscope size={13} style={{ display: 'inline', marginRight: 4 }} />
            Especialidad
          </label>
          <input
            type="text"
            value={profile.especialidad}
            onChange={(e) => set('especialidad', e.target.value)}
            placeholder="Ej: Odontólogo General"
          />
        </FieldRow>

        <FieldRow 
          style={{ opacity: !isFullAccess ? 0.6 : 1, cursor: !isFullAccess ? 'pointer' : 'default' }}
          onClickCapture={(e) => {
            if (!isFullAccess && onProRequired) {
              e.preventDefault();
              e.stopPropagation();
              onProRequired();
            }
          }}
        >
          <label style={{ width: 'auto', flexShrink: 0, marginRight: '12px' }}>
            Color
            {(!isFullAccess || isTrial) && <span style={{ background: isTrial ? '#3b82f6' : '#eab308', padding: '2px 6px', borderRadius: '4px', color: '#fff', fontSize: '9px', fontWeight: 700, marginLeft: '6px', letterSpacing: '0.5px' }}>{isTrial ? 'TRIAL' : 'PRO'}</span>}
          </label>
          <div style={{ flex: 1 }}>
            <input
              type="color"
              value={profile.color || '#719e81'}
              onChange={(e) => { if (isFullAccess) set('color', e.target.value); }}
              style={{ padding: '0', height: '36px', cursor: 'pointer', width: '100%', pointerEvents: !isFullAccess ? 'none' : 'auto' }}
              disabled={!isFullAccess}
            />
          </div>
        </FieldRow>
      </FormCard>

      {/* ── Información de la clínica ── */}
      <FormCard>
        <CardTitle>
          <Building2 size={15} />
          <span>Clínica</span>
        </CardTitle>

        <FieldRow>
          <label>Nombre</label>
          <input
            type="text"
            value={profile.clinicTitle}
            onChange={(e) => set('clinicTitle', e.target.value)}
            placeholder="Ej: Dental Clinic"
          />
        </FieldRow>

        <FieldRow>
          <label>
            Lema<OptionalTag>opcional</OptionalTag>
          </label>
          <input
            type="text"
            value={profile.lema ?? ''}
            onChange={(e) => set('lema', e.target.value)}
            placeholder="Ej: Tu sonrisa, nuestra pasión"
          />
        </FieldRow>

        <FieldRow>
          <label>
            <IdCard size={13} style={{ display: 'inline', marginRight: 4 }} />
            MPPS
          </label>
          <input
            type="text"
            value={profile.mpps}
            onChange={(e) => set('mpps', e.target.value)}
            placeholder="N° MPPS"
          />
        </FieldRow>

        <FieldRow>
          <label>COV</label>
          <input
            type="text"
            value={profile.cov}
            onChange={(e) => set('cov', e.target.value)}
            placeholder="N° COV"
          />
        </FieldRow>
      </FormCard>

      {/* ── Contacto ── */}
      <FormCard>
        <CardTitle>
          <Phone size={15} />
          <span>Contacto</span>
        </CardTitle>

        <FieldRow>
          <label>
            <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
            Dirección
          </label>
          <textarea
            value={profile.direccion}
            onChange={(e) => set('direccion', e.target.value)}
            placeholder="Dirección de la clínica"
          />
        </FieldRow>

        <FieldRow>
          <label>
            <Phone size={12} style={{ display: 'inline', marginRight: 4 }} />
            Teléfono
          </label>
          <input
            type="tel"
            value={profile.telefono}
            onChange={(e) => set('telefono', e.target.value)}
            placeholder="0412-000.00.00"
          />
        </FieldRow>

        <FieldRow>
          <label>
            <Mail size={12} style={{ display: 'inline', marginRight: 4 }} />
            Email
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="correo@dominio.com"
          />
        </FieldRow>

        <FieldRow>
          <label>
            <AtSign size={12} style={{ display: 'inline', marginRight: 4 }} />
            Instagram
          </label>
          <input
            type="text"
            value={profile.instagram}
            onChange={(e) => set('instagram', e.target.value)}
            placeholder="@usuario"
          />
        </FieldRow>
      </FormCard>

      {/* ── Imágenes ── */}
      <FormCard>
        <CardTitle>
          <ImagePlus size={15} />
          <span>Imágenes del documento</span>
        </CardTitle>

        <ImageSection>
          {/* Logo */}
          <ImageUploadCard style={{ minWidth: '80px', opacity: !isFullAccess ? 0.6 : 1, cursor: 'pointer' }}
            onClick={() => openCropper('logoDataUrl', 'Logo', '1:1', isFullAccess)}
          >
            <ImageLabel>
              Logo
              {(!isFullAccess || isTrial) && <span style={{ background: isTrial ? '#3b82f6' : '#eab308', padding: '2px 6px', borderRadius: '4px', color: '#fff', fontSize: '9px', fontWeight: 700, marginLeft: '6px', letterSpacing: '0.5px' }}>{isTrial ? 'TRIAL' : 'PRO'}</span>}
            </ImageLabel>
            <ImagePreview
              $shape="circle"
              $hasImage={!!(isFullAccess && profile.logoDataUrl)}
              title={isFullAccess ? 'Subir logo' : 'Exclusivo plan PRO'}
            >
              {(isFullAccess && profile.logoDataUrl) ? (
                <img src={profile.logoDataUrl} alt="Logo" />
              ) : (
                <ImagePlus size={22} />
              )}
            </ImagePreview>
          </ImageUploadCard>

          {/* Sello */}
          <ImageUploadCard
            style={{ minWidth: '80px', cursor: 'pointer' }}
            onClick={() => openCropper('selloDataUrl', 'Sello', '1:1')}
          >
            <ImageLabel>Sello</ImageLabel>
            <ImagePreview
              $shape="square"
              $hasImage={!!profile.selloDataUrl}
              title="Subir sello"
            >
              {profile.selloDataUrl ? (
                <img src={profile.selloDataUrl} alt="Sello" />
              ) : (
                <ImagePlus size={22} />
              )}
            </ImagePreview>
          </ImageUploadCard>

          {/* Firma */}
          <ImageUploadCard
            style={{ flex: 2, minWidth: '140px', cursor: 'pointer' }}
            onClick={() => openCropper('firmaDataUrl', 'Firma', 'libre')}
          >
            <ImageLabel>Firma</ImageLabel>
            <ImagePreview
              $shape="wide"
              $hasImage={!!profile.firmaDataUrl}
              title="Subir firma"
              style={{ width: '100%', height: '80px' }}
            >
              {profile.firmaDataUrl ? (
                <img src={profile.firmaDataUrl} alt="Firma" />
              ) : (
                <ImagePlus size={22} />
              )}
            </ImagePreview>
          </ImageUploadCard>
        </ImageSection>
      </FormCard>

      {/* Save */}
      <SaveBtn onClick={handleSave} id="btn-save-profile">
        <Save size={18} />
        Guardar perfil
      </SaveBtn>
    </Wrapper>
  </>
  );
};

export default DoctorSettings;
