import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import api from '../../services/api';
import { ChevronLeft, ChevronDown, Search, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 16px 100px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
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

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  color: var(--text);
  align-self: center;
  text-align: center;
  width: 100%;
`;

const StatsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div<{ $color?: string; $bg?: string; $fullWidth?: boolean }>`
  flex: ${props => props.$fullWidth ? '1 1 100%' : '1 1 calc(33.33% - 11px)'};
  min-width: ${props => props.$fullWidth ? '100%' : '80px'};
  background: ${props => props.$bg || 'var(--surface)'};
  padding: 20px;
  border-radius: 20px;
  text-align: center;
  cursor: pointer;
  
  /* Neumorphic shadow */
  box-shadow: 
    6px 6px 12px rgba(0, 0, 0, 0.04), 
    -6px -6px 12px rgba(255, 255, 255, 0.6);
  
  [data-theme='dark'] & {
    box-shadow: 
      6px 6px 12px rgba(0, 0, 0, 0.4), 
      -6px -6px 12px rgba(255, 255, 255, 0.04);
  }
  
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    box-shadow: 
      3px 3px 8px rgba(0, 0, 0, 0.03), 
      -3px -3px 8px rgba(255, 255, 255, 0.5);
    transform: translateY(2px);

    [data-theme='dark'] & {
      box-shadow: 
        3px 3px 8px rgba(0, 0, 0, 0.4), 
        -3px -3px 8px rgba(255, 255, 255, 0.03);
    }
  }

  &:active {
    box-shadow: 
      inset 4px 4px 10px rgba(0, 0, 0, 0.03), 
      inset -4px -4px 10px rgba(255, 255, 255, 0.5);
    transform: translateY(4px);

    [data-theme='dark'] & {
      box-shadow: 
        inset 4px 4px 10px rgba(0, 0, 0, 0.4), 
        inset -4px -4px 10px rgba(255, 255, 255, 0.03);
    }
  }
  
  h3 { margin: 0 0 8px; font-size: 11px; color: ${props => props.$color || 'var(--text-secondary)'}; text-transform: uppercase; letter-spacing: 1px; }
  p { margin: 0; font-size: 26px; font-weight: 700; color: var(--text); }
`;

const TableContainer = styled.div`
  background: var(--surface);
  border-radius: 16px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
  
  @media (max-width: 650px) {
    background: transparent;
    box-shadow: none;
    border-radius: 0;
  }
`;

const DesktopTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  @media (max-width: 650px) {
    display: none;
  }

  th, td {
    padding: 14px 16px;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }

  th {
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.5px;
  }

  tbody tr:hover {
    background: var(--surface-alt);
  }
`;

const MobileView = styled.div`
  display: none;
  @media (max-width: 650px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  .search-input {
    flex: 1;
    min-width: 200px;
    display: flex;
    align-items: center;
    background: var(--surface) !important;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0 12px;
    
    && input {
      border: none;
      background-color: transparent !important;
      padding: 10px 0;
      width: 100%;
      margin-left: 8px;
      color: var(--text) !important;
      &:focus { outline: none; }
    }
    &:focus-within { border-color: var(--accent); }
  }

  select {
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface) !important;
    color: var(--text);
    &:focus { outline: none; border-color: var(--accent); }
  }
`;

const UserMobileCard = styled.details`
  background: var(--surface);
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  padding: 14px;
  
  summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    list-style: none;
    &::-webkit-details-marker { display: none; }
  }

  &[open] summary .arrow {
    transform: rotate(180deg);
  }

  .summary-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .summary-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .badge {
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 6px;
    background: var(--accent-bg);
    color: var(--accent);
    font-weight: 700;
  }

  .arrow {
    transition: transform 0.2s;
    color: var(--text-muted);
  }

  .email {
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 400;
  }

  .details-content {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed var(--border);
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 13px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .label {
    color: var(--text-muted);
    font-size: 11px;
    text-transform: uppercase;
  }
`;

const SelectPlan = styled.select`
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  color: var(--text);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  &:focus { outline: none; border-color: var(--accent); }
`;

const DeleteBtn = styled.button`
  background: transparent;
  border: none;
  color: #e53935;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  &:hover {
    background: rgba(229, 57, 53, 0.1);
  }
`;

const fadeIn = keyframes`from { opacity: 0 } to { opacity: 1 }`;
const popIn = keyframes`
  from { opacity: 0; transform: scale(0.94) translateY(8px) }
  to   { opacity: 1; transform: scale(1)    translateY(0) }
`;

const ConfirmOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  animation: ${fadeIn} 0.18s ease;
  padding: 20px;
  box-sizing: border-box;
`;

const ConfirmBox = styled.div`
  background: var(--surface);
  border-radius: 18px;
  width: 90%;
  max-width: 380px;
  padding: 24px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
  animation: ${popIn} 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
`;

const ConfirmIconWrap = styled.div`
  width: 46px; height: 46px;
  border-radius: 50%;
  background: #ffebee;
  display: flex; align-items: center; justify-content: center;
  color: #e53935;
  margin: 0 auto 14px;
`;

const ConfirmTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  text-align: center;
`;

const ConfirmDesc = styled.p`
  margin: 0 0 20px;
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.5;
  strong { color: var(--text); }
`;

const ConfirmBtns = styled.div`
  display: flex;
  gap: 10px;
`;

const ConfirmCancelBtn = styled.button`
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: transparent;
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
  &:hover { background: var(--surface-alt); }
`;

const ConfirmDeleteBtn = styled.button`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  background: #e53935;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.12s;
  font-family: inherit;
  &:hover  { opacity: 0.9; transform: translateY(-1px); }
  &:active { transform: scale(0.97); }
`;

type UserData = {
  id: string;
  email: string;
  name: string;
  plan: 'FREE' | 'FREE_TRIAL' | 'FULL_ACCESS';
  role: 'USER' | 'ADMIN';
  createdAt: string;
};

type StatsData = {
  total: number;
  free: number;
  freeTrial: number;
  fullAccess: number;
  admins: number;
};

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel = ({ onBack }: AdminPanelProps) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL');
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get('/users?limit=50'),
        api.get('/users/stats')
      ]);
      setUsers(usersRes.data.users);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Error cargando datos del admin');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePlanChange = async (userId: string, newPlan: string) => {
    try {
      await api.patch(`/users/${userId}/plan`, { plan: newPlan });
      toast.success('Plan actualizado correctamente');
      loadData();
    } catch (err) {
      toast.error('No se pudo actualizar el plan');
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setPendingDelete({ id: userId, name: userName });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await api.delete(`/users/${pendingDelete.id}`);
      toast.success('Usuario eliminado correctamente');
      setPendingDelete(null);
      loadData();
    } catch (err) {
      toast.error('No se pudo eliminar el usuario');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'ALL' || u.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  if (loading) return <Container>Cargando panel...</Container>;

  return (
    <>
      {pendingDelete && (
        <ConfirmOverlay onClick={() => setPendingDelete(null)}>
          <ConfirmBox onClick={(e) => e.stopPropagation()}>
            <ConfirmIconWrap>
              <AlertTriangle size={24} strokeWidth={2.5} />
            </ConfirmIconWrap>
            <ConfirmTitle>Eliminar Usuario</ConfirmTitle>
            <ConfirmDesc>
              ¿Estás seguro de que deseas eliminar a <strong>{pendingDelete.name}</strong>?
              <br />
              Esta acción no se puede deshacer.
            </ConfirmDesc>
            <ConfirmBtns>
              <ConfirmCancelBtn onClick={() => setPendingDelete(null)}>Cancelar</ConfirmCancelBtn>
              <ConfirmDeleteBtn onClick={confirmDelete}>Eliminar</ConfirmDeleteBtn>
            </ConfirmBtns>
          </ConfirmBox>
        </ConfirmOverlay>
      )}

      <Container>
        <Header>
          <BackBtn onClick={onBack}>
            <ChevronLeft size={15} /> Volver
          </BackBtn>
          <Title>Panel de Administración</Title>
        </Header>

        {stats && (
          <StatsGrid>
            <StatCard $fullWidth $color="var(--accent)">
              <h3>Usuarios</h3>
              <p>{stats.total}</p>
            </StatCard>
            <StatCard $color="var(--text-secondary)">
              <h3>FREE</h3>
              <p>{stats.free}</p>
            </StatCard>
            <StatCard $color="#f59e0b">
              <h3>Free Trial</h3>
              <p>{stats.freeTrial}</p>
            </StatCard>
            <StatCard $color="var(--accent-2)">
              <h3>PRO</h3>
              <p>{stats.fullAccess}</p>
            </StatCard>
          </StatsGrid>
        )}

        <FilterBar>
          <div className="search-input">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
            <option value="ALL">Todos los planes</option>
            <option value="FREE">Free</option>
            <option value="FREE_TRIAL">Free Trial</option>
            <option value="FULL_ACCESS">Full Access</option>
          </select>
        </FilterBar>

        <TableContainer>
          <DesktopTable>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Registro</th>
                <th>Plan</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <SelectPlan
                      value={user.plan}
                      onChange={(e) => handlePlanChange(user.id, e.target.value)}
                    >
                      <option value="FREE">Free</option>
                      <option value="FREE_TRIAL">Free Trial</option>
                      <option value="FULL_ACCESS">Full Access</option>
                    </SelectPlan>
                  </td>
                  <td>
                    <DeleteBtn onClick={() => handleDeleteUser(user.id, user.name)} title="Eliminar usuario">
                      <Trash2 size={16} />
                    </DeleteBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </DesktopTable>

          <MobileView>
            {filteredUsers.map(user => (
              <UserMobileCard key={user.id}>
                <summary>
                  <div className="summary-info">
                    <span>{user.name}</span>
                    <span className="email">{user.email}</span>
                  </div>
                  <div className="summary-actions">
                    <span className="badge">{user.plan === 'FULL_ACCESS' ? 'PRO' : user.plan === 'FREE_TRIAL' ? 'TRIAL' : 'FREE'}</span>
                    <ChevronDown size={18} className="arrow" />
                  </div>
                </summary>
                <div className="details-content">
                  <div className="detail-row">
                    <span className="label">Rol</span>
                    <span>{user.role}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Registro</span>
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Plan</span>
                    <SelectPlan
                      value={user.plan}
                      onChange={(e) => handlePlanChange(user.id, e.target.value)}
                    >
                      <option value="FREE">Free</option>
                      <option value="FREE_TRIAL">Free Trial</option>
                      <option value="FULL_ACCESS">Full Access</option>
                    </SelectPlan>
                  </div>
                  <div className="detail-row">
                    <span className="label">Acciones</span>
                    <DeleteBtn onClick={() => handleDeleteUser(user.id, user.name)}>
                      <Trash2 size={16} /> <span style={{ marginLeft: '4px', fontSize: '12px' }}>Eliminar</span>
                    </DeleteBtn>
                  </div>
                </div>
              </UserMobileCard>
            ))}
          </MobileView>
        </TableContainer>
      </Container>
    </>
  );
};

export default AdminPanel;
