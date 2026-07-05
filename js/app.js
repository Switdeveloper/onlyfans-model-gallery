document.addEventListener('DOMContentLoaded', () => {
  loadImages();
  renderGallery();
  initNavigation();
  initUpload();
  initModal();
  initSearch();
  initFilters();
});

function initNavigation() {
  const tabs = document.querySelectorAll('.nav-btn');
  const contents = {
    gallery: document.getElementById('gallery'),
    generator: document.getElementById('generator'),
  };

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Object.values(contents).forEach(c => c.classList.remove('active'));
      const tab = contents[btn.dataset.tab];
      if (tab) tab.classList.add('active');
    });
  });
}

function initUpload() {
  const uploadInput = document.getElementById('imageUpload');

  uploadInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      const dataUrl = await readFileAsDataURL(file);
      const category = await askCategory(file.name);
      const tagsInput = prompt('Enter tags (comma separated):', '');
      const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [];

      addImage({
        dataUrl,
        prompt: file.name,
        tags,
        category: category || 'sfw',
      });
    }

    uploadInput.value = '';
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function askCategory(filename) {
  return new Promise(resolve => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; inset: 0; z-index: 300;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
      font-family: 'Inter', sans-serif;
    `;
    modal.innerHTML = `
      <div style="background:#1a1a26;border:1px solid #2a2a3e;border-radius:16px;padding:32px;max-width:380px;width:90%;box-shadow:0 24px 80px rgba(0,0,0,0.8);animation:modalIn 0.3s ease;">
        <h3 style="margin-bottom:8px;font-size:1.125rem;color:#f0f0f5;">Set Category</h3>
        <p style="color:#8888aa;font-size:0.875rem;margin-bottom:20px;">${escapeHtml(filename)}</p>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <button class="cat-btn" data-cat="sfw" style="background:rgba(34,197,94,0.15);color:#22c55e;border:1px solid rgba(34,197,94,0.3);padding:12px;border-radius:8px;font-weight:700;font-size:0.9375rem;cursor:pointer;font-family:inherit;transition:all 0.2s;">SFW - Safe for Work</button>
          <button class="cat-btn" data-cat="nsfw" style="background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);padding:12px;border-radius:8px;font-weight:700;font-size:0.9375rem;cursor:pointer;font-family:inherit;transition:all 0.2s;">NSFW - Not Safe for Work</button>
          <button class="cat-btn cancel" style="background:transparent;color:#8888aa;border:1px solid #2a2a3e;padding:10px;border-radius:8px;font-size:0.8125rem;cursor:pointer;font-family:inherit;margin-top:4px;">Cancel</button>
        </div>
      </div>
    `;

    modal.querySelectorAll('.cat-btn:not(.cancel)').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.filter = 'brightness(1.2)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.filter = 'none';
      });
      btn.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(btn.dataset.cat);
      });
    });
    modal.querySelector('.cancel').addEventListener('click', () => {
      document.body.removeChild(modal);
      resolve('sfw');
    });

    document.body.appendChild(modal);
  });
}

function initModal() {
  const modal = document.getElementById('imageModal');
  const overlay = modal.querySelector('.modal-overlay');
  const closeBtn = modal.querySelector('.modal-close');

  function close() {
    modal.classList.remove('open');
  }

  overlay.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });

  const deleteBtn = document.getElementById('deleteImage');
  const downloadBtn = document.getElementById('downloadImage');

  deleteBtn.addEventListener('click', () => {
    const id = modal.dataset.imageId;
    if (id && confirm('Delete this image?')) {
      deleteImage(id);
      close();
    }
  });

  downloadBtn.addEventListener('click', () => {
    const img = document.getElementById('modalImage');
    const a = document.createElement('a');
    a.href = img.src;
    a.download = `modelvault-${modal.dataset.imageId}.png`;
    a.click();
  });

  window.openModal = function(id) {
    const img = images.find(i => i.id === id);
    if (!img) return;

    modal.dataset.imageId = id;
    document.getElementById('modalImage').src = img.dataUrl;

    const catBadge = document.getElementById('modalCategory');
    catBadge.textContent = img.category.toUpperCase();
    catBadge.className = `badge ${img.category}`;

    document.getElementById('modalDate').textContent = formatDate(img.createdAt);

    const tagsContainer = document.getElementById('modalTags');
    if (img.tags && img.tags.length) {
      tagsContainer.innerHTML = img.tags.map(t => `<span class="item-tag">${escapeHtml(t)}</span>`).join('');
      tagsContainer.style.display = 'flex';
    } else {
      tagsContainer.style.display = 'none';
    }

    const promptEl = document.getElementById('modalPrompt');
    if (img.prompt && img.prompt !== img.tags?.[0]) {
      promptEl.textContent = img.prompt;
      promptEl.style.display = 'block';
    } else {
      promptEl.style.display = 'none';
    }

    modal.classList.add('open');
  };
}

function initSearch() {
  const input = document.getElementById('searchInput');
  let debounceTimer;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentSearch = input.value.trim();
      renderGallery();
    }, 300);
  });
}

function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderGallery();
    });
  });
}
