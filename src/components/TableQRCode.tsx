import React from 'react';
import QRCode from 'qrcode';
import { Download, Copy } from 'lucide-react';
import { useBranchStore } from '../store/branch';
import toast from 'react-hot-toast';

interface TableQRCodeProps {
  tableNumber: string;
}

const TableQRCode: React.FC<TableQRCodeProps> = ({ tableNumber }) => {
  const qrRef = React.useRef<HTMLCanvasElement>(null);
  const { selectedBranch } = useBranchStore();

  React.useEffect(() => {
    if (qrRef.current && selectedBranch) {
      const menuUrl = `${window.location.origin}/menu/${selectedBranch.id}/${tableNumber}`;
      QRCode.toCanvas(qrRef.current, menuUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    }
  }, [tableNumber, selectedBranch]);

  const handleDownload = () => {
    if (qrRef.current) {
      const url = qrRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `table-${tableNumber}-qr.png`;
      link.href = url;
      link.click();
    }
  };

  const handleCopyUrl = () => {
    if (selectedBranch) {
      const url = `${window.location.origin}/menu/${selectedBranch.id}/${tableNumber}`;
      navigator.clipboard.writeText(url);
      toast.success('Menu URL copied to clipboard');
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4">Table {tableNumber} QR Code</h3>
      <canvas ref={qrRef} className="mb-4" />
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
        >
          <Download size={16} className="mr-2" />
          Download QR Code
        </button>
        <button
          onClick={handleCopyUrl}
          className="flex items-center px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
        >
          <Copy size={16} className="mr-2" />
          Copy URL
        </button>
      </div>
    </div>
  );
};

export default TableQRCode;