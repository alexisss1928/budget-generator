import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ClipboardList, FileText, Trash2, Eraser } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getAllReportTemplates,
  saveReportTemplate,
  deleteReportTemplate,
  ReportTemplate,
} from '../../db/clinicDB';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// ─── Styled Components (Matching Budget & DoctorSettings) ──────────────────

const FormCard = styled.div`
  background: var(--surface);
  border-radius: 16px;
  margin-bottom: 20px;
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
  flex-wrap: wrap;

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

    &:focus {
      box-shadow: 0 0 0 2px var(--accent);
    }
  }

  textarea {
    resize: vertical;
    min-height: 250px;
    width: 100%;
    flex: none;
    margin-top: 10px;
  }
`;

const ActionBtn = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  background: ${(p) => (p.$danger ? '#ffebee' : 'var(--accent)')};
  color: ${(p) => (p.$danger ? '#e53935' : '#fff')};
  border: none;
  border-radius: 8px;
  font-size: 12px;
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

const SecondaryBtn = styled(ActionBtn)`
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);

  &:hover {
    background: var(--surface-alt);
    color: var(--text);
  }
`;

const SaveTemplateLink = styled.a`
  font-size: 13px;
  color: var(--accent);
  text-decoration: underline;
  cursor: pointer;
  margin-top: 10px;
  align-self: flex-end;
  font-weight: 600;

  &:hover {
    color: var(--text);
  }
`;

const QuillWrapper = styled.div`
  width: 100%;
  .ql-toolbar {
    background: var(--surface-alt) !important;
    border: 1px solid var(--border) !important;
    border-bottom: none !important;
    border-radius: 8px 8px 0 0;
  }
  .ql-container {
    background: var(--input-bg) !important;
    border: 1px solid var(--border) !important;
    border-radius: 0 0 8px 8px;
    min-height: 250px;
    font-size: 13px;
    font-family: inherit;
    color: var(--text) !important;
  }
  .ql-editor {
    min-height: 250px;
  }
  .ql-stroke {
    stroke: var(--text) !important;
  }
  .ql-fill {
    fill: var(--text) !important;
  }
  .ql-picker {
    color: var(--text) !important;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const ModalContent = styled.div`
  background: var(--surface);
  padding: 20px 24px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);

  h3 { margin-top: 0; margin-bottom: 16px; color: var(--text); }
  
  input {
    width: 100%;
    box-sizing: border-box;
    background: var(--input-bg) !important;
    color: var(--text) !important;
    border: none;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    outline: none;
    transition: box-shadow 0.15s;

    &:focus {
      box-shadow: 0 0 0 2px var(--accent);
    }
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
`;

// ─── Types ───────────────────────────────────────────────────────────────────

type ReportType = {
  report: string;
  setReport: (arg0: string) => void;
  handleReportData: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

// ─── Component ───────────────────────────────────────────────────────────────

const Report = ({ report, setReport, handleReportData }: ReportType) => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const loadTemplates = async () => {
    const data = await getAllReportTemplates();
    setTemplates(data);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleSelectTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedTemplateId(id);
    if (id) {
      const tpl = templates.find((t) => t.id === Number(id));
      if (tpl) setReport(tpl.content);
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateTitle.trim() || !report.trim()) {
      toast.error('Ingrese un título y el contenido del informe.');
      return;
    }
    await saveReportTemplate({
      title: newTemplateTitle,
      content: report,
    });
    setNewTemplateTitle('');
    setIsModalOpen(false);
    await loadTemplates();
    toast.success('Plantilla guardada');
  };

  const handleDeleteTemplate = () => {
    if (!selectedTemplateId) return;
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTemplate = async () => {
    await deleteReportTemplate(Number(selectedTemplateId));
    setSelectedTemplateId('');
    setIsDeleteModalOpen(false);
    await loadTemplates();
    toast.info('Plantilla eliminada');
  };

  return (
    <>
      {/* ── Plantillas ── */}
      <FormCard>
        <CardTitle>
          <ClipboardList size={15} />
          <span>Plantillas de Informes</span>
        </CardTitle>

        {/* Seleccionar Plantilla */}
        <FieldRow>
          <label>Cargar plantilla</label>
          <select value={selectedTemplateId} onChange={handleSelectTemplate}>
            <option value="">-- Seleccionar --</option>
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.title}
              </option>
            ))}
          </select>
          {selectedTemplateId && (
            <ActionBtn $danger onClick={handleDeleteTemplate} title="Eliminar plantilla seleccionada">
              <Trash2 size={16} />
            </ActionBtn>
          )}
        </FieldRow>
      </FormCard>

      {/* ── Redacción del Informe ── */}
      <FormCard>
        <CardTitle>
          <FileText size={15} />
          <span>Redacción</span>
        </CardTitle>
        <FieldRow style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ width: 'auto' }}>Contenido del informe</label>
            <SecondaryBtn onClick={() => setReport('')}>
              <Eraser size={14} /> Limpiar
            </SecondaryBtn>
          </div>
          <QuillWrapper style={{ marginTop: '10px' }}>
            <ReactQuill
              theme="snow"
              value={report}
              onChange={(content) => {
                const e = { target: { name: 'informe', value: content } } as any;
                handleReportData(e);
              }}
              placeholder="Redacte el informe médico aquí..."
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['clean']
                ]
              }}
            />
          </QuillWrapper>
          <SaveTemplateLink onClick={() => setIsModalOpen(true)}>
            Guardar como plantilla
          </SaveTemplateLink>
        </FieldRow>
      </FormCard>

      {/* Modal para guardar plantilla */}
      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>Guardar Plantilla</h3>
            <input
              type="text"
              placeholder="Nombre de la plantilla..."
              value={newTemplateTitle}
              onChange={(e) => setNewTemplateTitle(e.target.value)}
              autoFocus
            />
            <div className="buttons">
              <SecondaryBtn onClick={() => setIsModalOpen(false)}>Cancelar</SecondaryBtn>
              <ActionBtn onClick={handleSaveTemplate}>Guardar</ActionBtn>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Modal para confirmar eliminación */}
      {isDeleteModalOpen && (
        <ModalOverlay onClick={() => setIsDeleteModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>Eliminar Plantilla</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              ¿Estás seguro de que deseas eliminar esta plantilla? Esta acción no se puede deshacer.
            </p>
            <div className="buttons">
              <SecondaryBtn onClick={() => setIsDeleteModalOpen(false)}>Cancelar</SecondaryBtn>
              <ActionBtn $danger onClick={confirmDeleteTemplate}>Eliminar</ActionBtn>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default Report;
