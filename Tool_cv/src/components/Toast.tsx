import React, { createContext, useCallback, useContext, useState, ReactNode } from 'react';

/**
 * Toast nhẹ thay cho alert() — alert trong webview Zalo vừa xấu vừa có thể bị
 * chặn. Chữ to, tự tắt sau 2.5s, hiện dưới đáy (tầm ngón cái của thợ).
 */
const ToastContext = createContext<(msg: string) => void>(() => {});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [msg, setMsg] = useState<string | null>(null);

    const show = useCallback((m: string) => {
        setMsg(m);
        window.setTimeout(() => setMsg(null), 2500);
    }, []);

    return (
        <ToastContext.Provider value={show}>
            {children}
            {msg && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] max-w-[85%]">
                    <div className="bg-navy text-white text-[15px] font-bold px-5 py-3.5 rounded-2xl shadow-badge text-center">
                        {msg}
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
};
