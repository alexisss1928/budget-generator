import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import styled from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Pill, Trash2, PlusCircle, Download, Upload, Info
} from 'lucide-react';
import {
  getAllMedicines,
  saveMedicine,
  deleteMedicine,
  saveAllMedicines,
  MedicineRecord,
} from '../../db/clinicDB';

// ─── Styled Components (Matching DoctorSettings) ─────────────────────────────

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

const ListContainer = styled.div`
  max-height: 350px;
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

const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--surface-alt);
  }

  .info {
    font-size: 13px;
    color: var(--text);
    font-weight: 600;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .subinfo {
    font-size: 11px;
    color: var(--text-secondary);
    line-height: 1.3;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 14px;

    button {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      padding: 4px;
      border-radius: 6px;
      transition: all 0.15s;

      &:hover {
        background: #ffebee;
        color: #e53935;
      }
    }
  }
`;

const ActionRow = styled.div`
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1px solid var(--border);
  
  &:last-child {
    border-bottom: none;
  }

  p {
    margin: 0;
    font-size: 12px;
    color: var(--text-secondary);
  }
`;

const FileLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--input-bg);
  border: 2px dashed var(--border);
  border-radius: 10px;
  padding: 14px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-bg);
  }

  input {
    display: none;
  }
`;

const SecondaryBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: var(--surface-alt);
    border-color: var(--text-muted);
  }
`;

const PrimaryBtn = styled(SecondaryBtn) <{ $disabled?: boolean }>`
  background: ${(p) => p.$disabled ? 'var(--border)' : 'var(--accent)'};
  color: ${(p) => p.$disabled ? 'var(--text-muted)' : '#fff'};
  border: none;
  pointer-events: ${(p) => p.$disabled ? 'none' : 'auto'};

  svg {
    color: ${(p) => p.$disabled ? 'var(--text-muted)' : '#fff'} !important;
  }

  &:hover {
    background: var(--accent);
    opacity: 0.9;
  }
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
  padding: 24px;
  border-radius: 18px;
  width: 90%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);

  h3 {
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin: 0 0 18px 0;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;

    label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    input, select {
      background: var(--input-bg) !important;
      color: var(--text) !important;
      border: none;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 13px;
      outline: none;
      box-sizing: border-box;
      width: 100%;
      transition: box-shadow 0.15s;
      &:focus { box-shadow: 0 0 0 2px var(--accent); }
    }
  }

  .field-row {
    display: flex;
    gap: 10px;
    margin-bottom: 14px;

    > div {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
      }

      input {
        background: var(--input-bg) !important;
        color: var(--text) !important;
        border: none;
        border-radius: 8px;
        padding: 10px 12px;
        font-size: 13px;
        outline: none;
        box-sizing: border-box;
        width: 100%;
        transition: box-shadow 0.15s;
        &:focus { box-shadow: 0 0 0 2px var(--accent); }
      }
    }
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
`;

// Toggle Adultos/Niños
const PatientToggle = styled.div`
  display: flex;
  background: var(--bg);
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 20px;
  gap: 0;
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

const PediatricNote = styled.div`
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 14px;
  line-height: 1.5;
`;

const PediatricBadge = styled.span`
  display: inline-flex;
  align-items: center;
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
`;

// ─── Component ────────────────────────────────────────────────────────────────

type ConfigType = {
  onMedicinesChange: () => void;
  isFullAccess?: boolean;
  onProRequired?: () => void;
};

type NewMedicineState = {
  nombre: string;
  indicaciones: string;
  isPediatric: boolean;
  concentracionMg: string;
  concentracionMl: string;
  dosisPorKg: string;
  dosisAlDia: string;
  presentacion: string;
};

const DEFAULT_NEW_MEDICINE: NewMedicineState = {
  nombre: '',
  indicaciones: '',
  isPediatric: false,
  concentracionMg: '',
  concentracionMl: '',
  dosisPorKg: '',
  dosisAlDia: '',
  presentacion: '',
};

const ConfigMedicines = ({ onMedicinesChange, isFullAccess, onProRequired }: ConfigType) => {
  const [myMedicines, setMyMedicines] = useState<MedicineRecord[]>([]);
  const [newMedicine, setNewMedicine] = useState<NewMedicineState>(DEFAULT_NEW_MEDICINE);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadMedicines = async () => {
    const data = await getAllMedicines();
    setMyMedicines(data);
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleNewMedicine = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { value, name } = event.target;
    setNewMedicine({ ...newMedicine, [name]: value });
  };

  const HandleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      Papa.parse(event.target.files[0], {
        header: true,
        complete: async function (results) {
          if (results.meta.fields?.includes('nombre')) {
            const parsedMedicines = (results.data as any[])
              .filter((r) => r.nombre)
              .map(r => ({
                nombre: r.nombre,
                indicaciones: r.indicaciones || '',
                presentacion: r.presentacion || '',
                isPediatric: r.isPediatric === 'true' || r.isPediatric === 'TRUE' || r.isPediatric === '1' || r.isPediatric === true,
                concentracionMg: parseFloat(r.concentracionMg) || undefined,
                concentracionMl: parseFloat(r.concentracionMl) || undefined,
                dosisPorKg: parseFloat(r.dosisPorKg) || undefined,
                dosisAlDia: parseFloat(r.dosisAlDia) || undefined,
              }));
            await saveAllMedicines(parsedMedicines);
            await loadMedicines();
            onMedicinesChange();
            toast.success('Medicamentos cargados exitosamente');
          } else {
            toast.error(
              'El archivo debe tener al menos la columna "nombre"'
            );
          }
        },
      });
    }
  };

  const handleDownload = () => {
    const data = `nombre,indicaciones,presentacion,isPediatric,concentracionMg,concentracionMl,dosisPorKg,dosisAlDia
Ibuprofeno - 400 mg,"400 mg cada 6 horas, 600 mg cada 8 horas por 3 dias si hay dolor",Comprimidos,false,,,,
Amoxicilina (Pediátrico),,Suspensión,true,250,5,50,3`;
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'ModeloParaMedicamentos.csv');
    a.click();
  };

  const DownloadMyMedicines = () => {
    if (myMedicines.length > 0) {
      const data = Papa.unparse(
        myMedicines.map((m) => ({
          nombre: m.nombre,
          indicaciones: m.indicaciones || '',
          presentacion: m.presentacion || '',
          isPediatric: m.isPediatric ? 'true' : 'false',
          concentracionMg: m.concentracionMg || '',
          concentracionMl: m.concentracionMl || '',
          dosisPorKg: m.dosisPorKg || '',
          dosisAlDia: m.dosisAlDia || '',
        }))
      );
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'MisMedicamentos.csv');
      a.click();
    }
  };

  const AddMedicine = async () => {
    if (!newMedicine.nombre.trim()) return;

    const record: MedicineRecord = {
      nombre: newMedicine.nombre.trim(),
      indicaciones: newMedicine.indicaciones.trim(),
      presentacion: newMedicine.presentacion,
    };

    if (newMedicine.isPediatric) {
      record.isPediatric = true;
      record.concentracionMg = parseFloat(newMedicine.concentracionMg) || 0;
      record.concentracionMl = parseFloat(newMedicine.concentracionMl) || 0;
      record.dosisPorKg = parseFloat(newMedicine.dosisPorKg) || 0;
      record.dosisAlDia = parseFloat(newMedicine.dosisAlDia) || 0;
    }

    await saveMedicine(record);
    setNewMedicine(DEFAULT_NEW_MEDICINE);
    setIsModalOpen(false);
    await loadMedicines();
    onMedicinesChange();
    toast.success('Medicamento agregado');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewMedicine(DEFAULT_NEW_MEDICINE);
  };

  const DeleteMedicineById = async (id: number) => {
    await deleteMedicine(id);
    await loadMedicines();
    onMedicinesChange();
  };

  return (
    <Wrapper>
      {/* Info Banner */}
      <InfoBanner>
        <Info size={16} />
        <p>
          Administra la lista de <strong>medicamentos e indicaciones</strong> predeterminadas que aparecerán al emitir recipes médicos.
        </p>
      </InfoBanner>

      {/* ── Lista Actual ── */}
      <FormCard>
        <CardTitle>
          <Pill size={15} />
          <span>Mis Medicamentos</span>
          <PrimaryBtn onClick={() => setIsModalOpen(true)} style={{ marginLeft: 'auto', padding: '9px 12px', fontSize: '12px', borderRadius: '8px' }}>
            <PlusCircle size={14} /> Agregar
          </PrimaryBtn>
        </CardTitle>
        <ListContainer>
          {myMedicines.length === 0 ? (
            <EmptyState>No hay medicamentos guardados aún.</EmptyState>
          ) : (
            myMedicines.map((medicine) => (
              <ListItem key={medicine.id}>
                <div>
                  <div className="info">
                    {medicine.nombre} {medicine.presentacion && <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 500 }}>({medicine.presentacion})</span>}
                    {medicine.isPediatric && <PediatricBadge>NIÑOS</PediatricBadge>}
                  </div>
                  <div className="subinfo">
                    {medicine.isPediatric
                      ? `${medicine.concentracionMg}mg/${medicine.concentracionMl}ml · ${medicine.dosisPorKg}mg/kg/día · ${medicine.dosisAlDia} dosis/día`
                      : medicine.indicaciones}
                  </div>
                </div>
                <div className="actions">
                  <button onClick={() => DeleteMedicineById(medicine.id!)} title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </ListItem>
            ))
          )}
        </ListContainer>
      </FormCard>

      {/* ── Importar / Exportar ── */}
      <FormCard>
        <CardTitle>
          <Download size={15} />
          <span>Importar / Exportar CSV</span>
        </CardTitle>

        <ActionRow>
          <p>Cargar medicamentos desde un archivo CSV</p>
          <FileLabel>
            <Upload size={16} />
            Seleccionar archivo .csv
            <input type="file" accept=".csv" onChange={HandleFileSelect} />
          </FileLabel>
          <SecondaryBtn onClick={handleDownload}>
            <Download size={14} /> Descargar plantilla CSV
          </SecondaryBtn>
        </ActionRow>

        <ActionRow>
          <p>Exportar la lista actual de medicamentos</p>
          <PrimaryBtn
            onClick={DownloadMyMedicines}
            $disabled={myMedicines.length === 0}
          >
            <Download size={14} /> Exportar mis medicamentos
          </PrimaryBtn>
        </ActionRow>
      </FormCard>

      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar
        theme="colored"
      />

      {/* Modal Agregar Medicamento */}
      {isModalOpen && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>Nuevo Medicamento</h3>

            {/* Toggle Adultos / Niños */}
            <PatientToggle>
              <ToggleBtn
                $active={!newMedicine.isPediatric}
                onClick={() => setNewMedicine({ ...newMedicine, isPediatric: false })}
                type="button"
              >
                Adultos
              </ToggleBtn>
              <ToggleBtn
                $active={newMedicine.isPediatric}
                onClick={() => {
                  if (!isFullAccess) {
                    if (onProRequired) onProRequired();
                    return;
                  }
                  setNewMedicine({ ...newMedicine, isPediatric: true });
                }}
                type="button"
              >
                Niños
              </ToggleBtn>
            </PatientToggle>

            {/* Campo nombre (común) */}
            <div className="field">
              <label>Nombre del medicamento</label>
              <input
                type="text"
                name="nombre"
                value={newMedicine.nombre}
                onChange={handleNewMedicine}
                placeholder={newMedicine.isPediatric ? 'Ej: Amoxicilina Suspensión' : 'Ej: Ibuprofeno 400mg'}
                autoFocus
                autoComplete="off"
              />
            </div>

            {/* Campo Presentación */}
            <div className="field">
              <label>Presentación</label>
              <select name="presentacion" value={newMedicine.presentacion} onChange={handleNewMedicine}>
                <option value="">Seleccione una presentación...</option>
                <optgroup label="Sólidos">
                  <option value="Comprimidos">Comprimidos</option>
                  <option value="Cápsulas">Cápsulas</option>
                  <option value="Tabletas">Tabletas</option>
                  <option value="Grageas">Grageas</option>
                  <option value="Polvos">Polvos</option>
                  <option value="Granulados">Granulados</option>
                </optgroup>
                <optgroup label="Líquidos">
                  <option value="Jarabe">Jarabe</option>
                  <option value="Solución / Gotas">Solución / Gotas</option>
                  <option value="Suspensión ">Suspensión</option>
                  <option value="Ampollas / Viales">Ampollas / Viales</option>
                  <option value="Elixir">Elixir</option>
                </optgroup>
                <optgroup label="Semisólidos">
                  <option value="Crema">Crema</option>
                  <option value="Pomada">Pomada</option>
                  <option value="Ungüento">Ungüento</option>
                  <option value="Gel">Gel</option>
                  <option value="Pasta">Pasta</option>
                </optgroup>
                <optgroup label="Otras">
                  <option value="Inhalador">Inhalador</option>
                  <option value="Aerosol">Aerosol</option>
                  <option value="Parche transdérmico">Parche transdérmico</option>
                  <option value="Supositorio">Supositorio</option>
                  <option value="Óvulo">Óvulo</option>
                  <option value="Loción">Loción</option>
                </optgroup>
              </select>
            </div>

            {/* Modo Adultos */}
            {!newMedicine.isPediatric && (
              <div className="field">
                <label>Indicaciones / Posología</label>
                <input
                  type="text"
                  name="indicaciones"
                  value={newMedicine.indicaciones}
                  onChange={handleNewMedicine}
                  placeholder="Ej: 1 tableta cada 8 horas por 7 días"
                  autoComplete="off"
                />
              </div>
            )}

            {/* Modo Niños */}
            {newMedicine.isPediatric && (
              <>
                <PediatricNote>
                  Los campos de concentración y dosis se usarán para calcular automáticamente la posología según el peso del paciente al agregar al recipe.
                </PediatricNote>

                <div className="field-row">
                  <div>
                    <label>Concentración (mg)</label>
                    <input
                      type="number"
                      name="concentracionMg"
                      value={newMedicine.concentracionMg}
                      onChange={handleNewMedicine}
                      placeholder="Ej: 250"
                      min="0"
                      step="any"
                    />
                  </div>
                  <div>
                    <label>por (ml)</label>
                    <input
                      type="number"
                      name="concentracionMl"
                      value={newMedicine.concentracionMl}
                      onChange={handleNewMedicine}
                      placeholder="Ej: 5"
                      min="0"
                      step="any"
                    />
                  </div>
                </div>

                <div className="field-row">
                  <div>
                    <label>Dosis por kg al día </label>
                    <input
                      type="number"
                      name="dosisPorKg"
                      value={newMedicine.dosisPorKg}
                      onChange={handleNewMedicine}
                      placeholder="Ej: 40"
                      min="0"
                      step="any"
                    />
                  </div>
                  <div>
                    <label>Dosis al día</label>
                    <input
                      type="number"
                      name="dosisAlDia"
                      value={newMedicine.dosisAlDia}
                      onChange={handleNewMedicine}
                      placeholder="Ej: 3"
                      min="1"
                      step="1"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="buttons">
              <SecondaryBtn onClick={closeModal}>Cancelar</SecondaryBtn>
              <PrimaryBtn onClick={AddMedicine}>Guardar</PrimaryBtn>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </Wrapper>
  );
};

export default ConfigMedicines;
