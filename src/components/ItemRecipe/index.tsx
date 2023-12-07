import DeleteIcon from '../../assets/icons/trash-solid.svg';
import styled from 'styled-components';

const ItemPresupuesto = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  position: relative;

  .description,
  .unitPrice {
    color: #8b8b8b;
  }

  .data p {
    margin: 5px;
  }

  .prices {
    display: flex;

    p {
      margin-left: 20px;
      text-align: center;
    }

    button {
      background-color: transparent;
      cursor: pointer;
      border: none;
      margin-left: 20px;

      img {
        width: 12px;
        filter: opacity(0.5);
      }
    }
  }

  p {
    font-weight: 300;
  }

  .insuranceCoverage {
    color: #58c36b;
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
    <ItemPresupuesto>
      <div className="data">
        <p>{item.nombre}</p>
        <p className="description">{item.indicaciones}</p>
      </div>
      <div className="prices">
        <button
          onClick={() => {
            Delete(index);
          }}
        >
          <img src={DeleteIcon} alt="" />
        </button>
      </div>
    </ItemPresupuesto>
  );
}
