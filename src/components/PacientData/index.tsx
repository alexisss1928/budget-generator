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
};

type PacientDataProps = {
  personalData: PersonalDataType;
  handlePersonalData: (...args: any) => void;
  setPersonalData?: React.Dispatch<React.SetStateAction<any>>;
  /** Muestra los campos de teléfono y correo (para Presupuesto) */
  showContactFields?: boolean;
};

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
