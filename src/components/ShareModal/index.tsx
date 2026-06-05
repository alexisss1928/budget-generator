import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Share2 } from 'lucide-react';
import { DoctorProfile, PaymentMethodRecord } from '../../db/clinicDB';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
  padding: 20px;
`;

const ModalContent = styled.div`
  background: var(--surface);
  padding: 24px;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
  max-height: 90vh;
  display: flex;
  flex-direction: column;

  h3 {
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
    margin: 0 0 8px 0;
  }
  
  p.subtitle {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0 0 20px 0;
  }
`;

const ScrollableList = styled.div`
  overflow-y: auto;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  background: var(--bg);
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  transition: all 0.15s;

  &:hover {
    border-color: var(--accent);
    background: var(--surface-alt);
  }

  input[type="checkbox"] {
    margin-top: 3px;
    accent-color: var(--accent);
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    strong {
      font-size: 13px;
      color: var(--text);
      font-weight: 600;
    }
    
    span {
      font-size: 12px;
      color: var(--text-secondary);
      white-space: pre-wrap;
      line-height: 1.4;
    }
  }
`;

const ButtonsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: auto;
`;

const Button = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  background: ${(p) => p.$primary ? 'var(--accent)' : 'transparent'};
  color: ${(p) => p.$primary ? '#fff' : 'var(--text-secondary)'};
  border: ${(p) => p.$primary ? 'none' : '1px solid var(--border)'};

  &:hover {
    opacity: ${(p) => p.$primary ? 0.9 : 1};
    background: ${(p) => p.$primary ? 'var(--accent)' : 'var(--surface-alt)'};
  }
`;

interface SelectableItem {
  id: string;
  label: string;
  value: string;
  selected: boolean;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'doctor' | 'payment';
  doctorProfile?: DoctorProfile;
  paymentMethods?: PaymentMethodRecord[];
}

export default function ShareModal({ isOpen, onClose, type, doctorProfile, paymentMethods }: ShareModalProps) {
  const [items, setItems] = useState<SelectableItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    if (type === 'doctor' && doctorProfile) {
      const list: SelectableItem[] = [];
      const add = (id: string, label: string, value?: string) => {
        if (value && value.trim()) {
          list.push({ id, label, value: value.trim(), selected: true });
        }
      };

      add('name', 'Nombre', `${doctorProfile.prefix} ${doctorProfile.nombre} ${doctorProfile.apellido}`);
      add('spec', 'Especialidad', doctorProfile.especialidad);
      add('clinic', 'Clínica', doctorProfile.clinicTitle);
      add('dir', 'Dirección', doctorProfile.direccion);
      add('phone', 'Teléfono', doctorProfile.telefono);
      add('email', 'Correo', doctorProfile.email);
      add('ig', 'Instagram', doctorProfile.instagram);
      add('mpps', 'MPPS', doctorProfile.mpps);
      add('cov', 'COV', doctorProfile.cov);

      setItems(list);
    } else if (type === 'payment' && paymentMethods) {
      const list: SelectableItem[] = paymentMethods.map(pm => {
        const title = pm.type === 'Otro' ? pm.customName || 'Otro' : pm.type;
        let detailsStr = '';
        try {
          const parsed = JSON.parse(pm.details);
          detailsStr = Object.entries(parsed)
            .filter(([k, v]) => k !== 'customName' && Boolean(v))
            .map(([k, v]) => {
              const formattedKey = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              return `${formattedKey}: ${v}`;
            }).join('\n');
        } catch {
          // fallback
        }

        return {
          id: String(pm.id),
          label: title,
          value: detailsStr,
          selected: true
        };
      });

      setItems(list);
    }
  }, [isOpen, type, doctorProfile, paymentMethods]);

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  const handleShare = async () => {
    const selectedItems = items.filter(i => i.selected);
    if (selectedItems.length === 0) return;

    let textToShare = '';

    if (type === 'doctor') {
      textToShare = "📋 *Datos del Especialista*\n\n";
      selectedItems.forEach(i => {
        textToShare += `*${i.label}:* ${i.value}\n`;
      });
    } else {
      textToShare = "💳 *Métodos de Pago Aceptados*\n\n";
      selectedItems.forEach(i => {
        textToShare += `*${i.label}*\n${i.value}\n\n`;
      });
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: type === 'doctor' ? 'Datos del Especialista' : 'Métodos de Pago',
          text: textToShare.trim(),
        });
        onClose();
      } else {
        // Fallback for desktop browsers without share api
        await navigator.clipboard.writeText(textToShare.trim());
        alert('Copiado al portapapeles (Tu navegador no soporta el menú de compartir nativo).');
        onClose();
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <h3>Compartir {type === 'doctor' ? 'Datos' : 'Métodos de Pago'}</h3>
        <p className="subtitle">Selecciona los campos que deseas enviar:</p>
        
        <ScrollableList>
          {items.map(item => (
            <CheckboxLabel key={item.id}>
              <input 
                type="checkbox" 
                checked={item.selected} 
                onChange={() => toggleItem(item.id)} 
              />
              <div className="info">
                <strong>{item.label}</strong>
                <span>{item.value}</span>
              </div>
            </CheckboxLabel>
          ))}
          {items.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 20 }}>
              No hay datos configurados para compartir.
            </p>
          )}
        </ScrollableList>

        <ButtonsRow>
          <Button onClick={onClose}>
            <X size={16} /> Cancelar
          </Button>
          <Button $primary onClick={handleShare} disabled={!items.some(i => i.selected)}>
            <Share2 size={16} /> Compartir
          </Button>
        </ButtonsRow>
      </ModalContent>
    </ModalOverlay>
  );
}
