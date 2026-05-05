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
   const [isUploading, setIsUploading] = useState(false);
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
        const interval = setInterval(fetchFiles, 5000);
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
        <div className="md-navigation-drawer" style={{
            width: '280px',
            borderRight: '1px solid var(--md-sys-color-outline-variant)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'background-color 0.4s var(--md-sys-motion-easing-standard)'
        }}>
            <div style={{
                padding: '24px 16px 12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: 'var(--md-sys-typescale-title-small-font-size, 14px)',
                    fontWeight: 'var(--md-sys-typescale-title-small-font-weight, 500)',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    fontFamily: 'var(--md-sys-typescale-title-small-font-family, Roboto)',
                    letterSpacing: '0.1px'
                }}>
                    Files
                </h3>
<<<<<<< HEAD

=======
                <button
                    className="md-icon-button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload File"
                    disabled={isUploading}
                    style={{ width: '32px', height: '32px' }}
                >
                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>
                        {isUploading ? 'hourglass_empty' : 'upload'}
                    </span>
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleUpload}
                />
>>>>>>> e9ed254719f75d32be1cf619ce8e67c1f2e041c9
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
                {files.length === 0 ? (
                    <div style={{
                        color: 'var(--md-sys-color-on-surface-variant)',
                        fontSize: 'var(--md-sys-typescale-body-medium-font-size)',
                        textAlign: 'center',
                        marginTop: '20px',
                        fontFamily: 'var(--md-sys-typescale-body-medium-font-family)'
                    }}>
                        No files
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {files.map(file => (
                            <div
                                key={file.name}
                                className="md-list-item"
                                style={{
                                    borderRadius: 'var(--md-sys-shape-corner-full)',
                                    height: '56px',
                                    padding: '0 16px'
                                }}
                            >
                                <span className="material-symbols-rounded" style={{
                                    color: 'var(--md-sys-color-on-surface-variant)',
                                    marginRight: '16px'
                                }}>
                                    insert_drive_file
                                </span>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                    <span style={{
                                        color: 'var(--md-sys-color-on-surface)',
                                        fontSize: 'var(--md-sys-typescale-body-large-font-size)',
                                        fontWeight: 'var(--md-sys-typescale-body-large-font-weight)',
                                        fontFamily: 'var(--md-sys-typescale-body-large-font-family)',
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    }}>
                                        {file.name}
                                    </span>
                                    <span style={{
                                        color: 'var(--md-sys-color-on-surface-variant)',
                                        fontSize: 'var(--md-sys-typescale-body-medium-font-size)',
                                        fontFamily: 'var(--md-sys-typescale-body-medium-font-family)'
                                    }}>
                                        {formatSize(file.size)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <button
                                        className="md-icon-button"
                                        onClick={(e) => { e.stopPropagation(); handleDownload(file.name); }}
                                        title="Download"
                                        style={{ width: '32px', height: '32px' }}
                                    >
                                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>download</span>
                                    </button>
                                    <button
                                        className="md-icon-button"
                                        onClick={(e) => { e.stopPropagation(); handleDelete(file.name); }}
                                        title="Delete"
                                        style={{ width: '32px', height: '32px', color: 'var(--md-sys-color-error)' }}
                                    >
                                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileExplorer;
