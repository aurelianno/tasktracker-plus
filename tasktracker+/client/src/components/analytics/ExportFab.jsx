import React, { useState } from 'react';
// Add these imports for PDF/CSV export
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const fabStyle = {
  position: 'fixed',
  bottom: 32,
  right: 32,
  zIndex: 100,
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '50%',
  width: 64,
  height: 64,
  boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 32,
  cursor: 'pointer',
  transition: 'box-shadow 0.18s cubic-bezier(.4,2,.6,1)',
};
const modalBackdrop = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(30,41,59,0.18)',
  zIndex: 101,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const modalStyle = {
  background: 'white',
  borderRadius: 20,
  padding: '32px 28px',
  boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
  minWidth: 320,
  maxWidth: 400,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};
const buttonStyle = {
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  padding: '12px 24px',
  fontWeight: 600,
  fontSize: 16,
  margin: '12px 0',
  cursor: 'pointer',
  width: '100%',
  transition: 'box-shadow 0.18s cubic-bezier(.4,2,.6,1)',
};
const closeBtn = {
  position: 'absolute',
  top: 18,
  right: 24,
  fontSize: 22,
  color: '#64748b',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
};

function analyticsToCSV(analytics) {
  // Simple CSV for key metrics (expand as needed)
  let csv = 'Metric,Value\n';
  if (!analytics) return csv;
  if (analytics.performance) {
    Object.entries(analytics.performance).forEach(([k, v]) => {
      csv += `${k},${v}\n`;
    });
  }
  if (analytics.monthly) {
    Object.entries(analytics.monthly).forEach(([k, v]) => {
      csv += `monthly_${k},${v}\n`;
    });
  }
  if (analytics.lastMonth) {
    Object.entries(analytics.lastMonth).forEach(([k, v]) => {
      if (typeof v === 'object') {
        Object.entries(v).forEach(([kk, vv]) => {
          csv += `lastMonth_${kk},${vv}\n`;
        });
      } else {
        csv += `lastMonth_${k},${v}\n`;
      }
    });
  }
  return csv;
}

const ExportFab = ({ analytics }) => {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const handleExportPDF = async () => {
    const dashboard = document.querySelector('[data-analytics-dashboard]');
    if (!dashboard) return alert('Dashboard area not found.');
    // Scroll to top to ensure all content is visible
    dashboard.scrollIntoView();
    // Wait a tick for layout
    await new Promise(r => setTimeout(r, 200));
    const canvas = await html2canvas(dashboard, { useCORS: true, scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    // A4 landscape size in px at 96dpi: 1122 x 793
    const pdfWidth = 1122;
    const pdfHeight = 793;
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    // Scale image to fit A4 landscape
    let renderWidth = pdfWidth;
    let renderHeight = (imgHeight * pdfWidth) / imgWidth;
    if (renderHeight > pdfHeight) {
      renderHeight = pdfHeight;
      renderWidth = (imgWidth * pdfHeight) / imgHeight;
    }
    const x = (pdfWidth - renderWidth) / 2;
    const y = (pdfHeight - renderHeight) / 2;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [pdfWidth, pdfHeight] });
    pdf.addImage(imgData, 'PNG', x, y, renderWidth, renderHeight);
    pdf.save('analytics-report.pdf');
    if (imgWidth > pdfWidth || imgHeight > pdfHeight) {
      setTimeout(() => alert('Note: The dashboard was scaled to fit the PDF. If some content is missing, try reducing your browser zoom or window width before exporting.'), 500);
    }
  };

  const handleExportCSV = () => {
    const csv = analyticsToCSV(analytics);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button style={fabStyle} title="Export Analytics" onClick={() => setOpen(true)}>
        <span role="img" aria-label="Export">⬇️</span>
      </button>
      {open && (
        <div style={modalBackdrop}>
          <div style={{ ...modalStyle, position: 'relative' }}>
            <button style={closeBtn} onClick={() => setOpen(false)} title="Close">×</button>
            <h3 style={{ fontWeight: 700, fontSize: 20, color: '#1e293b', marginBottom: 18 }}>Export Analytics</h3>
            <div style={{ width: '100%', marginBottom: 18 }}>
              <label style={{ fontWeight: 500, color: '#475569', fontSize: 14 }}>Date Range:</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <input type="date" value={dateRange.from} onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))} style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
                <span style={{ alignSelf: 'center', color: '#64748b' }}>to</span>
                <input type="date" value={dateRange.to} onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))} style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
              </div>
            </div>
            <button style={buttonStyle} onClick={handleExportPDF}>Export as PDF</button>
            <button style={buttonStyle} onClick={handleExportCSV}>Download CSV</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportFab; 