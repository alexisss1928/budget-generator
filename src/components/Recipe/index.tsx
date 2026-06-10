import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { PlusCircle, Pill, Plus, X } from 'lucide-react';
import ItemRecipeComponent from '../ItemRecipe';

// ─── Styled Components (Matching Budget & DoctorSettings) ──────────────────

const FormCard = styled.div`
  background: var(--surface);
  border-radius: 16px;
  margin-bottom: 20px;
  overflow: visible;
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
    width: 100px;
    flex-shrink: 0;
  }

  input, select {
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

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: calc(100% - 36px);
  margin: 14px 18px 18px;
  padding: 12px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 10px;
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

const ListContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--border);
    border-radius: 3px;
  }
`;

const EmptyState = styled.div`
  padding: 30px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
`;

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
  overflow-y: auto;
  position: relative;
  
  /* Overrides for FormCard inside modal */
  & > div {
    margin: 0;
    box-shadow: none;
  }
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

const PrimaryBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-left: auto;

  svg {
    color: #fff !important;
  }

  &:hover {
    opacity: 0.9;
  }
`;

// Toggle Adultos / Niños
const PatientToggle = styled.div`
  display: flex;
  margin: 14px 18px 0;
  background: var(--bg);
  border-radius: 10px;
  padding: 4px;
`;

const ToggleBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  background: ${p => p.$active ? 'var(--accent)' : 'transparent'};
  color: ${p => p.$active ? '#fff' : 'var(--text-secondary)'};
  outline: none;
`;

const DoseResult = styled.div`
  margin: 0 18px 14px;
  background: rgba(113, 158, 129, 0.1);
  border: 1px solid rgba(113, 158, 129, 0.3);
  border-radius: 10px;
  padding: 12px 14px;

  .label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .value {
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
  }
`;

const PediatricBadge = styled.span`
  display: inline-flex;
  align-items: center;
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.3px;
  margin-left: 4px;
`;

// ─── Types ───────────────────────────────────────────────────────────────────

type MedicinesInLocalStorage = {
  id?: number;
  nombre: string;
  indicaciones: string;
  isPediatric?: boolean;
  concentracionMg?: number;
  concentracionMl?: number;
  dosisPorKg?: number;
  dosisAlDia?: number;
};

type RecipeProps = {
  AddMedicine: (e: React.ChangeEvent<HTMLFormElement>) => void;
  handleCurrentRecipe: (e: any) => void;
  medicinesList: MedicinesInLocalStorage[];
  currentRecipe: MedicinesInLocalStorage[];
  DeleteMedicine: (index: number) => void;
  currentMedicineSelected: MedicinesInLocalStorage;
  setCurrentMedicineSelected: (index: number) => void;
  onAddDirect: (med: { nombre: string; indicaciones: string }) => void;
  isFullAccess?: boolean;
  onProRequired?: () => void;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcDose(
  peso: number,
  dosisPorKg: number,
  dosisAlDia: number,
  mg: number,
  ml: number
): { volumenPorToma: number; intervalHours: number } {
  const dosisDiaria = peso * dosisPorKg; // mg totales en el día
  const dosisPorToma = dosisDiaria / dosisAlDia; // mg por toma
  const volumenPorToma = (dosisPorToma * ml) / mg; // ml por toma
  const intervalHours = 24 / dosisAlDia;
  return { volumenPorToma, intervalHours };
}

function buildPosologia(
  volumen: number,
  intervalHours: number
): string {
  const vol = Math.round(volumen * 10) / 10;
  return `Tomar ${vol} ml cada ${intervalHours} horas`;
}

// ─── Component ───────────────────────────────────────────────────────────────

const Recipe = ({
  AddMedicine,
  handleCurrentRecipe,
  medicinesList,
  currentRecipe,
  DeleteMedicine,
  currentMedicineSelected,
  onAddDirect,
  isFullAccess,
  onProRequired,
}: RecipeProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientMode, setPatientMode] = useState<'adult' | 'pediatric'>('adult');

  // ── Adult mode state ──────────────────────────────────────────────────────
  const [isManual, setIsManual] = useState(false);
  const [searchMedicine, setSearchMedicine] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Pediatric mode state ──────────────────────────────────────────────────
  const [pedSearchMedicine, setPedSearchMedicine] = useState('');
  const [pedShowDropdown, setPedShowDropdown] = useState(false);
  const pedDropdownRef = useRef<HTMLDivElement>(null);
  const [pedSelectedMed, setPedSelectedMed] = useState<MedicinesInLocalStorage | null>(null);
  const [pedIsManual, setPedIsManual] = useState(false);
  const [pedNombre, setPedNombre] = useState('');
  const [pedPeso, setPedPeso] = useState('');
  const [pedMg, setPedMg] = useState('');
  const [pedMl, setPedMl] = useState('');
  const [pedDosisPorKg, setPedDosisPorKg] = useState('');
  const [pedDosisAlDia, setPedDosisAlDia] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (pedDropdownRef.current && !pedDropdownRef.current.contains(event.target as Node)) {
        setPedShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetModal = () => {
    setIsManual(false);
    setSearchMedicine('');
    setShowDropdown(false);
    setPedSearchMedicine('');
    setPedShowDropdown(false);
    setPedSelectedMed(null);
    setPedIsManual(false);
    setPedNombre('');
    setPedPeso('');
    setPedMg('');
    setPedMl('');
    setPedDosisPorKg('');
    setPedDosisAlDia('');
  };

  // ── Filtered lists ────────────────────────────────────────────────────────
  const adultMedicines = medicinesList
    .map((m, index) => ({ ...m, originalIndex: index }))
    .filter(m => !m.isPediatric && m.nombre.toLowerCase().includes(searchMedicine.toLowerCase()))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const pedMedicines = medicinesList
    .map((m, index) => ({ ...m, originalIndex: index }))
    .filter(m => m.isPediatric && m.nombre.toLowerCase().includes(pedSearchMedicine.toLowerCase()))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  // ── Pediatric dose preview ────────────────────────────────────────────────
  const mgVal = parseFloat(pedIsManual ? pedMg : String(pedSelectedMed?.concentracionMg ?? '')) || 0;
  const mlVal = parseFloat(pedIsManual ? pedMl : String(pedSelectedMed?.concentracionMl ?? '')) || 0;
  const dpkVal = parseFloat(pedIsManual ? pedDosisPorKg : String(pedSelectedMed?.dosisPorKg ?? '')) || 0;
  const dadVal = parseFloat(pedIsManual ? pedDosisAlDia : String(pedSelectedMed?.dosisAlDia ?? '')) || 0;
  const pesoVal = parseFloat(pedPeso) || 0;

  const canCalc = pesoVal > 0 && mgVal > 0 && mlVal > 0 && dpkVal > 0 && dadVal > 0;
  const pedResult = canCalc ? calcDose(pesoVal, dpkVal, dadVal, mgVal, mlVal) : null;
  const pedPosologia = pedResult ? buildPosologia(pedResult.volumenPorToma, pedResult.intervalHours) : '';
  const pedName = pedIsManual ? pedNombre : pedSelectedMed?.nombre ?? '';

  // ── Handlers: adult ───────────────────────────────────────────────────────
  const selectMedicine = (index: number, name: string) => {
    setIsManual(false);
    setSearchMedicine(name);
    setShowDropdown(false);
    handleCurrentRecipe({ target: { name: 'treatment', value: index.toString() } } as any);
  };

  const selectManual = () => {
    setIsManual(true);
    setSearchMedicine('Medicamento manual');
    setShowDropdown(false);
    handleCurrentRecipe({ target: { name: 'nombre', value: '' } } as any);
    handleCurrentRecipe({ target: { name: 'indicaciones', value: '' } } as any);
  };

  const handleAdultFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    AddMedicine(e as any);
    setIsModalOpen(false);
    resetModal();
  };

  // ── Handlers: pediatric ───────────────────────────────────────────────────
  const selectPedMedicine = (med: MedicinesInLocalStorage) => {
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

  const handlePediatricAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pedName.trim() || !pedPosologia) return;
    const nameWithConc = `${pedName.trim()} ${mgVal}mg / ${mlVal}ml`;
    onAddDirect({ nombre: nameWithConc, indicaciones: pedPosologia });
    setIsModalOpen(false);
    resetModal();
  };

  return (
    <>
      {isModalOpen && (
        <ModalOverlay onClick={() => { setIsModalOpen(false); resetModal(); }}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseBtn onClick={() => { setIsModalOpen(false); resetModal(); }}><X size={18} /></CloseBtn>
            <FormCard>
              <CardTitle style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <PlusCircle size={15} />
                <span>Agregar medicamento</span>
              </CardTitle>

              {/* Toggle Adultos / Niños */}
              <PatientToggle>
                <ToggleBtn
                  $active={patientMode === 'adult'}
                  onClick={() => setPatientMode('adult')}
                  type="button"
                >
                  Adultos
                </ToggleBtn>
                <ToggleBtn
                  $active={patientMode === 'pediatric'}
                  onClick={() => {
                    if (!isFullAccess) {
                      if (onProRequired) onProRequired();
                      return;
                    }
                    setPatientMode('pediatric');
                  }}
                  type="button"
                >
                  Niños
                </ToggleBtn>
              </PatientToggle>

              {/* ── ADULT MODE ── */}
              {patientMode === 'adult' && (
                <form onSubmit={handleAdultFormSubmit}>
                  <FieldRow style={{ position: 'relative' }}>
                    <label>Medicamento</label>
                    <div style={{ flex: 1, position: 'relative' }} ref={dropdownRef}>
                      <input
                        type="text"
                        placeholder="Buscar o seleccionar..."
                        value={searchMedicine}
                        onChange={(e) => {
                          setSearchMedicine(e.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={(e) => {
                          setShowDropdown(true);
                          e.target.select();
                        }}
                        required={!isManual}
                        autoComplete="off"
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                      {showDropdown && (
                        <div style={{
                          position: 'absolute', top: '100%', left: 0, right: 0,
                          background: 'var(--surface)', border: '1px solid var(--border)',
                          borderRadius: '8px', marginTop: '4px', zIndex: 10,
                          maxHeight: '200px', overflowY: 'auto', boxShadow: 'var(--shadow-card)'
                        }}>
                          <div 
                            style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--accent)', fontSize: '12px' }}
                            onClick={selectManual}
                          >
                            <Plus size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                            Escribir medicamento manualmente
                          </div>
                          {adultMedicines.map((m) => (
                            <div
                              key={m.originalIndex}
                              style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: '13px', color: 'var(--text)' }}
                              onClick={() => selectMedicine(m.originalIndex, m.nombre)}
                            >
                              {m.nombre}
                            </div>
                          ))}
                          {adultMedicines.length === 0 && (
                            <div style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: 12 }}>
                              No se encontraron medicamentos
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </FieldRow>
                  
                  {isManual && (
                    <>
                      <FieldRow>
                        <label>Medicamento</label>
                        <input
                          type="text"
                          name="nombre"
                          onChange={handleCurrentRecipe}
                          placeholder="Nombre y presentación (Ej: Ibuprofeno 400mg)"
                          value={currentMedicineSelected.nombre}
                          required
                          autoComplete="off"
                          style={{ width: '100%', flex: 1 }}
                        />
                      </FieldRow>

                      <FieldRow>
                        <label>Posología</label>
                        <input
                          type="text"
                          name="indicaciones"
                          onChange={handleCurrentRecipe}
                          placeholder="Ej: Tomar 1 tableta cada 8 horas por 3 días"
                          value={currentMedicineSelected.indicaciones}
                          autoComplete="off"
                          style={{ width: '100%', flex: 1 }}
                        />
                      </FieldRow>
                    </>
                  )}

                  <AddBtn type="submit">
                    <Plus size={16} /> Agregar al recipe
                  </AddBtn>
                </form>
              )}

              {/* ── PEDIATRIC MODE ── */}
              {patientMode === 'pediatric' && (
                <form onSubmit={handlePediatricAdd}>
                  {/* Seleccionar medicamento guardado */}
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
                        style={{ width: '100%', boxSizing: 'border-box' }}
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
                          {pedMedicines.map((m) => (
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

                  {/* Nombre manual */}
                  {pedIsManual && (
                    <FieldRow>
                      <label>Nombre</label>
                      <input
                        type="text"
                        placeholder="Ej: Amoxicilina"
                        value={pedNombre}
                        onChange={e => setPedNombre(e.target.value)}
                        required
                        autoComplete="off"
                        style={{ width: '100%', flex: 1 }}
                      />
                    </FieldRow>
                  )}


                  {/* Peso */}
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
                      style={{ flex: 1 }}
                    />
                  </FieldRow>

                  {/* Campos manuales de concentración y dosis */}
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
                          style={{ flex: 1, minWidth: 60 }}
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
                          style={{ flex: 1, minWidth: 60 }}
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
                          style={{ flex: 1, minWidth: 80 }}
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
                          style={{ flex: 1, minWidth: 70 }}
                        />
                        <span style={{ color: 'var(--text-secondary)', fontSize: 12, alignSelf: 'center' }}>dosis</span>
                      </FieldRow>
                    </>
                  )}

                  {/* Resultado del cálculo */}
                  {pedResult && (
                    <DoseResult>
                      <div className="label">Posología calculada</div>
                      <div className="value">{pedPosologia}</div>
                    </DoseResult>
                  )}

                  {!canCalc && (pedSelectedMed || pedIsManual) && (
                    <div style={{ margin: '0 18px 14px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                      Completa el peso {pedIsManual ? 'y los campos de concentración/dosis' : ''} para calcular la posología
                    </div>
                  )}

                  <AddBtn type="submit" disabled={!canCalc || !pedName.trim()}>
                    <Plus size={16} /> Agregar al recipe
                  </AddBtn>
                </form>
              )}
            </FormCard>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* ── Lista del recipe ── */}
      <FormCard>
        <CardTitle>
          <Pill size={15} />
          <span>Recipe Médico</span>
          <PrimaryBtn onClick={() => setIsModalOpen(true)}>
            <PlusCircle size={14} /> Agregar
          </PrimaryBtn>
        </CardTitle>
        <ListContainer>
          {currentRecipe.length === 0 ? (
            <EmptyState>Agrega un medicamento para generar el recipe</EmptyState>
          ) : (
            currentRecipe.map((item, index) => (
              <ItemRecipeComponent
                item={item}
                key={index}
                index={index}
                Delete={() => DeleteMedicine(index)}
              />
            ))
          )}
        </ListContainer>
      </FormCard>
    </>
  );
};

export default Recipe;
