/* STORAGE & MODEL */
const STORAGE_KEY = 'portfolio_builder_final_v3';
const root = document.getElementById('root');
const app = document.getElementById('app');
const pageOverlay = document.getElementById('pageOverlay');
const pageCard = document.getElementById('pageCard');

const emptyModel = {
  profile: {
    name:'', desc:'', email:'', phone:'', github:'', linkedin:'', instagram:'', tiktok:'', x:'', photo:''
  },
  skills: [],
  projects: []
};

const emptyProject = {title:'',desc:'',demo:'',github:'',image:'',fileType:'',fileName:''};

function saveModel(m){ localStorage.setItem(STORAGE_KEY, JSON.stringify(m)); }
function loadModel(){ try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; }catch(e){return null;} }
function clearModel(){ localStorage.removeItem(STORAGE_KEY); }

// Check if in shared mode
const urlParams = new URLSearchParams(window.location.search);
const isShared = urlParams.has('shared');
let sharedData = null;

if (isShared) {
  try {
    const encoded = urlParams.get('shared');
    const decoded = atob(encoded);
    sharedData = JSON.parse(decoded);
  } catch (e) {
    console.error('Invalid shared data:', e);
  }
}

/* HELPERS */
function esc(s){ return String(s||''); }
function initialsSVG(name,w=400,h=400){
  const initials = (name||'').split(' ').map(x=>x[0]).filter(Boolean).slice(0,2).join('').toUpperCase() || '--';
  const bg = '#1e293b', txt = '#fff';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' fill='${txt}' font-family='Poppins' font-size='120' text-anchor='middle' dominant-baseline='central'>${initials}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
function placeholderProject(title){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='600'><rect width='100%' height='100%' fill='%232b2b56'/><text x='50%' y='50%' fill='%23fff' font-family='Poppins' font-size='32' text-anchor='middle' dominant-baseline='central'>${esc(title||'Project')}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/* RENDER */
function renderUI(){
  const model = isShared ? sharedData : (loadModel() || emptyModel);
  setTheme('portfolio');

  document.getElementById('titleName').textContent = model.profile.name || '';
  document.getElementById('titleRole').textContent = model.profile.name ? 'Web Basic Developer — Portfolio' : '';

  document.getElementById('heroGreeting').innerHTML = model.profile.name ? `Halo, <strong>${esc(model.profile.name)}</strong>` : 'Halo! Silakan isi profil Anda.';
  document.getElementById('heroDesc').textContent = model.profile.desc || '';

  document.getElementById('aboutText').textContent = model.profile.desc || '';

  // skills animated
  const skillsWrap = document.getElementById('skillsWrap');
  skillsWrap.innerHTML = '';
  (model.skills || []).forEach((s,i)=> {
    const d = document.createElement('div'); d.className='skill'; d.textContent = s;
    d.style.opacity=0; d.style.transform='translateY(8px)'; skillsWrap.appendChild(d);
    setTimeout(()=>{ d.style.opacity=1; d.style.transform='translateY(0)'; }, 120 + i*80);
  });

  // avatar & logo
  const avatar = document.getElementById('avatarImg');
  const logo = document.getElementById('logoImg');
  const photo = model.profile.photo || '';
  const name = model.profile.name || '';
  avatar.src = photo || initialsSVG(name);
  logo.src = photo || initialsSVG(name,200,200);

  document.getElementById('nameShort').textContent = model.profile.name || '';
  document.getElementById('roleShort').textContent = model.profile.desc || '';

  // contact chips
  document.getElementById('emailChip').textContent = model.profile.email || '';
  document.getElementById('githubChip').textContent = model.profile.github ? ('GitHub: ' + model.profile.github) : 'GitHub: -';
  document.getElementById('linkedinChip').textContent = model.profile.linkedin || '';

  // socials in profile & contact area (monochrome white icons)
  renderSocials(model);

  // projects grid
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '';
  (model.projects || []).forEach((p, idx)=>{
    const card = document.createElement('article'); card.className='project';
    const media = p.image ? `<img src="${p.image}" alt="${esc(p.title)}">` : p.file ? `<div style="width:100%;height:140px;background:#f0f0f0;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:10px;"><div style="font-size:14px;margin-bottom:5px;">File: ${esc(p.fileName)}</div><a href="${p.file}" download="${esc(p.fileName)}" class="chip" style="background:#007bff;color:#fff;">Download</a></div>` : `<img src="${placeholderProject(p.title)}" alt="${esc(p.title)}">`;
    const editButtons = isShared ? '' : `<button class="chip" data-idx="${idx}" onclick="onEditProject(event)">Edit</button><button class="chip" data-idx="${idx}" onclick="onDeleteProject(event)">Hapus</button>`;
    card.innerHTML = `
      ${media}
      <h4>${esc(p.title)}</h4>
      <p class="small-muted">${esc(p.desc)}</p>
      <div class="links">
        <a class="chip" href="${p.demo || '#'}" target="_blank">Demo</a>
        <a class="chip" href="${p.github || '#'}" target="_blank">GitHub</a>
        ${editButtons}
      </div>
    `;
    grid.appendChild(card);
  });

  // reveal
  document.querySelectorAll('.reveal').forEach((el,i)=>setTimeout(()=>el.classList.add('show'), 120 + i*80));

  // Hide controls in shared mode
  if (isShared) {
    document.querySelector('.controls').style.display = 'none';
  }
}

/* Social icons (monochrome white SVGs) */
function renderSocials(model){
  const wrap1 = document.getElementById('socialsWrap');
  const wrap2 = document.getElementById('socialsContact');
  wrap1.innerHTML = ''; wrap2.innerHTML = '';
  const socials = [
    {key:'github', url:model.profile.github, svg:ICON_GIT},
    {key:'linkedin', url:model.profile.linkedin, svg:ICON_LINKEDIN},
    {key:'instagram', url:model.profile.instagram, svg:ICON_INSTAGRAM},
    {key:'tiktok', url:model.profile.tiktok, svg:ICON_TIKTOK},
    {key:'x', url:model.profile.x, svg:ICON_X},
    {key:'wa', url: model.profile.phone ? ('https://wa.me/' + model.profile.phone.replace(/[^0-9]/g,'')) : '', svg:ICON_WA}
  ];
  socials.forEach(s=>{
    const el = document.createElement('a'); el.href = s.url || '#'; el.target = '_blank';
    el.title = s.key;
    el.innerHTML = s.svg;
    wrap1.appendChild(el);
    const el2 = el.cloneNode(true);
    wrap2.appendChild(el2);
  });
}

/* THEMES */
function setTheme(name){
  const map = {portfolio:'theme-portfolio', profile:'theme-profile', project:'theme-project'};
  document.documentElement.classList.remove('theme-portfolio','theme-profile','theme-project');
  root.classList.remove('theme-portfolio','theme-profile','theme-project');
  root.classList.add(map[name]);
}

/* OVERLAYS */
function openEditProfile(){
  setTheme('profile');
  const m = loadModel() || JSON.parse(JSON.stringify(emptyModel));
  pageCard.innerHTML = `
    <div class="page-title">
      <h3>Edit Profil</h3>
      <div><button class="btn ghost" id="closePage">Tutup</button></div>
    </div>
    <div style="display:flex;gap:16px;flex-wrap:wrap">
      <div style="flex:1;min-width:260px">
        <div class="field"><label class="small-muted">Nama</label><input id="pfName" type="text" value="${esc(m.profile.name)}"></div>
        <div class="field"><label class="small-muted">Deskripsi singkat</label><textarea id="pfDesc">${esc(m.profile.desc)}</textarea></div>
        <div class="field"><label class="small-muted">Email</label><input id="pfEmail" type="email" value="${esc(m.profile.email)}"></div>
        <div class="field"><label class="small-muted">Nomor WA (international, tanpa +)</label><input id="pfPhone" type="text" placeholder="6281234567890" value="${esc(m.profile.phone)}"></div>
        <div class="field"><label class="small-muted">GitHub (url)</label><input id="pfGit" type="text" value="${esc(m.profile.github)}"></div>
        <div class="field"><label class="small-muted">LinkedIn (url)</label><input id="pfLinked" type="text" value="${esc(m.profile.linkedin)}"></div>
        <div class="field"><label class="small-muted">Instagram (url)</label><input id="pfInsta" type="text" value="${esc(m.profile.instagram)}"></div>
        <div class="field"><label class="small-muted">TikTok (url)</label><input id="pfTiktok" type="text" value="${esc(m.profile.tiktok)}"></div>
        <div class="field"><label class="small-muted">X / Twitter (url)</label><input id="pfX" type="text" value="${esc(m.profile.x)}"></div>
        <div class="field"><label class="small-muted">Skills (pisah dengan koma)</label><input id="pfSkills" type="text" placeholder="HTML, CSS, JavaScript" value="${(m.skills||[]).join(', ')}"></div>
      </div>
      <div style="width:260px">
        <div style="margin-bottom:8px"><label class="small-muted">Foto Profil</label></div>
        <div style="width:220px;height:220px;border-radius:16px;overflow:hidden;background:#fff;display:flex;align-items:center;justify-content:center;margin-bottom:10px">
          <img id="pfPreview" src="${m.profile.photo || initialsSVG(m.profile.name)}" style="width:100%;height:100%;object-fit:cover">
        </div>
        <input id="pfFile" type="file" accept="image/*">
        <p class="small-muted" style="margin-top:8px">Foto disimpan di browser (localStorage). Disarankan ukuran &lt; 500KB.</p>
      </div>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:12px">
      <button class="btn primary" id="saveProfileBtn">Simpan Profil</button>
      <button class="btn ghost" id="cancelProfileBtn">Batal</button>
    </div>
  `;
  pageOverlay.style.display='flex';
  pageOverlay.classList.add('theme-profile');

  document.getElementById('closePage').onclick = () => closeOverlayAndRender();
  document.getElementById('cancelProfileBtn').onclick = () => closeOverlayAndRender();

  document.getElementById('pfFile').addEventListener('change', e=>{
    const f = e.target.files && e.target.files[0];
    if(!f) return;
    const r = new FileReader();
    r.onload = ev => document.getElementById('pfPreview').src = ev.target.result;
    r.readAsDataURL(f);
  });

  document.getElementById('saveProfileBtn').addEventListener('click', ()=>{
    const modelNow = loadModel() || JSON.parse(JSON.stringify(emptyModel));
    modelNow.profile.name = document.getElementById('pfName').value.trim();
    modelNow.profile.desc = document.getElementById('pfDesc').value.trim();
    modelNow.profile.email = document.getElementById('pfEmail').value.trim();
    modelNow.profile.phone = document.getElementById('pfPhone').value.trim();
    modelNow.profile.github = document.getElementById('pfGit').value.trim();
    modelNow.profile.linkedin = document.getElementById('pfLinked').value.trim();
    modelNow.profile.instagram = document.getElementById('pfInsta').value.trim();
    modelNow.profile.tiktok = document.getElementById('pfTiktok').value.trim();
    modelNow.profile.x = document.getElementById('pfX').value.trim();
    modelNow.skills = (document.getElementById('pfSkills').value || '').split(',').map(s=>s.trim()).filter(Boolean);
    modelNow.profile.photo = document.getElementById('pfPreview').src || '';
    saveModel(modelNow);
    closeOverlayAndRender();
  });
}

function openAddProject(existing=null, idx=null){
  setTheme('project');
  const item = existing || emptyProject;
  pageCard.innerHTML = `
    <div class="page-title">
      <h3>${existing ? 'Edit Proyek' : 'Tambah Proyek'}</h3>
      <div><button class="btn ghost" id="closePage2">Tutup</button></div>
    </div>
    <div style="display:flex;gap:16px;flex-wrap:wrap">
      <div style="flex:1;min-width:240px">
        <div class="field"><label class="small-muted">Judul Proyek</label><input id="pTitle" type="text" value="${esc(item.title)}"></div>
        <div class="field"><label class="small-muted">Deskripsi</label><textarea id="pDesc">${esc(item.desc)}</textarea></div>
        <div class="field"><label class="small-muted">Link Demo (opsional)</label><input id="pDemo" type="text" value="${esc(item.demo)}"></div>
        <div class="field"><label class="small-muted">Link GitHub (opsional)</label><input id="pGit" type="text" value="${esc(item.github)}"></div>
      </div>
      <div style="width:260px">
        <div style="margin-bottom:8px"><label class="small-muted">Media Proyek (gambar atau file)</label></div>
        <div id="pPreviewContainer" style="width:220px;height:140px;border-radius:10px;overflow:hidden;background:#fff;display:flex;align-items:center;justify-content:center;margin-bottom:10px">
          ${item.image ? `<img id="pPreview" src="${item.image}" style="width:100%;height:100%;object-fit:cover">` : item.file ? `<div style="text-align:center"><div>File: ${esc(item.fileName)}</div><a href="${item.file}" download="${esc(item.fileName)}" style="color:#007bff">Download</a></div>` : `<img src="${placeholderProject(item.title)}" style="width:100%;height:100%;object-fit:cover">`}
        </div>
        <input id="pFile" type="file">
        <p class="small-muted">File disimpan di browser (localStorage). Disarankan ukuran < 500KB.</p>
      </div>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:12px">
      <button class="btn primary" id="saveProjectBtn">${existing ? 'Simpan Perubahan' : 'Tambah Proyek'}</button>
      <button class="btn ghost" id="cancelProjectBtn">Batal</button>
    </div>
  `;
  pageOverlay.style.display='flex';
  pageOverlay.classList.add('theme-project');

  document.getElementById('closePage2').onclick = () => closeOverlayAndRender();
  document.getElementById('cancelProjectBtn').onclick = () => closeOverlayAndRender();

  document.getElementById('pFile').addEventListener('change', e=>{
    const f = e.target.files && e.target.files[0];
    if(!f) return;
    const r = new FileReader();
    r.onload = ev => {
      const container = document.getElementById('pPreviewContainer');
      if(f.type.startsWith('image/')){
        container.innerHTML = `<img id="pPreview" src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover">`;
      } else {
        container.innerHTML = `<div style="text-align:center"><div>File: ${esc(f.name)}</div><a href="${ev.target.result}" download="${esc(f.name)}" style="color:#007bff">Download</a></div>`;
      }
    };
    r.readAsDataURL(f);
  });

  document.getElementById('saveProjectBtn').addEventListener('click', ()=>{
    const modelNow = loadModel() || JSON.parse(JSON.stringify(emptyModel));
    const container = document.getElementById('pPreviewContainer');
    const img = container.querySelector('img');
    const link = container.querySelector('a');
    const newItem = {
      title: document.getElementById('pTitle').value.trim() || 'Untitled',
      desc: document.getElementById('pDesc').value.trim(),
      demo: document.getElementById('pDemo').value.trim(),
      github: document.getElementById('pGit').value.trim(),
      image: img && img.id === 'pPreview' ? img.src : '',
      file: link ? link.href : '',
      fileType: link ? link.download.split('.').pop() : '',
      fileName: link ? link.download : ''
    };
    if(idx !== null && idx >= 0) modelNow.projects[idx] = newItem;
    else modelNow.projects.unshift(newItem);
    saveModel(modelNow);
    closeOverlayAndRender();
    location.hash = '#projects';
  });
}

function closeOverlayAndRender(){
  pageOverlay.style.display='none';
  pageOverlay.classList.remove('theme-profile','theme-project');
  renderUI();
}

/* edit/delete */
function onEditProject(ev){
  const idx = Number(ev.currentTarget.dataset.idx);
  const model = loadModel() || emptyModel;
  openAddProject(model.projects[idx], idx);
}
function onDeleteProject(ev){
  const idx = Number(ev.currentTarget.dataset.idx);
  if(!confirm('Hapus proyek ini?')) return;
  const model = loadModel() || emptyModel;
  model.projects.splice(idx,1);
  saveModel(model);
  renderUI();
}

/* import/export/reset */
document.getElementById('btnExport').addEventListener('click', ()=>{
  const model = loadModel() || emptyModel;
  const blob = new Blob([JSON.stringify(model, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'portfolio-data.json'; a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('btnImport').addEventListener('click', ()=>{
  pageCard.innerHTML = `
    <div class="page-title"><h3>Import Data JSON</h3><div><button class="btn ghost" id="cancelImport">Batal</button></div></div>
    <div>
      <p class="small-muted">Pilih file JSON hasil export untuk memuat profil & proyek. Data yang ada akan diganti.</p>
      <input id="importFile" type="file" accept="application/json" style="margin-top:10px">
      <div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn primary" id="doImport">Import</button></div>
    </div>
  `;
  pageOverlay.style.display='flex';
  pageOverlay.classList.add('theme-profile');
  document.getElementById('cancelImport').onclick = ()=>{ pageOverlay.style.display='none'; renderUI(); };
  document.getElementById('doImport').onclick = ()=>{
    const f = document.getElementById('importFile').files && document.getElementById('importFile').files[0];
    if(!f){ alert('Pilih file JSON terlebih dahulu.'); return; }
    const r = new FileReader();
    r.onload = ev => {
      try{ const parsed = JSON.parse(ev.target.result); saveModel(parsed); pageOverlay.style.display='none'; renderUI(); alert('Import sukses.'); }
      catch(e){ alert('File JSON tidak valid.'); }
    };
    r.readAsText(f);
  };
});

document.getElementById('btnReset').addEventListener('click', ()=>{
  if(confirm('Reset semua data? (tidak bisa dibatalkan)')){ clearModel(); setTimeout(()=>initialize(true),100); }
});

/* CONTACT via WhatsApp */
document.getElementById('contactSend').addEventListener('click', ()=>{
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMessage').value.trim();
  if(!name || !email || !message){ alert('Isi semua field (Nama, Email, Pesan).'); return; }

  const model = loadModel() || emptyModel;
  const phone = (model.profile && model.profile.phone) ? model.profile.phone.trim() : '';
  if(!phone){ alert('Nomor WA belum diisi di Edit Profil. Silakan isi (format internasional, contoh 6281234567890).'); openEditProfile(); return; }
  const digits = phone.replace(/[^0-9]/g,'');
  if(!digits){ alert('Nomor WA tidak valid. Periksa kembali.'); openEditProfile(); return; }

  const base = 'Halo, saya tertarik dengan portfolio Anda di website ini.';
  const extra = ` Nama: ${name} | Email: ${email} | Pesan: ${message}`;
  const text = encodeURIComponent(base + extra);
  const url = `https://wa.me/${digits}?text=${text}`;
  window.open(url,'_blank');
});

document.getElementById('contactClear').addEventListener('click', ()=>{
  document.getElementById('contactName').value=''; document.getElementById('contactEmail').value=''; document.getElementById('contactMessage').value='';
});

/* typing */
const roles = ['Student'];
let ri=0, ci=0, fwd=true;
const typedEl = document.getElementById('typed');
function typeLoop(){
  const w = roles[ri];
  if(fwd){ ci++; typedEl.textContent = w.slice(0,ci); if(ci===w.length){ fwd=false; setTimeout(typeLoop,1000); return; } }
  else { ci--; typedEl.textContent = w.slice(0,ci); if(ci===0){ fwd=true; ri=(ri+1)%roles.length; } }
  setTimeout(typeLoop, fwd?90:40);
}
typeLoop();

/* progress bar */
function updateProgress(){ const h = document.documentElement.scrollHeight - window.innerHeight; const sc = window.scrollY; const pct = h>0 ? (sc/h)*100 : 0; document.getElementById('progress').style.width = pct + '%'; }
window.addEventListener('scroll', updateProgress); window.addEventListener('resize', updateProgress); updateProgress();

/* overlay backdrop close */
pageOverlay.addEventListener('click', e=>{ if(e.target===pageOverlay){ pageOverlay.style.display='none'; pageOverlay.classList.remove('theme-profile','theme-project'); renderUI(); } });

/* init & bindings */
function initialize(forceShow=false){
  const model = loadModel();
  root.classList.add('theme-portfolio');
  if(!model || forceShow){ saveModel(JSON.parse(JSON.stringify(emptyModel))); openEditProfile(); }
  else renderUI();
}


document.getElementById('openEditProfile').addEventListener('click', openEditProfile);
document.getElementById('openAddProject').addEventListener('click', ()=>openAddProject());
document.getElementById('btnDownloadCV').addEventListener('click', downloadCV);
document.getElementById('btnShare').addEventListener('click', sharePortfolio);
window.onEditProject = onEditProject; window.onDeleteProject = onDeleteProject;
document.addEventListener('DOMContentLoaded', ()=> initialize());

/* Share Portfolio */
function sharePortfolio(){
  const model = loadModel() || emptyModel;
  if(!model.profile.name){ alert('Isi nama Anda terlebih dahulu di Edit Profil.'); openEditProfile(); return; }

  const jsonStr = JSON.stringify(model);
  const encoded = btoa(jsonStr);
  const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${encoded}`;

  // Copy to clipboard
  navigator.clipboard.writeText(shareUrl).then(()=>{
    alert('Link portofolio berhasil disalin! Bagikan link ini kepada orang lain.');
  }).catch(err=>{
    console.error('Failed to copy:', err);
    // Fallback: show URL in prompt
    prompt('Salin link portofolio ini:', shareUrl);
  });
}

/* Download CV */
function downloadCV(){
  const model = loadModel() || emptyModel;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 1400;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 800, 1400);
  gradient.addColorStop(0, '#1e293b');
  gradient.addColorStop(0.5, '#334155');
  gradient.addColorStop(1, '#0f172a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 1400);

  // Border
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 8;
  ctx.strokeRect(15, 15, 770, 1370);

  // Header section with avatar
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(50, 50, 700, 200);

  // Avatar
  const avatarImg = new Image();
  avatarImg.crossOrigin = 'anonymous';
  avatarImg.onload = () => {
    // Draw avatar circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(150, 150, 60, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, 90, 90, 120, 120);
    ctx.restore();

    // Avatar border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(150, 150, 60, 0, Math.PI * 2);
    ctx.stroke();

    // Name and title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(model.profile.name || 'Nama Lengkap', 250, 120);

    ctx.font = '20px Arial';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Web Developer', 250, 150);

    // Contact info in header
    ctx.font = '16px Arial';
    ctx.fillStyle = '#475569';
    let contactY = 180;
    if (model.profile.email) {
      ctx.fillText(`📧 ${model.profile.email}`, 250, contactY);
      contactY += 20;
    }
    if (model.profile.phone) {
      ctx.fillText(`📱 ${model.profile.phone}`, 250, contactY);
      contactY += 20;
    }

    // Main content
    let y = 300;

    // About section
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('About Me', 50, y);
    y += 10;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, y);
    ctx.lineTo(750, y);
    ctx.stroke();
    y += 30;

    ctx.font = '18px Arial';
    ctx.fillStyle = '#e2e8f0';
    const aboutText = model.profile.desc || 'Deskripsi singkat tentang diri Anda.';
    const aboutLines = wrapText(ctx, aboutText, 700, 18);
    aboutLines.forEach(line => {
      ctx.fillText(line, 50, y);
      y += 25;
    });
    y += 30;

    // Skills section
    if (model.skills && model.skills.length > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Skills', 50, y);
      y += 10;
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(750, y);
      ctx.stroke();
      y += 30;

      ctx.font = '16px Arial';
      ctx.fillStyle = '#cbd5e1';
      model.skills.forEach(skill => {
        ctx.fillText(`• ${skill}`, 70, y);
        y += 25;
      });
      y += 20;
    }

    // Projects section
    if (model.projects && model.projects.length > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Projects', 50, y);
      y += 10;
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(750, y);
      ctx.stroke();
      y += 30;

      ctx.font = '18px Arial';
      ctx.fillStyle = '#e2e8f0';
      model.projects.forEach((p, idx) => {
        if (y > 1300) return; // Limit to canvas height
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${idx + 1}. ${p.title}`, 50, y);
        y += 25;
        ctx.font = '16px Arial';
        ctx.fillStyle = '#cbd5e1';
        const descLines = wrapText(ctx, p.desc || 'Deskripsi proyek.', 650, 16);
        descLines.forEach(line => {
          ctx.fillText(line, 70, y);
          y += 20;
        });
        if (p.demo) {
          ctx.fillText(`Demo: ${p.demo}`, 70, y);
          y += 20;
        }
        if (p.github) {
          ctx.fillText(`GitHub: ${p.github}`, 70, y);
          y += 20;
        }
        y += 15;
      });
    }

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Generated by PortopolioKu', 400, 1380);

    // Convert to PNG and download
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${model.profile.name || 'CV'}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // Fallback if no avatar
  avatarImg.onerror = () => {
    // Draw default avatar circle with initials
    ctx.save();
    ctx.beginPath();
    ctx.arc(150, 150, 60, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    const initials = (model.profile.name || 'N').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    ctx.fillText(initials, 150, 160);

    // Avatar border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(150, 150, 60, 0, Math.PI * 2);
    ctx.stroke();

    // Continue with the rest of the CV generation
    continueCVGeneration();
  };

  // Set avatar source
  const photo = model.profile.photo || initialsSVG(model.profile.name);
  avatarImg.src = photo;

  function continueCVGeneration() {
    // Name and title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(model.profile.name || 'Nama Lengkap', 250, 120);

    ctx.font = '20px Arial';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Web Developer', 250, 150);

    // Contact info in header
    ctx.font = '16px Arial';
    ctx.fillStyle = '#475569';
    let contactY = 180;
    if (model.profile.email) {
      ctx.fillText(`📧 ${model.profile.email}`, 250, contactY);
      contactY += 20;
    }
    if (model.profile.phone) {
      ctx.fillText(`📱 ${model.profile.phone}`, 250, contactY);
      contactY += 20;
    }

    // Main content
    let y = 300;

    // About section
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('About Me', 50, y);
    y += 10;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, y);
    ctx.lineTo(750, y);
    ctx.stroke();
    y += 30;

    ctx.font = '18px Arial';
    ctx.fillStyle = '#e2e8f0';
    const aboutText = model.profile.desc || 'Deskripsi singkat tentang diri Anda.';
    const aboutLines = wrapText(ctx, aboutText, 700, 18);
    aboutLines.forEach(line => {
      ctx.fillText(line, 50, y);
      y += 25;
    });
    y += 30;

    // Skills section
    if (model.skills && model.skills.length > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Skills', 50, y);
      y += 10;
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(750, y);
      ctx.stroke();
      y += 30;

      ctx.font = '16px Arial';
      ctx.fillStyle = '#cbd5e1';
      model.skills.forEach(skill => {
        ctx.fillText(`• ${skill}`, 70, y);
        y += 25;
      });
      y += 20;
    }

    // Projects section
    if (model.projects && model.projects.length > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Projects', 50, y);
      y += 10;
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(750, y);
      ctx.stroke();
      y += 30;

      ctx.font = '18px Arial';
      ctx.fillStyle = '#e2e8f0';
      model.projects.forEach((p, idx) => {
        if (y > 1300) return; // Limit to canvas height
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${idx + 1}. ${p.title}`, 50, y);
        y += 25;
        ctx.font = '16px Arial';
        ctx.fillStyle = '#cbd5e1';
        const descLines = wrapText(ctx, p.desc || 'Deskripsi proyek.', 650, 16);
        descLines.forEach(line => {
          ctx.fillText(line, 70, y);
          y += 20;
        });
        if (p.demo) {
          ctx.fillText(`Demo: ${p.demo}`, 70, y);
          y += 20;
        }
        if (p.github) {
          ctx.fillText(`GitHub: ${p.github}`, 70, y);
          y += 20;
        }
        y += 15;
      });
    }

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Generated by PortopolioKu', 400, 1380);

    // Convert to PNG and download
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${model.profile.name || 'CV'}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}

// Helper function to wrap text
function wrapText(ctx, text, maxWidth, fontSize) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}

/* ---------------------------
   Monochrome SVG ICONS (white)
   --------------------------- */
const ICON_GIT = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .5a11.5 11.5 0 00-3.63 22.41c.57.1.78-.24.78-.54v-1.9c-3.18.69-3.85-1.53-3.85-1.53-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.74 2.68 1.24 3.33.95.1-.74.4-1.24.73-1.53-2.54-.29-5.22-1.27-5.22-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.13 1.17a10.8 10.8 0 015.7 0c2.17-1.48 3.13-1.17 3.13-1.17.62 1.59.23 2.76.11 3.05.73.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.37-5.25 5.65.41.36.77 1.08.77 2.18v3.24c0 .3.21.65.79.54A11.5 11.5 0 0012 .5z"/></svg>`;
const ICON_LINKEDIN = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.45 20.45h-3.6v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.41-2.08 2.86v5.5h-3.6V9h3.46v1.56h.05c.48-.9 1.65-1.84 3.4-1.84 3.64 0 4.31 2.4 4.31 5.52v6.72zM5.34 7.43a2.09 2.09 0 110-4.18 2.09 2.09 0 010 4.18zM7.14 20.45H3.55V9h3.59v11.45z"/></svg>`;
const ICON_INSTAGRAM = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.2A4.8 4.8 0 1016.8 13 4.8 4.8 0 0012 8.2zm6.5-.9a1.1 1.1 0 11-1.1-1.1 1.1 1.1 0 011.1 1.1zM12 15.2A3.2 3.2 0 1115.2 12 3.2 3.2 0 0112 15.2z"/></svg>`;
const ICON_TIKTOK = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 3v10.5A3.5 3.5 0 1012.5 7H14a6 6 0 01-5 6v1.5A4.5 4.5 0 109 7V3z"/></svg>`;
const ICON_X = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 5.5a1 1 0 00-1.4-.1L12 12 4.4 5.4A1 1 0 003 6.8L10.6 13.4 3 21a1 1 0 101.4 1.4L12 14.6l7.6 7.8A1 1 0 0021 21.6l-7.6-7.8L21 6.8A1 1 0 0021 5.5z"/></svg>`;
const ICON_WA = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.52 3.48A11.86 11.86 0 0012 0C5.372 0 .1 5.372.1 12c0 2.124.555 4.2 1.61 6.03L0 24l6.24-1.64A11.85 11.85 0 0012 24c6.627 0 12-5.372 12-12 0-3.2-1.24-6.2-3.48-8.52zM12 21.5c-1.9 0-3.74-.48-5.36-1.38l-.38-.22-3.72.98.99-3.63-.24-.39A9.5 9.5 0 012.5 12c0-5.25 4.25-9.5 9.5-9.5 2.54 0 4.93.99 6.76 2.82A9.53 9.53 0 0121.5 12c0 5.25-4.25 9.5-9.5 9.5z"/></svg>`;
