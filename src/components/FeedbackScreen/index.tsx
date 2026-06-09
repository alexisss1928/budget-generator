import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ThumbsUp, AlertCircle, Lightbulb, Plus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Wrapper = styled.div`
  height: 100%;
  overflow-y: auto;
  background: var(--bg);
  padding: 0 0 100px;
`;



const ContentContainer = styled.div`
  padding: 20px;
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

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }

  .status {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 6px;
    background: var(--input-bg);
    color: var(--text-secondary);
  }
  
  .status.resolved {
    background: #ecfdf5;
    color: #10b981;
  }
`;

const Description = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
`;

const LikeButton = styled.button<{ $liked: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${(p) => p.$liked ? 'var(--accent-bg)' : 'var(--input-bg)'};
  color: ${(p) => p.$liked ? 'var(--accent)' : 'var(--text-secondary)'};
  border: 1px solid ${(p) => p.$liked ? 'var(--accent)' : 'transparent'};
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
  transition: all 0.2s;

  &:hover {
    background: ${(p) => p.$liked ? 'var(--accent-bg)' : 'var(--surface-alt)'};
  }
`;

const FAB = styled.button`
  position: fixed;
  bottom: 24px;
  right: 20px;
  width: 58px;
  height: 58px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4); /* fallback if var missing rgb */
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 28px rgba(16, 185, 129, 0.5);
  }
  
  &:active {
    transform: scale(0.96);
  }
`;

// -- Modal Styles --
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const ModalContent = styled.div`
  background: var(--surface);
  padding: 24px;
  border-radius: 18px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);

  h3 {
    margin: 0 0 20px;
    font-size: 16px;
    color: var(--text);
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;

  label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  input, textarea, select {
    background: var(--input-bg);
    color: var(--text);
    border: none;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 13px;
    outline: none;
    font-family: inherit;
    resize: none;
    &:focus { box-shadow: 0 0 0 2px var(--accent); }
  }
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;

  button {
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
  }

  .cancel {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--border);
  }

  .submit {
    background: var(--accent);
    color: white;
  }
`;

type Feedback = {
  id: string;
  type: 'ERROR' | 'SUGGESTION';
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  likeCount?: number;
  hasLiked?: boolean;
  publicTitle?: string;
  publicDesc?: string;
};

export default function FeedbackScreen() {
  const { user } = useAuth();
  const [publicSuggestions, setPublicSuggestions] = useState<Feedback[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFeedback, setNewFeedback] = useState({ type: 'SUGGESTION', title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPublicSuggestions = async () => {
    try {
      const res = await api.get('/feedback/public');
      setPublicSuggestions(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPublicSuggestions();
  }, []);

  const handleLike = async (id: string) => {
    try {
      // Optimistic update
      setPublicSuggestions(prev => prev.map(f => {
        if (f.id === id) {
          const isLiking = !f.hasLiked;
          return { ...f, hasLiked: isLiking, likeCount: (f.likeCount || 0) + (isLiking ? 1 : -1) };
        }
        return f;
      }));

      await api.post(`/feedback/${id}/like`);
    } catch (e) {
      console.error(e);
      fetchPublicSuggestions(); // Revert on failure
    }
  };

  const handleSubmit = async () => {
    if (!newFeedback.title.trim() || !newFeedback.description.trim()) {
      toast.error('Por favor completa todos los campos.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/feedback', newFeedback);
      toast.success('Reporte enviado correctamente.');
      setIsModalOpen(false);
      setNewFeedback({ type: 'SUGGESTION', title: '', description: '' });
    } catch (e) {
      console.error(e);
      toast.error('Hubo un error al enviar el reporte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusText = (status: string) => {
    if (status === 'RESOLVED') return 'Resuelto';
    if (status === 'IN_PROGRESS') return 'En Progreso';
    return 'En Revisión';
  };

  return (
    <Wrapper>
      <ContentContainer>
        {publicSuggestions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            No hay mejoras publicadas para votar aún.
          </div>
        ) : (
          publicSuggestions.map(f => (
            <Card key={f.id}>
              <CardHeader>
                <h4>{f.publicTitle || f.title}</h4>
                {f.status === 'RESOLVED' && <span className="status resolved"><CheckCircle2 size={12} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />Resuelto</span>}
                {f.status === 'IN_PROGRESS' && <span className="status">En Progreso</span>}
              </CardHeader>
              <Description>{f.publicDesc || f.description}</Description>
              <LikeButton $liked={!!f.hasLiked} onClick={() => handleLike(f.id)}>
                <ThumbsUp size={14} /> {f.likeCount || 0}
              </LikeButton>
            </Card>
          ))
        )}
      </ContentContainer>

      <FAB onClick={() => setIsModalOpen(true)} title="Nuevo Reporte" aria-label="Nuevo Reporte">
        <Plus size={24} />
      </FAB>

      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h3>Enviar Reporte o Sugerencia</h3>
            
            <Field>
              <label>Tipo</label>
              <select 
                value={newFeedback.type} 
                onChange={e => setNewFeedback({ ...newFeedback, type: e.target.value as any })}
              >
                <option value="SUGGESTION">Sugerir Mejora</option>
                <option value="ERROR">Reportar Error</option>
              </select>
            </Field>

            <Field>
              <label>Título breve</label>
              <input 
                type="text" 
                placeholder="Ej. Problema al descargar PDF"
                value={newFeedback.title}
                onChange={e => setNewFeedback({ ...newFeedback, title: e.target.value })}
              />
            </Field>

            <Field>
              <label>Descripción detallada</label>
              <textarea 
                rows={4}
                placeholder="Describe el problema o la mejora que propones..."
                value={newFeedback.description}
                onChange={e => setNewFeedback({ ...newFeedback, description: e.target.value })}
              />
            </Field>

            <ModalButtons>
              <button className="cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="submit" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </button>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}

      <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar theme="colored" />
    </Wrapper>
  );
}
