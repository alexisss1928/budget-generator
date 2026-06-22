import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ChevronLeft, Plus, Briefcase, Trash2, Edit2, Calendar } from 'lucide-react';
import { WorkplaceRecord, getAllWorkplaces, saveWorkplace, deleteWorkplace } from '../../db/clinicDB';

const ScreenContainer = styled.div`
  height: 100%;
  overflow-y: auto;
  background: var(--bg);
  animation: slideUp 0.25s ease;

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SectionInner = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 600px;
  padding: 20px 16px 100px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
`;

const BackBtn = styled.button`
  display: flex; align-items: center; gap: 6px;
  background: var(--surface);
  border: none; border-radius: 10px;
  padding: 8px 14px 8px 10px;
  font-size: 13px; font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: var(--shadow-card);
  &:hover { background: var(--accent-bg); color: var(--accent); }
`;

const NewBtn = styled.button`
  margin-left: auto;
  background: transparent;
  border: 2px solid var(--accent);
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 12px; font-weight: 700;
  color: var(--accent);
  cursor: pointer;
  display: flex; align-items: center; gap: 6px;
  transition: all 0.15s;
  &:hover { background: var(--accent); color: #fff; transform: translateY(-1px); }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`;

const Card = styled.div`
  background: var(--surface);
  border-radius: 14px;
  padding: 20px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--border);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--accent);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SubText = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button<{ $danger?: boolean }>`
  background: transparent;
  border: none;
  color: ${p => p.$danger ? '#ef4444' : 'var(--text-secondary)'};
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: ${p => p.$danger ? 'rgba(239, 68, 68, 0.1)' : 'var(--hover-bg)'};
  }
`;

const ModalOverlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  padding: 20px;
`;

const ModalContent = styled.div`
  background: var(--surface);
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
  max-height: 90vh;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;

  &:focus {
    border-color: var(--accent);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;

  &:focus {
    border-color: var(--accent);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: ${p => p.$primary ? 'none' : '1px solid var(--border)'};
  background: ${p => p.$primary ? 'var(--accent)' : 'transparent'};
  color: ${p => p.$primary ? '#fff' : 'var(--text)'};
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  
  h4 {
    margin: 12px 0 8px;
    color: var(--text);
    font-size: 16px;
  }
  
  p {
    font-size: 14px;
    margin: 0;
  }
`;

interface Props {
  onBack: () => void;
  onNavigateDetail: (id: number) => void;
}

export default function WorkplacesScreen({ onBack, onNavigateDetail }: Props) {
  const [workplaces, setWorkplaces] = useState<WorkplaceRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkplace, setEditingWorkplace] = useState<WorkplaceRecord | null>(null);

  const defaultFormState = {
    name: '',
    feeType: 'fixed_percentage' as const,
    feeValue: '',
    cutoffType: 'monthly' as const,
    customCutoffDays: 0,
    cutoffDaysOfWeek: [] as number[]
  };

  const [form, setForm] = useState<Omit<WorkplaceRecord, 'id'>>(defaultFormState);

  const loadData = async () => {
    const data = await getAllWorkplaces();
    setWorkplaces(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (workplace?: WorkplaceRecord) => {
    if (workplace) {
      setEditingWorkplace(workplace);
      setForm({
        name: workplace.name,
        feeType: workplace.feeType,
        feeValue: workplace.feeValue,
        cutoffType: workplace.cutoffType,
        customCutoffDays: workplace.customCutoffDays || 0,
        cutoffDaysOfWeek: workplace.cutoffDaysOfWeek || []
      });
    } else {
      setEditingWorkplace(null);
      setForm(defaultFormState);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      alert("Por favor ingresa el nombre del sitio de trabajo.");
      return;
    }
    if (form.feeType === 'fixed_percentage' && !form.feeValue) {
      alert("Por favor ingresa el porcentaje fijo.");
      return;
    }

    const record: WorkplaceRecord = {
      ...(editingWorkplace ? { id: editingWorkplace.id } : {}),
      ...form
    };

    await saveWorkplace(record);
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm("¿Seguro que deseas eliminar este sitio de trabajo?")) {
      await deleteWorkplace(id);
      loadData();
    }
  };

  const getFeeTypeText = (type: string, value: string) => {
    if (type === 'fixed_percentage') return `Porcentaje fijo: ${value}%`;
    if (type === 'variable') return `Variable por procedimiento`;
    if (type === 'custom_formula') return `Fórmula: ${value}`;
    return type;
  };

  const getCutoffText = (type: string, days?: number, daysOfWeek?: number[]) => {
    const map: any = {
      daily: 'Diario',
      weekly: 'Semanal',
      biweekly: 'Quincenal',
      monthly: 'Mensual',
      custom: `Cada ${days} días`,
      weekly_days: 'Días de semana específicos'
    };
    if (type === 'weekly_days' && daysOfWeek && daysOfWeek.length > 0) {
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return `Días: ${daysOfWeek.map(d => dayNames[d]).join(', ')}`;
    }
    return map[type] || type;
  };

  return (
    <ScreenContainer>
      <SectionInner>
        <SectionHeader>
          <BackBtn onClick={onBack}>
            <ChevronLeft size={15} /> Inicio
          </BackBtn>
          <NewBtn onClick={() => handleOpenModal()}>
            <Plus size={14} /> Nuevo Sitio
          </NewBtn>
        </SectionHeader>

        {workplaces.length === 0 ? (
          <EmptyState>
            <Briefcase size={40} style={{ opacity: 0.5 }} />
            <h4>No hay sitios de trabajo</h4>
            <p>Comienza registrando tus lugares de trabajo y configura tus honorarios.</p>
          </EmptyState>
        ) : (
          <Grid>
            {workplaces.map(wp => (
              <Card key={wp.id} onClick={() => wp.id && onNavigateDetail(wp.id)}>
                <CardHeader>
                  <Title><Briefcase size={18} /> {wp.name}</Title>
                  <Actions>
                    <IconButton onClick={(e) => { e.stopPropagation(); handleOpenModal(wp); }}>
                      <Edit2 size={15} />
                    </IconButton>
                    <IconButton $danger onClick={(e) => wp.id && handleDelete(e, wp.id)}>
                      <Trash2 size={15} />
                    </IconButton>
                  </Actions>
                </CardHeader>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <SubText>
                    <strong>Honorarios:</strong> {getFeeTypeText(wp.feeType, wp.feeValue)}
                  </SubText>
                  <SubText>
                    <Calendar size={14} /> <strong>Corte:</strong> {getCutoffText(wp.cutoffType, wp.customCutoffDays, wp.cutoffDaysOfWeek)}
                  </SubText>
                </div>
              </Card>
            ))}
          </Grid>
        )}
      </SectionInner>

      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)' }}>
              {editingWorkplace ? 'Editar Sitio' : 'Nuevo Sitio de Trabajo'}
            </h3>
            
            <FormGroup>
              <Label>Nombre del sitio</Label>
              <Input 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                placeholder="Ej. Clínica Santa Sofía" 
              />
            </FormGroup>

            <FormGroup>
              <Label>Tipo de honorarios</Label>
              <Select 
                value={form.feeType} 
                onChange={e => setForm({...form, feeType: e.target.value as any})}
              >
                <option value="fixed_percentage">Porcentaje Fijo</option>
                <option value="variable">Variable por Procedimiento</option>
                <option value="custom_formula">Fórmula Personalizada</option>
              </Select>
            </FormGroup>

            {form.feeType === 'fixed_percentage' && (
              <FormGroup>
                <Label>Porcentaje de ganancia (%)</Label>
                <Input 
                  type="number" 
                  value={form.feeValue} 
                  onChange={e => setForm({...form, feeValue: e.target.value})} 
                  placeholder="Ej. 30" 
                />
              </FormGroup>
            )}

            {form.feeType === 'custom_formula' && (
              <FormGroup>
                <Label>Fórmula personalizada</Label>
                <Input 
                  value={form.feeValue} 
                  onChange={e => setForm({...form, feeValue: e.target.value})} 
                  placeholder="Ej. (costo * 0.5) - 10" 
                />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                  Usa la variable "costo" en tu fórmula. Ej: costo * 0.3
                </span>
              </FormGroup>
            )}

            <FormGroup>
              <Label>Frecuencia de corte de pago {editingWorkplace && '(No editable)'}</Label>
              <Select 
                value={form.cutoffType} 
                onChange={e => setForm({...form, cutoffType: e.target.value as any})}
                disabled={!!editingWorkplace}
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="weekly_days">Días específicos de la semana</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
                <option value="custom">Personalizado (días)</option>
              </Select>
            </FormGroup>

            {form.cutoffType === 'weekly_days' && (
              <FormGroup>
                <Label>Días de corte en la semana {editingWorkplace && '(No editable)'}</Label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { id: 1, label: 'L' },
                    { id: 2, label: 'M' },
                    { id: 3, label: 'X' },
                    { id: 4, label: 'J' },
                    { id: 5, label: 'V' },
                    { id: 6, label: 'S' },
                    { id: 0, label: 'D' }
                  ].map(d => (
                    <button
                      key={d.id}
                      type="button"
                      disabled={!!editingWorkplace}
                      onClick={() => {
                        const arr = form.cutoffDaysOfWeek || [];
                        if (arr.includes(d.id)) {
                          setForm({...form, cutoffDaysOfWeek: arr.filter(x => x !== d.id)});
                        } else {
                          setForm({...form, cutoffDaysOfWeek: [...arr, d.id].sort()});
                        }
                      }}
                      style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        border: '1px solid var(--border)',
                        background: form.cutoffDaysOfWeek?.includes(d.id) ? 'var(--accent)' : 'transparent',
                        color: form.cutoffDaysOfWeek?.includes(d.id) ? '#fff' : 'var(--text)',
                        cursor: editingWorkplace ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                        transition: 'all 0.2s',
                        opacity: editingWorkplace && !form.cutoffDaysOfWeek?.includes(d.id) ? 0.5 : 1
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </FormGroup>
            )}

            {form.cutoffType === 'custom' && (
              <FormGroup>
                <Label>Días del corte {editingWorkplace && '(No editable)'}</Label>
                <Input 
                  type="number" 
                  value={form.customCutoffDays} 
                  onChange={e => setForm({...form, customCutoffDays: parseInt(e.target.value) || 0})} 
                  placeholder="Ej. 45" 
                  disabled={!!editingWorkplace}
                />
              </FormGroup>
            )}

            <ModalFooter>
              <Button onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button $primary onClick={handleSave}>Guardar</Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </ScreenContainer>
  );
}
