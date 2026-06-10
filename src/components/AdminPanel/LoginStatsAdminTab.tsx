import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import api from '../../services/api';

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeIn 0.3s ease;
`;

const ChartCard = styled.div`
  background: var(--surface);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border);
`;

const ChartTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  margin-top: 0;
  margin-bottom: 20px;
`;

const TableCard = styled.div`
  background: var(--surface);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border);
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th,
  td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }

  th {
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.5px;
  }

  td {
    color: var(--text);
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const UserCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  img {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
  }

  .info {
    display: flex;
    flex-direction: column;
  }

  .name {
    font-weight: 600;
  }

  .email {
    font-size: 11px;
    color: var(--text-secondary);
  }
`;

type StatsResponse = {
  chartData: { name: string; visitas: number }[];
  recentLogs: {
    id: string;
    userId: string;
    timestamp: string;
    user: {
      name: string;
      email: string;
      picture: string | null;
    };
  }[];
};

export default function LoginStatsAdminTab() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<StatsResponse>('/users/login-stats?days=7')
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando estadísticas...</p>;
  if (!data) return <p>Error al cargar las estadísticas.</p>;

  return (
    <TabContainer>
      <ChartCard>
        <ChartTitle>Visitas de usuarios (Últimos 7 días)</ChartTitle>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--accent)', fontWeight: 600 }}
              />
              <Bar dataKey="visitas" name="Visitas" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <TableCard>
        <ChartTitle>Últimos accesos (Top 50)</ChartTitle>
        <StyledTable>
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {data.recentLogs.map((log) => (
              <tr key={log.id}>
                <td>
                  {new Date(log.timestamp).toLocaleDateString('es-VE')} -{' '}
                  {new Date(log.timestamp).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td>
                  <UserCell>
                    <img
                      src={log.user.picture || 'https://ui-avatars.com/api/?name=' + log.user.name}
                      alt={log.user.name}
                    />
                    <div className="info">
                      <span className="name">{log.user.name}</span>
                      <span className="email">{log.user.email}</span>
                    </div>
                  </UserCell>
                </td>
              </tr>
            ))}
            {data.recentLogs.length === 0 && (
              <tr>
                <td colSpan={2} style={{ textAlign: 'center', padding: '20px' }}>
                  No hay registros recientes
                </td>
              </tr>
            )}
          </tbody>
        </StyledTable>
      </TableCard>
    </TabContainer>
  );
}
