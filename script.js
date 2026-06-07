document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const linkInput = document.getElementById('linkInput');
    const generateBtn = document.getElementById('generateBtn');
    const qrWrapper = document.getElementById('qrWrapper');
    const qrcodeDiv = document.getElementById('qrcode');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadFormat = document.getElementById('downloadFormat');
    const clearBtn = document.getElementById('clearBtn');

    // Load the qrcode library once and reuse for both display and download
    let qrcodeLib = null;
    async function getLib() {
        if (!qrcodeLib) {
            const mod = await import('https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm');
            qrcodeLib = mod.default;
        }
        return qrcodeLib;
    }

    // Validate URL to prevent javascript: / data: injection
    function isSafeURL(input) {
        try {
            const url = new URL(input);
            return url.protocol === 'https:' || url.protocol === 'http:';
        } catch (_) {
            return false;
        }
    }

    async function generateQRCode(url) {
        const lib = await getLib();

        // Clear previous
        qrcodeDiv.innerHTML = '';

        // Create a canvas and draw QR code directly onto it
        const canvas = document.createElement('canvas');
        qrcodeDiv.appendChild(canvas);

        lib.toCanvas(canvas, url, {
            width: 200,
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' }
        }, (err) => {
            if (err) {
                console.error('QR generation error:', err);
                return;
            }
            qrWrapper.classList.remove('hidden');
        });
    }

    // Generate QR Code from Link
    generateBtn.addEventListener('click', async () => {
        const url = linkInput.value.trim();
        if (!url) {
            alert('Please enter a valid URL.');
            return;
        }
        if (!isSafeURL(url)) {
            alert('Please enter a valid http:// or https:// URL.');
            return;
        }
        generateBtn.textContent = 'Generating...';
        await generateQRCode(url);
        generateBtn.textContent = 'Generate QR';
    });

    // Allow pressing Enter to generate
    linkInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') generateBtn.click();
    });

    // Clear QR code
    clearBtn.addEventListener('click', () => {
        qrcodeDiv.innerHTML = '';
        qrWrapper.classList.add('hidden');
        linkInput.value = '';
        linkInput.focus();
    });

    // Download Logic
    downloadBtn.addEventListener('click', async () => {
        const url = linkInput.value.trim();
        if (!url) return;

        const lib = await getLib();
        const format = downloadFormat.value;

        if (format === 'png') {
            lib.toDataURL(url, {
                width: 1000,
                margin: 2,
                color: { dark: '#000000ff', light: '#ffffffff' }
            }, (err, dataUrl) => {
                if (err) return console.error(err);
                const link = document.createElement('a');
                link.download = 'qrcode.png';
                link.href = dataUrl;
                link.click();
            });
        } else if (format === 'svg') {
            lib.toString(url, {
                type: 'svg',
                width: 1000,
                margin: 2,
                color: { dark: '#000000ff', light: '#ffffffff' }
            }, (err, string) => {
                if (err) return console.error(err);
                const blob = new Blob([string], { type: 'image/svg+xml;charset=utf-8' });
                const svgUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = 'qrcode.svg';
                link.href = svgUrl;
                link.click();
                URL.revokeObjectURL(svgUrl);
            });
        }
    });
});
