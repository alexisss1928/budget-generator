import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import styled from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Settings, Trash2, PlusCircle, Download, Upload, Info
} from 'lucide-react';
import {
  getAllTreatments,
  saveTreatment,
  deleteTreatment,
  saveAllTreatments,
  TreatmentRecord,
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
    font-weight: 500;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 14px;
    
    .price {
      font-size: 13px;
      font-weight: 700;
      color: var(--accent);
      background: var(--accent-bg);
      padding: 4px 8px;
      border-radius: 6px;
    }

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
  align-items: center;

  &:last-child {
    border-bottom: none;
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

  input[type="number"] {
    width: 80px;
    flex: none;
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
  onTreatmentsChange: () => void;
};

const ConfigComponent = ({ onTreatmentsChange }: ConfigType) => {
  const [myTreatments, setMyTreatments] = useState<TreatmentRecord[]>([]);
  const [newTreatment, setNewTreatment] = useState({ nombre: '', precio: '' });

  const loadTreatments = async () => {
    const data = await getAllTreatments();
    setMyTreatments(data);
  };

  useEffect(() => {
    loadTreatments();
  }, []);

  const handleNewTreatment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    setNewTreatment({ ...newTreatment, [name]: value });
  };

  const HandleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      Papa.parse(event.target.files[0], {
        header: true,
        complete: async function (results) {
          if (
            results.meta.fields?.includes('nombre') &&
            results.meta.fields?.includes('precio')
          ) {
            await saveAllTreatments(
              (results.data as TreatmentRecord[]).filter((r) => r.nombre)
            );
            await loadTreatments();
            onTreatmentsChange();
            toast.success('Tratamientos cargados exitosamente');
          } else {
            toast.error(
              'El archivo debe tener las columnas "nombre" y "precio"'
            );
          }
        },
      });
    }
  };

  const handleDownload = () => {
    const data = `nombre,precio
Consulta Inicial,10
Tartrectomia e Higiene,20
Aplicación Tópica de Fluor,10
Resina Tipo I,30
Resina Tipo II,45
Resina Tipo III,110
Resina Clase V,30`;
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'ModeloParaCostos.csv');
    a.click();
  };

  const DownloadMyPrices = () => {
    if (myTreatments.length > 0) {
      const data = Papa.unparse(myTreatments.map(({ nombre, precio }) => ({ nombre, precio })));
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'MisCostos.csv');
      a.click();
    }
  };

  const AddTreatment = async () => {
    if (!newTreatment.nombre.trim()) return;
    await saveTreatment(newTreatment);
    setNewTreatment({ nombre: '', precio: '' });
    await loadTreatments();
    onTreatmentsChange();
    toast.success('Tratamiento agregado');
  };

  const DeleteTreatmentById = async (id: number) => {
    await deleteTreatment(id);
    await loadTreatments();
    onTreatmentsChange();
  };

  return (
    <Wrapper>
      {/* Info Banner */}
      <InfoBanner>
        <Info size={16} />
        <p>
          Administra la lista de <strong>procedimientos y precios</strong> que aparecerán disponibles al crear presupuestos.
        </p>
      </InfoBanner>

      {/* ── Agregar Nuevo ── */}
      <FormCard>
        <CardTitle>
          <PlusCircle size={15} />
          <span>Nuevo Tratamiento</span>
        </CardTitle>
        <FieldRow>
          <input
            type="text"
            name="nombre"
            value={newTreatment.nombre}
            onChange={handleNewTreatment}
            autoComplete="off"
            placeholder="Nombre del tratamiento"
          />
          <input
            type="number"
            name="precio"
            value={newTreatment.precio}
            onChange={handleNewTreatment}
            autoComplete="off"
            placeholder="Precio $"
          />
          <AddBtn onClick={AddTreatment} title="Agregar">
            <PlusCircle size={18} />
          </AddBtn>
        </FieldRow>
      </FormCard>

      {/* ── Lista Actual ── */}
      <FormCard>
        <CardTitle>
          <Settings size={15} />
          <span>Mis Tratamientos</span>
        </CardTitle>
        <ListContainer>
          {myTreatments.length === 0 ? (
            <EmptyState>No hay tratamientos guardados aún.</EmptyState>
          ) : (
            myTreatments.map((treatment) => (
              <ListItem key={treatment.id}>
                <div className="info">{treatment.nombre}</div>
                <div className="actions">
                  <span className="price">${treatment.precio}</span>
                  <button onClick={() => DeleteTreatmentById(treatment.id!)} title="Eliminar">
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
          <p>Cargar tratamientos desde un archivo CSV</p>
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
          <p>Exportar la lista actual de tratamientos</p>
          <PrimaryBtn 
            onClick={DownloadMyPrices} 
            $disabled={myTreatments.length === 0}
          >
            <Download size={14} /> Exportar mis costos
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

export default ConfigComponent;
