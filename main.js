// ==================== CONFIGURATION ====================
var radius = 240;
var autoRotate = true;
var rotateSpeed = -60;
var imgWidth = 120;
var imgHeight = 170;
var bgMusicURL = null;
var bgMusicControls = false;

// Romantic messages for typewriter
const romanticMessages = [
  "For Someone Special...",
  "Dành cho người anh yêu...",
  "My Heart Belongs to You...",
];

// Initialize Particles Manager for heart rain and sparkles
window.particlesManager = new ParticlesManager();

// ==================== ENTRY SCREEN ====================
const entryScreen = document.getElementById('entry-screen');
const mainContent = document.getElementById('main-content');
const entryHeart = document.getElementById('entry-heart');
const typewriterText = document.getElementById('typewriter-text');

// Typewriter effect
function typeWriter(text, element, speed = 100) {
  let i = 0;
  element.innerHTML = '';

  // Add cursor
  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';

  function type() {
    if (i < text.length) {
      element.textContent = text.substring(0, i + 1);
      element.appendChild(cursor);
      i++;
      setTimeout(type, speed);
    } else {
      // Keep cursor blinking at end
      element.appendChild(cursor);
    }
  }

  type();
}

// Start typewriter on load
window.addEventListener('load', () => {
  const message = romanticMessages[Math.floor(Math.random() * romanticMessages.length)];
  setTimeout(() => typeWriter(message, typewriterText, 80), 500);
});

// Heart click to reveal
entryHeart.addEventListener('click', revealMainContent);

function revealMainContent() {
  // Trigger particles scatter effect
  if (window.particlesManager) {
    window.particlesManager.scatterHearts();
  }

  // Fade out entry screen
  entryScreen.classList.add('fade-out');

  // Show main content
  mainContent.classList.remove('hidden');
  setTimeout(() => {
    mainContent.classList.add('visible');
  }, 100);

  // Remove entry screen after animation
  setTimeout(() => {
    entryScreen.style.display = 'none';
    // Start the carousel and effects
    init();
    draw();
  }, 800);
}

// ==================== CAROUSEL SETUP ====================
var odrag = document.getElementById('drag-container');
var ospin = document.getElementById('spin-container');
var ground = document.getElementById('ground');

// Size of images
ospin.style.width = imgWidth + "px";
ospin.style.height = imgHeight + "px";

// Size of ground
ground.style.width = radius * 3 + "px";
ground.style.height = radius * 3 + "px";

function init(delayTime) {
  var aImg = ospin.getElementsByTagName('img');
  var aVid = ospin.getElementsByTagName('video');
  var aEle = [...aImg, ...aVid];

  for (var i = 0; i < aEle.length; i++) {
    aEle[i].style.transform = "rotateY(" + (i * (360 / aEle.length)) + "deg) translateZ(" + radius + "px)";
    aEle[i].style.transition = "transform 1s";
    aEle[i].style.transitionDelay = delayTime || (aEle.length - i) / 4 + "s";

    // Add click listener for fullscreen
    aEle[i].addEventListener('click', openImageModal);
  }
}

function applyTranform(obj) {
  if (tY > 180) tY = 180;
  if (tY < 0) tY = 0;
  obj.style.transform = "rotateX(" + (-tY) + "deg) rotateY(" + (tX) + "deg)";
}

function playSpin(yes) {
  ospin.style.animationPlayState = (yes ? 'running' : 'paused');
}

var sX, sY, nX, nY, desX = 0, desY = 0, tX = 0, tY = 10;

// Auto spin
if (autoRotate) {
  var animationName = (rotateSpeed > 0 ? 'spin' : 'spinRevert');
  ospin.style.animation = `${animationName} ${Math.abs(rotateSpeed)}s infinite linear`;
}

// Background music
if (bgMusicURL) {
  document.getElementById('music-container').innerHTML += `
    <audio src="${bgMusicURL}" ${bgMusicControls ? 'controls' : ''} autoplay loop>
      <p>Your browser does not support the audio element.</p>
    </audio>
  `;
}

// ==================== DRAG/TOUCH CONTROLS ====================
document.onpointerdown = function (e) {
  // Ignore if clicking on UI elements or admin panel
  if (e.target.closest('#settings-btn, #file-inputs, .modal, #admin-panel, textarea, input')) return;

  clearInterval(odrag.timer);
  e = e || window.event;
  var sX = e.clientX, sY = e.clientY;

  this.onpointermove = function (e) {
    e = e || window.event;
    var nX = e.clientX, nY = e.clientY;
    desX = nX - sX;
    desY = nY - sY;
    tX += desX * 0.1;
    tY += desY * 0.1;
    applyTranform(odrag);
    sX = nX;
    sY = nY;
  };

  this.onpointerup = function (e) {
    odrag.timer = setInterval(function () {
      desX *= 0.95;
      desY *= 0.95;
      tX += desX * 0.1;
      tY += desY * 0.1;
      applyTranform(odrag);
      playSpin(false);
      if (Math.abs(desX) < 0.5 && Math.abs(desY) < 0.5) {
        clearInterval(odrag.timer);
        playSpin(true);
      }
    }, 17);
    this.onpointermove = this.onpointerup = null;
  };

  return false;
};

// Mouse wheel zoom
document.onmousewheel = function (e) {
  e = e || window.event;
  var d = e.wheelDelta / 20 || -e.detail;
  radius += d;
  init(1);
};

// ==================== IMAGE MODAL WITH MESSAGES ====================
const imageModal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const modalMessage = document.getElementById('modal-message');
const modalClose = document.getElementById('modal-close');

// Get love messages from localStorage
function getLoveMessages() {
  try {
    return JSON.parse(localStorage.getItem('loveMessages') || '{}');
  } catch (e) {
    return {};
  }
}

// Save love messages to localStorage
function saveLoveMessages(messages) {
  localStorage.setItem('loveMessages', JSON.stringify(messages));
}

function openImageModal(e) {
  e.stopPropagation();
  const imgElement = e.target;
  const imgIndex = imgElement.dataset.index || '0';

  modalImage.src = imgElement.src;

  // Get message for this image
  const messages = getLoveMessages();
  const message = messages[imgIndex] || '';

  if (message) {
    modalMessage.textContent = message;
    modalMessage.classList.remove('empty');
  } else {
    modalMessage.textContent = '💕';
    modalMessage.classList.add('empty');
  }

  imageModal.classList.remove('hidden');
  setTimeout(() => imageModal.classList.add('visible'), 10);
}

function closeImageModal() {
  imageModal.classList.remove('visible');
  setTimeout(() => imageModal.classList.add('hidden'), 300);
}

modalClose.addEventListener('click', closeImageModal);
document.querySelector('#image-modal .modal-backdrop').addEventListener('click', closeImageModal);

// ==================== SECRET MESSAGE ====================
const secretModal = document.getElementById('secret-modal');
const secretClose = document.getElementById('secret-close');

function showSecretMessage() {
  secretModal.classList.remove('hidden');
  setTimeout(() => secretModal.classList.add('visible'), 10);
  if (window.particlesManager) {
    window.particlesManager.triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);
  }
}

function closeSecretMessage() {
  secretModal.classList.remove('visible');
  setTimeout(() => secretModal.classList.add('hidden'), 300);
}

secretClose.addEventListener('click', closeSecretMessage);
document.querySelector('#secret-modal .modal-backdrop').addEventListener('click', closeSecretMessage);

// Keyboard combo: Ctrl+L for secret message
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'l') {
    e.preventDefault();
    showSecretMessage();
  }
  // Ctrl+Shift+A for secret admin panel - redirect to admin URL
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    e.preventDefault();
    if (!checkAdminAccess()) {
      window.location.href = window.location.pathname + '?admin=true';
    }
  }
  // ESC to close modals (not admin - use button for that)
  if (e.key === 'Escape') {
    closeImageModal();
    closeSecretMessage();
  }
});

// ==================== INTERACTIVE SURPRISES ====================

// Double-click for confetti
let lastClickTime = 0;
document.addEventListener('click', (e) => {
  const currentTime = Date.now();
  if (currentTime - lastClickTime < 300) {
    // Double click detected
    if (window.particlesManager) {
      window.particlesManager.triggerConfetti(e.clientX, e.clientY);
    }
  }
  lastClickTime = currentTime;
});

// Shake detection for heart scatter
let lastShakeTime = 0;
let lastX = 0, lastY = 0, lastZ = 0;
const shakeThreshold = 15;

window.addEventListener('devicemotion', (e) => {
  const currentTime = Date.now();
  if (currentTime - lastShakeTime < 1000) return;

  const acceleration = e.accelerationIncludingGravity;
  if (!acceleration) return;

  const deltaX = Math.abs(acceleration.x - lastX);
  const deltaY = Math.abs(acceleration.y - lastY);
  const deltaZ = Math.abs(acceleration.z - lastZ);

  if ((deltaX > shakeThreshold && deltaY > shakeThreshold) ||
    (deltaX > shakeThreshold && deltaZ > shakeThreshold) ||
    (deltaY > shakeThreshold && deltaZ > shakeThreshold)) {
    lastShakeTime = currentTime;
    if (window.particlesManager) {
      window.particlesManager.scatterHearts();
    }
  }

  lastX = acceleration.x;
  lastY = acceleration.y;
  lastZ = acceleration.z;
});

// ==================== FILE INPUTS ====================
document.getElementById('image-input').addEventListener('change', handleFileSelection);
document.getElementById('mp3-input').addEventListener('change', handleFileSelection);
document.getElementById('start-button').addEventListener('click', startApplication);

let imagesSelected = false;
let mp3Selected = false;

function handleFileSelection(event) {
  const imageInput = document.getElementById('image-input');
  const mp3Input = document.getElementById('mp3-input');

  imagesSelected = imageInput.files.length > 0;
  if (event.target.id === 'image-input' && imageInput.files.length === 0) {
    return;
  }
  mp3Selected = mp3Input.files.length > 0;
}

function startApplication() {
  if (imagesSelected) {
    handleImageSelection();
  }
  if (mp3Selected) {
    handleMp3Selection();
  }
  // Close settings panel
  document.getElementById('file-inputs').style.display = 'none';
}

function handleImageSelection() {
  const files = document.getElementById('image-input').files;
  const spinContainer = document.getElementById('spin-container');
  spinContainer.innerHTML = '';

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = `Image ${i + 1}`;
    img.dataset.index = i; // Add index for message linking
    img.addEventListener('click', openImageModal);
    spinContainer.appendChild(img);
  }

  const p = document.createElement('p');
  p.textContent = 'My Love';
  spinContainer.appendChild(p);

  setTimeout(init, 500);

  // Trigger confetti to celebrate
  if (window.particlesManager) {
    setTimeout(() => {
      window.particlesManager.triggerConfetti(window.innerWidth / 2, window.innerHeight / 3);
    }, 1000);
  }
}

function handleMp3Selection() {
  const file = document.getElementById('mp3-input').files[0];
  if (file) {
    const audio = document.querySelector('audio');
    audio.src = URL.createObjectURL(file);
    audio.play();
  }
}

// Settings toggle
document.getElementById('settings-btn').addEventListener('click', function () {
  const fileInputs = document.getElementById('file-inputs');
  if (fileInputs.style.display === 'none' || fileInputs.style.display === '') {
    fileInputs.style.display = 'block';
  } else {
    fileInputs.style.display = 'none';
  }
});

// ==================== WEBGL HEART ====================
var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var gl = canvas.getContext('webgl');
if (!gl) {
  console.error("Unable to initialize WebGL.");
}

var time = 0.0;

var vertexSource = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

var fragmentSource = `
precision highp float;

uniform float width;
uniform float height;
vec2 resolution = vec2(width, height);

uniform float time;

#define POINT_COUNT 8

vec2 points[POINT_COUNT];
const float speed = -0.5;
const float len = 0.25;
float intensity = 1.3;
float radius = 0.008;

float sdBezier(vec2 pos, vec2 A, vec2 B, vec2 C){    
  vec2 a = B - A;
  vec2 b = A - 2.0*B + C;
  vec2 c = a * 2.0;
  vec2 d = A - pos;

  float kk = 1.0 / dot(b,b);
  float kx = kk * dot(a,b);
  float ky = kk * (2.0*dot(a,a)+dot(d,b)) / 3.0;
  float kz = kk * dot(d,a);      

  float res = 0.0;

  float p = ky - kx*kx;
  float p3 = p*p*p;
  float q = kx*(2.0*kx*kx - 3.0*ky) + kz;
  float h = q*q + 4.0*p3;

  if(h >= 0.0){ 
    h = sqrt(h);
    vec2 x = (vec2(h, -h) - q) / 2.0;
    vec2 uv = sign(x)*pow(abs(x), vec2(1.0/3.0));
    float t = uv.x + uv.y - kx;
    t = clamp( t, 0.0, 1.0 );

    vec2 qos = d + (c + b*t)*t;
    res = length(qos);
  }else{
    float z = sqrt(-p);
    float v = acos( q/(p*z*2.0) ) / 3.0;
    float m = cos(v);
    float n = sin(v)*1.732050808;
    vec3 t = vec3(m + m, -n - m, n - m) * z - kx;
    t = clamp( t, 0.0, 1.0 );

    vec2 qos = d + (c + b*t.x)*t.x;
    float dis = dot(qos,qos);
    
    res = dis;

    qos = d + (c + b*t.y)*t.y;
    dis = dot(qos,qos);
    res = min(res,dis);
    
    qos = d + (c + b*t.z)*t.z;
    dis = dot(qos,qos);
    res = min(res,dis);

    res = sqrt( res );
  }
    
  return res;
}

vec2 getHeartPosition(float t){
  return vec2(16.0 * sin(t) * sin(t) * sin(t),
              -(13.0 * cos(t) - 5.0 * cos(2.0*t)
              - 2.0 * cos(3.0*t) - cos(4.0*t)));
}

float getGlow(float dist, float radius, float intensity){
  return pow(radius/dist, intensity);
}

float getSegment(float t, vec2 pos, float offset, float scale){
  for(int i = 0; i < POINT_COUNT; i++){
    points[i] = getHeartPosition(offset + float(i)*len + fract(speed * t) * 6.28);
  }
    
  vec2 c = (points[0] + points[1]) / 2.0;
  vec2 c_prev;
  float dist = 10000.0;
    
  for(int i = 0; i < POINT_COUNT-1; i++){
    c_prev = c;
    c = (points[i] + points[i+1]) / 2.0;
    dist = min(dist, sdBezier(pos, scale * c_prev, scale * points[i], scale * c));
  }
  return max(0.0, dist);
}

void main(){
  vec2 uv = gl_FragCoord.xy/resolution.xy;
  float widthHeightRatio = resolution.x/resolution.y;
  vec2 centre = vec2(0.5, 0.5);
  vec2 pos = centre - uv;
  pos.y /= widthHeightRatio;
  pos.y += 0.02;
  float scale = 0.000015 * height;
  
  float t = time;
    
  float dist = getSegment(t, pos, 0.0, scale);
  float glow = getGlow(dist, radius, intensity);
  
  vec3 col = vec3(0.0);

  col += 10.0*vec3(smoothstep(0.003, 0.001, dist));
  col += glow * vec3(1.0,0.05,0.3);
  
  dist = getSegment(t, pos, 3.4, scale);
  glow = getGlow(dist, radius, intensity);
  
  col += 10.0*vec3(smoothstep(0.003, 0.001, dist));
  col += glow * vec3(0.1,0.4,1.0);
        
  col = 1.0 - exp(-col);

  col = pow(col, vec3(0.4545));

  gl_FragColor = vec4(col,1.0);
}
`;

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform1f(widthHandle, window.innerWidth);
  gl.uniform1f(heightHandle, window.innerHeight);
}

function compileShader(shaderSource, shaderType) {
  var shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw "Shader compile failed with: " + gl.getShaderInfoLog(shader);
  }
  return shader;
}

function getAttribLocation(program, name) {
  var attributeLocation = gl.getAttribLocation(program, name);
  if (attributeLocation === -1) {
    throw 'Cannot find attribute ' + name + '.';
  }
  return attributeLocation;
}

function getUniformLocation(program, name) {
  var attributeLocation = gl.getUniformLocation(program, name);
  if (attributeLocation === -1) {
    throw 'Cannot find uniform ' + name + '.';
  }
  return attributeLocation;
}

var vertexShader = compileShader(vertexSource, gl.VERTEX_SHADER);
var fragmentShader = compileShader(fragmentSource, gl.FRAGMENT_SHADER);

var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

gl.useProgram(program);

var vertexData = new Float32Array([
  -1.0, 1.0,
  -1.0, -1.0,
  1.0, 1.0,
  1.0, -1.0,
]);

var vertexDataBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

var positionHandle = getAttribLocation(program, 'position');

gl.enableVertexAttribArray(positionHandle);
gl.vertexAttribPointer(positionHandle, 2, gl.FLOAT, false, 2 * 4, 0);

var timeHandle = getUniformLocation(program, 'time');
var widthHandle = getUniformLocation(program, 'width');
var heightHandle = getUniformLocation(program, 'height');

gl.uniform1f(widthHandle, window.innerWidth);
gl.uniform1f(heightHandle, window.innerHeight);

var lastFrame = Date.now();
var thisFrame;

function draw() {
  thisFrame = Date.now();
  time += (thisFrame - lastFrame) / 1000;
  lastFrame = thisFrame;

  gl.uniform1f(timeHandle, time);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  requestAnimationFrame(draw);
}

// ==================== SECRET ADMIN PANEL ====================
const adminPanel = document.getElementById('admin-panel');
const adminGrid = document.getElementById('admin-grid');
const adminClose = document.getElementById('admin-close');
const adminSave = document.getElementById('admin-save');
const saveFeedback = document.getElementById('save-feedback');

// Check if admin mode via URL param
function checkAdminAccess() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('admin') === 'true';
}

// Show admin panel
function showAdminPanel() {
  generatePhotoCards();
  adminPanel.classList.remove('hidden');
  document.body.style.overflow = 'auto'; // Enable scrolling in admin
}

// Hide admin panel and go back to main page
function hideAdminPanel() {
  adminPanel.classList.add('hidden');
  document.body.style.overflow = 'hidden'; // Disable scrolling for carousel
  // Redirect to main page without admin param
  if (checkAdminAccess()) {
    window.location.href = window.location.pathname;
  }
}

// Generate photo cards for admin - Enhanced with controls
async function generatePhotoCards() {
  const images = ospin.getElementsByTagName('img');
  const messages = await storageManager.getMessages();
  const emptyState = document.getElementById('empty-state');
  const photoCount = document.getElementById('photo-count');

  adminGrid.innerHTML = '';

  // Show/hide empty state
  if (images.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (photoCount) photoCount.textContent = '0 ảnh';
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  if (photoCount) photoCount.textContent = `${images.length} ảnh`;

  for (let i = 0; i < images.length; i++) {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.dataset.id = images[i].dataset.id || i;

    const imgSrc = images[i].src;
    const currentMessage = messages[i] || messages[images[i].dataset.id] || '';

    card.innerHTML = `
      <div class="photo-card-image-container">
        <span class="photo-index">${i + 1}</span>
        <img src="${imgSrc}" alt="Ảnh ${i + 1}" class="photo-card-image">
        <div class="photo-card-overlay">
          <label class="photo-card-btn replace-btn" title="Thay thế ảnh">
            <input type="file" accept="image/*" data-index="${i}" class="replace-input" hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
          </label>
          <button class="photo-card-btn delete-btn" data-index="${i}" title="Xóa ảnh">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="photo-card-content">
        <label class="photo-card-label">
          <span>💕</span> Lời nhắn cho ảnh ${i + 1}
        </label>
        <textarea 
          class="photo-card-textarea" 
          data-index="${i}"
          placeholder="Viết lời yêu thương của bạn tại đây..."
        >${currentMessage}</textarea>
      </div>
    `;

    adminGrid.appendChild(card);
  }

  // Attach event listeners for replace/delete buttons
  attachPhotoCardListeners();
}

// Attach listeners to photo card buttons
function attachPhotoCardListeners() {
  // Replace button listeners
  document.querySelectorAll('.replace-input').forEach(input => {
    input.addEventListener('change', handleReplaceImage);
  });

  // Delete button listeners
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', handleDeleteImage);
  });
}

// Handle replace image
async function handleReplaceImage(e) {
  const file = e.target.files[0];
  if (!file) return;

  const index = parseInt(e.target.dataset.index);
  const spinContainer = document.getElementById('spin-container');
  const images = spinContainer.getElementsByTagName('img');

  if (images[index]) {
    images[index].src = URL.createObjectURL(file);
    showToast('Đã thay thế ảnh thành công!', 'success');
    generatePhotoCards();
  }
}

// Handle delete single image
async function handleDeleteImage(e) {
  const index = parseInt(e.target.closest('.delete-btn').dataset.index);
  const spinContainer = document.getElementById('spin-container');
  const images = spinContainer.getElementsByTagName('img');

  if (images[index]) {
    images[index].remove();
    showToast('Đã xóa ảnh!', 'success');
    setTimeout(init, 100);
    generatePhotoCards();
  }
}

// Clear all images
async function clearAllImages() {
  const spinContainer = document.getElementById('spin-container');
  const images = spinContainer.querySelectorAll('img');

  images.forEach(img => img.remove());

  // Clear from IndexedDB too
  await storageManager.clearAllImages();

  showToast('Đã xóa tất cả ảnh!', 'success');
  generatePhotoCards();
}

// Show confirmation modal
function showConfirmModal(title, message, onConfirm) {
  const existingModal = document.querySelector('.confirm-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.className = 'confirm-modal';
  modal.innerHTML = `
    <div class="confirm-content">
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="confirm-buttons">
        <button class="confirm-btn cancel">Hủy</button>
        <button class="confirm-btn danger">Xác nhận</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.cancel').addEventListener('click', () => modal.remove());
  modal.querySelector('.danger').addEventListener('click', () => {
    onConfirm();
    modal.remove();
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Toast notification
function showToast(message, type = 'default') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  if (!toast || !toastMessage) return;

  toast.className = 'toast';
  toastMessage.textContent = message;

  if (type === 'success') toast.classList.add('success');
  if (type === 'error') toast.classList.add('error');

  toast.classList.remove('hidden');
  toast.classList.add('visible');

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.classList.add('hidden'), 400);
  }, 3000);
}

// Save all messages - Enhanced with IndexedDB
async function saveAllMessages() {
  const textareas = adminGrid.querySelectorAll('.photo-card-textarea');
  const messages = {};

  textareas.forEach((textarea) => {
    const index = textarea.dataset.index;
    const message = textarea.value.trim();
    if (message) {
      messages[index] = message;
    }
  });

  // Save to both localStorage and IndexedDB
  saveLoveMessages(messages);
  await storageManager.saveAllMessages(messages);

  // Show feedback
  showToast('Đã lưu tất cả lời nhắn! 💕', 'success');

  // Trigger confetti
  if (window.particlesManager) {
    window.particlesManager.triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);
  }
}

// Event listeners for admin
adminClose.addEventListener('click', hideAdminPanel);
adminSave.addEventListener('click', saveAllMessages);

// Clear All button
const clearAllBtn = document.getElementById('admin-clear-all');
if (clearAllBtn) {
  clearAllBtn.addEventListener('click', () => {
    showConfirmModal(
      'Xóa tất cả ảnh?',
      'Hành động này sẽ xóa tất cả ảnh trong bộ sưu tập. Bạn có chắc chắn?',
      clearAllImages
    );
  });
}

// Add Photo button(s)
const addPhotoInputs = document.querySelectorAll('#admin-add-photo, #admin-add-photo-empty');
addPhotoInputs.forEach(input => {
  if (input) {
    input.addEventListener('change', async function (e) {
      const files = e.target.files;
      if (!files.length) return;

      const spinContainer = document.getElementById('spin-container');
      const existingImages = spinContainer.getElementsByTagName('img');
      let startIndex = existingImages.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let imgSrc;
        let r2Key = null;

        // Upload to R2 if configured
        if (storageManager.useCloud && storageManager.workerUrl) {
          try {
            showToast(`Đang upload ảnh ${i + 1}/${files.length}...`);
            const result = await storageManager.uploadToR2(file);
            imgSrc = result.url;
            r2Key = result.key;
          } catch (error) {
            console.error('R2 upload failed:', error);
            imgSrc = URL.createObjectURL(file);
            showToast('Upload cloud thất bại, dùng local', 'error');
          }
        } else {
          imgSrc = URL.createObjectURL(file);
        }

        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = `Image ${startIndex + i + 1}`;
        img.dataset.index = startIndex + i;
        if (r2Key) img.dataset.r2key = r2Key;
        img.addEventListener('click', openImageModal);

        // Insert before the <p> tag
        const pTag = spinContainer.querySelector('p');
        if (pTag) {
          spinContainer.insertBefore(img, pTag);
        } else {
          spinContainer.appendChild(img);
        }
      }

      // Re-init carousel
      setTimeout(init, 300);
      showToast(`Đã thêm ${files.length} ảnh!`, 'success');
      generatePhotoCards();

      // Reset input
      e.target.value = '';
    });
  }
});

// Music input
const adminMp3Input = document.getElementById('admin-mp3-input');
if (adminMp3Input) {
  adminMp3Input.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const audio = document.querySelector('audio');
    if (audio) {
      audio.src = URL.createObjectURL(file);
      audio.play();
      showToast('Đã đổi nhạc nền!', 'success');
    }
  });
}

// Check admin access on page load - redirect logic
if (checkAdminAccess()) {
  document.addEventListener('DOMContentLoaded', async () => {
    entryScreen.style.display = 'none';
    mainContent.style.display = 'none';

    // Init storage manager
    await storageManager.init();

    // Init R2 config UI
    initR2Config();

    showAdminPanel();
  });
}

// Init storage on page load for main page too
document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAdminAccess()) {
    await storageManager.init();
  }
});

// ==================== R2 CLOUD CONFIG ====================
function initR2Config() {
  const workerUrlInput = document.getElementById('worker-url-input');
  const saveWorkerUrlBtn = document.getElementById('save-worker-url');
  const cloudStatus = document.getElementById('cloud-status');

  if (!workerUrlInput || !saveWorkerUrlBtn) return;

  // Load existing URL
  const savedUrl = localStorage.getItem('r2WorkerUrl') || '';
  workerUrlInput.value = savedUrl;
  updateCloudStatus(savedUrl);

  // Save button handler
  saveWorkerUrlBtn.addEventListener('click', async () => {
    const url = workerUrlInput.value.trim();

    if (url) {
      // Test connection
      try {
        const response = await fetch(url, { method: 'GET' });
        if (response.ok) {
          storageManager.setWorkerUrl(url);
          updateCloudStatus(url);
          showToast('Đã kết nối Cloud Storage!', 'success');
        } else {
          throw new Error('Connection failed');
        }
      } catch (error) {
        showToast('Không thể kết nối Worker URL', 'error');
      }
    } else {
      storageManager.setWorkerUrl('');
      updateCloudStatus('');
      showToast('Đã tắt Cloud Storage', 'success');
    }
  });

  function updateCloudStatus(url) {
    if (!cloudStatus) return;

    if (url) {
      cloudStatus.textContent = '✓ Đã kết nối - ảnh sẽ lưu lên cloud';
      cloudStatus.classList.add('connected');
    } else {
      cloudStatus.textContent = 'Chưa cấu hình - ảnh chỉ lưu local';
      cloudStatus.classList.remove('connected');
    }
  }
}

// ==================== LOAD IMAGES FROM CLOUD ====================
async function loadImagesFromCloud() {
  // Skip if no worker URL configured
  if (!storageManager.useCloud || !storageManager.workerUrl) {
    console.log('Cloud not configured, using default images');
    return false;
  }

  try {
    const r2Images = await storageManager.listR2Images();

    if (r2Images.length === 0) {
      console.log('No images in cloud, using default');
      return false;
    }

    const spinContainer = document.getElementById('spin-container');

    // Clear default images
    const existingImages = spinContainer.querySelectorAll('img');
    existingImages.forEach(img => img.remove());

    // Add cloud images
    r2Images.forEach((img, index) => {
      const imgEl = document.createElement('img');
      imgEl.src = img.url;
      imgEl.alt = `Cloud Image ${index + 1}`;
      imgEl.dataset.index = index;
      imgEl.dataset.r2key = img.key;
      imgEl.addEventListener('click', openImageModal);

      const pTag = spinContainer.querySelector('p');
      if (pTag) {
        spinContainer.insertBefore(imgEl, pTag);
      } else {
        spinContainer.appendChild(imgEl);
      }
    });

    console.log(`Loaded ${r2Images.length} images from cloud`);
    return true;
  } catch (error) {
    console.error('Failed to load images from cloud:', error);
    return false;
  }
}

// Init: Load from cloud on page start
document.addEventListener('DOMContentLoaded', async () => {
  await storageManager.init();

  // Try to load images from cloud for main page
  if (!checkAdminAccess()) {
    const cloudLoaded = await loadImagesFromCloud();
    if (cloudLoaded) {
      // Re-init carousel with cloud images after entry is clicked
      const originalReveal = revealMainContent;
      window.revealMainContent = function () {
        originalReveal();
        setTimeout(init, 100);
      };
    }
  }
});
