import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ThemeColors } from '../types';
import { API_URL } from '../constants';

interface FileExplorerProps {
    colors: ThemeColors;
    theme: 'dark' | 'light';
}

interface FileInfo {
    name: string;
    size: number;
    mtime: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ colors, theme }) => {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchFiles = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/files`);
            setFiles(res.data);
        } catch (err) {
            console.error('Failed to fetch files:', err);
        }
    };

    useEffect(() => {
        fetchFiles();
        const interval = setInterval(fetchFiles, 5000); // Auto-refresh every 5s
        return () => clearInterval(interval);
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            await axios.post(`${API_URL}/api/files/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchFiles();
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (filename: string) => {
        if (!window.confirm(`Delete ${filename}?`)) return;
        try {
            await axios.delete(`${API_URL}/api/files/${filename}`);
            fetchFiles();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleDownload = (filename: string) => {
        window.open(`${API_URL}/api/files/download/${filename}`, '_blank');
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div style={{
            width: '260px',
            backgroundColor: theme === 'dark' ? 'rgba(39, 41, 61, 0.4)' : 'rgba(255, 255, 255, 0.7)',
            borderRight: `1px solid ${colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.4s ease'
        }}>
            <div style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${colors.border}`,
                backgroundColor: 'rgba(0,0,0,0.05)'
            }}>
                <h3 style={{ 
                    margin: 0, fontSize: '0.75rem', fontWeight: 800, 
                    color: colors.text, textTransform: 'uppercase', letterSpacing: '1.5px' 
                }}>
                    Files
                </h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                {files.length === 0 ? (
                    <div style={{ 
                        color: colors.textMuted, fontSize: '0.75rem', textAlign: 'center', 
                        marginTop: '20px', fontStyle: 'italic' 
                    }}>
                        No files uploaded
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {files.map(file => (
                            <div 
                                key={file.name}
                                className="file-item"
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px',
                                    backgroundColor: 'rgba(0,0,0,0.03)',
                                    border: '1px solid transparent',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'default'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ 
                                        color: colors.text, fontSize: '0.8rem', fontWeight: 600,
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        maxWidth: '140px'
                                    }}>
                                        {file.name}
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            onClick={() => handleDownload(file.name)}
                                            style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', padding: 0 }}
                                            title="Download"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                                            </svg>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(file.name)}
                                            style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: 0 }}
                                            title="Delete"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <span style={{ color: colors.textMuted, fontSize: '0.65rem' }}>
                                    {formatSize(file.size)} • {new Date(file.mtime).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <style>{`
                .file-item:hover {
                    background-color: rgba(0,0,0,0.1) !important;
                    border-color: ${colors.border} !important;
                    transform: translateX(4px);
                }
            `}</style>
        </div>
    );
};

export default FileExplorer;
