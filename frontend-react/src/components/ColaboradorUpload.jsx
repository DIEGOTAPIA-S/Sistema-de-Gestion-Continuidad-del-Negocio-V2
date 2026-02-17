import React, { useRef, useState } from 'react';
import { uploadColaboradoresExcel } from '../services/colaboradoresService';

const ColaboradorUpload = ({ onUploadSuccess }) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const result = await uploadColaboradoresExcel(file);
            let msg = `✅ Carga Finalizada\n\nCreados: ${result.created}\nActualizados: ${result.updated}`;
            if (result.errors && result.errors.length > 0) {
                msg += `\n\n❌ Errores (${result.errors.length}):\n` + result.errors.slice(0, 5).join('\n');
            }
            alert(msg);
            if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
            alert("❌ Error cargando archivo: " + (error.response?.data?.error || error.message));
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
        }
    };

    return (
        <div style={{ padding: '10px 0' }}>
            <input
                type="file"
                accept=".xlsx, .xls"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            <button
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px dashed #cbd5e1',
                    background: '#f8fafc',
                    color: '#64748b',
                    cursor: uploading ? 'wait' : 'pointer',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}
            >
                {uploading ? '⏳ Procesando...' : '📤 Cargar Excel (Geocodificado)'}
            </button>
        </div>
    );
};

export default ColaboradorUpload;
