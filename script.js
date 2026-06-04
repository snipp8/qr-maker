document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const linkInput = document.getElementById('linkInput');
    const generateBtn = document.getElementById('generateBtn');
    const qrWrapper = document.getElementById('qrWrapper');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const qrcodeDiv = document.getElementById('qrcode');
    
    const fileInputDisplay = document.getElementById('fileInputDisplay');
    const openModalBtn = document.getElementById('openModalBtn');
    
    const uploadModal = document.getElementById('uploadModal');
    const closeBtn = document.querySelector('.close-btn');
    const dropZone = document.getElementById('dropZone');
    const dropZoneText = document.getElementById('dropZoneText');
    const browseBtn = document.getElementById('browseBtn');
    const actualFileInput = document.getElementById('actualFileInput');
    
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadFormat = document.getElementById('downloadFormat');

    // Reference to Firebase storage (initialized in firebase.js)
    const storage = firebase.storage();

    let qrcode = null;

    function generateQRCode(url) {
        // Clear previous QR code
        qrcodeDiv.innerHTML = '';
        qrWrapper.classList.remove('hidden');

        qrcode = new QRCode(qrcodeDiv, {
            text: url,
            width: 200,
            height: 200,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    }

    // Generate QR Code from Link
    generateBtn.addEventListener('click', () => {
        const url = linkInput.value.trim();
        if (!url) {
            alert('Please enter a valid URL.');
            return;
        }
        generateQRCode(url);
    });

    // Download Logic
    downloadBtn.addEventListener('click', async () => {
        const url = linkInput.value.trim();
        if (!url) return;
        
        const format = downloadFormat.value;
        
        // Dynamically import the advanced qrcode library for downloads
        const QRCodeModule = await import('https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm');
        const qrcodeLib = QRCodeModule.default;
        
        if (format === 'png') {
            qrcodeLib.toDataURL(url, {
                width: 1000,
                margin: 2,
                color: { dark: '#000000ff', light: '#ffffffff' }
            }, function (err, dataUrl) {
                if (err) return console.error(err);
                const link = document.createElement('a');
                link.download = 'qrcode.png';
                link.href = dataUrl;
                link.click();
            });
        } else if (format === 'svg') {
            qrcodeLib.toString(url, {
                type: 'svg',
                width: 1000,
                margin: 2,
                color: { dark: '#000000ff', light: '#ffffffff' }
            }, function (err, string) {
                if (err) return console.error(err);
                const blob = new Blob([string], {type: 'image/svg+xml;charset=utf-8'});
                const svgUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = 'qrcode.svg';
                link.href = svgUrl;
                link.click();
                URL.revokeObjectURL(svgUrl);
            });
        }
    });

    // Modal Logic
    openModalBtn.addEventListener('click', () => {
        uploadModal.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', closeModal);
    
    // Close on outside click
    uploadModal.addEventListener('click', (e) => {
        if (e.target === uploadModal) {
            closeModal();
        }
    });

    function closeModal() {
        uploadModal.classList.add('hidden');
    }

    // Browse file button logic
    browseBtn.addEventListener('click', () => {
        actualFileInput.click();
    });

    actualFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    });

    // Drag and Drop Logic
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    });

    async function handleFiles(files) {
        const file = files[0];
        if (file) {
            fileInputDisplay.value = file.name;
            
            // Show upload state
            const originalText = dropZoneText.innerText;
            dropZoneText.innerText = "Uploading to Firebase...";
            browseBtn.disabled = true;

            try {
                // Upload to Firebase Storage
                const storageRef = storage.ref();
                const fileRef = storageRef.child('uploads/' + Date.now() + '_' + file.name);
                const snapshot = await fileRef.put(file);
                
                // Get the public download URL
                const downloadURL = await snapshot.ref.getDownloadURL();
                
                // Update link input so user sees where the QR points
                linkInput.value = downloadURL;
                
                // Generate QR
                generateQRCode(downloadURL);
                
                closeModal();
            } catch (error) {
                console.error("Upload failed:", error);
                alert("Upload failed. Make sure your Firebase Storage rules allow public reads/writes (Test Mode).");
            } finally {
                // Restore state
                dropZoneText.innerText = originalText;
                browseBtn.disabled = false;
            }
        }
    }
});
