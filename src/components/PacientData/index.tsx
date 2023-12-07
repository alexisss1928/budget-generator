import styled from 'styled-components';

const InputBox = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;

  label {
    color: #000;
    font-weight: 700;
  }

  input,
  select,
  textarea {
    margin-top: 5px;
    border: none;
    padding: 10px;
    border-radius: 5px;
  }

  input[type='submit'] {
    background-color: #7e9c7f;
    color: #fff;
    cursor: pointer;
  }

  input[type='checkbox'] {
    cursor: pointer;
  }
`;

type personalDataType = {
  name: string;
  identification: string;
};

type PacientDataType = {
  personalData: personalDataType;
  handlePersonalData: (...args: any) => void;
};

const PacientData = ({ personalData, handlePersonalData }: PacientDataType) => {
  return (
    <>
      <InputBox>
        <label htmlFor="name">Nombre del paciente</label>
        <input
          type="text"
          name="name"
          value={personalData.name}
          onChange={handlePersonalData}
          autoComplete="off"
          placeholder="Esriba el nombre o razón social del paciente"
        />
      </InputBox>
      <InputBox>
        <label htmlFor="identification">Numero de cedula</label>
        <input
          type="text"
          name="identification"
          value={personalData.identification}
          onChange={handlePersonalData}
          autoComplete="off"
          placeholder="Escriba el número de identificación del paciente"
        />
      </InputBox>
    </>
  );
};

export default PacientData;
