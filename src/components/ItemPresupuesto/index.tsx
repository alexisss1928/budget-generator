import styled from 'styled-components';
import { Trash2 } from 'lucide-react';

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

  .data {
    flex: 1;
    
    .title {
      font-size: 13px;
      color: var(--text);
      font-weight: 600;
      margin: 0 0 4px 0;
    }
    
    .description {
      font-size: 11px;
      color: var(--text-secondary);
      line-height: 1.3;
      margin: 0;
    }
  }

  .prices {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-left: 12px;

    .price-col {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
      
      span {
        font-size: 11px;
        color: var(--text-muted);
      }
      strong {
        font-size: 13px;
        color: var(--text);
      }
      .insurance {
        font-size: 10px;
        color: #58c36b;
        font-weight: 600;
      }
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
      margin-left: 4px;

      &:hover {
        background: #ffebee;
        color: #e53935;
      }
    }
  }
`;

type CurrentTreatmentListItem = {
  nombre: string;
  precio: string;
  insuranceCoverage: string;
  quantity: string;
  observations: string;
};

type ItemPresupuestoType = {
  item: CurrentTreatmentListItem;
  index: number;
  Delete: (index: number) => void;
  insuranceCoverageisActive: boolean;
};

export default function ItemPresupuestoComponent({
  item,
  index,
  Delete,
  insuranceCoverageisActive,
}: ItemPresupuestoType) {
  return (
    <ListItem>
      <div className="data">
        <p className="title">
          {item.nombre} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>× {item.quantity}</span>
        </p>
        {item.observations && <p className="description">{item.observations}</p>}
      </div>
      
      <div className="prices">
        <div className="price-col">
          <span>Unidad</span>
          <strong>${item.precio}</strong>
          {insuranceCoverageisActive && (
            <span className="insurance">(${item.insuranceCoverage})</span>
          )}
        </div>
        
        <div className="price-col" style={{ width: 60 }}>
          <span>Subtotal</span>
          <strong style={{ color: 'var(--accent)' }}>${+item.precio * +item.quantity}</strong>
          {insuranceCoverageisActive && (
            <span className="insurance">(${+item.insuranceCoverage * +item.quantity})</span>
          )}
        </div>

        <button onClick={() => Delete(index)} title="Eliminar">
          <Trash2 size={16} />
        </button>
      </div>
    </ListItem>
  );
}
