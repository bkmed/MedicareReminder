import React, { createContext, useContext, useState, useCallback } from 'react';
import { NotificationModal } from '../components/NotificationModal';

export type NotificationType = 'success' | 'error' | 'info' | 'confirm';

interface NotificationButton {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface NotificationOptions {
    title?: string;
    message: string;
    type?: NotificationType;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    buttons?: NotificationButton[];
}

interface NotificationContextType {
    showNotification: (options: NotificationOptions) => void;
    hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [options, setOptions] = useState<NotificationOptions | null>(null);

    const showNotification = useCallback((newOptions: NotificationOptions) => {
        setOptions(newOptions);
        setVisible(true);
    }, []);

    // Subscribe to global notifications
    React.useEffect(() => {
        const unsubscribe = require('../services/globalNotificationService').globalNotificationService.subscribe(showNotification);
        return unsubscribe;
    }, [showNotification]);

    const hideNotification = useCallback(() => {
        setVisible(false);
        if (options?.onCancel) {
            options.onCancel();
        }
    }, [options]);

    const confirm = useCallback(() => {
        setVisible(false);
        if (options?.onConfirm) {
            options.onConfirm();
        }
    }, [options]);

    return (
        <NotificationContext.Provider value={{ showNotification, hideNotification }}>
            {children}
            {options && (
                <NotificationModal
                    visible={visible}
                    title={options.title}
                    message={options.message}
                    type={options.type}
                    onConfirm={confirm}
                    onCancel={hideNotification}
                    confirmText={options.confirmText}
                    cancelText={options.cancelText}
                    buttons={options.buttons}
                />
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
