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

  .actions {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-left: 12px;

    button {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      padding: 4px;
      border-radius: 6px;
      transition: all 0.15s;

      &:hover {
        background: #ffebee;
        color: #e53935;
      }
    }
  }
`;

type CurrentTreatmentListItem = {
  nombre: string;
  indicaciones: string;
};

type ItemPresupuestoType = {
  item: CurrentTreatmentListItem;
  index: number;
  Delete: (index: number) => void;
};

export default function ItemRecipeComponent({
  item,
  index,
  Delete,
}: ItemPresupuestoType) {
  return (
    <ListItem>
      <div className="data">
        <p className="title">{item.nombre}</p>
        {item.indicaciones && <p className="description">{item.indicaciones}</p>}
      </div>
      
      <div className="actions">
        <button onClick={() => Delete(index)} title="Eliminar">
          <Trash2 size={16} />
        </button>
      </div>
    </ListItem>
  );
}
