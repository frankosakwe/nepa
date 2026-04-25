import React from 'react';
import { useTranslation } from '../i18n/useTranslation';

interface PrintLayoutProps {
  title?: string;
  subtitle?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showPageNumbers?: boolean;
  watermark?: string;
  className?: string;
  children: React.ReactNode;
}

const PrintLayout: React.FC<PrintLayoutProps> = ({
  title,
  subtitle,
  header,
  footer,
  showHeader = true,
  showFooter = true,
  showPageNumbers = true,
  watermark,
  className = '',
  children
}) => {
  const { t } = useTranslation();
  const currentDate = new Date().toLocaleDateString();

  const defaultHeader = (
    <div className="print-default-header">
      <div className="print-header-content">
        <div className="print-header-left">
          {title && <h1 className="print-header-title">{title}</h1>}
          {subtitle && <p className="print-header-subtitle">{subtitle}</p>}
        </div>
        <div className="print-header-right">
          <div className="print-header-logo">
            <span className="print-logo-text">NEPA</span>
          </div>
          <div className="print-header-meta">
            <p className="print-header-date">{currentDate}</p>
            <p className="print-header-page">Page <span className="page-number"></span></p>
          </div>
        </div>
      </div>
    </div>
  );

  const defaultFooter = (
    <div className="print-default-footer">
      <div className="print-footer-content">
        <div className="print-footer-left">
          <p className="print-footer-company">
            NEPA Platform - {t('print.poweredBy', 'Powered by NEPA')}
          </p>
        </div>
        <div className="print-footer-center">
          <p className="print-footer-confidential">
            {t('print.confidential', 'Confidential')}
          </p>
        </div>
        <div className="print-footer-right">
          <p className="print-footer-page">
            {t('print.page', 'Page')} <span className="page-number"></span>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`print-layout ${className}`}>
      {watermark && (
        <div className="print-watermark">
          {watermark}
        </div>
      )}
      
      {showHeader && (
        <header className="print-layout-header">
          {header || defaultHeader}
        </header>
      )}
      
      <main className="print-layout-content">
        {children}
      </main>
      
      {showFooter && (
        <footer className="print-layout-footer">
          {footer || defaultFooter}
        </footer>
      )}
      
      {showPageNumbers && (
        <div className="print-page-numbers">
          <span className="page-number"></span>
        </div>
      )}
    </div>
  );
};

export default PrintLayout;
