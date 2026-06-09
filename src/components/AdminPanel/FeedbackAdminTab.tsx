import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AlertCircle, Lightbulb, Edit2, Heart } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CardDetails = styled.details<{ $type: string }>`
  background: var(--surface);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
`;

const CardSummary = styled.summary`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 18px;
  cursor: pointer;
  list-style: none;
  &::-webkit-details-marker { display: none; }
`;

const CardContent = styled.div`
  padding: 0 18px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-top: 1px dashed var(--border);
  padding-top: 14px;
`;

const LikesBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--accent-bg);
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 10px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
`;

const ActionsFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border);

  select {
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface-alt);
    color: var(--text);
    font-size: 12px;
    font-weight: 600;
    outline: none;
    cursor: pointer;
    min-width: 110px;
    &:focus { border-color: var(--accent); }
  }
  }
`;

const DescBox = styled.p`
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
`;

const PublishBox = styled.div`
  background: var(--surface-alt);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;

  h5 { margin: 0; font-size: 12px; color: var(--text); display: flex; align-items: center; gap: 6px; }
  
  input, textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--input-bg);
    color: var(--text);
    font-family: inherit;
    font-size: 12px;
  }

  button.save {
    align-self: flex-end;
    background: var(--accent);
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  select {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-size: 13px;
    outline: none;
    cursor: pointer;
    &:focus { border-color: var(--accent); }
  }
`;

export default function FeedbackAdminTab({ type }: { type: 'SUGGESTION' | 'ERROR' }) {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPublish, setEditingPublish] = useState<string | null>(null);
  const [publishData, setPublishData] = useState({ publicTitle: '', publicDesc: '' });
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPublished, setFilterPublished] = useState('ALL');

  const loadFeedbacks = async () => {
    try {
      const res = await api.get('/feedback/admin');
      setFeedbacks(res.data);
    } catch (e) {
      toast.error('Error cargando reportes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.patch(`/feedback/${id}/status`, { status });
      toast.success('Estado actualizado');
      loadFeedbacks();
    } catch (e) {
      toast.error('Error actualizando estado');
    }
  };

  const handlePublishClick = (f: any) => {
    if (f.isPublic) {
      setPublishData({ publicTitle: f.publicTitle || f.title, publicDesc: f.publicDesc || f.description });
    } else {
      setPublishData({ publicTitle: f.title, publicDesc: f.description });
    }
    setEditingPublish(f.id);
  };

  const submitPublish = async (id: string) => {
    try {
      await api.patch(`/feedback/${id}/publish`, publishData);
      toast.success('Publicado para votación');
      setEditingPublish(null);
      loadFeedbacks();
    } catch (e) {
      toast.error('Error al publicar');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Cargando...</div>;

  let filteredFeedbacks = feedbacks.filter(f => f.type === type);
  if (filterStatus !== 'ALL') {
    filteredFeedbacks = filteredFeedbacks.filter(f => f.status === filterStatus);
  }
  if (type === 'SUGGESTION' && filterPublished !== 'ALL') {
    filteredFeedbacks = filteredFeedbacks.filter(f => filterPublished === 'PUBLISHED' ? f.isPublic : !f.isPublic);
  }

  return (
    <Container>
      <FiltersRow>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="ALL">Todos los Estados</option>
          <option value="OPEN">Abiertos</option>
          <option value="IN_PROGRESS">En Progreso</option>
          <option value="RESOLVED">Resueltos</option>
        </select>
        {type === 'SUGGESTION' && (
          <select value={filterPublished} onChange={e => setFilterPublished(e.target.value)}>
            <option value="ALL">Todas</option>
            <option value="PUBLISHED">Publicadas</option>
            <option value="UNPUBLISHED">No Publicadas</option>
          </select>
        )}
      </FiltersRow>

      {filteredFeedbacks.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay reportes.</div>
      ) : filteredFeedbacks.map(f => (
        <CardDetails key={f.id} $type={f.type}>
          <CardSummary>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {f.type === 'ERROR' ? <AlertCircle size={16} color="#ef4444" /> : <Lightbulb size={16} color="#eab308" />}
              <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text)', fontWeight: 700 }}>{f.title}</h4>
            </div>
            {f.isPublic && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--accent)', alignSelf: 'flex-end', marginTop: '6px' }}>
                <span style={{ padding: '4px 8px', background: 'var(--accent-bg)', borderRadius: '6px' }}>Publicado</span>
                <LikesBadge><Heart size={14} fill="currentColor" /> {f._count?.likes || 0}</LikesBadge>
              </div>
            )}
            {f.type === 'ERROR' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, alignSelf: 'flex-end', marginTop: '6px' }}>
                <span style={{ 
                  padding: '4px 8px', borderRadius: '6px',
                  background: f.status === 'OPEN' ? '#fee2e2' : f.status === 'IN_PROGRESS' ? '#fef3c7' : '#d1fae5',
                  color: f.status === 'OPEN' ? '#ef4444' : f.status === 'IN_PROGRESS' ? '#d97706' : '#10b981'
                }}>
                  {f.status === 'OPEN' ? 'ABIERTO' : f.status === 'IN_PROGRESS' ? 'EN PROGRESO' : 'RESUELTO'}
                </span>
              </div>
            )}
          </CardSummary>
          
          <CardContent>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              De: {f.user.name} ({f.user.email})
            </span>
            <DescBox>{f.description}</DescBox>

            {f.isPublic && editingPublish !== f.id && (
              <div style={{ background: 'var(--surface-alt)', padding: '10px', borderRadius: '8px', fontSize: '12px' }}>
                <strong>Mostrado al público como:</strong> {f.publicTitle} <br/>
                <span style={{ color: 'var(--text-secondary)' }}>{f.publicDesc}</span>
              </div>
            )}

            {editingPublish === f.id && (
              <PublishBox>
                <h5><Edit2 size={12} /> Editar texto público para votación</h5>
                <input 
                  value={publishData.publicTitle} 
                  onChange={e => setPublishData({...publishData, publicTitle: e.target.value})} 
                  placeholder="Título público"
                />
                <textarea 
                  rows={3} 
                  value={publishData.publicDesc} 
                  onChange={e => setPublishData({...publishData, publicDesc: e.target.value})}
                  placeholder="Descripción pública"
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setEditingPublish(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}>Cancelar</button>
                  <button className="save" onClick={() => submitPublish(f.id)}>Guardar y Publicar</button>
                </div>
              </PublishBox>
            )}

            <ActionsFooter>
              {f.type === 'SUGGESTION' && (
                <button 
                  onClick={() => handlePublishClick(f)}
                  style={{
                    background: f.isPublic ? 'var(--accent-bg)' : 'transparent',
                    color: f.isPublic ? 'var(--accent)' : 'var(--text-muted)',
                    border: `1px solid ${f.isPublic ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  {f.isPublic ? 'Editar Publicación' : 'Publicar'}
                </button>
              )}
              <select value={f.status} onChange={e => handleStatusChange(f.id, e.target.value)}>
                <option value="OPEN">Abierto</option>
                <option value="IN_PROGRESS">En Progreso</option>
                <option value="RESOLVED">Resuelto</option>
              </select>
            </ActionsFooter>
          </CardContent>
        </CardDetails>
      ))}
    </Container>
  );
}
