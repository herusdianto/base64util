/**
 * Base64 Utility - Encode & Decode Base64
 * Supports: String, Image, and File
 */

class Base64Util {
    constructor() {
        this.encodeFile = null;
        this.decodedBlob = null;
        this.decodedFilename = 'decoded_file';
        this.init();
    }

    init() {
        this.bindTabs();
        this.bindEncodeEvents();
        this.bindDecodeEvents();
        this.bindCopyButtons();
        this.bindDownloadButtons();
        this.restoreFromLocalStorage();
        this.attachLocalStorageListeners();
    }

    // ==================== Tab Navigation ====================
    bindTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;

                // Update buttons
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    // ==================== Encode Events ====================
    bindEncodeEvents() {
        // Input type toggle
        const encodeTypeRadios = document.querySelectorAll('input[name="encode-type"]');
        encodeTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                document.getElementById('encode-text-input').classList.toggle('hidden', radio.value !== 'text');
                document.getElementById('encode-file-input').classList.toggle('hidden', radio.value !== 'file');
                // Auto-trigger encode on type change
                this.encode();
            });
        });

        // File input & drag-drop
        const dropZone = document.getElementById('encode-drop-zone');
        const fileInput = document.getElementById('encode-file');

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                this.handleEncodeFile(e.dataTransfer.files[0]);
                this.encode(); // Auto-trigger encode after file drop
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                this.handleEncodeFile(e.target.files[0]);
                this.encode(); // Auto-trigger encode after file select
            }
        });

        // Auto-trigger encode on text input
        const encodeText = document.getElementById('encode-text');
        if (encodeText) {
            encodeText.addEventListener('input', () => {
                if (document.querySelector('input[name="encode-type"]:checked').value === 'text') {
                    this.encode();
                }
            });
        }
        // Remove encode button event binding
    }

    handleEncodeFile(file) {
        this.encodeFile = file;
        const preview = document.getElementById('encode-file-preview');
        preview.classList.remove('hidden');

        let previewHTML = '';

        // If it's an image, show preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewHTML = `
                    <img src="${e.target.result}" class="preview-image" alt="Preview">
                    <div class="file-details">
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">${this.formatFileSize(file.size)}</span>
                        <button class="remove-file">✕ Remove</button>
                    </div>
                `;
                preview.innerHTML = previewHTML;
                preview.querySelector('.remove-file').addEventListener('click', () => this.removeEncodeFile());
            };
            reader.readAsDataURL(file);
        } else {
            previewHTML = `
                <div class="file-details">
                    <span class="file-name">📄 ${file.name}</span>
                    <span class="file-size">${this.formatFileSize(file.size)}</span>
                    <button class="remove-file">✕ Remove</button>
                </div>
            `;
            preview.innerHTML = previewHTML;
            preview.querySelector('.remove-file').addEventListener('click', () => this.removeEncodeFile());
        }
    }

    removeEncodeFile() {
        this.encodeFile = null;
        document.getElementById('encode-file').value = '';
        document.getElementById('encode-file-preview').classList.add('hidden');
    }

    encode() {
        const inputType = document.querySelector('input[name="encode-type"]:checked').value;

        if (inputType === 'text') {
            const text = document.getElementById('encode-text').value;
            if (!text.trim()) {
                document.getElementById('encode-output').value = '';
                return;
            }
            const encoded = btoa(unescape(encodeURIComponent(text)));
            document.getElementById('encode-output').value = encoded;
            this.showStatus('Text encoded successfully!', 'success');
        } else {
            if (!this.encodeFile) {
                document.getElementById('encode-output').value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result.split(',')[1];
                document.getElementById('encode-output').value = base64;
                this.showStatus(`File "${this.encodeFile.name}" encoded successfully!`, 'success');
            };
            reader.onerror = () => {
                this.showStatus('Error reading file', 'error');
            };
            reader.readAsDataURL(this.encodeFile);
        }
        this.saveToLocalStorage();
    }

    // ==================== Decode Events ====================
    bindDecodeEvents() {
        // Input type toggle
        const decodeInputTypeRadios = document.querySelectorAll('input[name="decode-input-type"]');
        decodeInputTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                document.getElementById('decode-text-input').classList.toggle('hidden', radio.value !== 'text');
                document.getElementById('decode-file-input').classList.toggle('hidden', radio.value !== 'file');
                // Auto-trigger decode on type change
                this.decode();
            });
        });

        // File drop zone for decode
        const dropZone = document.getElementById('decode-drop-zone');
        const fileInput = document.getElementById('decode-file');

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                this.handleDecodeFile(e.dataTransfer.files[0]);
                setTimeout(() => this.decode(), 0); // Auto-trigger decode after file drop
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                this.handleDecodeFile(e.target.files[0]);
                setTimeout(() => this.decode(), 0); // Auto-trigger decode after file select
            }
        });

        // Auto-trigger decode on text input
        const decodeText = document.getElementById('decode-text');
        if (decodeText) {
            decodeText.addEventListener('input', () => {
                if (document.querySelector('input[name="decode-input-type"]:checked').value === 'text') {
                    this.decode();
                }
            });
        }
        // Output type selector (auto trigger decode)
        const decodeOutputTypeRadios = document.querySelectorAll('input[name="decode-output-type"]');
        decodeOutputTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.decode();
            });
        });
        // Remove decode button event binding
    }

    handleDecodeFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('decode-text').value = e.target.result.trim();
            // Switch back to text input view to show the loaded content
            document.querySelector('input[name="decode-input-type"][value="text"]').checked = true;
            document.getElementById('decode-text-input').classList.remove('hidden');
            document.getElementById('decode-file-input').classList.add('hidden');
            this.showStatus('File loaded successfully!', 'success');
        };
        reader.readAsText(file);
    }

    decode() {
        const inputType = document.querySelector('input[name="decode-input-type"]:checked').value;
        const outputType = document.querySelector('input[name="decode-output-type"]:checked').value;

        let base64String = document.getElementById('decode-text').value.trim();

        if (!base64String) {
            return;
        }

        // Remove data URL prefix if present
        if (base64String.includes(',')) {
            base64String = base64String.split(',')[1];
        }

        // Remove whitespace and newlines
        base64String = base64String.replace(/\s/g, '');

        try {
            const binaryString = atob(base64String);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Detect file type
            const detectedType = this.detectFileType(bytes);
            let finalOutputType = outputType;

            if (outputType === 'auto') {
                if (detectedType.category === 'image') {
                    finalOutputType = 'image';
                } else if (detectedType.category === 'text') {
                    finalOutputType = 'text';
                } else {
                    finalOutputType = 'file';
                }
            }

            // Hide all output sections
            document.querySelectorAll('.decode-output').forEach(el => el.classList.remove('active'));

            // Create blob
            this.decodedBlob = new Blob([bytes], { type: detectedType.mimeType });
            this.decodedFilename = 'decoded' + detectedType.extension;

            switch (finalOutputType) {
                case 'text':
                    this.showTextOutput(binaryString);
                    break;
                case 'image':
                    this.showImageOutput(bytes, detectedType);
                    break;
                case 'file':
                    this.showFileOutput(bytes, detectedType);
                    break;
            }

            this.showStatus(`Decoded successfully! Type: ${detectedType.name}`, 'success');
        } catch (error) {
            console.error(error);
            this.showStatus('Invalid Base64 string', 'error');
        }
        this.saveToLocalStorage();
    }

    showTextOutput(text) {
        const outputDiv = document.getElementById('decode-output-text');
        try {
            // Try to decode as UTF-8
            const decoded = decodeURIComponent(escape(text));
            document.getElementById('decode-result-text').value = decoded;
        } catch {
            // If UTF-8 fails, show as-is
            document.getElementById('decode-result-text').value = text;
        }
        outputDiv.classList.remove('hidden');
        outputDiv.classList.add('active');
    }

    showImageOutput(bytes, fileType) {
        const blob = new Blob([bytes], { type: fileType.mimeType });
        const url = URL.createObjectURL(blob);
        const img = document.getElementById('decode-result-image');
        const outputDiv = document.getElementById('decode-output-image');

        img.onload = () => {
            img.style.display = 'block';
        };
        img.onerror = () => {
            console.error('Failed to load image');
            img.style.display = 'none';
        };
        img.src = url;

        outputDiv.classList.remove('hidden');
        outputDiv.classList.add('active');
    }

    showFileOutput(bytes, fileType) {
        const fileInfo = document.getElementById('decode-file-info');
        const outputDiv = document.getElementById('decode-output-file');

        fileInfo.querySelector('.filename').textContent = 'decoded' + fileType.extension;
        fileInfo.querySelector('.filesize').textContent = this.formatFileSize(bytes.length);
        fileInfo.querySelector('.filetype').textContent = fileType.name;
        fileInfo.querySelector('.icon').textContent = this.getFileIcon(fileType.category);

        outputDiv.classList.remove('hidden');
        outputDiv.classList.add('active');
    }

    // ==================== File Type Detection ====================
    detectFileType(bytes) {
        // Check for common file signatures (magic bytes)
        const signatures = {
            // Images
            'PNG': { bytes: [0x89, 0x50, 0x4E, 0x47], mimeType: 'image/png', extension: '.png', category: 'image' },
            'JPEG': { bytes: [0xFF, 0xD8, 0xFF], mimeType: 'image/jpeg', extension: '.jpg', category: 'image' },
            'GIF': { bytes: [0x47, 0x49, 0x46], mimeType: 'image/gif', extension: '.gif', category: 'image' },
            'WebP': { bytes: [0x52, 0x49, 0x46, 0x46], check: (b) => b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50, mimeType: 'image/webp', extension: '.webp', category: 'image' },
            'BMP': { bytes: [0x42, 0x4D], mimeType: 'image/bmp', extension: '.bmp', category: 'image' },
            'ICO': { bytes: [0x00, 0x00, 0x01, 0x00], mimeType: 'image/x-icon', extension: '.ico', category: 'image' },
            'SVG': { bytes: [0x3C, 0x73, 0x76, 0x67], mimeType: 'image/svg+xml', extension: '.svg', category: 'image' },

            // Documents
            'PDF': { bytes: [0x25, 0x50, 0x44, 0x46], mimeType: 'application/pdf', extension: '.pdf', category: 'document' },

            // Archives
            'ZIP': { bytes: [0x50, 0x4B, 0x03, 0x04], mimeType: 'application/zip', extension: '.zip', category: 'archive' },
            'GZIP': { bytes: [0x1F, 0x8B], mimeType: 'application/gzip', extension: '.gz', category: 'archive' },
            'RAR': { bytes: [0x52, 0x61, 0x72, 0x21], mimeType: 'application/x-rar-compressed', extension: '.rar', category: 'archive' },
            '7Z': { bytes: [0x37, 0x7A, 0xBC, 0xAF], mimeType: 'application/x-7z-compressed', extension: '.7z', category: 'archive' },

            // Audio
            'MP3': { bytes: [0x49, 0x44, 0x33], mimeType: 'audio/mpeg', extension: '.mp3', category: 'audio' },
            'MP3_2': { bytes: [0xFF, 0xFB], mimeType: 'audio/mpeg', extension: '.mp3', category: 'audio' },
            'WAV': { bytes: [0x52, 0x49, 0x46, 0x46], check: (b) => b[8] === 0x57 && b[9] === 0x41 && b[10] === 0x56 && b[11] === 0x45, mimeType: 'audio/wav', extension: '.wav', category: 'audio' },
            'OGG': { bytes: [0x4F, 0x67, 0x67, 0x53], mimeType: 'audio/ogg', extension: '.ogg', category: 'audio' },

            // Video
            'MP4': { bytes: [0x00, 0x00, 0x00], check: (b) => b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70, mimeType: 'video/mp4', extension: '.mp4', category: 'video' },
            'AVI': { bytes: [0x52, 0x49, 0x46, 0x46], check: (b) => b[8] === 0x41 && b[9] === 0x56 && b[10] === 0x49 && b[11] === 0x20, mimeType: 'video/avi', extension: '.avi', category: 'video' },

            // Executables
            'EXE': { bytes: [0x4D, 0x5A], mimeType: 'application/x-msdownload', extension: '.exe', category: 'executable' },
        };

        for (const [name, sig] of Object.entries(signatures)) {
            let match = true;
            for (let i = 0; i < sig.bytes.length; i++) {
                if (bytes[i] !== sig.bytes[i]) {
                    match = false;
                    break;
                }
            }
            if (match && sig.check) {
                match = sig.check(bytes);
            }
            if (match) {
                return { name, ...sig };
            }
        }

        // Check if it's likely text
        let isText = true;
        const checkLength = Math.min(bytes.length, 512);
        for (let i = 0; i < checkLength; i++) {
            const byte = bytes[i];
            if (byte < 0x09 || (byte > 0x0D && byte < 0x20 && byte !== 0x1B)) {
                if (byte > 0x7E && byte < 0xC0) {
                    isText = false;
                    break;
                }
            }
        }

        if (isText) {
            return { name: 'Text', mimeType: 'text/plain', extension: '.txt', category: 'text' };
        }

        return { name: 'Binary Data', mimeType: 'application/octet-stream', extension: '.bin', category: 'binary' };
    }

    getFileIcon(category) {
        const icons = {
            'image': '🖼️',
            'document': '📄',
            'archive': '📦',
            'audio': '🎵',
            'video': '🎬',
            'executable': '⚙️',
            'text': '📝',
            'binary': '📁'
        };
        return icons[category] || '📄';
    }

    // ==================== Copy & Download ====================
    bindCopyButtons() {
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const textarea = document.getElementById(targetId);
                if (textarea && textarea.value) {
                    navigator.clipboard.writeText(textarea.value)
                        .then(() => this.showStatus('Copied to clipboard!', 'success'))
                        .catch(() => this.showStatus('Failed to copy', 'error'));
                }
            });
        });
    }

    bindDownloadButtons() {
        // Download encoded text
        document.querySelectorAll('.download-btn[data-content]').forEach(btn => {
            btn.addEventListener('click', () => {
                const contentId = btn.dataset.content;
                const filename = btn.dataset.filename;
                const content = document.getElementById(contentId).value;
                if (content) {
                    this.downloadText(content, filename);
                }
            });
        });

        // Download decoded image
        document.getElementById('download-image-btn').addEventListener('click', () => {
            if (this.decodedBlob) {
                this.downloadBlob(this.decodedBlob, this.decodedFilename);
            }
        });

        // Download decoded file
        document.getElementById('download-file-btn').addEventListener('click', () => {
            if (this.decodedBlob) {
                this.downloadBlob(this.decodedBlob, this.decodedFilename);
            }
        });
    }

    downloadText(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        this.downloadBlob(blob, filename);
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showStatus(`Downloaded: ${filename}`, 'success');
    }

    // ==================== LocalStorage Persistence ====================
    saveToLocalStorage() {
        // Save encode input and output
        const encodeInput = document.getElementById('encode-text');
        const encodeOutput = document.getElementById('encode-output');
        if (encodeInput && encodeOutput) {
            localStorage.setItem('b64util_encode_input', encodeInput.value || '');
        }
        // Save decode input and output
        const decodeInput = document.getElementById('decode-text');
        const decodeOutput = document.getElementById('decode-result-text');
        if (decodeInput && decodeOutput) {
            localStorage.setItem('b64util_decode_input', decodeInput.value || '');
        }
    }

    restoreFromLocalStorage() {
        // Restore encode input and output
        const encodeInput = document.getElementById('encode-text');
        const encodeOutput = document.getElementById('encode-output');
        if (encodeInput) {
            const lastInput = localStorage.getItem('b64util_encode_input') || '';
            encodeInput.value = lastInput;
            // If there is a last encode input, trigger encode automatically
            if (lastInput.trim()) {
                // Use setTimeout to ensure DOM is ready and event listeners are bound
                setTimeout(() => this.encode(), 0);
            }
        }
        // Restore decode input and output
        const decodeInput = document.getElementById('decode-text');
        const decodeOutput = document.getElementById('decode-result-text');
        if (decodeInput && decodeOutput) {
            const lastInput = localStorage.getItem('b64util_decode_input') || '';
            decodeInput.value = lastInput;
            // If there is a last decode input, trigger decode automatically
            if (lastInput.trim()) {
                // Use setTimeout to ensure DOM is ready and event listeners are bound
                setTimeout(() => this.decode(), 0);
            }
        }
    }

    attachLocalStorageListeners() {
        const encodeInput = document.getElementById('encode-text');
        const encodeOutput = document.getElementById('encode-output');
        const decodeInput = document.getElementById('decode-text');
        const decodeOutput = document.getElementById('decode-result-text');
        if (encodeInput) encodeInput.addEventListener('input', () => this.saveToLocalStorage());
        if (encodeOutput) encodeOutput.addEventListener('input', () => this.saveToLocalStorage());
        if (decodeInput) decodeInput.addEventListener('input', () => this.saveToLocalStorage());
        if (decodeOutput) decodeOutput.addEventListener('input', () => this.saveToLocalStorage());
    }

    // ==================== Utilities ====================
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showStatus(message, type) {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
        status.classList.remove('hidden');

        setTimeout(() => {
            status.classList.add('hidden');
        }, 3000);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new Base64Util();
});

// Set current year
if (document.getElementById('currentYear')) {
  document.getElementById('currentYear').textContent = new Date().getFullYear();
}

// Theme toggle logic with SVG icon only
const themeSwitchBtn = document.getElementById('theme-switch');
const themeIcon = document.getElementById('theme-icon');
function setTheme(dark) {
    if (dark) {
        document.documentElement.classList.add('dark-mode');
        themeIcon.innerHTML = `<svg class="sun-icon" viewBox="0 0 24 24"><path d="M12 7a5 5 0 100 10 5 5 0 000-10zM2 13h2a1 1 0 100-2H2a1 1 0 100 2zm18 0h2a1 1 0 100-2h-2a1 1 0 100 2zM11 2v2a1 1 0 102 0V2a1 1 0 10-2 0zm0 18v2a1 1 0 102 0v-2a1 1 0 10-2 0zM5.99 4.58a1 1 0 10-1.41 1.41l1.06 1.06a1 1 0 101.41-1.41L5.99 4.58zm12.37 12.37a1 1 0 10-1.41 1.41l1.06 1.06a1 1 0 101.41-1.41l-1.06-1.06zm1.06-10.96a1 1 0 10-1.41-1.41l-1.06 1.06a1 1 0 101.41 1.41l1.06-1.06zM7.05 18.36a1 1 0 10-1.41-1.41l-1.06 1.06a1 1 0 101.41 1.41l1.06-1.06z"></path></svg>`;
    } else {
        document.documentElement.classList.remove('dark-mode');
        themeIcon.innerHTML = `<svg class="moon-icon" viewBox="0 0 24 24"><path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"></path></svg>`;
    }
}
// Load theme from localStorage, default to dark mode
const savedTheme = localStorage.getItem('theme') === null ? 'dark' : localStorage.getItem('theme');
if (savedTheme === 'light') {
    setTheme(false);
} else {
    setTheme(true);
}
themeSwitchBtn.addEventListener('click', function() {
    const isDark = !document.documentElement.classList.contains('dark-mode');
    setTheme(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// On page load, check for last input value for decode
const lastDecodeInput = localStorage.getItem('lastDecodeInput');
if (lastDecodeInput) {
    const decodeInput = document.getElementById('decode-input');
    if (decodeInput) {
        decodeInput.value = lastDecodeInput;
        // Directly trigger decode function
        if (typeof Base64Util !== 'undefined' && Base64Util.decode) {
            Base64Util.decode();
        }
    }
}
