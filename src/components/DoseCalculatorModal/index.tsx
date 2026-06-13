import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { X, Calculator, Plus, Share2 } from 'lucide-react';
import { MedicineRecord, getAllMedicines } from '../../db/clinicDB';

// --- Styled Components ---

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  padding: 20px;
  box-sizing: border-box;
`;

const ModalContent = styled.div`
  background: var(--surface);
  border-radius: 18px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
  max-height: 90vh;
  overflow: visible;
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  z-index: 10;
  
  &:hover {
    color: var(--text);
  }
`;

const FormCard = styled.div`
  background: var(--surface);
  border-radius: 16px;
  overflow: visible;
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
    width: 100px;
    flex-shrink: 0;
  }

  input {
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

    &:focus {
      box-shadow: 0 0 0 2px var(--accent);
    }
  }
`;

const DoseResult = styled.div`
  margin: 18px;
  background: rgba(113, 158, 129, 0.1);
  border: 1px solid rgba(113, 158, 129, 0.3);
  border-radius: 10px;
  padding: 14px 16px;

  .label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }

  .value {
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }
`;

const ShareWhatsAppBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 14px;
  padding: 10px;
  background: #25D366;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.12s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }
`;

// --- Helpers ---

function calcDose(
  peso: number,
  dosisPorKg: number,
  dosisAlDia: number,
  mg: number,
  ml: number
): { volumenPorToma: number; intervalHours: number } {
  const dosisDiaria = peso * dosisPorKg;
  const dosisPorToma = dosisDiaria / dosisAlDia;
  const volumenPorToma = (dosisPorToma * ml) / mg;
  const intervalHours = 24 / dosisAlDia;
  return { volumenPorToma, intervalHours };
}

function buildPosologia(volumen: number, intervalHours: number): string {
  const vol = Math.round(volumen * 10) / 10;
  return `Tomar ${vol} ml cada ${intervalHours} horas`;
}

// --- Component ---

export default function DoseCalculatorModal({ onClose }: { onClose: () => void }) {
  const [medicinesList, setMedicinesList] = useState<MedicineRecord[]>([]);
  const [pedSearchMedicine, setPedSearchMedicine] = useState('');
  const [pedShowDropdown, setPedShowDropdown] = useState(false);
  const pedDropdownRef = useRef<HTMLDivElement>(null);
  const [pedSelectedMed, setPedSelectedMed] = useState<MedicineRecord | null>(null);
  const [pedIsManual, setPedIsManual] = useState(false);
  const [pedPeso, setPedPeso] = useState('');
  const [pedMg, setPedMg] = useState('');
  const [pedMl, setPedMl] = useState('');
  const [pedDosisPorKg, setPedDosisPorKg] = useState('');
  const [pedDosisAlDia, setPedDosisAlDia] = useState('');

  useEffect(() => {
    getAllMedicines().then(setMedicinesList);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pedDropdownRef.current && !pedDropdownRef.current.contains(event.target as Node)) {
        setPedShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pedMedicines = medicinesList
    .map((m, index) => ({ ...m, originalIndex: index }))
    .filter(m => m.isPediatric && m.nombre.toLowerCase().includes(pedSearchMedicine.toLowerCase()))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const mgVal = parseFloat(pedIsManual ? pedMg : String(pedSelectedMed?.concentracionMg ?? '')) || 0;
  const mlVal = parseFloat(pedIsManual ? pedMl : String(pedSelectedMed?.concentracionMl ?? '')) || 0;
  const dpkVal = parseFloat(pedIsManual ? pedDosisPorKg : String(pedSelectedMed?.dosisPorKg ?? '')) || 0;
  const dadVal = parseFloat(pedIsManual ? pedDosisAlDia : String(pedSelectedMed?.dosisAlDia ?? '')) || 0;
  const pesoVal = parseFloat(pedPeso) || 0;

  const canCalc = pesoVal > 0 && mgVal > 0 && mlVal > 0 && dpkVal > 0 && dadVal > 0;
  const pedResult = canCalc ? calcDose(pesoVal, dpkVal, dadVal, mgVal, mlVal) : null;
  const pedPosologia = pedResult ? buildPosologia(pedResult.volumenPorToma, pedResult.intervalHours) : '';

  const selectPedMedicine = (med: MedicineRecord) => {
    setPedSelectedMed(med);
    setPedIsManual(false);
    setPedSearchMedicine(med.nombre);
    setPedShowDropdown(false);
  };

  const selectPedManual = () => {
    setPedIsManual(true);
    setPedSelectedMed(null);
    setPedSearchMedicine('Manual');
    setPedShowDropdown(false);
  };

  const handleShareWa = () => {
    const medicineName = pedIsManual ? pedSearchMedicine : pedSelectedMed?.nombre ?? 'Medicamento';
    const text = `💊 *Dosis pediátrica calculada*\n\n*Medicamento:* ${medicineName}\n*Peso del paciente:* ${pedPeso} kg\n*Posología:* ${pedPosologia}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseBtn onClick={onClose}><X size={18} /></CloseBtn>
        <FormCard>
          <CardTitle>
            <Calculator size={16} />
            <span>Calculadora de Dosis</span>
          </CardTitle>
          <div style={{ paddingBottom: pedResult ? 0 : 18 }}>
            <FieldRow style={{ position: 'relative' }}>
              <label>Medicamento</label>
              <div style={{ flex: 1, position: 'relative' }} ref={pedDropdownRef}>
                <input
                  type="text"
                  placeholder="Buscar guardados o manual..."
                  value={pedSearchMedicine}
                  onChange={(e) => {
                    setPedSearchMedicine(e.target.value);
                    setPedShowDropdown(true);
                  }}
                  onFocus={(e) => {
                    setPedShowDropdown(true);
                    e.target.select();
                  }}
                  autoComplete="off"
                  style={{ width: '100%' }}
                />
                {pedShowDropdown && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '8px', marginTop: '4px', zIndex: 10,
                    maxHeight: '200px', overflowY: 'auto', boxShadow: 'var(--shadow-card)'
                  }}>
                    <div
                      style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--accent)', fontSize: '12px' }}
                      onClick={selectPedManual}
                    >
                      <Plus size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      Ingresar manualmente
                    </div>
                    {pedMedicines.map((m: any) => (
                      <div
                        key={m.originalIndex}
                        style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: '13px', color: 'var(--text)' }}
                        onClick={() => selectPedMedicine(m)}
                      >
                        <div style={{ fontWeight: 600 }}>{m.nombre}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {m.concentracionMg}mg/{m.concentracionMl}ml · {m.dosisPorKg}mg/kg/día · {m.dosisAlDia} dosis/día
                        </div>
                      </div>
                    ))}
                    {pedMedicines.length === 0 && (
                      <div style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: 12 }}>
                        No hay medicamentos pediátricos guardados
                      </div>
                    )}
                  </div>
                )}
              </div>
            </FieldRow>

            <FieldRow>
              <label>Peso (kg)</label>
              <input
                type="number"
                placeholder="Ej: 12"
                value={pedPeso}
                onChange={e => setPedPeso(e.target.value)}
                min="0"
                step="any"
                required
              />
            </FieldRow>

            {pedIsManual && (
              <>
                <FieldRow style={{ flexWrap: 'wrap', gap: 8 }}>
                  <label style={{ width: '100%', marginBottom: 0 }}>Concentración</label>
                  <input
                    type="number"
                    placeholder="mg"
                    value={pedMg}
                    onChange={e => setPedMg(e.target.value)}
                    min="0"
                    step="any"
                    required
                    style={{ minWidth: 60 }}
                  />
                  <span style={{ color: 'var(--text-secondary)', fontSize: 12, alignSelf: 'center' }}>mg /</span>
                  <input
                    type="number"
                    placeholder="ml"
                    value={pedMl}
                    onChange={e => setPedMl(e.target.value)}
                    min="0"
                    step="any"
                    required
                    style={{ minWidth: 60 }}
                  />
                  <span style={{ color: 'var(--text-secondary)', fontSize: 12, alignSelf: 'center' }}>ml</span>
                </FieldRow>

                <FieldRow style={{ flexWrap: 'wrap', gap: 8 }}>
                  <label style={{ width: '100%', marginBottom: 0 }}>Dosis</label>
                  <input
                    type="number"
                    placeholder="mg/kg/día"
                    value={pedDosisPorKg}
                    onChange={e => setPedDosisPorKg(e.target.value)}
                    min="0"
                    step="any"
                    required
                    style={{ minWidth: 80 }}
                  />
                  <span style={{ color: 'var(--text-secondary)', fontSize: 12, alignSelf: 'center' }}>mg/kg ·</span>
                  <input
                    type="number"
                    placeholder="veces/día"
                    value={pedDosisAlDia}
                    onChange={e => setPedDosisAlDia(e.target.value)}
                    min="1"
                    step="1"
                    required
                    style={{ minWidth: 70 }}
                  />
                  <span style={{ color: 'var(--text-secondary)', fontSize: 12, alignSelf: 'center' }}>dosis</span>
                </FieldRow>
              </>
            )}
            
            {pedResult && (
              <DoseResult>
                <div className="label">Posología calculada</div>
                <div className="value">{pedPosologia}</div>
                <ShareWhatsAppBtn onClick={handleShareWa}>
                  <Share2 size={16} strokeWidth={2.5} />
                  Compartir por WhatsApp
                </ShareWhatsAppBtn>
              </DoseResult>
            )}
          </div>
        </FormCard>
      </ModalContent>
    </ModalOverlay>
  );
}
