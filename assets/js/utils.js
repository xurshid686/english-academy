// Core platform utilities
class IELTSPlatform {
    constructor() {
        this.initStorage();
    }

    initStorage() {
        const defaults = {
            'students': [],
            'tests': [],
            'lessons': [],
            'homeworks': [],
            'testResults': [],
            'adminActivities': [],
            'telegramConfig': {},
            'adminSettings': {
                username: 'teacher',
                password: 'password123'
            }
        };

        for (const [key, value] of Object.entries(defaults)) {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify(value));
            }
        }
    }

    getData(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch (error) {
            return [];
        }
    }

    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            return false;
        }
    }

    logActivity(action, type = 'info') {
        const activities = this.getData('adminActivities');
        activities.push({
            action,
            type,
            time: new Date().toLocaleString()
        });
        this.saveData('adminActivities', activities);
    }

    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    async sendTelegramNotification(message) {
        const telegramConfig = this.getData('telegramConfig');
        
        if (!telegramConfig.token || !telegramConfig.chatId) {
            return false;
        }

        try {
            const response = await fetch(`https://api.telegram.org/bot${telegramConfig.token}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: telegramConfig.chatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
            
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.custom-notification');
        existing.forEach(el => el.remove());

        const notification = document.createElement('div');
        notification.className = `custom-notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
}

const platform = new IELTSPlatform();
