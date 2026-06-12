import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ShoppingCart, PlusCircle, Trash2, Edit2, Share2, CheckSquare, Square, Info, ChevronDown } from 'lucide-react';
import {
  getAllShoppingItems,
  saveShoppingItem,
  deleteShoppingItem,
  ShoppingItemRecord,
} from '../../db/clinicDB';

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
  justify-content: space-between;
  padding: 16px 18px 14px;
  border-bottom: 1px solid var(--border);

  .left {
    display: flex;
    align-items: center;
    gap: 10px;
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
  }

  .right {
    display: flex;
    align-items: center;
    gap: 12px;

    button {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 6px;
      transition: all 0.15s;

      &:hover {
        background: var(--surface-alt);
        color: var(--text);
      }
    }
  }
`;



const EmptyState = styled.div`
  padding: 30px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
`;

const ListItemCard = styled.div<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid ${p => p.$selected ? 'var(--accent)' : 'var(--border)'};
  border-radius: 12px;
  padding: 16px;
  gap: 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: ${p => p.$selected ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'};

  .top-row {
    display: flex;
    gap: 16px;
  }

  .checkbox {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: ${p => p.$selected ? 'var(--accent)' : 'var(--text-muted)'};
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      h4 {
        margin: 0;
        font-size: 15px;
        color: var(--text);
      }
      .qty-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .qty {
          font-size: 12px;
          font-weight: 700;
          color: var(--accent);
          background: var(--accent-bg);
          padding: 4px 8px;
          border-radius: 6px;
        }

        .chevron {
          display: flex;
          color: var(--text-muted);
          transition: transform 0.2s;
        }
      }
    }

    p {
      margin: 8px 0 0;
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.4;
    }
  }

  .actions {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      font-family: inherit;

      &:hover {
        background: var(--border);
      }

      &.danger {
        color: #e53935;
        &:hover {
          background: #ffebee;
          border-color: #ef9a9a;
        }
      }
    }
  }
`;

const FloatingAddBtn = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: var(--accent);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: transform 0.15s;

  &:active {
    transform: scale(0.95);
  }
`;

const FloatingShareBtn = styled.button`
  position: fixed;
  bottom: 96px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: #16a085;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: transform 0.15s, opacity 0.15s;

  &:active {
    transform: scale(0.95);
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: var(--surface);
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);

  h3 {
    margin: 0 0 20px;
    font-size: 18px;
    color: var(--text);
  }

  .input-group {
    margin-bottom: 16px;
    label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }
    input, textarea {
      width: 100%;
      box-sizing: border-box;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--input-bg);
      color: var(--text);
      font-family: inherit;
      font-size: 14px;
      outline: none;
      &:focus { border-color: var(--accent); }
    }
    textarea {
      resize: vertical;
      min-height: 80px;
    }
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    
    button {
      flex: 1;
      padding: 12px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      border: none;

      &.cancel {
        background: transparent;
        color: var(--text-secondary);
        border: 1px solid var(--border);
      }
      &.save {
        background: var(--accent);
        color: white;
      }
    }
  }
`;

const ConfirmOverlay = styled(ModalOverlay)``;
const ConfirmBox = styled(ModalContent)`
  text-align: center;
  max-width: 320px;
  padding: 30px 24px;
  
  h3 {
    margin-bottom: 12px;
  }
  p {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0 0 24px;
    line-height: 1.5;
  }
  
  .actions {
    display: flex;
    gap: 12px;
    
    button {
      flex: 1;
      padding: 10px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      border: none;

      &.cancel {
        background: transparent;
        color: var(--text-secondary);
        border: 1px solid var(--border);
      }
      &.delete {
        background: #ef4444;
        color: white;
      }
    }
  }
`;

export default function ShoppingListScreen() {
  const [items, setItems] = useState<ShoppingItemRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [openItemId, setOpenItemId] = useState<number | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItemRecord | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ShoppingItemRecord | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    cantidad: '',
    notaAdicional: ''
  });

  const loadItems = async () => {
    const data = await getAllShoppingItems();
    setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSelectAll = () => {
    const newSet = new Set<number>();
    items.forEach(i => i.id && newSet.add(i.id));
    setSelectedIds(newSet);
  };

  const handleDeselectAll = () => {
    setSelectedIds(newSet => new Set());
  };

  const isAllSelected = items.length > 0 && selectedIds.size === items.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      handleDeselectAll();
    } else {
      handleSelectAll();
    }
  };

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) return alert("El nombre es requerido");
    if (!formData.cantidad.trim()) return alert("La cantidad es requerida");

    const record: ShoppingItemRecord = {
      ...(editingItem?.id ? { id: editingItem.id } : {}),
      nombre: formData.nombre.trim(),
      cantidad: formData.cantidad.trim(),
      notaAdicional: formData.notaAdicional.trim()
    };

    await saveShoppingItem(record);
    setIsModalOpen(false);
    loadItems();
  };

  const handleEdit = (item: ShoppingItemRecord) => {
    setEditingItem(item);
    setFormData({
      nombre: item.nombre,
      cantidad: item.cantidad,
      notaAdicional: item.notaAdicional
    });
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete && itemToDelete.id) {
      const id = itemToDelete.id;
      await deleteShoppingItem(id);
      loadItems();
      
      if (selectedIds.has(id)) {
        const newSet = new Set(selectedIds);
        newSet.delete(id);
        setSelectedIds(newSet);
      }
    }
    setItemToDelete(null);
  };

  const handleDeleteClick = (item: ShoppingItemRecord) => {
    setItemToDelete(item);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ nombre: '', cantidad: '', notaAdicional: '' });
    setIsModalOpen(true);
  };

  const handleShare = async () => {
    if (selectedIds.size === 0) {
      return alert("Selecciona al menos un ítem para compartir");
    }

    const selectedItems = items.filter(i => i.id && selectedIds.has(i.id));
    let text = "🛒 *Lista de Compras:*\n\n";
    selectedItems.forEach(item => {
      text += `- ${item.cantidad} x ${item.nombre}`;
      if (item.notaAdicional) {
        text += ` (Nota: ${item.notaAdicional})`;
      }
      text += "\n";
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lista de Compras',
          text: text,
        });
      } catch (err) {
        console.error("Error al compartir", err);
      }
    } else {
      alert("Tu navegador no soporta la función de compartir nativa. Puedes copiar el texto manualmente.");
      // Fallback
      console.log(text);
    }
  };

  return (
    <Wrapper>
      <InfoBanner>
        <Info size={16} strokeWidth={2.5} />
        <p>
          <strong>Haz tus pedidos:</strong> Selecciona los productos que necesites y pulsa el botón de compartir para enviar la lista directamente a tu proveedor de confianza.
        </p>
      </InfoBanner>

      <FormCard>
        <CardTitle>
          <div className="left">
            <ShoppingCart size={18} />
            <span>Lista de Compras</span>
          </div>
          {items.length > 0 && (
            <div className="right">
              <button onClick={toggleSelectAll} title={isAllSelected ? "Deseleccionar Todo" : "Seleccionar Todo"}>
                {isAllSelected ? <CheckSquare size={18} /> : <Square size={18} />}
              </button>
            </div>
          )}
        </CardTitle>

        {items.length === 0 ? (
          <EmptyState>No hay ítems en tu lista de compras.</EmptyState>
        ) : (
          <ListContainer>
            {items.map((item) => {
              if (!item.id) return null;
              const isSelected = selectedIds.has(item.id);

              return (
                <ListItemCard key={item.id} $selected={isSelected} onClick={() => setOpenItemId(prev => prev === item.id ? null : item.id)}>
                  <div className="top-row">
                    <div className="checkbox" onClick={(e) => { e.stopPropagation(); toggleSelect(item.id!); }}>
                      {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
                    </div>
                    <div className="content">
                      <div className="header">
                        <h4>{item.nombre}</h4>
                        <div className="qty-wrap">
                          <span className="qty">{item.cantidad}</span>
                          <div className="chevron" style={{ transform: openItemId === item.id ? 'rotate(180deg)' : 'none' }}>
                            <ChevronDown size={18} />
                          </div>
                        </div>
                      </div>
                      {openItemId === item.id && item.notaAdicional && <p>{item.notaAdicional}</p>}
                    </div>
                  </div>
                  {openItemId === item.id && (
                    <div className="actions" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleEdit(item)}>
                        <Edit2 size={18} />
                      </button>
                      <button className="danger" onClick={() => handleDeleteClick(item)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </ListItemCard>
              );
            })}
          </ListContainer>
        )}
      </FormCard>

      <FloatingAddBtn onClick={openAddModal}>
        <PlusCircle size={28} />
      </FloatingAddBtn>

      {selectedIds.size > 0 && (
        <FloatingShareBtn onClick={handleShare} title="Compartir seleccionados">
          <Share2 size={24} />
        </FloatingShareBtn>
      )}

      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h3>{editingItem ? 'Editar Producto' : 'Agregar Producto'}</h3>
            
            <div className="input-group">
              <label>Nombre del Producto</label>
              <input 
                type="text" 
                value={formData.nombre} 
                onChange={e => setFormData({...formData, nombre: e.target.value})}
                placeholder="Ej. Guantes de Látex"
                autoFocus
              />
            </div>
            
            <div className="input-group">
              <label>Cantidad</label>
              <input 
                type="number" 
                value={formData.cantidad} 
                onChange={e => setFormData({...formData, cantidad: e.target.value})}
                placeholder="Ej. 5"
              />
            </div>
            
            <div className="input-group">
              <label>Nota Adicional (Opcional)</label>
              <textarea 
                value={formData.notaAdicional} 
                onChange={e => setFormData({...formData, notaAdicional: e.target.value})}
                placeholder="Ej. Talla M, marca específica..."
              />
            </div>

            <div className="modal-actions">
              <button className="cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="save" onClick={handleSave}>Guardar</button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {itemToDelete && (
        <ConfirmOverlay onClick={() => setItemToDelete(null)}>
          <ConfirmBox onClick={e => e.stopPropagation()}>
            <Trash2 size={36} color="#ef4444" style={{ marginBottom: 16 }} />
            <h3>¿Eliminar producto?</h3>
            <p>Se eliminará <strong>{itemToDelete.nombre}</strong> de tu lista de compras. Esta acción no se puede deshacer.</p>
            <div className="actions">
              <button className="cancel" onClick={() => setItemToDelete(null)}>Cancelar</button>
              <button className="delete" onClick={confirmDelete}>Eliminar</button>
            </div>
          </ConfirmBox>
        </ConfirmOverlay>
      )}
    </Wrapper>
  );
}
