import React, { useState } from "react";
import { container } from "webpack";

const styles = {
    container: {
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        width: '400px',
    },
    dropZone: {
        border: '2px dashed #ccc',
        borderRadius: '12px',
        padding: '40px',
        cursor: 'pointer',
        marginBottom: '20px',
        trainsition: 'border 0.3s',
    },
    button: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '10px',
    },
    result: {
        marginTop: '20px',
        padding: '10px',
        background: '#f8f9fa',
        borderRadius: '6px',
        wordBreak: 'break-all',
        fontSize: '14px',
        color: '#007AFF',
    }
};

export default function App() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setResultUrl('');
            setError('');
        }

        const handleUpload = async () => {
            if (!file) return;
            setLoading(true);
            setError('');

            try {
                // Send file path to Main process
                const response = await window.api.processAudio(file.path);
                if (response.success) {
                    setResultUrl(response.url);
                }
                else {
                    setError(response.error || 'Unknown error occurred');
                }
            } catch (err) {
                setError(err.message || 'Unknown error occurred');
            } finally {
                setLoading(false);
            }
        };
        return (
            <div style={styles.container}>
                <h2>Music Preview Generator</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>Create an intense 30 second preview.</p>
                <div
                    style={styles.dropZone}
                    onClick={() => document.getElementById('fileInput').click()}
                >
                    <input type="file" id="fileInput" accept=".mp3,.wav,.flac" style={{ display: 'none' }} onChange={handleFileChange} />
                    {file ? <p>Selected File: {file.name}</p> : <p>Click to select an audio file (MP3, WAV, FLAC)</p>}
                </div>
                {loading ? (
                    <p>Processing...</p>
                ) : (
                    <button style={styles.button} onClick={handleUpload} disabled={!file}>
                        Generate Preview
                    </button>
                )}
                {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
                {resultUrl && (
                    <div style={styles.result}>
                        <strong>Preview URL:</strong>
                        <p><a href={resultUrl} target="_blank" rel="noopener noreferrer">{resultUrl}</a></p>
                    </div>
                )}
            </div>
        );
    }
}