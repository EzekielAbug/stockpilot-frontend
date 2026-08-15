import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { UploadCloud, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from './api';

const ImportCSV = ({ entityName, endpoint, templateHeaders, onImportSuccess, onClose }) => {
  const [data, setData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDownloadTemplate = () => {
    const csv = Papa.unparse({
      fields: templateHeaders,
      data: []
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${entityName}_template.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast.error("Error parsing CSV. Please check formatting.");
          console.error(results.errors);
          return;
        }
        setData(results.data);
      }
    });
  };

  const handleSubmit = async () => {
    if (data.length === 0) return toast.error("No data to import.");
    setIsUploading(true);
    
    try {
      // Map the keys strictly to snake_case if headers are human-readable
      const formattedData = data.map(row => {
        let obj = {};
        for (const [key, val] of Object.entries(row)) {
          // Convert 'Company Name' to 'name', etc. based on template mapping
          let newKey = key.toLowerCase().replace(/ /g, '_');
          // Some specific mappings:
          if (newKey === 'company_name') newKey = 'name';
          if (newKey === 'price' || newKey === 'cost_price') obj[newKey] = parseFloat(val) || 0;
          else obj[newKey] = val;
        }
        return obj;
      });

      const res = await api.post(endpoint, formattedData);
      toast.success(res.data.message || `Imported successfully!`);
      if (onImportSuccess) onImportSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Import failed. Check data formatting.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-panel" style={{ width: '600px', maxWidth: '90vw', padding: '32px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} color="var(--secondary)" />
        </button>
        
        <h2>Import {entityName}</h2>
        <p style={{ color: 'var(--secondary)', marginBottom: '24px' }}>
          Download the template, fill it with your data, and upload it back here.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <button className="btn" onClick={handleDownloadTemplate} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center' }}>
            <Download size={18} /> Download Template
          </button>
          
          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center' }}>
            <UploadCloud size={18} /> Upload CSV
          </button>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
        </div>

        {data.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>Preview ({data.length} rows)</h3>
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(0,0,0,0.05)', textAlign: 'left' }}>
                    {Object.keys(data[0]).map(key => (
                      <th key={key} style={{ padding: '8px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j} style={{ padding: '8px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>{val}</td>
                      ))}
                    </tr>
                  ))}
                  {data.length > 5 && (
                    <tr>
                      <td colSpan={Object.keys(data[0]).length} style={{ padding: '8px', textAlign: 'center', color: 'var(--secondary)' }}>
                        ... and {data.length - 5} more rows
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '24px', padding: '12px' }}
              onClick={handleSubmit}
              disabled={isUploading}
            >
              {isUploading ? 'Importing...' : `Confirm Import`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportCSV;
