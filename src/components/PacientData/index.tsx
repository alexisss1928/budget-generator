import styled from 'styled-components';

// ─── Styled Components ────────────────────────────────────────────────────────

const FieldRow = styled.div`
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  align-items: center;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    width: 90px;
    flex-shrink: 0;
  }

  input {
    flex: 1;
    min-width: 0;
    box-sizing: border-box;
    background: var(--input-bg) !important;
    color: var(--text) !important;
    border: none;
    border-radius: 8px;
    padding: 9px 12px;
    font-size: 13px;
    outline: none;
    transition: box-shadow 0.15s;
    font-family: inherit;

    &:focus {
      box-shadow: 0 0 0 2px var(--accent);
    }

    &::placeholder {
      color: var(--text-muted);
    }
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

type PersonalDataType = {
  name: string;
  identification: string;
  phone?: string;
  email?: string;
};

type PacientDataProps = {
  personalData: PersonalDataType;
  handlePersonalData: (...args: any) => void;
  /** Muestra los campos de teléfono y correo (para Presupuesto) */
  showContactFields?: boolean;
};

// ─── Component ────────────────────────────────────────────────────────────────

const PacientData = ({
  personalData,
  handlePersonalData,
  showContactFields = false,
}: PacientDataProps) => {
  return (
    <>
      <FieldRow>
        <label htmlFor="name">Nombre</label>
        <input
          id="name"
          type="text"
          name="name"
          value={personalData.name}
          onChange={handlePersonalData}
          autoComplete="off"
          placeholder="Nombre o razón social del paciente"
        />
      </FieldRow>

      <FieldRow>
        <label htmlFor="identification">Cédula</label>
        <input
          id="identification"
          type="text"
          name="identification"
          value={personalData.identification}
          onChange={handlePersonalData}
          autoComplete="off"
          placeholder="Número de identificación"
        />
      </FieldRow>

      {showContactFields && (
        <>
          <FieldRow>
            <label htmlFor="phone">Teléfono</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={personalData.phone ?? ''}
              onChange={handlePersonalData}
              autoComplete="off"
              placeholder="Ej: 04141234567"
            />
          </FieldRow>

          <FieldRow>
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              name="email"
              value={personalData.email ?? ''}
              onChange={handlePersonalData}
              autoComplete="off"
              placeholder="correo@ejemplo.com"
            />
          </FieldRow>
        </>
      )}
    </>
  );
};

export default PacientData;
