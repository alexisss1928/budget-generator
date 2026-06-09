import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CheckCircle2, AlertCircle, Lightbulb, Trash2, Edit2, Check } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Card = styled.div`
  background: var(--surface);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const TitleBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  h4 { margin: 0; font-size: 15px; color: var(--text); }
  span.email { font-size: 11px; color: var(--text-muted); }
`;

const ActionsBox = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  select {
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--input-bg);
    color: var(--text);
    font-size: 11px;
    outline: none;
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

export default function FeedbackAdminTab() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPublish, setEditingPublish] = useState<string | null>(null);
  const [publishData, setPublishData] = useState({ publicTitle: '', publicDesc: '' });

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

  return (
    <Container>
      {feedbacks.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay reportes.</div>
      ) : feedbacks.map(f => (
        <Card key={f.id}>
          <HeaderRow>
            <TitleBox>
              {f.type === 'ERROR' ? <AlertCircle size={16} color="#ef4444" /> : <Lightbulb size={16} color="#eab308" />}
              <h4>{f.title}</h4>
              <span className="email">{f.user.name} ({f.user.email})</span>
            </TitleBox>
            <ActionsBox>
              <select value={f.status} onChange={e => handleStatusChange(f.id, e.target.value)}>
                <option value="OPEN">Abierto</option>
                <option value="IN_PROGRESS">En Progreso</option>
                <option value="RESOLVED">Resuelto</option>
              </select>
              {f.type === 'SUGGESTION' && (
                <button 
                  onClick={() => handlePublishClick(f)}
                  style={{
                    background: f.isPublic ? 'var(--accent-bg)' : 'transparent',
                    color: f.isPublic ? 'var(--accent)' : 'var(--text-muted)',
                    border: `1px solid ${f.isPublic ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  {f.isPublic ? 'Publicado' : 'Publicar'}
                </button>
              )}
            </ActionsBox>
          </HeaderRow>
          
          <DescBox>{f.description}</DescBox>

          {f.isPublic && editingPublish !== f.id && (
            <div style={{ background: 'var(--surface-alt)', padding: '10px', borderRadius: '8px', fontSize: '12px' }}>
              <strong>Mostrado al público como:</strong> {f.publicTitle} <br/>
              <span style={{ color: 'var(--text-secondary)' }}>{f.publicDesc}</span>
              <div style={{ color: 'var(--accent)', fontWeight: 600, marginTop: '4px' }}>👍 {f._count.likes} Likes</div>
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

        </Card>
      ))}
    </Container>
  );
}
