import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

// --- Toast Context ---
const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const warning = useCallback((msg) => addToast(msg, 'warning'), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts }) => {
  if (toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-in slide-in-from-right fade-in ${getBg(toast.type)}`}
        >
          {getIcon(toast.type)}
          <p className="text-sm font-medium text-gray-800">{toast.message}</p>
        </div>
      ))}
    </div>
  );
};

// --- Confirm Modal ---
const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
  return context;
};

export const ConfirmProvider = ({ children }) => {
  const [modal, setModal] = useState(null);

  const confirm = useCallback((message, title = 'Konfirmasi') => {
    return new Promise((resolve) => {
      setModal({
        title,
        message,
        onConfirm: () => { setModal(null); resolve(true); },
        onCancel: () => { setModal(null); resolve(false); }
      });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {modal && <ConfirmModal {...modal} />}
    </ConfirmContext.Provider>
  );
};

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
        <div className="flex items-start mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastProvider;
