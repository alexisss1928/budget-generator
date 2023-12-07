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

type ReportType = {
  report: string;
  setReport: (arg0: string) => void;
  handleReportData: (...args: any[]) => void;
};

const Report = ({ report, setReport, handleReportData }: ReportType) => {
  return (
    <>
      <InputBox>
        <label htmlFor="identification">Redacte el informe</label>
        <textarea
          name="informe"
          value={report}
          onChange={handleReportData}
          rows={20}
          cols={50}
          autoComplete="off"
        />
      </InputBox>
      <a
        href="/"
        style={{
          color: '#8e8e8e',
          position: 'relative',
          top: '10px',
          right: '0',
          fontSize: '12px',
        }}
        onClick={(e) => {
          e.preventDefault();
          setReport('');
        }}
      >
        Borrar informe
      </a>
    </>
  );
};

export default Report;
