/* =====================================================
   SNEKKER NERIJUS JUCINSKAS - Main JavaScript
   ===================================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileMenu();
    initStickyHeader();
    initSmoothScroll();
    initScrollAnimations();
    initContactForm();
    initClickToCall();
});

/* =====================================================
   MOBILE MENU
   ===================================================== */
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-nav a');

    if (!mobileToggle || !mobileNav) return;

    // Toggle menu
    mobileToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    mobileLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            mobileToggle.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
            mobileToggle.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

/* =====================================================
   STICKY HEADER
   ===================================================== */
function initStickyHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        // Add shadow when scrolled
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

/* =====================================================
   SMOOTH SCROLL
   ===================================================== */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Skip if just "#" or no target
            if (href === '#' || href.length <= 1) return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

/* =====================================================
   SCROLL ANIMATIONS
   ===================================================== */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (animatedElements.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(function(el) {
        observer.observe(el);
    });
}

/* =====================================================
   CONTACT FORM
   ===================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const formWrapper = document.querySelector('.contact-form-wrapper');
    const successMessage = document.querySelector('.form-success');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : 'Send';

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate form
        if (!validateForm(form)) {
            return;
        }

        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sender...';
        }

        // Collect form data
        const formData = {
            name: form.querySelector('[name="name"]').value.trim(),
            email: form.querySelector('[name="email"]').value.trim(),
            phone: form.querySelector('[name="phone"]').value.trim(),
            location: form.querySelector('[name="location"]')?.value.trim() || '',
            projectType: form.querySelector('[name="projectType"]').value,
            description: form.querySelector('[name="description"]').value.trim(),
            wantSiteVisit: form.querySelector('[name="siteVisit"]')?.checked || false
        };

        try {
            // In production, this would send to Resend API
            // For now, we'll simulate a successful submission
            await simulateFormSubmission(formData);

            // Show success message
            form.style.display = 'none';
            if (successMessage) {
                successMessage.classList.add('active');
            }

            // Reset form
            form.reset();

        } catch (error) {
            console.error('Form submission error:', error);
            alert('Beklager, noko gjekk gale. Prøv igjen eller ring oss direkte.');
        } finally {
            // Reset button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }
    });

    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(function(input) {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            // Remove error state on input
            this.classList.remove('error');
            const errorMsg = this.parentNode.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(function(field) {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    field.classList.remove('error');

    // Check if required and empty
    if (field.required && !value) {
        isValid = false;
        errorMessage = 'Dette feltet er påkrevd';
    }
    // Email validation
    else if (fieldName === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Ugyldig e-postadresse';
        }
    }
    // Phone validation (Norwegian format)
    else if (fieldName === 'phone' && value) {
        const phoneRegex = /^(\+47)?[\s-]?[0-9]{8}$/;
        const cleanPhone = value.replace(/[\s-]/g, '');
        if (!phoneRegex.test(cleanPhone) && cleanPhone.length < 8) {
            isValid = false;
            errorMessage = 'Ugyldig telefonnummer';
        }
    }

    if (!isValid) {
        field.classList.add('error');
        const errorEl = document.createElement('span');
        errorEl.className = 'error-message';
        errorEl.textContent = errorMessage;
        errorEl.style.cssText = 'color: #A0522D; font-size: 0.875rem; margin-top: 0.25rem; display: block;';
        field.parentNode.appendChild(errorEl);
    }

    return isValid;
}

// Simulate form submission (replace with actual API call)
function simulateFormSubmission(data) {
    return new Promise(function(resolve) {
        console.log('Form data submitted:', data);
        setTimeout(resolve, 1500);
    });
}

/* =====================================================
   RESEND API INTEGRATION
   For production, uncomment and configure this function
   ===================================================== */
/*
async function sendFormToResend(formData) {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer YOUR_RESEND_API_KEY',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: 'noreply@snekker-nerijus.no',
            to: 'post@snekker-nerijus.no',
            subject: `Ny førespurnad frå ${formData.name} - ${formData.projectType}`,
            html: `
                <h2>Ny førespurnad via nettsida</h2>
                <p><strong>Namn:</strong> ${formData.name}</p>
                <p><strong>E-post:</strong> ${formData.email}</p>
                <p><strong>Telefon:</strong> ${formData.phone}</p>
                <p><strong>Stad:</strong> ${formData.location || 'Ikkje oppgitt'}</p>
                <p><strong>Type prosjekt:</strong> ${formData.projectType}</p>
                <p><strong>Ønskjer befaring:</strong> ${formData.wantSiteVisit ? 'Ja' : 'Nei'}</p>
                <h3>Prosjektbeskrivelse:</h3>
                <p>${formData.description}</p>
            `
        })
    });

    if (!response.ok) {
        throw new Error('Failed to send email');
    }

    return response.json();
}
*/

/* =====================================================
   CLICK TO CALL
   ===================================================== */
function initClickToCall() {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');

    phoneLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            // Track phone click (for analytics)
            if (typeof gtag === 'function') {
                gtag('event', 'click', {
                    'event_category': 'Contact',
                    'event_label': 'Phone Call'
                });
            }
        });
    });
}

/* =====================================================
   ACTIVE NAV LINK
   ===================================================== */
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav a, .mobile-nav a');

    navLinks.forEach(function(link) {
        const linkPath = link.getAttribute('href');

        if (currentPath.endsWith(linkPath) ||
            (linkPath === 'index.html' && (currentPath === '/' || currentPath.endsWith('/')))) {
            link.classList.add('active');
        }
    });
}

// Call on page load
setActiveNavLink();

/* =====================================================
   LAZY LOADING IMAGES
   ===================================================== */
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for older browsers
        lazyImages.forEach(function(img) {
            img.src = img.dataset.src;
        });
    }
}

// Initialize lazy loading
initLazyLoading();

/* =====================================================
   UTILITY FUNCTIONS
   ===================================================== */

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = function() {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(function() {
                inThrottle = false;
            }, limit);
        }
    };
}

/* =====================================================
   FORM RESET FOR BACK NAVIGATION
   ===================================================== */
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        // Page was loaded from cache (back/forward navigation)
        const form = document.getElementById('contact-form');
        const successMessage = document.querySelector('.form-success');

        if (form && successMessage) {
            form.style.display = 'block';
            successMessage.classList.remove('active');
        }
    }
});
