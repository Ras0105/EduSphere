const passwordField = document.getElementById('password');
const passwordToggle = document.getElementById('passwordToggle');

passwordToggle.addEventListener('click', function() {
    // Check current attribute state to swap text processing views
    const isPassword = passwordField.getAttribute('type') === 'password';
    passwordField.setAttribute('type', isPassword ? 'text' : 'password');
    
    // Toggle representation eye glyph structure classes safely
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});