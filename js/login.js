// Tab switching logic
function switchTab(tab) {
    const studentTab = document.getElementById('tab-student');
    const adminTab = document.getElementById('tab-admin');
    const studentContent = document.getElementById('content-student');
    const adminContent = document.getElementById('content-admin');

    if (tab === 'student') {
        studentTab.classList.add('bg-background', 'text-foreground', 'shadow-sm');
        studentTab.classList.remove('text-muted-foreground', 'hover:bg-background/50');

        adminTab.classList.remove('bg-background', 'text-foreground', 'shadow-sm');
        adminTab.classList.add('text-muted-foreground', 'hover:bg-background/50');

        studentContent.classList.remove('hidden');
        adminContent.classList.add('hidden');
    } else {
        adminTab.classList.add('bg-background', 'text-foreground', 'shadow-sm');
        adminTab.classList.remove('text-muted-foreground', 'hover:bg-background/50');

        studentTab.classList.remove('bg-background', 'text-foreground', 'shadow-sm');
        studentTab.classList.add('text-muted-foreground', 'hover:bg-background/50');

        adminContent.classList.remove('hidden');
        studentContent.classList.add('hidden');
    }
}

// Form handling
document.addEventListener('DOMContentLoaded', () => {
    // Student Login
    const studentForm = document.getElementById('student-form');
    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('student-email').value;
        const password = document.getElementById('student-password').value;

        const user = window.quizStore.login(email, password);

        if (user && user.role === 'student') {
            // Simple toast notification (alert for now, could implement custom toast)
            // alert('Welcome back!');
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid credentials');
        }
    });

    // Admin Login
    const adminForm = document.getElementById('admin-form');
    adminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;

        const user = window.quizStore.login(email, password);

        if (user && user.role === 'admin') {
            // alert('Welcome, Admin!');
            window.location.href = 'admin.html';
        } else {
            alert('Invalid admin credentials');
        }
    });
});
