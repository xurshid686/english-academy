// =============================================
// 🚀 CORE UTILITIES - ALL PLATFORM FUNCTIONS
// =============================================

class IELTSPlatform {
    constructor() {
        this.initStorage();
    }

    // Initialize all storage with default data
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
                username: 'ielts_teacher',
                password: 'admin123'
            }
        };

        for (const [key, value] of Object.entries(defaults)) {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify(value));
            }
        }
    }

    // Get data from localStorage
    getData(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch (error) {
            console.error(`Error getting ${key}:`, error);
            return [];
        }
    }

    // Save data to localStorage
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            return false;
        }
    }

    // Add activity log
    logActivity(action, type = 'info') {
        const activities = this.getData('adminActivities');
        activities.push({
            action,
            type,
            time: new Date().toLocaleString(),
            timestamp: Date.now()
        });
        this.saveData('adminActivities', activities);
    }

    // Generate unique ID
    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // Format date
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Calculate progress percentage
    calculateProgress(studentId) {
        const homeworks = this.getData('homeworks');
        const studentHomeworks = homeworks.filter(h => h.studentId === studentId);
        
        if (studentHomeworks.length === 0) return 0;
        
        const completed = studentHomeworks.filter(h => h.completed).length;
        return Math.round((completed / studentHomeworks.length) * 100);
    }

    // Update student progress
    updateStudentProgress(studentId) {
        const students = this.getData('students');
        const student = students.find(s => s.id === studentId);
        
        if (student) {
            student.progress = this.calculateProgress(studentId);
            student.lastActive = new Date().toISOString();
            this.saveData('students', students);
        }
    }

    // Send Telegram notification
    async sendTelegramNotification(message) {
        const telegramConfig = this.getData('telegramConfig');
        
        if (!telegramConfig.token || !telegramConfig.chatId) {
            console.log('Telegram not configured');
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
            console.error('Telegram error:', error);
            return false;
        }
    }

    // Validate email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-transform duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Confirm action
    confirmAction(message) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white p-6 rounded-2xl w-96">
                    <h3 class="text-xl font-bold mb-4">Confirm Action</h3>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <div class="flex space-x-3">
                        <button onclick="this.closest('.fixed').remove(); resolve(true)" 
                                class="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold">
                            Yes, Continue
                        </button>
                        <button onclick="this.closest('.fixed').remove(); resolve(false)" 
                                class="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold">
                            Cancel
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        });
    }
}

// Initialize platform
const platform = new IELTSPlatform();
