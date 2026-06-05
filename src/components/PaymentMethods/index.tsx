import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Trash2, PlusCircle, Info, CreditCard } from 'lucide-react';
import { 
  getAllPaymentMethods, 
  savePaymentMethod, 
  deletePaymentMethod,
  PaymentMethodRecord,
  PaymentMethodType
} from '../../db/clinicDB';

// ─── Styled Components ─────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  height: 100%;
  overflow-y: auto;
  background: var(--bg);
  padding: 0 0 100px;
`;

const InfoBanner = styled.div`
  background: var(--accent-bg);
  border-left: 3px solid var(--accent);
  padding: 14px 18px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 0;

  svg {
    flex-shrink: 0;
    margin-top: 1px;
    color: var(--accent);
  }

  p {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;

    strong {
      color: var(--text);
      font-weight: 600;
    }
  }
`;

const FormCard = styled.div`
  background: var(--surface);
  border-radius: 16px;
  margin: 16px 0 0;
  overflow: hidden;
  box-shadow: var(--shadow-card);
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 18px 14px;
  border-bottom: 1px solid var(--border);

  svg {
    color: var(--accent);
    flex-shrink: 0;
  }

  span {
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }
`;

const ListContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--border);
    border-radius: 3px;
  }
`;

const EmptyState = styled.div`
  padding: 30px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
`;

const ListItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--surface-alt);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 12px;

      button.delete {
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
  }

  .details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    font-size: 12px;
    color: var(--text-secondary);
    
    div {
      background: var(--bg);
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid var(--border);
      
      span {
        font-weight: 600;
        color: var(--text);
        margin-right: 4px;
      }
    }
  }
`;

const SecondaryBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: var(--surface-alt);
    border-color: var(--text-muted);
  }
`;

const PrimaryBtn = styled(SecondaryBtn)<{ $disabled?: boolean }>`
  background: ${(p) => p.$disabled ? 'var(--border)' : 'var(--accent)'};
  color: ${(p) => p.$disabled ? 'var(--text-muted)' : '#fff'};
  border: none;
  pointer-events: ${(p) => p.$disabled ? 'none' : 'auto'};

  &:hover {
    background: var(--accent);
    opacity: 0.9;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  padding: 20px;
`;

const ModalContent = styled.div`
  background: var(--surface);
  padding: 24px;
  border-radius: 18px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
  max-height: 90vh;
  overflow-y: auto;

  h3 {
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin: 0 0 18px 0;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;

    label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    input, select, textarea {
      background: var(--input-bg);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 13px;
      outline: none;
      box-sizing: border-box;
      width: 100%;
      transition: all 0.15s;
      font-family: inherit;
      &:focus { 
        border-color: var(--accent);
        box-shadow: 0 0 0 2px var(--accent-bg); 
      }
    }
    
    textarea {
      resize: vertical;
      min-height: 80px;
    }
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 24px;
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

const paymentTypes: PaymentMethodType[] = [
  'Pago Móvil',
  'Zelle',
  'Transferencia Bancaria',
  'Transferencia Internacional',
  'PayPal',
  'Otro'
];

export default function PaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethodRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal state
  const [selectedType, setSelectedType] = useState<PaymentMethodType>('Pago Móvil');
  const [formData, setFormData] = useState<Record<string, string>>({});

  const loadMethods = async () => {
    const data = await getAllPaymentMethods();
    setMethods(data);
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const openModal = () => {
    setSelectedType('Pago Móvil');
    setFormData({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value as PaymentMethodType);
    setFormData({}); // Reset fields when type changes
  };

  const saveMethod = async () => {
    // Basic validation based on type
    if (selectedType === 'Otro' && !formData.customName) {
      toast.error('Debe ingresar un nombre para el método');
      return;
    }
    
    const newMethod: PaymentMethodRecord = {
      type: selectedType,
      customName: selectedType === 'Otro' ? formData.customName : undefined,
      details: JSON.stringify(formData),
      isActive: true
    };

    await savePaymentMethod(newMethod);
    closeModal();
    loadMethods();
    toast.success('Método de pago agregado');
  };

  const deleteMethod = async (id: number) => {
    if (window.confirm('¿Seguro que deseas eliminar este método de pago?')) {
      await deletePaymentMethod(id);
      loadMethods();
      toast.info('Método eliminado');
    }
  };

  const parseDetails = (jsonStr: string) => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return {};
    }
  };

  return (
    <Wrapper>
      <InfoBanner>
        <Info size={16} />
        <p>
          Configura los <strong>métodos de pago</strong> que aceptas. Podrás copiar esta información fácilmente para enviarla a tus pacientes o visualizarla como referencia rápida.
        </p>
      </InfoBanner>

      <FormCard>
        <CardTitle>
          <CreditCard size={15} />
          <span>Métodos Registrados</span>
          <PrimaryBtn onClick={openModal} style={{ marginLeft: 'auto', padding: '9px 12px', fontSize: '12px', borderRadius: '8px' }}>
            <PlusCircle size={14} /> Agregar
          </PrimaryBtn>
        </CardTitle>
        <ListContainer>
          {methods.length === 0 ? (
            <EmptyState>No hay métodos de pago configurados.</EmptyState>
          ) : (
            methods.map((method) => {
              const details = parseDetails(method.details);
              return (
                <ListItem key={method.id}>
                  <div className="header">
                    <div className="title">
                      {method.type === 'Otro' ? method.customName : method.type}
                    </div>
                    <div className="actions">
                      <button className="delete" onClick={() => deleteMethod(method.id!)} title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="details">
                    {Object.entries(details).map(([key, value]) => {
                      if (key === 'customName' || !value) return null;
                      // Format key (e.g. "numeroCuenta" -> "Numero Cuenta")
                      const formattedKey = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase());
                      
                      return (
                        <div key={key}>
                          <span>{formattedKey}:</span> {value as string}
                        </div>
                      );
                    })}
                  </div>
                </ListItem>
              );
            })
          )}
        </ListContainer>
      </FormCard>

      <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar theme="colored" />

      {/* Modal Agregar Método */}
      {isModalOpen && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>Agregar Método de Pago</h3>
            
            <div className="field">
              <label>Tipo de Método</label>
              <select value={selectedType} onChange={handleTypeChange}>
                {paymentTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Dynamic Fields based on Type */}
            {selectedType === 'Pago Móvil' && (
              <>
                <div className="field">
                  <label>Banco</label>
                  <input type="text" name="banco" value={formData.banco || ''} onChange={handleInputChange} placeholder="Ej. Banesco (0134)" />
                </div>
                <div className="field">
                  <label>Teléfono</label>
                  <input type="text" name="telefono" value={formData.telefono || ''} onChange={handleInputChange} placeholder="Ej. 0414-1234567" />
                </div>
                <div className="field">
                  <label>Cédula / RIF</label>
                  <input type="text" name="identificacion" value={formData.identificacion || ''} onChange={handleInputChange} placeholder="Ej. V-12345678" />
                </div>
              </>
            )}

            {selectedType === 'Zelle' && (
              <>
                <div className="field">
                  <label>Correo Electrónico o Teléfono</label>
                  <input type="text" name="correo" value={formData.correo || ''} onChange={handleInputChange} placeholder="Ej. dr.ejemplo@gmail.com" />
                </div>
                <div className="field">
                  <label>Nombre del Titular (Opcional)</label>
                  <input type="text" name="titular" value={formData.titular || ''} onChange={handleInputChange} placeholder="Ej. Jose Perez" />
                </div>
              </>
            )}

            {selectedType === 'Transferencia Bancaria' && (
              <>
                <div className="field">
                  <label>Banco</label>
                  <input type="text" name="banco" value={formData.banco || ''} onChange={handleInputChange} />
                </div>
                <div className="field">
                  <label>Número de Cuenta</label>
                  <input type="text" name="numeroCuenta" value={formData.numeroCuenta || ''} onChange={handleInputChange} />
                </div>
                <div className="field">
                  <label>Titular de la Cuenta</label>
                  <input type="text" name="titular" value={formData.titular || ''} onChange={handleInputChange} />
                </div>
                <div className="field">
                  <label>Cédula / RIF</label>
                  <input type="text" name="identificacion" value={formData.identificacion || ''} onChange={handleInputChange} />
                </div>
              </>
            )}

            {selectedType === 'Transferencia Internacional' && (
              <>
                <div className="field">
                  <label>Banco / Entidad</label>
                  <input type="text" name="banco" value={formData.banco || ''} onChange={handleInputChange} />
                </div>
                <div className="field">
                  <label>Número de Cuenta / IBAN</label>
                  <input type="text" name="cuenta" value={formData.cuenta || ''} onChange={handleInputChange} />
                </div>
                <div className="field">
                  <label>SWIFT / Routing Number</label>
                  <input type="text" name="swift" value={formData.swift || ''} onChange={handleInputChange} />
                </div>
                <div className="field">
                  <label>Nombre del Beneficiario</label>
                  <input type="text" name="beneficiario" value={formData.beneficiario || ''} onChange={handleInputChange} />
                </div>
                <div className="field">
                  <label>Dirección del Banco (Opcional)</label>
                  <input type="text" name="direccionBanco" value={formData.direccionBanco || ''} onChange={handleInputChange} />
                </div>
              </>
            )}

            {selectedType === 'PayPal' && (
              <>
                <div className="field">
                  <label>Correo Electrónico o Enlace (PayPal.me)</label>
                  <input type="text" name="paypal" value={formData.paypal || ''} onChange={handleInputChange} placeholder="Ej. paypal.me/usuario" />
                </div>
              </>
            )}

            {selectedType === 'Otro' && (
              <>
                <div className="field">
                  <label>Nombre del Método</label>
                  <input type="text" name="customName" value={formData.customName || ''} onChange={handleInputChange} placeholder="Ej. Binance Pay, Zinli..." />
                </div>
                <div className="field">
                  <label>Datos (Libre)</label>
                  <textarea name="datos" value={formData.datos || ''} onChange={handleInputChange} placeholder="Coloca aquí los datos necesarios para realizar el pago..." />
                </div>
              </>
            )}

            <div className="buttons">
              <SecondaryBtn onClick={closeModal}>Cancelar</SecondaryBtn>
              <PrimaryBtn onClick={saveMethod}>Guardar</PrimaryBtn>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </Wrapper>
  );
}
