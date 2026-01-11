const selectBtn = document.getElementById('selectBtn');
const runBtn = document.getElementById('runBtn');
const fileNameEl = document.getElementById('fileName');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');
const winInput = document.getElementById('win');
const stepInput = document.getElementById('step');

let selectedFile = null;

selectBtn.addEventListener('click', async () => {
  const p = await window.api.selectFile();
  if (p) {
    selectedFile = p;
    fileNameEl.textContent = p;
    runBtn.disabled = false;
  }
});

runBtn.addEventListener('click', async () => {
  if (!selectedFile) return;
  statusEl.textContent = 'Analyzing...';
  resultEl.textContent = '';
  runBtn.disabled = true;
  try {
    const windowSec = Number(winInput.value) || 30;
    const stepSec = Number(stepInput.value) || 10;
    const res = await window.api.processAndUpload(selectedFile, { windowSec, stepSec });
    if (res.success) {
      statusEl.textContent = 'Upload succeeded';
      resultEl.innerHTML = `CloudFront URL: <a href="${res.url}" target="_blank">${res.url}</a>`;
    } else {
      statusEl.textContent = 'Failed in upload to S3';
      resultEl.textContent = res.error || 'Unknown error';
    }
  } catch (err) {
    statusEl.textContent = 'Error';
    resultEl.textContent = err.message || String(err);
  } finally {
    runBtn.disabled = false;
  }
});
