// =============================================
// 🔐 AUTHENTICATION SYSTEM
// =============================================

class AuthSystem {
    // Admin login
    adminLogin(username, password) {
        const adminSettings = platform.getData('adminSettings');
        
        if (username === adminSettings.username && password === adminSettings.password) {
            sessionStorage.setItem('adminAuthenticated', 'true');
            sessionStorage.setItem('adminLoginTime', new Date().toISOString());
            platform.logActivity('🔐 Admin logged in', 'security');
            return true;
        }
        return false;
    }

    // Student login
    studentLogin(username, password) {
        const students = platform.getData('students');
        const student = students.find(s => s.username === username && s.password === password);
        
        if (student) {
            sessionStorage.setItem('studentAuthenticated', 'true');
            sessionStorage.setItem('currentStudent', JSON.stringify(student));
            platform.logActivity(`👤 Student logged in: ${student.name}`, 'student');
            return student;
        }
        return null;
    }

    // Check admin auth
    checkAdminAuth() {
        if (sessionStorage.getItem('adminAuthenticated') !== 'true') {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Check student auth
    checkStudentAuth() {
        if (sessionStorage.getItem('studentAuthenticated') !== 'true') {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Get current student
    getCurrentStudent() {
        const studentData = sessionStorage.getItem('currentStudent');
        return studentData ? JSON.parse(studentData) : null;
    }

    // Logout
    logout(userType) {
        if (userType === 'admin') {
            sessionStorage.removeItem('adminAuthenticated');
            sessionStorage.removeItem('adminLoginTime');
            window.location.href = 'login.html';
        } else {
            sessionStorage.removeItem('studentAuthenticated');
            sessionStorage.removeItem('currentStudent');
            window.location.href = 'login.html';
        }
    }

    // Change admin password
    changeAdminPassword(currentPassword, newPassword) {
        const adminSettings = platform.getData('adminSettings');
        
        if (currentPassword !== adminSettings.password) {
            return { success: false, message: 'Current password is incorrect' };
        }
        
        adminSettings.password = newPassword;
        platform.saveData('adminSettings', adminSettings);
        platform.logActivity('🔑 Admin password changed', 'security');
        
        return { success: true, message: 'Password changed successfully' };
    }

    // Change student password
    changeStudentPassword(studentId, currentPassword, newPassword) {
        const students = platform.getData('students');
        const student = students.find(s => s.id === studentId);
        
        if (!student) {
            return { success: false, message: 'Student not found' };
        }
        
        if (currentPassword !== student.password) {
            return { success: false, message: 'Current password is incorrect' };
        }
        
        student.password = newPassword;
        platform.saveData('students', students);
        platform.logActivity(`🔑 Password changed for student: ${student.name}`, 'student');
        
        return { success: true, message: 'Password changed successfully' };
    }
}

const auth = new AuthSystem();
