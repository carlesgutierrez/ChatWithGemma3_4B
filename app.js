// app.js — Main application logic for GEMA
// Connects to local LMStudio API and manages the chat UI

const LMSTUDIO_URL = 'http://localhost:1234/v1/chat/completions';
const CONFIG_FILE = 'config.txt';

// State
let systemPrompt = '';
let chatHistory = [];
let isWaiting = false;

// DOM
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const userMessages = document.getElementById('user-messages');
const botMessages = document.getElementById('bot-messages');
const robotStatus = document.getElementById('robot-status');
const userEmpty = document.getElementById('user-empty');
const botEmpty = document.getElementById('bot-empty');

// ─── Load config and init ─────────────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch(CONFIG_FILE);
    if (!res.ok) throw new Error('No se pudo cargar config.txt');
    systemPrompt = await res.text();
    console.log('[GEMA] Prompt de sistema cargado correctamente.');
  } catch (e) {
    console.warn('[GEMA] Error al cargar config.txt. Usando prompt por defecto.', e);
    systemPrompt = 'Eres GEMA, una asistente coach para proyectos artísticos. Responde en español.';
  }

  // Add system prompt to chat history
  chatHistory = [{ role: 'system', content: systemPrompt }];
  setStatus('ONLINE · ESPERANDO INPUT');
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
function setStatus(text) {
  robotStatus.textContent = text;
}

function getTimestamp() {
  const now = new Date();
  return now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function addUserMessage(text) {
  if (userEmpty) userEmpty.style.display = 'none';

  const el = document.createElement('div');
  el.className = 'user-message';
  el.innerHTML = `${escapeHtml(text)}<div class="msg-timestamp">${getTimestamp()}</div>`;
  userMessages.appendChild(el);
  userMessages.scrollTop = userMessages.scrollHeight;
}

function addBotMessage(text) {
  if (botEmpty) botEmpty.style.display = 'none';

  // Remove thinking indicator if present
  const thinking = document.getElementById('bot-thinking');
  if (thinking) thinking.remove();

  const el = document.createElement('div');
  el.className = 'bot-message';
  el.innerHTML = `${formatResponse(text)}<div class="msg-timestamp">${getTimestamp()}</div>`;
  botMessages.appendChild(el);
  botMessages.scrollTop = botMessages.scrollHeight;
}

function showThinkingIndicator() {
  const el = document.createElement('div');
  el.id = 'bot-thinking';
  el.className = 'thinking-indicator';
  el.innerHTML = `
    <span class="thinking-dots">
      <span></span><span></span><span></span>
    </span>
    PROCESANDO...
  `;
  botMessages.appendChild(el);
  botMessages.scrollTop = botMessages.scrollHeight;
}

function addBotError(text) {
  const thinking = document.getElementById('bot-thinking');
  if (thinking) thinking.remove();

  const el = document.createElement('div');
  el.className = 'bot-message';
  el.style.borderRightColor = 'var(--neon-pink)';
  el.innerHTML = `<span style="color:var(--neon-pink)">⚠ ERROR:</span> ${escapeHtml(text)}<div class="msg-timestamp">${getTimestamp()}</div>`;
  botMessages.appendChild(el);
  botMessages.scrollTop = botMessages.scrollHeight;
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

function formatResponse(text) {
  // Simple formatting: bold, line breaks
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--neon-cyan)">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:var(--neon-purple)">$1</em>')
    .replace(/\n/g, '<br>');
}

// ─── LMStudio API ─────────────────────────────────────────────────────────────
async function sendToLMStudio(userText) {
  chatHistory.push({ role: 'user', content: userText });

  const response = await fetch(LMSTUDIO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemma-3-4b',
      messages: chatHistory,
      temperature: 0.75,
      max_tokens: 800,
      stream: false
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LMStudio respondió con error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content?.trim() || '(Sin respuesta)';
  chatHistory.push({ role: 'assistant', content: reply });
  return reply;
}

// ─── Main send flow ───────────────────────────────────────────────────────────
async function handleSend() {
  const text = userInput.value.trim();
  if (!text || isWaiting) return;

  isWaiting = true;
  userInput.value = '';
  userInput.disabled = true;
  sendBtn.disabled = true;

  // Show user message
  addUserMessage(text);

  // Show thinking state
  showThinkingIndicator();
  window.setRobotThinking(true);
  setStatus('PROCESANDO · PENSANDO...');

  try {
    const reply = await sendToLMStudio(text);
    addBotMessage(reply);
    
    // Brief speaking animation
    window.setRobotThinking(false);
    window.setRobotSpeaking(true);
    setStatus('TRANSMITIENDO RESPUESTA...');
    
    await new Promise(r => setTimeout(r, 1800));
    window.setRobotSpeaking(false);
    setStatus('ONLINE · ESPERANDO INPUT');
    
  } catch (err) {
    console.error('[GEMA] Error de conexión:', err);
    window.setRobotThinking(false);
    window.setRobotSpeaking(false);
    
    let errorMsg = err.message || 'Error desconocido';
    if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
      errorMsg = 'No se pudo conectar con LMStudio. Asegúrate de que LMStudio está corriendo en localhost:1234 y que el modelo Gemma 3 está cargado.';
    }
    addBotError(errorMsg);
    setStatus('ERROR · COMPRUEBA LMSTUDIO');
  }

  isWaiting = false;
  userInput.disabled = false;
  sendBtn.disabled = false;
  userInput.focus();
}

// ─── Event Listeners ──────────────────────────────────────────────────────────
sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
