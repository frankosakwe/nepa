import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import PrintButton from './PrintButton';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock window.print
const mockPrint = jest.fn();
Object.defineProperty(window, 'print', {
  writable: true,
  value: mockPrint,
});

// Mock useTranslation
jest.mock('../i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback || key,
  }),
}));

describe('PrintButton Component', () => {
  const mockOnPrint = jest.fn();
  const mockOnPreview = jest.fn();
  const mockOnDownload = jest.fn();

  beforeEach(() => {
    mockOnPrint.mockClear();
    mockOnPreview.mockClear();
    mockOnDownload.mockClear();
    mockPrint.mockClear();
  });

  test('renders print button with correct text', () => {
    render(<PrintButton onPrint={mockOnPrint} />);
    
    const printButton = screen.getByTitle('Print');
    expect(printButton).toBeInTheDocument();
    expect(screen.getByText('Print')).toBeInTheDocument();
  });

  test('shows preview button when showPreview is true', () => {
    render(<PrintButton onPrint={mockOnPrint} showPreview={true} />);
    
    const previewButton = screen.getByTitle('Print Preview');
    expect(previewButton).toBeInTheDocument();
  });

  test('shows download button when showDownload is true', () => {
    render(<PrintButton onPrint={mockOnPrint} showDownload={true} />);
    
    const downloadButton = screen.getByTitle('Download PDF');
    expect(downloadButton).toBeInTheDocument();
  });

  test('hides preview button when showPreview is false', () => {
    render(<PrintButton onPrint={mockOnPrint} showPreview={false} />);
    
    const previewButton = screen.queryByTitle('Print Preview');
    expect(previewButton).not.toBeInTheDocument();
  });

  test('hides download button when showDownload is false', () => {
    render(<PrintButton onPrint={mockOnPrint} showDownload={false} />);
    
    const downloadButton = screen.queryByTitle('Download PDF');
    expect(downloadButton).not.toBeInTheDocument();
  });

  test('calls onPrint when print button is clicked', async () => {
    const user = userEvent.setup();
    render(<PrintButton onPrint={mockOnPrint} />);
    
    const printButton = screen.getByTitle('Print');
    await user.click(printButton);
    
    expect(mockPrint).toHaveBeenCalled();
    expect(mockOnPrint).toHaveBeenCalled();
  });

  test('calls onPreview when preview button is clicked', async () => {
    const user = userEvent.setup();
    render(<PrintButton onPrint={mockOnPrint} onPreview={mockOnPreview} showPreview={true} />);
    
    const previewButton = screen.getByTitle('Print Preview');
    await user.click(previewButton);
    
    expect(mockOnPreview).toHaveBeenCalled();
  });

  test('calls onDownload when download button is clicked', async () => {
    const user = userEvent.setup();
    render(<PrintButton onPrint={mockOnPrint} onDownload={mockOnDownload} showDownload={true} />);
    
    const downloadButton = screen.getByTitle('Download PDF');
    await user.click(downloadButton);
    
    expect(mockOnDownload).toHaveBeenCalled();
  });

  test('shows printing state when printing', async () => {
    const user = userEvent.setup();
    render(<PrintButton onPrint={mockOnPrint} />);
    
    const printButton = screen.getByTitle('Print');
    await user.click(printButton);
    
    expect(screen.getByText('Printing...')).toBeInTheDocument();
    expect(printButton).toBeDisabled();
  });

  test('disables all buttons when disabled prop is true', () => {
    render(<PrintButton onPrint={mockOnPrint} disabled={true} showPreview={true} showDownload={true} />);
    
    const printButton = screen.getByTitle('Print');
    const previewButton = screen.getByTitle('Print Preview');
    const downloadButton = screen.getByTitle('Download PDF');
    
    expect(printButton).toBeDisabled();
    expect(previewButton).toBeDisabled();
    expect(downloadButton).toBeDisabled();
  });

  test('applies custom className', () => {
    render(<PrintButton onPrint={mockOnPrint} className="custom-class" />);
    
    const container = screen.getByRole('group');
    expect(container).toHaveClass('custom-class');
  });

  test('uses custom title', () => {
    render(<PrintButton onPrint={mockOnPrint} title="Custom Print Title" />);
    
    const printButton = screen.getByTitle('Custom Print Title');
    expect(printButton).toBeInTheDocument();
  });

  test('adds printing class to body during print', async () => {
    const user = userEvent.setup();
    render(<PrintButton onPrint={mockOnPrint} />);
    
    const printButton = screen.getByTitle('Print');
    await user.click(printButton);
    
    expect(document.body).toHaveClass('printing');
  });

  test('removes printing class after print completes', async () => {
    const user = userEvent.setup();
    render(<PrintButton onPrint={mockOnPrint} />);
    
    const printButton = screen.getByTitle('Print');
    await user.click(printButton);
    
    // Wait for the timeout to complete
    await waitFor(() => {
      expect(document.body).not.toHaveClass('printing');
    }, { timeout: 2000 });
  });

  test('shows print status during printing', async () => {
    const user = userEvent.setup();
    render(<PrintButton onPrint={mockOnPrint} />);
    
    const printButton = screen.getByTitle('Print');
    await user.click(printButton);
    
    expect(screen.getByText('Preparing document for printing...')).toBeInTheDocument();
  });

  test('passes accessibility checks', async () => {
    const { container } = render(<PrintButton onPrint={mockOnPrint} />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });

  test('handles print error gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock window.print to throw an error
    const originalPrint = window.print;
    window.print = jest.fn(() => {
      throw new Error('Print failed');
    });
    
    render(<PrintButton onPrint={mockOnPrint} />);
    
    const printButton = screen.getByTitle('Print');
    await user.click(printButton);
    
    // Should not be in printing state after error
    await waitFor(() => {
      expect(screen.queryByText('Printing...')).not.toBeInTheDocument();
    });
    
    // Restore original print function
    window.print = originalPrint;
  });

  test('does not trigger print when already printing', async () => {
    const user = userEvent.setup();
    render(<PrintButton onPrint={mockOnPrint} />);
    
    const printButton = screen.getByTitle('Print');
    await user.click(printButton);
    
    // Try to click again while printing
    await user.click(printButton);
    
    // Should only call print once
    expect(mockPrint).toHaveBeenCalledTimes(1);
  });

  test('does not trigger actions when disabled', async () => {
    const user = userEvent.setup();
    render(<PrintButton 
      onPrint={mockOnPrint} 
      onPreview={mockOnPreview} 
      onDownload={mockOnDownload}
      disabled={true}
      showPreview={true}
      showDownload={true}
    />);
    
    const printButton = screen.getByTitle('Print');
    const previewButton = screen.getByTitle('Print Preview');
    const downloadButton = screen.getByTitle('Download PDF');
    
    await user.click(printButton);
    await user.click(previewButton);
    await user.click(downloadButton);
    
    expect(mockOnPrint).not.toHaveBeenCalled();
    expect(mockOnPreview).not.toHaveBeenCalled();
    expect(mockOnDownload).not.toHaveBeenCalled();
  });
});

describe('PrintButton Integration', () => {
  test('works with keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<PrintButton onPrint={jest.fn()} showPreview={true} showDownload={true} />);
    
    // Tab through buttons
    await user.tab();
    expect(screen.getByTitle('Print')).toHaveFocus();
    
    await user.tab();
    expect(screen.getByTitle('Print Preview')).toHaveFocus();
    
    await user.tab();
    expect(screen.getByTitle('Download PDF')).toHaveFocus();
  });

  test('supports enter key activation', async () => {
    const user = userEvent.setup();
    const mockOnPrint = jest.fn();
    render(<PrintButton onPrint={mockOnPrint} />);
    
    const printButton = screen.getByTitle('Print');
    printButton.focus();
    
    await user.keyboard('{Enter}');
    
    expect(mockOnPrint).toHaveBeenCalled();
  });

  test('supports space key activation', async () => {
    const user = userEvent.setup();
    const mockOnPrint = jest.fn();
    render(<PrintButton onPrint={mockOnPrint} />);
    
    const printButton = screen.getByTitle('Print');
    printButton.focus();
    
    await user.keyboard('{ }');
    
    expect(mockOnPrint).toHaveBeenCalled();
  });
});
