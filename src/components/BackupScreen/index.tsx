import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Database, Download, Upload, AlertTriangle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { exportDB, importDB } from '../../db/clinicDB';

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

const ActionRow = styled.div`
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  
  p {
    margin: 0;
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
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
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: var(--surface-alt);
    border-color: var(--text-muted);
  }
`;

const PrimaryBtn = styled(SecondaryBtn)<{ $danger?: boolean }>`
  background: ${(p) => p.$danger ? '#e53935' : 'var(--accent)'};
  color: #fff;
  border: none;

  &:hover {
    background: ${(p) => p.$danger ? '#c62828' : 'var(--accent)'};
    opacity: 0.9;
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
  padding: 16px;
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

const WarningBox = styled.div`
  background: #fff3e0;
  border: 1px solid #ffcc80;
  color: #e65100;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 12px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 4px;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 10px 0;
`;

const RadioOption = styled.label<{ $active?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1px solid ${(p) => p.$active ? 'var(--accent)' : 'var(--border)'};
  border-radius: 10px;
  background: ${(p) => p.$active ? 'var(--accent-bg)' : 'var(--input-bg)'};
  cursor: pointer;
  transition: all 0.15s;

  input {
    margin-top: 2px;
    accent-color: var(--accent);
  }

  div {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    strong {
      font-size: 13px;
      color: ${(p) => p.$active ? 'var(--accent)' : 'var(--text)'};
    }
    
    span {
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.4;
    }
  }
`;

const BackupScreen = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');

  const handleExport = async () => {
    try {
      const data = await exportDB();
      const blob = new Blob([data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().split('T')[0];
      a.download = `ClinicManager_Backup_${date}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Respaldo exportado exitosamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al exportar los datos');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) throw new Error("Empty file");
        
        // Basic validation
        JSON.parse(text); 
        
        await importDB(text, restoreMode);
        toast.success('Datos restaurados correctamente. Recargando...', { autoClose: 2000 });
        
        // Reload to apply changes across all contexts
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (err) {
        console.error(err);
        toast.error('El archivo no es válido o está corrupto');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Wrapper>
      <InfoBanner>
        <Database size={16} />
        <p>
          <strong>Respaldo y Restauración</strong><br />
          Guarda todos tus datos locales (tratamientos, medicamentos, plantillas, perfil e historial) en un archivo seguro, o restaura un respaldo previo.
        </p>
      </InfoBanner>

      <FormCard>
        <CardTitle>
          <Download size={15} />
          <span>Crear Respaldo</span>
        </CardTitle>
        <ActionRow>
          <p>Genera un archivo .json con toda la información guardada en este dispositivo.</p>
          <PrimaryBtn onClick={handleExport}>
            <Download size={15} /> Exportar Datos
          </PrimaryBtn>
        </ActionRow>
      </FormCard>

      <FormCard>
        <CardTitle>
          <Upload size={15} />
          <span>Restaurar Datos</span>
        </CardTitle>
        <ActionRow>
          <p>Selecciona cómo deseas restaurar y luego elige el archivo de respaldo.</p>
          
          <RadioGroup>
            <RadioOption $active={restoreMode === 'replace'}>
              <input 
                type="radio" 
                name="restoreMode" 
                checked={restoreMode === 'replace'} 
                onChange={() => setRestoreMode('replace')} 
              />
              <div>
                <strong>Reemplazar Todo</strong>
                <span>Borra la información actual y carga únicamente la del archivo.</span>
              </div>
            </RadioOption>
            <RadioOption $active={restoreMode === 'merge'}>
              <input 
                type="radio" 
                name="restoreMode" 
                checked={restoreMode === 'merge'} 
                onChange={() => setRestoreMode('merge')} 
              />
              <div>
                <strong>Mezclar Datos</strong>
                <span>Mantiene tu información actual y añade los registros del archivo.</span>
              </div>
            </RadioOption>
          </RadioGroup>

          {restoreMode === 'replace' && (
            <WarningBox>
              <AlertTriangle size={16} />
              <span><strong>¡Atención!</strong> Se eliminarán tus datos actuales.</span>
            </WarningBox>
          )}

          <FileLabel>
            <Upload size={16} />
            Seleccionar archivo de respaldo (.json)
            <input type="file" accept=".json" onChange={handleImport} ref={fileInputRef} />
          </FileLabel>
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

export default BackupScreen;
