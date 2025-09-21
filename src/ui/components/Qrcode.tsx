import React, { useRef } from 'react';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';

const QRCodeComponent = () => {
  const url = 'https://ypa.onrender.com/#/menu/1';
  const qrRef = useRef(null);

  const downloadQRCode = () => {
    if (qrRef.current === null) {
      return;
    }

    toPng(qrRef.current, { cacheBust: true })
      .then((dataUrl:any) => {
        const link = document.createElement('a');
        link.download = 'qr-code.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err:any) => {
        console.error('QR code download failed:', err);
      });
  };

  return (
    <div>
      <h1>Scan the QR Code</h1>
      <div ref={qrRef} style={{ background: 'white', padding: '16px' }}>
        <QRCode value={url} size={256} />
      </div>
      <button onClick={downloadQRCode} style={{ marginTop: '16px' }}>
        Download QR Code
      </button>
    </div>
  );
};

export default QRCodeComponent;
