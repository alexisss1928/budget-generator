import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { getUniquePatients, PatientData as DBPersistentPatientData } from '../../db/clinicDB';

// ─── Styled Components ────────────────────────────────────────────────────────

const FieldRow = styled.div`
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  align-items: center;

  label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    width: 90px;
    flex-shrink: 0;
  }

  input[type='text'],
  input[type='tel'],
  input[type='email'] {
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

  select {
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
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;

    &:focus {
      box-shadow: 0 0 0 2px var(--accent);
    }
  }
`;

const CheckboxRow = styled.div<{ $open?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: ${p => p.$open ? 'none' : '1px solid var(--border)'};
  cursor: pointer;
  user-select: none;

  label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    cursor: pointer;
    flex: 1;
  }
`;

const StyledCheckbox = styled.div<{ $checked: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 2px solid ${p => p.$checked ? 'var(--accent)' : 'var(--border)'};
  background: ${p => p.$checked ? 'var(--accent)' : 'var(--input-bg)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s;

  &::after {
    content: '';
    display: ${p => p.$checked ? 'block' : 'none'};
    width: 5px;
    height: 9px;
    border: 2px solid #fff;
    border-top: none;
    border-left: none;
    transform: rotate(45deg) translateY(-1px);
  }
`;

const GuardianSection = styled.div`
  margin: 2px 0 4px;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px 4px;
  background: var(--surface-alt, rgba(0,0,0,0.03));
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
  margin-bottom: 6px;
  animation: fadeSlideIn 0.2s ease;

  input[type='text'],
  select {
    background: #fff !important;
    color: #222 !important;
  }

  .guardian-title {
    font-size: 10px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
  }

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const AutocompleteWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  min-width: 0;
`;

const DropdownList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  margin: 4px 0 0 0;
  padding: 0;
  list-style: none;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--border);
    border-radius: 3px;
  }
`;

const DropdownItem = styled.li`
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--surface-alt);
  }

  .name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
  }

  .id {
    font-size: 11px;
    color: var(--text-secondary);
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

type PersonalDataType = {
  name: string;
  identification: string;
  phone?: string;
  email?: string;
  isMinor?: boolean;
  guardianName?: string;
  guardianId?: string;
  guardianRelationship?: string;
};

type PacientDataProps = {
  personalData: PersonalDataType;
  handlePersonalData: (...args: any) => void;
  setPersonalData?: React.Dispatch<React.SetStateAction<any>>;
  /** Muestra los campos de teléfono y correo (para Presupuesto) */
  showContactFields?: boolean;
};

const RELATIONSHIP_OPTIONS = [
  'Padre',
  'Madre',
  'Abuelo',
  'Abuela',
  'Padrastro',
  'Madrastra',
  'Tío',
  'Tía',
  'Otro',
];

// ─── Component ────────────────────────────────────────────────────────────────

const PacientData = ({
  personalData,
  handlePersonalData,
  setPersonalData,
  showContactFields = false,
}: PacientDataProps) => {
  const [patients, setPatients] = useState<DBPersistentPatientData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUniquePatients().then(setPatients);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const query = personalData.identification.trim().toLowerCase();
  const filteredPatients = query.length > 0
    ? patients.filter(p => p.identification.toLowerCase().includes(query))
    : [];

  const handlePatientSelect = (patient: DBPersistentPatientData) => {
    if (setPersonalData) {
      setPersonalData((prev: any) => ({
        ...prev,
        name: patient.name,
        identification: patient.identification,
        phone: patient.phone || prev.phone,
        email: patient.email || prev.email,
      }));
    }
    setShowDropdown(false);
  };

  const toggleMinor = () => {
    if (setPersonalData) {
      setPersonalData((prev: any) => ({
        ...prev,
        isMinor: !prev.isMinor,
        guardianName: !prev.isMinor ? prev.guardianName : '',
        guardianId: !prev.isMinor ? prev.guardianId : '',
        guardianRelationship: !prev.isMinor ? prev.guardianRelationship : '',
      }));
    }
  };

  const handleGuardianField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (setPersonalData) {
      setPersonalData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <>
      <FieldRow>
        <label htmlFor="identification">Cédula</label>
        <AutocompleteWrapper ref={dropdownRef}>
          <input
            id="identification"
            type="text"
            name="identification"
            value={personalData.identification}
            onChange={(e) => {
              handlePersonalData(e);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            autoComplete="off"
            placeholder="Número de identificación"
          />
          {showDropdown && filteredPatients.length > 0 && (
            <DropdownList>
              {filteredPatients.map((p, idx) => (
                <DropdownItem key={idx} onClick={() => handlePatientSelect(p)}>
                  <span className="name">{p.name}</span>
                  <span className="id">C.I. {p.identification}</span>
                </DropdownItem>
              ))}
            </DropdownList>
          )}
        </AutocompleteWrapper>
      </FieldRow>

      {/* Menor de edad */}
      <CheckboxRow $open={!!personalData.isMinor} onClick={toggleMinor}>
        <StyledCheckbox $checked={!!personalData.isMinor} />
        <label>Paciente menor de edad</label>
      </CheckboxRow>

      {personalData.isMinor && (
        <GuardianSection>
          <span className="guardian-title">Datos del representante</span>
          <FieldRow>
            <label htmlFor="guardianName">Nombre</label>
            <input
              id="guardianName"
              type="text"
              name="guardianName"
              value={personalData.guardianName ?? ''}
              onChange={handleGuardianField}
              autoComplete="off"
              placeholder="Nombre del representante"
            />
          </FieldRow>

          <FieldRow>
            <label htmlFor="guardianId">Cédula</label>
            <input
              id="guardianId"
              type="text"
              name="guardianId"
              value={personalData.guardianId ?? ''}
              onChange={handleGuardianField}
              autoComplete="off"
              placeholder="Cédula del representante"
            />
          </FieldRow>

          <FieldRow style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <label htmlFor="guardianRelationship">Parentesco</label>
            <select
              id="guardianRelationship"
              name="guardianRelationship"
              value={personalData.guardianRelationship ?? ''}
              onChange={handleGuardianField}
            >
              <option value="">Seleccionar...</option>
              {RELATIONSHIP_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </FieldRow>
        </GuardianSection>
      )}

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
