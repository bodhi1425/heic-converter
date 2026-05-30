import './style.css';
import JSZip from 'jszip';

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;

const fileInput = $<HTMLInputElement>('#fileInput');
const dropzone = $('#dropzone');
const panel = $('#panel');
const fileListEl = $('#fileList');
const formatSeg = $('#format');
const convertBtn = $<HTMLButtonElement>('#convertBtn');
const statusEl = $('#status');
const resultEl = $('#result');

let files: File[] = [];
let outType: 'image/jpeg' | 'image/png' = 'image/jpeg';

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

function fmt(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function setStatus(msg: string, kind: 'ok' | 'err' | '' = '') {
  statusEl.textContent = msg;
  statusEl.className = 'statusline' + (kind ? ' ' + kind : '');
}

const isHeicName = (f: File) =>
  /\.(heic|heif)$/i.test(f.name) || f.type === 'image/heic' || f.type === 'image/heif';

function renderFileList() {
  fileListEl.innerHTML = files
    .map(
      (f, i) =>
        `<div class="hc-row"><span class="idx mono">${String(i + 1).padStart(2, '0')}</span>` +
        `<span class="hc-name" title="${f.name}">${f.name}</span>` +
        `<span class="size mono">${fmt(f.size)}</span></div>`,
    )
    .join('');
}

function addFiles(incoming: File[]) {
  const heics = incoming.filter(isHeicName);
  if (!heics.length) {
    setStatus('请选择 HEIC / HEIF 图片(iPhone 照片)', 'err');
    return;
  }
  files = files.concat(heics);
  (panel as HTMLElement).hidden = false;
  renderFileList();
  convertBtn.disabled = false;
  resultEl.classList.remove('show');
  resultEl.innerHTML = '';
  setStatus(`${files.length} 个文件待转换 · 选格式后点「开始转换」`);
}

// ---------- 上传:点击 + 拖拽 ----------
fileInput.addEventListener('change', () => {
  if (fileInput.files) addFiles(Array.from(fileInput.files));
  fileInput.value = '';
});
(['dragenter', 'dragover'] as const).forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.add('drag');
  }),
);
(['dragleave', 'drop'] as const).forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    if (ev === 'dragleave' && dropzone.contains((e as DragEvent).relatedTarget as Node)) return;
    dropzone.classList.remove('drag');
  }),
);
dropzone.addEventListener('drop', (e) => {
  const fs = (e as DragEvent).dataTransfer?.files;
  if (fs) addFiles(Array.from(fs));
});

// ---------- 格式选择 ----------
formatSeg.querySelectorAll('button').forEach((b) => {
  b.addEventListener('click', () => {
    formatSeg.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', 'true');
    outType = (b as HTMLElement).dataset.fmt as 'image/jpeg' | 'image/png';
  });
});

// ---------- 转换 ----------
convertBtn.addEventListener('click', async () => {
  if (!files.length) return;
  convertBtn.disabled = true;
  resultEl.classList.remove('show');
  resultEl.innerHTML = '';
  const ext = outType === 'image/png' ? 'png' : 'jpg';
  const results: { name: string; blob: Blob; url: string }[] = [];
  try {
    setStatus('正在加载转换引擎(首次约需几秒)…');
    const { heicTo } = await import('heic-to'); // 懒加载:WASM 引擎仅在转换时下载
    for (let i = 0; i < files.length; i++) {
      setStatus(`正在本地转换 ${i + 1}/${files.length}…`);
      const blob = (await heicTo({ blob: files[i], type: outType, quality: 0.92 })) as Blob;
      const name = files[i].name.replace(/\.[^.]+$/, '') + '.' + ext;
      results.push({ name, blob, url: URL.createObjectURL(blob) });
    }
    setStatus(`转换完成 · ${results.length} 个文件`, 'ok');
    renderResults(results, ext);
  } catch (e) {
    setStatus((e as Error).message || '转换失败,请确认文件是 HEIC/HEIF', 'err');
  } finally {
    convertBtn.disabled = false;
  }
});

function renderResults(results: { name: string; blob: Blob; url: string }[], ext: string) {
  const rows = results
    .map(
      (r) =>
        `<div class="hc-result-row"><span class="hc-name" title="${r.name}">${r.name}</span>` +
        `<span class="size mono">${fmt(r.blob.size)}</span>` +
        `<a class="btn btn-ghost btn-sm" href="${r.url}" download="${r.name}">下载</a></div>`,
    )
    .join('');
  const zipBtn =
    results.length > 1
      ? `<button class="btn btn-primary" id="zipBtn" style="margin-top:14px">打包下载全部 (${results.length})</button>`
      : '';
  resultEl.innerHTML = `<div class="hc-results">${rows}</div>${zipBtn}`;
  resultEl.classList.add('show');
  if (results.length > 1) {
    $<HTMLButtonElement>('#zipBtn').addEventListener('click', async () => {
      const zip = new JSZip();
      results.forEach((r) => zip.file(r.name, r.blob));
      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `heic-converted-${ext}.zip`;
      a.click();
    });
  }
}
