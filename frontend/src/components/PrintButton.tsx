import React, { useState } from 'react';
import { Printer, Download, Eye } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

interface PrintButtonProps {
  onPrint?: () => void;
  onPreview?: () => void;
  onDownload?: () => void;
  title?: string;
  className?: string;
  showPreview?: boolean;
  showDownload?: boolean;
  disabled?: boolean;
}

const PrintButton: React.FC<PrintButtonProps> = ({
  onPrint,
  onPreview,
  onDownload,
  title,
  className = '',
  showPreview = true,
  showDownload = true,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    if (disabled || isPrinting) return;
    
    setIsPrinting(true);
    
    try {
      // Add print-specific class to body
      document.body.classList.add('printing');
      
      // Trigger print dialog
      window.print();
      
      // Remove print class after a delay
      setTimeout(() => {
        document.body.classList.remove('printing');
        setIsPrinting(false);
      }, 1000);
      
      onPrint?.();
    } catch (error) {
      console.error('Print failed:', error);
      setIsPrinting(false);
    }
  };

  const handlePreview = () => {
    if (disabled) return;
    onPreview?.();
  };

  const handleDownload = () => {
    if (disabled) return;
    onDownload?.();
  };

  return (
    <div className={`print-button-container ${className}`}>
      <div className="print-button-group">
        <button
          onClick={handlePrint}
          disabled={disabled || isPrinting}
          className="print-button print-button-primary"
          title={title || t('print.print', 'Print')}
        >
          <Printer size={16} />
          <span className="print-button-text">
            {isPrinting ? t('print.printing', 'Printing...') : t('print.print', 'Print')}
          </span>
        </button>
        
        {showPreview && (
          <button
            onClick={handlePreview}
            disabled={disabled}
            className="print-button print-button-secondary"
            title={t('print.preview', 'Print Preview')}
          >
            <Eye size={16} />
            <span className="print-button-text screen-reader-only">
              {t('print.preview', 'Print Preview')}
            </span>
          </button>
        )}
        
        {showDownload && (
          <button
            onClick={handleDownload}
            disabled={disabled}
            className="print-button print-button-secondary"
            title={t('print.download', 'Download PDF')}
          >
            <Download size={16} />
            <span className="print-button-text screen-reader-only">
              {t('print.download', 'Download PDF')}
            </span>
          </button>
        )}
      </div>
      
      {isPrinting && (
        <div className="print-status">
          <div className="print-spinner"></div>
          <span>{t('print.preparing', 'Preparing document for printing...')}</span>
        </div>
      )}
    </div>
  );
};

export default PrintButton;
