import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import api from '../../services/api';
import { ChevronLeft, ChevronDown, Search } from 'lucide-react';
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
  flex: ${props => props.$fullWidth ? '1 1 100%' : '1 1 calc(50% - 8px)'};
  min-width: ${props => props.$fullWidth ? '100%' : '130px'};
  background: ${props => props.$bg || 'var(--surface)'};
  padding: 20px;
  border-radius: 16px;
  box-shadow: var(--shadow-card);
  text-align: center;
  border-bottom: 3px solid ${props => props.$color || 'transparent'};
  
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

type UserData = {
  id: string;
  email: string;
  name: string;
  plan: 'FREE' | 'FULL_ACCESS';
  role: 'USER' | 'ADMIN';
  createdAt: string;
};

type StatsData = {
  total: number;
  free: number;
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

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'ALL' || u.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  if (loading) return <Container>Cargando panel...</Container>;

  return (
    <Container>
      <Header>
        <BackBtn onClick={onBack}>
          <ChevronLeft size={15} /> Volver
        </BackBtn>
        <Title>Panel de Administración</Title>
      </Header>

      {stats && (
        <StatsGrid>
          <StatCard $fullWidth $color="var(--accent)" $bg="var(--accent-bg)">
            <h3>Usuarios</h3>
            <p>{stats.total}</p>
          </StatCard>
          <StatCard $color="var(--text-secondary)">
            <h3>Plan Free</h3>
            <p>{stats.free}</p>
          </StatCard>
          <StatCard $color="var(--accent-2)">
            <h3>Full Access</h3>
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
                    <option value="FULL_ACCESS">Full Access</option>
                  </SelectPlan>
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
                  <span className="badge">{user.plan === 'FULL_ACCESS' ? 'PRO' : 'FREE'}</span>
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
                    <option value="FULL_ACCESS">Full Access</option>
                  </SelectPlan>
                </div>
              </div>
            </UserMobileCard>
          ))}
        </MobileView>
      </TableContainer>
    </Container>
  );
};

export default AdminPanel;
