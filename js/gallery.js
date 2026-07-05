const STORAGE_KEY = 'modelvault_images';

let images = [];
let currentFilter = 'all';
let currentSearch = '';

function loadImages() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    images = stored ? JSON.parse(stored) : [];
  } catch {
    images = [];
  }
}

function saveImages() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
}

function addImage(data) {
  const img = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    ...data,
    createdAt: new Date().toISOString(),
  };
  images.unshift(img);
  saveImages();
  renderGallery();
  return img;
}

function deleteImage(id) {
  images = images.filter(img => img.id !== id);
  saveImages();
  renderGallery();
}

function getFilteredImages() {
  return images.filter(img => {
    if (currentFilter !== 'all' && img.category !== currentFilter) return false;
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      const tags = (img.tags || []).join(' ').toLowerCase();
      const prompt = (img.prompt || '').toLowerCase();
      if (!tags.includes(q) && !prompt.includes(q)) return false;
    }
    return true;
  });
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  const filtered = getFilteredImages();

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📸</div>
        <h2>${images.length === 0 ? 'No images yet' : 'No matches found'}</h2>
        <p>${images.length === 0 ? 'Upload your first image or generate one with AI' : 'Try a different search or filter'}</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(img => `
    <div class="gallery-item" data-id="${img.id}">
      <img src="${img.dataUrl}" alt="${img.prompt || 'Model image'}" loading="lazy">
      <span class="item-category ${img.category}">${img.category}</span>
      <button class="item-delete" data-id="${img.id}" title="Delete">✕</button>
      <div class="item-overlay">
        ${(img.tags && img.tags.length) ? `
          <div class="item-tags">
            ${img.tags.slice(0, 4).map(t => `<span class="item-tag">${escapeHtml(t)}</span>`).join('')}
          </div>
        ` : ''}
        <span style="color:white;font-size:0.75rem;opacity:0.7;">${formatDate(img.createdAt)}</span>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.gallery-item').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.closest('.item-delete')) return;
      openModal(el.dataset.id);
    });
  });

  grid.querySelectorAll('.item-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (confirm('Delete this image?')) deleteImage(btn.dataset.id);
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
