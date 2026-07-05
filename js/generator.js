const HF_API_URL = 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev';

let generatedImageData = null;
let isGenerating = false;

function getApiKey() {
  return localStorage.getItem('modelvault_hf_key') || '';
}

function saveApiKey(key) {
  localStorage.setItem('modelvault_hf_key', key);
}

async function generateImage(prompt, style) {
  const key = getApiKey();
  const headers = { 'Content-Type': 'application/json' };
  if (key) headers['Authorization'] = `Bearer ${key}`;

  const styledPrompt = style === 'photorealistic' ? `photorealistic, ${prompt}, highly detailed, 8k` :
    style === 'cinematic' ? `cinematic, ${prompt}, film grain, dramatic lighting, movie still` :
    style === 'artistic' ? `artistic, ${prompt}, digital art, trending on artstation` :
    `anime style, ${prompt}, anime art, high quality`;

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ inputs: styledPrompt }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API error: ${response.status}`);
  }

  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function showGeneratedImage(dataUrl, prompt, tags, category) {
  const container = document.getElementById('generatedResult');
  const img = document.getElementById('generatedImage');
  img.src = dataUrl;
  container.style.display = 'block';

  generatedImageData = { dataUrl, prompt, tags, category };
}

document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn');
  const promptInput = document.getElementById('promptInput');
  const styleSelect = document.getElementById('styleSelect');
  const categorySelect = document.getElementById('categorySelect');
  const tagsInput = document.getElementById('tagsInput');
  const saveGeneratedBtn = document.getElementById('saveGenerated');
  const regenerateBtn = document.getElementById('regenerateBtn');
  const saveApiKeyBtn = document.getElementById('saveApiKey');
  const apiKeyInput = document.getElementById('apiKeyInput');

  const savedKey = getApiKey();
  if (savedKey) apiKeyInput.value = savedKey;

  saveApiKeyBtn.addEventListener('click', () => {
    saveApiKey(apiKeyInput.value.trim());
    saveApiKeyBtn.textContent = 'Saved!';
    setTimeout(() => { saveApiKeyBtn.textContent = 'Save Key'; }, 2000);
  });

  generateBtn.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      alert('Please enter a prompt');
      return;
    }

    if (isGenerating) return;
    isGenerating = true;
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="spinner"></span> Generating...';

    try {
      const style = styleSelect.value;
      const category = categorySelect.value;
      const tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean);

      const dataUrl = await generateImage(prompt, style);
      showGeneratedImage(dataUrl, prompt, tags, category);

      generateBtn.innerHTML = '<span class="btn-icon">✨</span> Generate Image';
    } catch (err) {
      if (err.message.includes('403') || err.message.includes('401')) {
        alert('API key invalid or model is loading. The free tier may be rate-limited. Try adding your own Hugging Face API key in the panel on the right.');
      } else if (err.message.includes('503')) {
        alert('Model is loading... Please wait a moment and try again.');
      } else {
        alert('Generation failed: ' + err.message);
      }
      generateBtn.innerHTML = '<span class="btn-icon">✨</span> Generate Image';
    } finally {
      isGenerating = false;
      generateBtn.disabled = false;
    }
  });

  regenerateBtn.addEventListener('click', () => {
    document.getElementById('generateBtn').click();
  });

  saveGeneratedBtn.addEventListener('click', () => {
    if (!generatedImageData) return;
    const { dataUrl, prompt, tags, category } = generatedImageData;
    addImage({ dataUrl, prompt, tags, category });
    document.getElementById('generatedResult').style.display = 'none';
    generatedImageData = null;

    document.querySelector('[data-tab="gallery"]').click();

    const btn = saveGeneratedBtn;
    btn.textContent = 'Saved! ✓';
    setTimeout(() => { btn.textContent = 'Save to Gallery'; }, 2000);
  });
});
