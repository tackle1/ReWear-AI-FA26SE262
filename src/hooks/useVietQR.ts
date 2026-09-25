import { useState, useCallback } from 'react';

export interface VietQROptions {
  bankId: string;
  accountNo: string;
  amount: number;
  description: string;
}

export const useVietQR = () => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'SUCCESS' | 'FAILED'>('PENDING');
  const [isPolling, setIsPolling] = useState<boolean>(false);

  const generateQR = useCallback(async (options: VietQROptions) => {
    return options;
  }, []);

  const pollPaymentStatus = useCallback(async (orderId: string) => {
    setIsPolling(true);
    return orderId;
  }, []);

  return {
    qrUrl,
    setQrUrl,
    paymentStatus,
    isPolling,
    generateQR,
    pollPaymentStatus,
    setPaymentStatus,
  };
};

export default useVietQR;
