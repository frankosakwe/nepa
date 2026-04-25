import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Download, RotateCcw } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

interface PrintPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  onDownload?: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({
  isOpen,
  onClose,
  onPrint,
  onDownload,
  title,
  children,
  className = ''
}) => {
  const { t } = useTranslation();
  const [scale, setScale] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handlePrint = async () => {
    if (isPrinting) return;
    
    setIsPrinting(true);
    
    try {
      // Add print class to body
      document.body.classList.add('print-preview-mode');
      
      // Wait a moment for styles to apply
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Trigger print
      window.print();
      
      // Remove print class after printing
      setTimeout(() => {
        document.body.classList.remove('print-preview-mode');
        setIsPrinting(false);
        onClose();
      }, 1000);
      
      onPrint();
    } catch (error) {
      console.error('Print failed:', error);
      setIsPrinting(false);
    }
  };

  const handleDownload = () => {
    onDownload?.();
  };

  const handleScaleChange = (newScale: number) => {
    setScale(Math.max(0.5, Math.min(2, newScale)));
  };

  const handleZoomIn = () => {
    handleScaleChange(scale + 0.1);
  };

  const handleZoomOut = () => {
    handleScaleChange(scale - 0.1);
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  if (!isOpen) return null;

  return (
    <div className="print-preview-overlay">
      <div className="print-preview-modal">
        <div className="print-preview-header">
          <div className="print-preview-title">
            <h3>{title || t('print.preview', 'Print Preview')}</h3>
            <span className="print-preview-scale">
              {Math.round(scale * 100)}%
            </span>
          </div>
          
          <div className="print-preview-controls">
            <div className="print-preview-zoom">
              <button
                onClick={handleZoomOut}
                className="print-preview-zoom-btn"
                title={t('print.zoomOut', 'Zoom Out')}
                disabled={scale <= 0.5}
              >
                <span className="text-sm">−</span>
              </button>
              
              <button
                onClick={handleResetZoom}
                className="print-preview-zoom-btn"
                title={t('print.resetZoom', 'Reset Zoom')}
              >
                <RotateCcw size={14} />
              </button>
              
              <button
                onClick={handleZoomIn}
                className="print-preview-zoom-btn"
                title={t('print.zoomIn', 'Zoom In')}
                disabled={scale >= 2}
              >
                <span className="text-sm">+</span>
              </button>
            </div>
            
            <div className="print-preview-actions">
              <button
                onClick={handleDownload}
                className="print-preview-action-btn"
                title={t('print.download', 'Download PDF')}
              >
                <Download size={16} />
                <span className="print-preview-action-text">
                  {t('print.download', 'Download')}
                </span>
              </button>
              
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="print-preview-action-btn print-preview-action-primary"
                title={t('print.print', 'Print')}
              >
                <Printer size={16} />
                <span className="print-preview-action-text">
                  {isPrinting 
                    ? t('print.printing', 'Printing...') 
                    : t('print.print', 'Print')
                  }
                </span>
              </button>
              
              <button
                onClick={onClose}
                className="print-preview-action-btn"
                title={t('print.close', 'Close')}
              >
                <X size={16} />
                <span className="print-preview-action-text screen-reader-only">
                  {t('print.close', 'Close')}
                </span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="print-preview-content">
          <div 
            ref={previewRef}
            className="print-preview-viewport"
            style={{ transform: `scale(${scale})` }}
          >
            <div className="print-preview-document">
              {children}
            </div>
          </div>
        </div>
        
        <div className="print-preview-footer">
          <div className="print-preview-info">
            <span>{t('print.pageInfo', 'Page 1 of 1')}</span>
            <span>{t('print.paperSize', 'A4')}</span>
          </div>
        </div>
        
        {isPrinting && (
          <div className="print-preview-loading">
            <div className="print-preview-loading-spinner"></div>
            <span>{t('print.preparing', 'Preparing document for printing...')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintPreview;
