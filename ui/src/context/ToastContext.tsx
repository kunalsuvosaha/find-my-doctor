import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 3000); // Auto remove after 3s
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const success = (msg: string) => addToast(msg, 'success');
    const error = (msg: string) => addToast(msg, 'error');

    return (
        <ToastContext.Provider value={{ addToast, success, error }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onClose }: { toast: ToastMessage, onClose: () => void }) => {
    const variants = {
        initial: { opacity: 0, x: 20, scale: 0.95 },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: 20, scale: 0.95 }
    };

    const bgColors = {
        success: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800',
        error: 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800',
        info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800'
    };

    const textColors = {
        success: 'text-green-800 dark:text-green-200',
        error: 'text-red-800 dark:text-red-200',
        info: 'text-blue-800 dark:text-blue-200'
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />
    };

    return (
        <motion.div
            layout
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`pointer-events-auto min-w-[300px] max-w-md w-full p-4 rounded-xl border shadow-lg flex items-start gap-3 backdrop-blur-sm ${bgColors[toast.type]}`}
        >
            <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
            <div className={`flex-1 text-sm font-medium ${textColors[toast.type]}`}>
                {toast.message}
            </div>
            <button onClick={onClose} className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
