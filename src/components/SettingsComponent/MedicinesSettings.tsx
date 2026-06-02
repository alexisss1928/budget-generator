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
  margin: 16px 16px 0;
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

const FieldRow = styled.div`
  display: flex;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  align-items: flex-start;

  &:last-child {
    border-bottom: none;
  }

  .inputs {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  input {
    flex: 1;
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
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  align-self: center;

  &:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.95);
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

const PrimaryBtn = styled(SecondaryBtn)<{ $disabled?: boolean }>`
  background: ${(p) => p.$disabled ? 'var(--border)' : 'var(--accent)'};
  color: ${(p) => p.$disabled ? 'var(--text-muted)' : '#fff'};
  border: none;
  pointer-events: ${(p) => p.$disabled ? 'none' : 'auto'};

  &:hover {
    background: var(--accent);
    opacity: 0.9;
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

type ConfigType = {
  onMedicinesChange: () => void;
};

const ConfigMedicines = ({ onMedicinesChange }: ConfigType) => {
  const [myMedicines, setMyMedicines] = useState<MedicineRecord[]>([]);
  const [newMedicine, setNewMedicine] = useState({ nombre: '', indicaciones: '' });

  const loadMedicines = async () => {
    const data = await getAllMedicines();
    setMyMedicines(data);
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleNewMedicine = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    setNewMedicine({ ...newMedicine, [name]: value });
  };

  const HandleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      Papa.parse(event.target.files[0], {
        header: true,
        complete: async function (results) {
          if (
            results.meta.fields?.includes('nombre') &&
            results.meta.fields?.includes('indicaciones')
          ) {
            await saveAllMedicines(
              (results.data as MedicineRecord[]).filter((r) => r.nombre)
            );
            await loadMedicines();
            onMedicinesChange();
            toast.success('Medicamentos cargados exitosamente');
          } else {
            toast.error(
              'El archivo debe tener las columnas "nombre" e "indicaciones"'
            );
          }
        },
      });
    }
  };

  const handleDownload = () => {
    const data = `nombre,indicaciones
Ibuprofeno - 400 mg,"400 mg cada 6 horas, 600 mg cada 8 horas por 3 dias si hay dolor"
Acetaminofen - 500 mg,500 mg cada 6 horas
Ketoprofeno - 100 mg,100 mg cada 4 a 6 horas
Amoxicilina - 500 mg,500 mg cada 8 horas por 7 dias
Amoxicilina + Ac. Clavulanico - 500 mg/125 mg,1 tab cada 8 horas por 5 a 10 dias.
Clindamicina - 300 mg,300 mg cada 6 horas por 7 dias
Azitromicina - 500 mg,500 mg diarios por 3 dias`;
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
        myMedicines.map(({ nombre, indicaciones }) => ({ nombre, indicaciones }))
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
    await saveMedicine(newMedicine);
    setNewMedicine({ nombre: '', indicaciones: '' });
    await loadMedicines();
    onMedicinesChange();
    toast.success('Medicamento agregado');
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

      {/* ── Agregar Nuevo ── */}
      <FormCard>
        <CardTitle>
          <PlusCircle size={15} />
          <span>Nuevo Medicamento</span>
        </CardTitle>
        <FieldRow>
          <div className="inputs">
            <input
              type="text"
              name="nombre"
              value={newMedicine.nombre}
              onChange={handleNewMedicine}
              autoComplete="off"
              placeholder="Nombre del medicamento (ej: Ibuprofeno 400mg)"
            />
            <input
              type="text"
              name="indicaciones"
              value={newMedicine.indicaciones}
              onChange={handleNewMedicine}
              autoComplete="off"
              placeholder="Indicaciones (ej: 1 tableta cada 8 horas)"
            />
          </div>
          <AddBtn onClick={AddMedicine} title="Agregar">
            <PlusCircle size={18} />
          </AddBtn>
        </FieldRow>
      </FormCard>

      {/* ── Lista Actual ── */}
      <FormCard>
        <CardTitle>
          <Pill size={15} />
          <span>Mis Medicamentos</span>
        </CardTitle>
        <ListContainer>
          {myMedicines.length === 0 ? (
            <EmptyState>No hay medicamentos guardados aún.</EmptyState>
          ) : (
            myMedicines.map((medicine) => (
              <ListItem key={medicine.id}>
                <div>
                  <div className="info">{medicine.nombre}</div>
                  <div className="subinfo">{medicine.indicaciones}</div>
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
    </Wrapper>
  );
};

export default ConfigMedicines;
