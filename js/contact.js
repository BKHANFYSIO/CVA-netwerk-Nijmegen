/* ============================================
   CVA Netwerk Nijmegen – Contact Formulier
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initContactForm();
});

function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', handleSubmit);

    // Remove error state on input
    form.querySelectorAll('.form-input, .form-textarea').forEach(input => {
        input.addEventListener('input', () => {
            input.closest('.form-group').classList.remove('error');
        });
    });
}

function handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const naam = document.getElementById('contactNaam');
    const email = document.getElementById('contactEmail');
    const bericht = document.getElementById('contactBericht');

    let isValid = true;

    // Validate naam
    if (!naam.value.trim()) {
        naam.closest('.form-group').classList.add('error');
        isValid = false;
    }

    // Validate email
    if (!email.value.trim() || !isValidEmail(email.value)) {
        email.closest('.form-group').classList.add('error');
        isValid = false;
    }

    // Validate bericht
    if (!bericht.value.trim()) {
        bericht.closest('.form-group').classList.add('error');
        isValid = false;
    }

    if (!isValid) return;

    // Simulate form submission
    // In production, this would send to a backend API
    const submitBtn = form.querySelector('.form-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Verzenden...
  `;

    // Add spinning animation
    const style = document.createElement('style');
    style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
    document.head.appendChild(style);

    // Simulate API call delay
    setTimeout(() => {
        form.style.display = 'none';
        document.getElementById('formSuccess').classList.add('visible');

        // Log form data (for demo)
        console.log('Contact formulier verzonden:', {
            naam: naam.value,
            email: email.value,
            onderwerp: document.getElementById('contactOnderwerp').value,
            bericht: bericht.value
        });
    }, 1500);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
