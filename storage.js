/**
 * Storage Manager - Handles IndexedDB + Cloudflare R2
 * Local: IndexedDB for offline/fallback
 * Cloud: R2 for persistent sharing
 */

class StorageManager {
    constructor() {
        // IndexedDB config
        this.dbName = 'MyLoveGallery';
        this.dbVersion = 1;
        this.db = null;
        this.isReady = false;

        // Cloudflare R2 Worker URL - UPDATE THIS AFTER DEPLOY
        // Format: https://my-love-r2-worker.<your-subdomain>.workers.dev
        this.workerUrl = localStorage.getItem('r2WorkerUrl') || '';
        this.useCloud = !!this.workerUrl;
    }

    // Set Worker URL (call this from admin panel)
    setWorkerUrl(url) {
        this.workerUrl = url;
        this.useCloud = !!url;
        localStorage.setItem('r2WorkerUrl', url);
    }

    // ==================== R2 CLOUD OPERATIONS ====================

    // Upload image to R2
    async uploadToR2(file) {
        if (!this.workerUrl) {
            throw new Error('Worker URL not configured');
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.workerUrl}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload to R2');
        }

        const result = await response.json();
        return {
            key: result.key,
            url: `${this.workerUrl}${result.url}`
        };
    }

    // Delete image from R2
    async deleteFromR2(key) {
        if (!this.workerUrl) return;

        const response = await fetch(`${this.workerUrl}/delete/${key}`, {
            method: 'DELETE'
        });

        return response.ok;
    }

    // List all images from R2
    async listR2Images() {
        if (!this.workerUrl) return [];

        const response = await fetch(`${this.workerUrl}/list`);
        if (!response.ok) return [];

        const result = await response.json();
        return result.images.map(img => ({
            ...img,
            url: `${this.workerUrl}${img.url}`
        }));
    }

    // Clear all images from R2
    async clearAllR2Images() {
        const images = await this.listR2Images();
        for (const img of images) {
            await this.deleteFromR2(img.key);
        }
    }

    // Initialize IndexedDB
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.isReady = true;
                console.log('IndexedDB initialized');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create images store
                if (!db.objectStoreNames.contains('images')) {
                    const imageStore = db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
                    imageStore.createIndex('order', 'order', { unique: false });
                }

                // Create messages store
                if (!db.objectStoreNames.contains('messages')) {
                    db.createObjectStore('messages', { keyPath: 'id' });
                }

                // Create settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    // Convert File to base64
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // ==================== IMAGE OPERATIONS ====================

    // Get all images
    async getImages() {
        if (!this.isReady) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['images'], 'readonly');
            const store = transaction.objectStore('images');
            const index = store.index('order');
            const request = index.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Add image
    async addImage(file, order = null) {
        if (!this.isReady) await this.init();

        const base64 = await this.fileToBase64(file);
        const images = await this.getImages();
        const newOrder = order !== null ? order : images.length;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['images'], 'readwrite');
            const store = transaction.objectStore('images');
            const request = store.add({
                data: base64,
                name: file.name,
                order: newOrder,
                createdAt: Date.now()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Replace image at specific index
    async replaceImage(id, file) {
        if (!this.isReady) await this.init();

        const base64 = await this.fileToBase64(file);

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['images'], 'readwrite');
            const store = transaction.objectStore('images');

            // First get the existing image to preserve order
            const getRequest = store.get(id);
            getRequest.onsuccess = () => {
                const existing = getRequest.result;
                const updatedImage = {
                    id: id,
                    data: base64,
                    name: file.name,
                    order: existing ? existing.order : 0,
                    createdAt: existing ? existing.createdAt : Date.now(),
                    updatedAt: Date.now()
                };

                const putRequest = store.put(updatedImage);
                putRequest.onsuccess = () => resolve(putRequest.result);
                putRequest.onerror = () => reject(putRequest.error);
            };
        });
    }

    // Delete single image
    async deleteImage(id) {
        if (!this.isReady) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['images'], 'readwrite');
            const store = transaction.objectStore('images');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Clear all images
    async clearAllImages() {
        if (!this.isReady) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['images'], 'readwrite');
            const store = transaction.objectStore('images');
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // ==================== MESSAGE OPERATIONS ====================

    // Get all messages
    async getMessages() {
        if (!this.isReady) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['messages'], 'readonly');
            const store = transaction.objectStore('messages');
            const request = store.getAll();

            request.onsuccess = () => {
                const result = {};
                request.result.forEach(item => {
                    result[item.id] = item.message;
                });
                resolve(result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Save message for image
    async saveMessage(imageId, message) {
        if (!this.isReady) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['messages'], 'readwrite');
            const store = transaction.objectStore('messages');
            const request = store.put({ id: imageId, message: message });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Save all messages
    async saveAllMessages(messages) {
        if (!this.isReady) await this.init();

        const transaction = this.db.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');

        // Clear existing
        await new Promise((resolve, reject) => {
            const clearRequest = store.clear();
            clearRequest.onsuccess = resolve;
            clearRequest.onerror = reject;
        });

        // Add new messages
        for (const [id, message] of Object.entries(messages)) {
            if (message && message.trim()) {
                store.put({ id: id, message: message });
            }
        }

        return new Promise((resolve, reject) => {
            transaction.oncomplete = resolve;
            transaction.onerror = reject;
        });
    }

    // ==================== SETTINGS OPERATIONS ====================

    async getSetting(key) {
        if (!this.isReady) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result?.value);
            request.onerror = () => reject(request.error);
        });
    }

    async saveSetting(key, value) {
        if (!this.isReady) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key: key, value: value });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Check if has custom data
    async hasCustomData() {
        const images = await this.getImages();
        return images.length > 0;
    }
}

// Export for use in main.js
window.StorageManager = StorageManager;
window.storageManager = new StorageManager();
