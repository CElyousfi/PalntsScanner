import { useState, useEffect } from 'react';

export function useLowDataMode() {
    const [isLowData, setIsLowData] = useState(false);

    useEffect(() => {
        // Check if the Network Information API is supported
        if ('connection' in navigator) {
            const connection = (navigator as any).connection;
            const updateLowDataStatus = () => {
                // Assume 'save-data' mode or slow effective connection types (2g, 3g) imply low data
                if (connection.saveData === true ||
                    connection.effectiveType === 'slow-2g' ||
                    connection.effectiveType === '2g' ||
                    connection.effectiveType === '3g') {
                    setIsLowData(true);
                } else {
                    setIsLowData(false);
                }
            };

            updateLowDataStatus();
            connection.addEventListener('change', updateLowDataStatus);
            return () => connection.removeEventListener('change', updateLowDataStatus);
        }
    }, []);

    return isLowData;
}
