// import { useRef } from 'react';
// import MoreIcon from '../../assets/ellipsis-vertical-solid.svg';
// import EditIcon from '../../assets/pen-solid.svg';
import DeleteIcon from '../../assets/icons/trash-solid.svg';
// import CloseIcon from '../../assets/xmark-solid.svg';
import styled from 'styled-components';

const ItemPresupuesto = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
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

/* const ItemOptions = styled.div`
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  border-radius: 5px;
  right: 0;
  height: 100%;
  background-color: #fff;

  div {
    display: flex;
  }

  img {
    height: 15px;
    margin: 10px;
  }
`; */

export default function ItemPresupuestoComponent({
  item,
  index,
  Delete,
  insuranceCoverageisActive,
}: any) {
  return (
    <ItemPresupuesto>
      <div className="data">
        <p>
          {item.nombre} x {item.quantity}
        </p>
        <p className="description">{item.observations}</p>
      </div>
      <div className="prices">
        <p className="unitPrice">
          {item.precio}
          {insuranceCoverageisActive ? (
            <>
              <br />
              <span className="insuranceCoverage">
                ({item.insuranceCoverage})
              </span>
            </>
          ) : null}
        </p>
        <p>
          {item.precio * item.quantity}
          {insuranceCoverageisActive ? (
            <>
              <br />
              <span className="insuranceCoverage">
                ({item.insuranceCoverage * item.quantity})
              </span>
            </>
          ) : null}
        </p>
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
