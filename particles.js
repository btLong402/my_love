/**
 * Particles Manager - Handles all particle effects
 * - FloatingHearts: Hearts rising from bottom
 * - Sparkles: Twinkling stars around carousel
 * - Confetti: Explosion effect on double-click
 * - HeartScatter: Hearts flying on shake
 */

class ParticlesManager {
    constructor() {
        this.container = null;
        this.hearts = [];
        this.sparkles = [];
        this.confetti = [];
        this.maxHearts = 20;
        this.maxSparkles = 15;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }

    init() {
        // Create particles container
        this.container = document.createElement('div');
        this.container.id = 'particles-container';
        this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 50;
      overflow: hidden;
    `;
        document.body.appendChild(this.container);

        // Start floating hearts if not reduced motion
        if (!this.isReducedMotion) {
            this.startFloatingHearts();
            this.startSparkles();
        }
    }

    // ==================== FLOATING HEARTS ====================
    startFloatingHearts() {
        // Create initial hearts
        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.createFloatingHeart(), i * 800);
        }
        // Continue creating hearts
        setInterval(() => {
            if (this.hearts.length < this.maxHearts) {
                this.createFloatingHeart();
            }
        }, 2000);
    }

    createFloatingHeart() {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        const size = 15 + Math.random() * 20;
        const startX = Math.random() * window.innerWidth;
        const duration = 8 + Math.random() * 6;
        const delay = Math.random() * 2;

        heart.innerHTML = this.getHeartSVG();
        heart.style.cssText = `
      position: absolute;
      bottom: -50px;
      left: ${startX}px;
      width: ${size}px;
      height: ${size}px;
      opacity: 0;
      animation: floatUp ${duration}s ease-out ${delay}s forwards;
    `;

        this.container.appendChild(heart);
        this.hearts.push(heart);

        // Remove after animation
        setTimeout(() => {
            heart.remove();
            this.hearts = this.hearts.filter(h => h !== heart);
        }, (duration + delay) * 1000);
    }

    getHeartSVG(color = null) {
        const colors = ['#FF006E', '#D946EF', '#F472B6', '#EC4899', '#FB7185'];
        const c = color || colors[Math.floor(Math.random() * colors.length)];
        return `<svg viewBox="0 0 24 24" fill="${c}">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>`;
    }

    // ==================== SPARKLES ====================
    startSparkles() {
        setInterval(() => {
            if (this.sparkles.length < this.maxSparkles) {
                this.createSparkle();
            }
        }, 500);
    }

    createSparkle() {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        const size = 4 + Math.random() * 8;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const duration = 1 + Math.random() * 1.5;

        sparkle.innerHTML = '✦';
        sparkle.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      font-size: ${size}px;
      color: rgba(255, 255, 255, 0.8);
      text-shadow: 0 0 10px #fff, 0 0 20px #FF006E;
      animation: sparkle ${duration}s ease-in-out forwards;
      pointer-events: none;
    `;

        this.container.appendChild(sparkle);
        this.sparkles.push(sparkle);

        setTimeout(() => {
            sparkle.remove();
            this.sparkles = this.sparkles.filter(s => s !== sparkle);
        }, duration * 1000);
    }

    // ==================== CONFETTI ====================
    triggerConfetti(x, y) {
        if (this.isReducedMotion) return;

        const colors = ['#FF006E', '#D946EF', '#F472B6', '#FBBF24', '#34D399', '#60A5FA'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 5 + Math.random() * 10;
            const angle = (Math.random() * 360) * (Math.PI / 180);
            const velocity = 5 + Math.random() * 10;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            const rotation = Math.random() * 360;

            confetti.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size * 0.6}px;
        background: ${color};
        border-radius: 2px;
        transform: rotate(${rotation}deg);
        pointer-events: none;
      `;

            this.container.appendChild(confetti);

            // Animate confetti
            let posX = x;
            let posY = y;
            let velocityX = vx;
            let velocityY = vy - 10; // Initial upward velocity
            let rotationSpeed = (Math.random() - 0.5) * 20;
            let currentRotation = rotation;
            let opacity = 1;

            const animate = () => {
                velocityY += 0.3; // Gravity
                posX += velocityX;
                posY += velocityY;
                currentRotation += rotationSpeed;
                opacity -= 0.015;

                confetti.style.left = posX + 'px';
                confetti.style.top = posY + 'px';
                confetti.style.transform = `rotate(${currentRotation}deg)`;
                confetti.style.opacity = opacity;

                if (opacity > 0 && posY < window.innerHeight + 50) {
                    requestAnimationFrame(animate);
                } else {
                    confetti.remove();
                }
            };

            requestAnimationFrame(animate);
        }
    }

    // ==================== HEART SCATTER ====================
    scatterHearts() {
        if (this.isReducedMotion) return;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const heartCount = 30;

        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement('div');
            const size = 15 + Math.random() * 25;
            const angle = (i / heartCount) * 360 * (Math.PI / 180);
            const distance = 100 + Math.random() * 200;
            const targetX = centerX + Math.cos(angle) * distance;
            const targetY = centerY + Math.sin(angle) * distance;

            heart.innerHTML = this.getHeartSVG();
            heart.style.cssText = `
        position: absolute;
        left: ${centerX}px;
        top: ${centerY}px;
        width: ${size}px;
        height: ${size}px;
        transform: translate(-50%, -50%) scale(0);
        pointer-events: none;
      `;

            this.container.appendChild(heart);

            // Animate scatter
            let scale = 0;
            let x = centerX;
            let y = centerY;
            let opacity = 1;
            const duration = 1000 + Math.random() * 500;
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);

                x = centerX + (targetX - centerX) * easeOut;
                y = centerY + (targetY - centerY) * easeOut;
                scale = progress < 0.3 ? progress / 0.3 : 1;
                opacity = progress > 0.7 ? 1 - ((progress - 0.7) / 0.3) : 1;

                heart.style.left = x + 'px';
                heart.style.top = y + 'px';
                heart.style.transform = `translate(-50%, -50%) scale(${scale})`;
                heart.style.opacity = opacity;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    heart.remove();
                }
            };

            setTimeout(() => requestAnimationFrame(animate), i * 20);
        }
    }

    // ==================== CURSOR TRAIL ====================
    createCursorTrail(x, y) {
        if (this.isReducedMotion) return;

        const trail = document.createElement('div');
        trail.innerHTML = '✦';
        trail.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      font-size: 12px;
      color: rgba(255, 0, 110, 0.8);
      pointer-events: none;
      animation: cursorTrail 0.6s ease-out forwards;
    `;
        this.container.appendChild(trail);

        setTimeout(() => trail.remove(), 600);
    }
}

// Export for use in main.js
window.ParticlesManager = ParticlesManager;
