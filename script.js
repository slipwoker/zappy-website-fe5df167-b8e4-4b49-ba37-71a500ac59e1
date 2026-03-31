document.addEventListener('DOMContentLoaded', function () {

  // ─── 1. Smooth Scroll for Anchor Links ───────────────────────────────────────
  document.body.addEventListener('click', function (e) {
    const target = e.target.closest('a[href^="#"]');
    if (!target) return;

    const hash = target.getAttribute('href');
    if (!hash || hash === '#') return;

    const destination = document.querySelector(hash);
    if (!destination) return;

    e.preventDefault();

    const navbarEl = document.querySelector('.navbar, nav, header');
    const navbarHeight = navbarEl ? navbarEl.offsetHeight : 0;
    const elementTop = destination.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementTop - navbarHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    if (history.pushState) {
      history.pushState(null, null, hash);
    }
  });


  // ─── 2. Navbar Scroll Effect ─────────────────────────────────────────────────
  const navbar = document.querySelector('.navbar, nav, header');

  if (navbar) {
    const SCROLL_THRESHOLD = 50;

    function handleNavbarScroll() {
      if (window.pageYOffset > SCROLL_THRESHOLD) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    let navbarTicking = false;
    window.addEventListener('scroll', function () {
      if (!navbarTicking) {
        window.requestAnimationFrame(function () {
          handleNavbarScroll();
          navbarTicking = false;
        });
        navbarTicking = true;
      }
    }, { passive: true });

    handleNavbarScroll();
  }


  // ─── 3. Contact Form Validation ──────────────────────────────────────────────
  const contactForm = document.querySelector('.contact-form');

  if (contactForm) {

    function getFieldLabel(field) {
      const id = field.id;
      if (id) {
        const label = document.querySelector('label[for="' + id + '"]');
        if (label) return label.textContent.trim().replace(/:$/, '');
      }
      return field.name || field.placeholder || 'This field';
    }

    function showError(field, message) {
      clearError(field);
      field.classList.add('field-error');
      field.setAttribute('aria-invalid', 'true');

      const errorEl = document.createElement('span');
      errorEl.className = 'form-error-message';
      errorEl.setAttribute('role', 'alert');
      errorEl.textContent = message;

      const wrapper = field.closest('.form-group, .field-wrapper, .input-wrapper') || field.parentNode;
      wrapper.appendChild(errorEl);
    }

    function clearError(field) {
      field.classList.remove('field-error');
      field.removeAttribute('aria-invalid');

      const wrapper = field.closest('.form-group, .field-wrapper, .input-wrapper') || field.parentNode;
      const existingError = wrapper.querySelector('.form-error-message');
      if (existingError) existingError.remove();
    }

    function isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function isValidPhone(value) {
      return /^[\d\s\+\-\(\)]{7,20}$/.test(value);
    }

    function validateField(field) {
      const value = field.value.trim();
      const type = field.type ? field.type.toLowerCase() : '';
      const label = getFieldLabel(field);
      const isRequired = field.required || field.hasAttribute('required');

      if (isRequired && value === '') {
        showError(field, label + ' is required.');
        return false;
      }

      if (value !== '') {
        if (type === 'email' && !isValidEmail(value)) {
          showError(field, 'Please enter a valid email address.');
          return false;
        }

        if (type === 'tel' && !isValidPhone(value)) {
          showError(field, 'Please enter a valid phone number.');
          return false;
        }

        if (field.minLength && field.minLength > 0 && value.length < field.minLength) {
          showError(field, label + ' must be at least ' + field.minLength + ' characters.');
          return false;
        }

        if (field.maxLength && field.maxLength > 0 && value.length > field.maxLength) {
          showError(field, label + ' must not exceed ' + field.maxLength + ' characters.');
          return false;
        }
      }

      clearError(field);
      return true;
    }

    const validatableFields = contactForm.querySelectorAll('input, textarea, select');

    validatableFields.forEach(function (field) {
      field.addEventListener('blur', function () {
        validateField(field);
      });

      field.addEventListener('input', function () {
        if (field.classList.contains('field-error')) {
          validateField(field);
        }
      });
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      let isFormValid = true;
      let firstInvalidField = null;

      validatableFields.forEach(function (field) {
        if (field.type === 'hidden' || field.disabled) return;
        const fieldValid = validateField(field);
        if (!fieldValid && !firstInvalidField) {
          firstInvalidField = field;
        }
        if (!fieldValid) isFormValid = false;
      });

      if (!isFormValid) {
        if (firstInvalidField) {
          firstInvalidField.focus();
          firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      const submitBtn = contactForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';

        setTimeout(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }, 3000);
      }

      contactForm.dispatchEvent(new CustomEvent('formValidated', { bubbles: true }));
    });
  }


  // ─── 4. Scroll Animations (Fade-in on Scroll) ────────────────────────────────
  const ANIMATION_CLASS = 'fade-in-up';
  const VISIBLE_CLASS = 'is-visible';
  const ANIMATION_SELECTORS = [
    '.animate',
    '.fade-in',
    '.scroll-animate',
    '.reveal',
    '[data-animate]'
  ];

  const animatableElements = document.querySelectorAll(ANIMATION_SELECTORS.join(', '));

  if (animatableElements.length > 0) {

    const styleId = 'scroll-animation-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = [
        '.animate, .fade-in, .scroll-animate, .reveal, [data-animate] {',
        '  opacity: 0;',
        '  transform: translateY(24px);',
        '  transition: opacity 0.6s ease, transform 0.6s ease;',
        '}',
        '.animate.is-visible, .fade-in.is-visible, .scroll-animate.is-visible,',
        '.reveal.is-visible, [data-animate].is-visible {',
        '  opacity: 1;',
        '  transform: translateY(0);',
        '}'
      ].join('\n');
      document.head.appendChild(style);
    }

    if ('IntersectionObserver' in window) {

      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
      };

      const intersectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.getAttribute('data-delay');

            if (delay) {
              setTimeout(function () {
                el.classList.add(VISIBLE_CLASS);
              }, parseInt(delay, 10));
            } else {
              el.classList.add(VISIBLE_CLASS);
            }

            intersectionObserver.unobserve(el);
          }
        });
      }, observerOptions);

      animatableElements.forEach(function (el) {
        intersectionObserver.observe(el);
      });

    } else {

      function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return rect.top <= windowHeight * 0.9 && rect.bottom >= 0;
      }

      function checkVisibility() {
        animatableElements.forEach(function (el) {
          if (!el.classList.contains(VISIBLE_CLASS) && isElementInViewport(el)) {
            el.classList.add(VISIBLE_CLASS);
          }
        });
      }

      let scrollTicking = false;
      window.addEventListener('scroll', function () {
        if (!scrollTicking) {
          window.requestAnimationFrame(function () {
            checkVisibility();
            scrollTicking = false;
          });
          scrollTicking = true;
        }
      }, { passive: true });

      checkVisibility();
    }
  }

});
/* === NAVBAR SCROLL JS OVERRIDE START === */
(function(){var nb=document.querySelector('nav.navbar,.navbar:not(.zappy-catalog-menu)');var cm=document.querySelector('.zappy-catalog-menu,#zappy-catalog-menu');if(!nb)return;var bodyBg=getComputedStyle(document.body).backgroundColor||'rgb(0,0,0)';var m=bodyBg.match(/\d+/g);var cr=m?parseInt(m[0]):0,cg=m?parseInt(m[1]):0,cb=m?parseInt(m[2]):0;var fb='rgba('+cr+','+cg+','+cb+',0.85)';var sR=cr/255,sG=cg/255,sB=cb/255;sR=sR<=0.03928?sR/12.92:Math.pow((sR+0.055)/1.055,2.4);sG=sG<=0.03928?sG/12.92:Math.pow((sG+0.055)/1.055,2.4);sB=sB<=0.03928?sB/12.92:Math.pow((sB+0.055)/1.055,2.4);var lum=0.2126*sR+0.7152*sG+0.0722*sB;var rs=getComputedStyle(document.documentElement);var td=rs.getPropertyValue('--text-dark').trim()||'#1a1a1a';var tl=rs.getPropertyValue('--text-light').trim()||'#ffffff';var st=(lum>0.4)?td:tl;var th=60;var neSel='a,.navbar-brand,.navbar-brand a,.dropdown-toggle,.mobile-toggle,.phone-header-btn,.mobile-hamburger-btn,.mobile-close-btn,.mobile-submenu-toggle,.nav-link';var skipCls=['cart-link','login-link','nav-search-toggle','search-toggle','nav-cta-btn'];function sTC(c,clr){var els=c.querySelectorAll(neSel);for(var i=0;i<els.length;i++){var sk=false;if(els[i].closest('.sub-menu')||els[i].closest('.dropdown-menu')){sk=true;}for(var j=0;j<skipCls.length;j++){if(els[i].classList.contains(skipCls[j])){sk=true;break;}}if(!sk)els[i].style.setProperty('color',clr,'important');}}function cTC(c){var els=c.querySelectorAll(neSel);for(var i=0;i<els.length;i++){if(els[i].closest('.sub-menu')||els[i].closest('.dropdown-menu'))continue;els[i].style.removeProperty('color');}}function onS(){if(window._zappyNavOverrideActive)return;if(window._zappyNavNoDarkHero)return;if(window.innerWidth<=768){nb.style.removeProperty('background');nb.style.removeProperty('background-color');nb.style.removeProperty('background-image');nb.style.removeProperty('--frosted-text');nb.style.backdropFilter='';nb.style.webkitBackdropFilter='';nb.style.boxShadow='';nb.classList.remove('scrolled');cTC(nb);if(cm){cm.style.removeProperty('background');cm.style.removeProperty('background-color');cm.style.removeProperty('backdrop-filter');cm.style.removeProperty('-webkit-backdrop-filter');cm.classList.remove('scrolled');cTC(cm);}return;}var y=window.scrollY||window.pageYOffset;if(y>th){nb.classList.add('scrolled');nb.style.setProperty('background-color',fb,'important');nb.style.setProperty('background-image','none','important');nb.style.setProperty('--frosted-text',st);nb.style.backdropFilter='blur(12px)';nb.style.webkitBackdropFilter='blur(12px)';nb.style.boxShadow='0 2px 16px rgba(0,0,0,0.12)';sTC(nb,st);if(cm){cm.classList.add('scrolled');cm.style.setProperty('background',fb,'important');cm.style.setProperty('backdrop-filter','blur(12px)','important');cm.style.setProperty('-webkit-backdrop-filter','blur(12px)','important');sTC(cm,st);}}else{if(window._zappyNavNoDarkHero)return;nb.classList.remove('scrolled');nb.style.setProperty('background-color','transparent','important');nb.style.removeProperty('background-image');nb.style.removeProperty('--frosted-text');nb.style.backdropFilter='none';nb.style.webkitBackdropFilter='none';nb.style.boxShadow='none';cTC(nb);if(cm){cm.classList.remove('scrolled');cm.style.setProperty('background','transparent','important');cm.style.setProperty('backdrop-filter','none','important');cm.style.setProperty('-webkit-backdrop-filter','none','important');cTC(cm);}}}if(window._zappyNavScrollCleanup)window._zappyNavScrollCleanup();window.addEventListener('scroll',onS,{passive:true});window.addEventListener('resize',onS,{passive:true});window._zappyNavScrollCleanup=function(){window.removeEventListener('scroll',onS);window.removeEventListener('resize',onS);};onS();function sLum(rv,gv,bv){rv/=255;gv/=255;bv/=255;rv=rv<=0.03928?rv/12.92:Math.pow((rv+0.055)/1.055,2.4);gv=gv<=0.03928?gv/12.92:Math.pow((gv+0.055)/1.055,2.4);bv=bv<=0.03928?bv/12.92:Math.pow((bv+0.055)/1.055,2.4);return 0.2126*rv+0.7152*gv+0.0722*bv;}var heroEl=document.querySelector('section[class*="hero"],[data-hero-type],main>section:first-child');var hasDH=false;if(heroEl){var hCs=getComputedStyle(heroEl);var hBI=hCs.backgroundImage;if(hBI&&hBI!=='none'){if(hBI.indexOf('url(')!==-1){var hM2=hCs.backgroundColor.match(/\d+/g);if(hM2&&hM2.length>=3){hasDH=sLum(parseInt(hM2[0]),parseInt(hM2[1]),parseInt(hM2[2]))<0.4;}else{hasDH=true;}}else if(hBI.indexOf('gradient')!==-1){var cM=hBI.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g);if(cM&&cM.length>0){var tLm=0;for(var ci=0;ci<cM.length;ci++){var pts=cM[ci].match(/\d+/g);tLm+=sLum(parseInt(pts[0]),parseInt(pts[1]),parseInt(pts[2]));}hasDH=(tLm/cM.length)<0.4;}else{hasDH=true;}}else{hasDH=true;}}else{var hM=hCs.backgroundColor.match(/\d+/g);if(hM&&hM.length>=3){hasDH=sLum(parseInt(hM[0]),parseInt(hM[1]),parseInt(hM[2]))<0.4;}}}if(!hasDH){window.removeEventListener('scroll',onS);window.removeEventListener('resize',onS);delete window._zappyNavScrollCleanup;nb.classList.add('scrolled');if(window.innerWidth>768){nb.style.setProperty('--frosted-text',st);nb.style.setProperty('background-image','none','important');nb.style.setProperty('background-color',fb,'important');nb.style.backdropFilter='blur(12px)';nb.style.webkitBackdropFilter='blur(12px)';nb.style.boxShadow='0 2px 16px rgba(0,0,0,0.12)';sTC(nb,st);}if(cm){cm.classList.add('scrolled');if(window.innerWidth>768){cm.style.setProperty('background',fb,'important');cm.style.setProperty('backdrop-filter','blur(12px)','important');cm.style.setProperty('-webkit-backdrop-filter','blur(12px)','important');sTC(cm,st);}}window._zappyNavNoDarkHero=true;var origNbR=nb.classList.remove.bind(nb.classList);nb._origClassListRemove=origNbR;nb.classList.remove=function(){var a=[];for(var i=0;i<arguments.length;i++){if(arguments[i]!=='scrolled')a.push(arguments[i]);}if(a.length>0)origNbR.apply(null,a);};if(cm){var origCmR=cm.classList.remove.bind(cm.classList);cm._origClassListRemove=origCmR;cm.classList.remove=function(){var a=[];for(var i=0;i<arguments.length;i++){if(arguments[i]!=='scrolled')a.push(arguments[i]);}if(a.length>0)origCmR.apply(null,a);};}}})();
/* === NAVBAR SCROLL JS OVERRIDE END === */


/* Cookie Consent */

// Helper function to check cookie consent
function hasConsentFor(category) {
  if (typeof window.CookieConsent === 'undefined') {
    return false; // Default to no consent if cookie consent not loaded
  }
  
  return window.CookieConsent.validConsent(category);
}

// Helper function to execute code only with consent
function withConsent(category, callback) {
  if (hasConsentFor(category)) {
    callback();
  } else {
    console.log(`[WARNING] Skipping ${category} code - no user consent`);
  }
}

// Cookie Consent Initialization

(function() {
  'use strict';
  
  let initAttempts = 0;
  const maxAttempts = 50; // 5 seconds max wait
  
  // Wait for DOM and vanilla-cookieconsent to be ready
  function initCookieConsent() {
    initAttempts++;
    
    
    if (typeof window.CookieConsent === 'undefined') {
      if (initAttempts < maxAttempts) {
        setTimeout(initCookieConsent, 100);
      } else {
      }
      return;
    }

    const cc = window.CookieConsent;
    
    
    // Initialize cookie consent
    try {
      cc.run({
  "autoShow": true,
  "mode": "opt-in",
  "revision": 0,
  "categories": {
    "necessary": {
      "enabled": true,
      "readOnly": true
    },
    "analytics": {
      "enabled": false,
      "readOnly": false,
      "autoClear": {
        "cookies": [
          {
            "name": "_ga"
          },
          {
            "name": "_ga_*"
          },
          {
            "name": "_gid"
          },
          {
            "name": "_gat"
          }
        ]
      }
    },
    "marketing": {
      "enabled": false,
      "readOnly": false,
      "autoClear": {
        "cookies": [
          {
            "name": "_fbp"
          },
          {
            "name": "_fbc"
          },
          {
            "name": "fr"
          }
        ]
      }
    }
  },
  "language": {
    "default": "he",
    "translations": {
      "he": {
        "consentModal": {
          "title": "אנחנו משתמשים בעוגיות 🍪",
          "description": "דוד אינסטלציה משתמש בעוגיות כדי לשפר את החוויה שלך, לנתח שימוש באתר ולסייע במאמצי השיווק שלנו.",
          "acceptAllBtn": "אשר הכל",
          "acceptNecessaryBtn": "רק הכרחי",
          "showPreferencesBtn": "נהל העדפות",
          "footer": "<a href=\"#privacy-policy\">מדיניות פרטיות</a> | <a href=\"#terms-conditions\">תנאי שימוש</a>"
        },
        "preferencesModal": {
          "title": "העדפות עוגיות",
          "acceptAllBtn": "אשר הכל",
          "acceptNecessaryBtn": "רק הכרחי",
          "savePreferencesBtn": "שמור העדפות",
          "closeIconLabel": "סגור",
          "sections": [
            {
              "title": "עוגיות חיוניות",
              "description": "עוגיות אלה הכרחיות לתפקוד האתר ולא ניתן להשבית אותן.",
              "linkedCategory": "necessary"
            },
            {
              "title": "עוגיות ניתוח",
              "description": "עוגיות אלה עוזרות לנו להבין איך המבקרים מתקשרים עם האתר שלנו.",
              "linkedCategory": "analytics"
            },
            {
              "title": "עוגיות שיווקיות",
              "description": "עוגיות אלה משמשות להצגת פרסומות מותאמות אישית.",
              "linkedCategory": "marketing"
            }
          ]
        }
      }
    }
  },
  "guiOptions": {
    "consentModal": {
      "layout": "box",
      "position": "bottom right",
      "equalWeightButtons": true,
      "flipButtons": false
    },
    "preferencesModal": {
      "layout": "box",
      "equalWeightButtons": true,
      "flipButtons": false
    }
  }
});
      
      // Google Consent Mode v2 integration
      // Update consent state based on accepted cookie categories
      function updateGoogleConsentMode() {
        if (typeof gtag !== 'function') {
          // Define gtag if not already defined (needed for consent updates)
          window.dataLayer = window.dataLayer || [];
          window.gtag = function(){dataLayer.push(arguments);};
        }
        
        var analyticsAccepted = cc.acceptedCategory('analytics');
        var marketingAccepted = cc.acceptedCategory('marketing');
        
        gtag('consent', 'update', {
          'analytics_storage': analyticsAccepted ? 'granted' : 'denied',
          'ad_storage': marketingAccepted ? 'granted' : 'denied',
          'ad_user_data': marketingAccepted ? 'granted' : 'denied',
          'ad_personalization': marketingAccepted ? 'granted' : 'denied'
        });
      }
      
      // Update consent on initial load (if user previously accepted)
      updateGoogleConsentMode();
      
      // Handle consent changes via onChange callback
      if (typeof cc.onChange === 'function') {
        cc.onChange(function(cookie, changed_preferences) {
          updateGoogleConsentMode();
        });
      }

      // Note: Cookie Preferences button removed per marketing guidelines
      // Footer should be clean and minimal - users can manage cookies via banner
    } catch (error) {
    }
  }

  // Initialize when DOM is ready - multiple approaches for reliability
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent);
    // Backup timeout in case DOMContentLoaded doesn't fire
    setTimeout(initCookieConsent, 1000);
  } else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initCookieConsent();
  } else {
    // Fallback - try after a short delay
    setTimeout(initCookieConsent, 500);
  }
  
  // Additional fallback - try after page load
  if (typeof window !== 'undefined') {
    if (window.addEventListener) {
      window.addEventListener('load', initCookieConsent, { once: true });
    }
  }
})();

/* Accessibility Features */

/* Mickidum Accessibility Toolbar Initialization - Zappy Style */

window.onload = function() {
    
    try {
        window.micAccessTool = new MicAccessTool({
            buttonPosition: 'left', // Position on left side
            forceLang: 'he-IL', // Force language
            icon: {
                position: {
                    bottom: { size: 50, units: 'px' },
                    left: { size: 20, units: 'px' },
                    type: 'fixed'
                },
                backgroundColor: 'transparent', // Transparent to allow CSS styling
                color: 'transparent', // Let CSS handle coloring
                img: 'accessible',
                circular: false // Square button for consistent styling
            },
            menu: {
                dimensions: {
                    width: { size: 300, units: 'px' },
                    height: { size: 'auto', units: 'px' }
                }
            }
        });
        
    } catch (error) {
    }
    
    // Keyboard shortcut handler: ALT+A (Option+A on Mac) to toggle accessibility widget visibility (desktop only)
    document.addEventListener('keydown', function(event) {
        // Check if ALT+A is pressed (ALT on Windows/Linux, Option on Mac)
        var isAltOrOption = event.altKey;
        // Use event.code for reliable physical key detection (works regardless of Option key character output)
        var isAKey = event.code === 'KeyA' || event.keyCode === 65 || event.which === 65 || 
                      (event.key && (event.key.toLowerCase() === 'a' || event.key === 'å' || event.key === 'Å'));
        
        if (isAltOrOption && isAKey) {
            // Only work on desktop (screen width > 768px)
            if (window.innerWidth > 768) {
                event.preventDefault();
                event.stopPropagation();
                
                // Toggle visibility class on body
                var isVisible = document.body.classList.contains('accessibility-widget-visible');
                
                if (isVisible) {
                    // Hide the widget
                    document.body.classList.remove('accessibility-widget-visible');
                } else {
                    // Show the widget
                    document.body.classList.add('accessibility-widget-visible');
                    
                    // After a short delay, click the button to open the menu
                    setTimeout(function() {
                        var accessButton = document.getElementById('mic-access-tool-general-button');
                        if (accessButton) {
                            accessButton.click();
                        }
                    }, 200);
                }
            }
        }
    }, true);
};


// Zappy Contact Form API Integration (Fallback)
(function() {
    if (window.zappyContactFormLoaded) {
        console.log('📧 Zappy contact form already loaded');
        return;
    }
    window.zappyContactFormLoaded = true;

    function zappyNotify(message, type) {
        var existing = document.querySelectorAll('.zappy-notification');
        existing.forEach(function(el) { el.remove(); });
        var el = document.createElement('div');
        el.className = 'zappy-notification';
        var bg = type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1';
        var fg = type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460';
        var border = type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb';
        var icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
        el.style.cssText = 'position:fixed;top:20px;right:20px;max-width:400px;padding:16px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:10000;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:14px;line-height:1.4;animation:slideInRight .3s ease-out;background:' + bg + ';color:' + fg + ';border:1px solid ' + border;
        el.innerHTML = '<span style="margin-right:8px">' + icon + '</span>' + message + '<button onclick="this.parentElement.remove()" style="background:none;border:none;font-size:18px;cursor:pointer;float:right;opacity:.7;padding:0 0 0 12px">&times;</button>';
        if (!document.getElementById('zappy-notify-anim')) {
            var s = document.createElement('style');
            s.id = 'zappy-notify-anim';
            s.textContent = '@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}';
            document.head.appendChild(s);
        }
        document.body.appendChild(el);
        setTimeout(function() { if (el.parentElement) el.remove(); }, type === 'error' ? 8000 : 5000);
    }

    function initContactFormIntegration() {
        console.log('📧 Zappy: Initializing contact form API integration...');

        var contactForm = document.querySelector('.contact-form') || 
                           document.querySelector('form[action*="contact"]') ||
                           document.querySelector('form#contact') ||
                           document.querySelector('form#contactForm') ||
                           document.getElementById('contactForm') ||
                           document.querySelector('section.contact form') ||
                           document.querySelector('section#contact form') ||
                           document.querySelector('form');
        
        if (!contactForm) {
            console.log('⚠️ Zappy: No contact form found on page');
            return;
        }
        
        console.log('✅ Zappy: Contact form found:', contactForm.className || contactForm.id || 'unnamed form');

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate privacy consent checkbox if present (required for GDPR)
        var privacyCheckbox = this.querySelector('.privacy-consent-checkbox');
        if (privacyCheckbox && !privacyCheckbox.checked) {
            zappyNotify('Please accept the Terms & Conditions and Privacy Policy to continue', 'error');
            privacyCheckbox.focus();
            return;
        }

        // Collect form data with multi-value support (checkboxes, multi-selects)
        var formData = new FormData(this);
        var data = {};
        for (var pair of formData.entries()) {
            if (data[pair[0]] !== undefined) {
                if (Array.isArray(data[pair[0]])) data[pair[0]].push(pair[1]);
                else data[pair[0]] = [data[pair[0]], pair[1]];
            } else {
                data[pair[0]] = pair[1];
            }
        }

        // Smart field mapping
        var _coreNameFields = ['name','firstName','first_name','fname','lastName','last_name','lname'];
        var _coreEmailFields = ['email','emailAddress','mail','e-mail'];
        var _corePhoneFields = ['phone','tel','telephone','mobile','cellphone'];
        var _coreMsgFields = ['message','msg','comments','comment','description','details','notes','body','text','inquiry'];
        var _coreSubjectFields = ['subject','topic','regarding','re'];
        var _allCoreFields = [].concat(_coreNameFields, _coreEmailFields, _corePhoneFields, _coreMsgFields, _coreSubjectFields);

        var resolvedName = (data.name || '').trim()
            || [data.firstName || data.first_name || data.fname || '', data.lastName || data.last_name || data.lname || ''].filter(Boolean).join(' ').trim()
            || (data.email || data.emailAddress || data.mail || '').trim()
            || 'Anonymous';
        var resolvedEmail = (data.email || data.emailAddress || data.mail || data['e-mail'] || '').trim();
        var resolvedPhone = data.phone || data.tel || data.telephone || data.mobile || data.cellphone || null;
        var resolvedSubject = data.subject || data.topic || data.regarding || data.re || 'Contact Form Submission';
        var resolvedMessage = (data.message || data.msg || data.comments || data.comment || data.description || data.details || data.body || data.text || data.inquiry || '').trim();
        if (!resolvedMessage) {
            var extraEntries = Object.entries(data).filter(function(e) { return _allCoreFields.indexOf(e[0]) === -1; });
            if (extraEntries.length > 0) {
                resolvedMessage = extraEntries.map(function(e) {
                    var label = e[0].replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim();
                    var val = Array.isArray(e[1]) ? e[1].join(', ') : e[1];
                    return label + ': ' + val;
                }).join('\n');
            } else {
                resolvedMessage = 'Form submission from ' + window.location.pathname;
            }
        }

        var extraFields = {};
        for (var k of Object.keys(data)) {
            if (_allCoreFields.indexOf(k) === -1 && data[k] !== '' && data[k] !== null && data[k] !== undefined) {
                extraFields[k] = data[k];
            }
        }

        // Loading state
        var submitBtn = this.querySelector('button[type="submit"], input[type="submit"]');
        var originalText = submitBtn ? (submitBtn.value || submitBtn.textContent) : '';
        if (submitBtn) {
            if (submitBtn.tagName === 'INPUT') submitBtn.value = 'Sending...';
            else submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
        }

        var currentPagePath = window.location.pathname;
        if (window.ZAPPY_CONFIG && window.ZAPPY_CONFIG.currentPagePath) {
            currentPagePath = window.ZAPPY_CONFIG.currentPagePath;
        } else {
            try {
                var p = new URLSearchParams(window.location.search).get('page');
                if (p) currentPagePath = p;
            } catch (ignored) {}
        }

        var theForm = this;
        try {
            console.log('📧 Zappy: Sending contact form to backend API...');
            var apiBase = (window.ZAPPY_API_BASE || 'https://api.zappy5.com').replace(/\/$/, '');
            var payload = {
                websiteId: 'fe5df167-b8e4-4b49-ba37-71a500ac59e1',
                name: resolvedName,
                email: resolvedEmail,
                subject: resolvedSubject,
                message: resolvedMessage,
                phone: resolvedPhone,
                currentPagePath: currentPagePath
            };
            if (Object.keys(extraFields).length > 0) {
                payload.extraFields = extraFields;
            }
            var response = await fetch(apiBase + '/api/email/contact-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            var result = await response.json();
            
            if (result.success) {
                console.log('✅ Zappy: Contact form data sent successfully to backend');

                // Thank-you page redirect
                if (result.thankYouPagePath && result.ticketNumber) {
                    var ticketParam = 'ticket=' + encodeURIComponent(result.ticketNumber);
                    var isPreview = window.location.pathname.indexOf('/preview') !== -1;
                    var thankYouUrl;
                    if (isPreview && window.ZAPPY_CONFIG) {
                        var wid = window.ZAPPY_CONFIG.websiteId || 'fe5df167-b8e4-4b49-ba37-71a500ac59e1';
                        var pt = window.location.pathname.indexOf('fullscreen') !== -1 ? 'preview-fullscreen' : 'preview';
                        thankYouUrl = window.location.origin + '/api/website/' + pt + '/' + wid + '?page=' + encodeURIComponent(result.thankYouPagePath) + '&' + ticketParam;
                        if (window.ZAPPY_CONFIG.authToken) thankYouUrl += '&auth_token=' + encodeURIComponent(window.ZAPPY_CONFIG.authToken);
                    } else {
                        thankYouUrl = result.thankYouPagePath + '?' + ticketParam;
                    }
                    window.location.href = thankYouUrl;
                    return;
                }

                var _siteLang = document.documentElement.lang || '';
                var _isHeSite = _siteLang === 'he' || (_siteLang !== 'ar' && document.documentElement.dir === 'rtl');
                var _isArSite = _siteLang === 'ar';
                var _successFallback = _isHeSite ? 'ההודעה שלך נשלחה בהצלחה! נחזור אליך בהקדם.' : _isArSite ? 'تم إرسال رسالتك بنجاح! سنرد عليك قريبًا.' : 'Thank you for your message! We\'ll get back to you soon.';
                zappyNotify(result.message || _successFallback, 'success');
                theForm.reset();
            } else {
                console.log('⚠️ Zappy: Backend returned error:', result.error);
                var _isHeSiteErr = _siteLang === 'he' || (_siteLang !== 'ar' && document.documentElement.dir === 'rtl');
                var _isArSiteErr = _siteLang === 'ar';
                var _errFallback = _isHeSiteErr ? 'שליחת ההודעה נכשלה. אנא נסו שוב.' : _isArSiteErr ? 'فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.' : 'Failed to send message. Please try again.';
                zappyNotify(result.error || _errFallback, 'error');
            }
        } catch (error) {
            console.error('❌ Zappy: Failed to send to backend API:', error);
            var _isHeSiteNet = _siteLang === 'he' || (_siteLang !== 'ar' && document.documentElement.dir === 'rtl');
            var _isArSiteNet = _siteLang === 'ar';
            var _netFallback = _isHeSiteNet ? 'לא ניתן לשלוח הודעה כרגע. אנא נסו שוב מאוחר יותר.' : _isArSiteNet ? 'لا يمكن إرسال الرسالة الآن. يرجى المحاولة مرة أخرى لاحقًا.' : 'Unable to send message right now. Please try again later.';
            zappyNotify(_netFallback, 'error');
        } finally {
            if (submitBtn) {
                if (submitBtn.tagName === 'INPUT') submitBtn.value = originalText;
                else submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
        }, true);

        console.log('✅ Zappy: Contact form API integration initialized');
    } // End of initContactFormIntegration
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContactFormIntegration);
    } else {
        initContactFormIntegration();
    }
})();


/* ZAPPY_PUBLISHED_LIGHTBOX_RUNTIME */
(function(){
  try {
    if (window.__zappyPublishedLightboxInit) return;
    window.__zappyPublishedLightboxInit = true;

    function safeText(s){ try { return String(s || '').replace(/"/g,'&quot;'); } catch(e){ return ''; } }

    function ensureOverlayForToggle(toggle){
      try {
        if (!toggle || !toggle.id) return;
        if (toggle.id.indexOf('zappy-lightbox-toggle-') !== 0) return;
        var elementId = toggle.id.replace('zappy-lightbox-toggle-','');
        var label = document.querySelector('label.zappy-lightbox-trigger[for="' + toggle.id + '"]');
        if (!label) return;

        // If toggle is inside the label (corrupted), move it before the label so the for attribute works consistently.
        try {
          if (label.contains(toggle) && label.parentNode) {
            label.parentNode.insertBefore(toggle, label);
          }
        } catch (e0) {}

        var lightboxId = 'zappy-lightbox-' + elementId;
        var lb = document.getElementById(lightboxId);
        if (lb && lb.parentNode !== document.body) {
          try { document.body.appendChild(lb); } catch (eMove) {}
        }

        if (!lb) {
          var img = null;
          try { img = label.querySelector('img'); } catch (eImg0) {}
          if (!img) {
            try { img = document.querySelector('img[data-element-id="' + elementId + '"]'); } catch (eImg1) {}
          }
          if (!img) return;

          lb = document.createElement('div');
          lb.id = lightboxId;
          lb.className = 'zappy-lightbox';
          lb.setAttribute('data-zappy-image-lightbox','true');
          lb.style.display = 'none';
          lb.innerHTML =
            '<label class="zappy-lightbox-backdrop" for="' + toggle.id + '" aria-label="Close"></label>' +
            '<div class="zappy-lightbox-content">' +
              '<label class="zappy-lightbox-close" for="' + toggle.id + '" aria-label="Close">×</label>' +
              '<img class="zappy-lightbox-image" src="' + safeText(img.currentSrc || img.src || img.getAttribute('src')) + '" alt="' + safeText(img.getAttribute('alt') || 'Image') + '">' +
            '</div>';
          document.body.appendChild(lb);
        }

        // Keep overlay image in sync at open time (in case src changed / responsive currentSrc)
        function syncOverlayImage(){
          try {
            var imgCur = label.querySelector('img');
            var imgLb = lb.querySelector('img');
            if (imgCur && imgLb) {
              imgLb.src = imgCur.currentSrc || imgCur.src || imgLb.src;
              imgLb.alt = imgCur.alt || imgLb.alt;
            }
          } catch (eSync) {}
        }

        if (!toggle.__zappyLbBound) {
          toggle.addEventListener('change', function(){
            if (toggle.checked) syncOverlayImage();
            lb.style.display = toggle.checked ? 'flex' : 'none';
          });
          toggle.__zappyLbBound = true;
        }

        if (!lb.__zappyLbBound) {
          lb.addEventListener('click', function(ev){
            try {
              var t = ev.target;
              if (!t) return;
              if (t.classList && (t.classList.contains('zappy-lightbox-backdrop') || t.classList.contains('zappy-lightbox-close'))) {
                ev.preventDefault();
                toggle.checked = false;
                lb.style.display = 'none';
              }
            } catch (e2) {}
          });
          lb.__zappyLbBound = true;
        }

        if (!label.__zappyLbClick) {
          label.addEventListener('click', function(ev){
            try {
              if (document.body && document.body.classList && document.body.classList.contains('zappy-edit-mode')) return;
              if (ev && ev.target && ev.target.closest && ev.target.closest('a[href],button,input,select,textarea')) return;
              ev.preventDefault();
              ev.stopPropagation();
              toggle.checked = true;
              syncOverlayImage();
              lb.style.display = 'flex';
            } catch (e3) {}
          }, true);
          label.__zappyLbClick = true;
        }
      } catch (e) {}
    }

    function ensureLightboxCss(){
      try {
        var head = document.head || document.querySelector('head');
        if (!head || head.querySelector('style[data-zappy-image-lightbox="true"]')) return;
        var s = document.createElement('style');
        s.setAttribute('data-zappy-image-lightbox','true');
        s.textContent =
          '.zappy-lightbox{position:fixed;inset:0;background:rgba(0,0,0,.72);display:none;align-items:center;justify-content:center;z-index:9999;padding:24px;}'+
          '.zappy-lightbox-content{position:relative;max-width:min(1100px,92vw);max-height:92vh;}'+
          '.zappy-lightbox-content img{max-width:92vw;max-height:92vh;display:block;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.45);}'+
          '.zappy-lightbox-close{position:absolute;top:-14px;right:-14px;width:32px;height:32px;border-radius:999px;background:#fff;color:#111;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 8px 24px rgba(0,0,0,.25);cursor:pointer;}'+
          '.zappy-lightbox-backdrop{position:absolute;inset:0;display:block;cursor:pointer;}'+
          'input.zappy-lightbox-toggle{position:absolute;opacity:0;pointer-events:none;}'+
          'label.zappy-lightbox-trigger{display:contents;}'+
          'label.zappy-lightbox-trigger{cursor:zoom-in;}'+
          'label.zappy-lightbox-trigger [data-zappy-zoom-wrapper="true"],'+
          'label.zappy-lightbox-trigger img{cursor:zoom-in !important;}'+
          'input.zappy-lightbox-toggle:checked + label.zappy-lightbox-trigger + .zappy-lightbox{display:flex;}';
        head.appendChild(s);
      } catch(e){}
    }

    function initZappyPublishedLightboxes(){
      try {
        ensureLightboxCss();
        // Repair orphaned labels (label has for=toggleId but input is missing)
        var orphanLabels = document.querySelectorAll('label.zappy-lightbox-trigger[for^="zappy-lightbox-toggle-"]');
        for (var i=0;i<orphanLabels.length;i++){
          var lbl = orphanLabels[i];
          var forId = lbl && lbl.getAttribute ? lbl.getAttribute('for') : null;
          if (!forId) continue;
          if (!document.getElementById(forId)) {
            var t = document.createElement('input');
            t.type = 'checkbox';
            t.id = forId;
            t.className = 'zappy-lightbox-toggle';
            t.setAttribute('data-zappy-image-lightbox','true');
            if (lbl.parentNode) lbl.parentNode.insertBefore(t, lbl);
          }
        }

        var toggles = document.querySelectorAll('input.zappy-lightbox-toggle[id^="zappy-lightbox-toggle-"]');
        for (var j=0;j<toggles.length;j++){
          ensureOverlayForToggle(toggles[j]);
        }

        // Close on ESC if any lightbox is open
        if (!document.__zappyLbEscBound) {
          document.addEventListener('keydown', function(ev){
            try {
              if (!ev || ev.key !== 'Escape') return;
              var openLb = document.querySelector('.zappy-lightbox[style*="display: flex"]');
              if (openLb) {
                var openToggle = null;
                try {
                  var id = openLb.id || '';
                  if (id.indexOf('zappy-lightbox-') === 0) {
                    openToggle = document.getElementById('zappy-lightbox-toggle-' + id.replace('zappy-lightbox-',''));
                  }
                } catch (e4) {}
                if (openToggle) openToggle.checked = false;
                openLb.style.display = 'none';
              }
            } catch (e5) {}
          });
          document.__zappyLbEscBound = true;
        }
      } catch (eInit) {}
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initZappyPublishedLightboxes, { once: true });
    } else {
      initZappyPublishedLightboxes();
    }
  } catch (eOuter) {}
})();
/* END ZAPPY_PUBLISHED_LIGHTBOX_RUNTIME */


/* ZAPPY_PUBLISHED_ZOOM_WRAPPER_RUNTIME */
(function(){
  try {
    if (window.__zappyPublishedZoomInit) return;
    window.__zappyPublishedZoomInit = true;

    function parseObjPos(op) {
      var x = 50, y = 50;
      try {
        if (typeof op === 'string') {
          var m = op.match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
          if (m) { x = parseFloat(m[1]); y = parseFloat(m[2]); }
        }
      } catch (e) {}
      if (!isFinite(x)) x = 50; if (!isFinite(y)) y = 50;
      return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
    }

    function coverPercents(imgA, contA) {
      if (!isFinite(imgA) || imgA <= 0 || !isFinite(contA) || contA <= 0)
        return { w: 100, h: 100 };
      if (imgA >= contA) return { w: (imgA / contA) * 100, h: 100 };
      return { w: 100, h: (contA / imgA) * 100 };
    }

    function applyZoom(wrapper, img) {
      var zoom = parseFloat(img.getAttribute('data-zappy-zoom')) || 1;
      if (!(zoom > 0)) zoom = 1;

      var widthMode = wrapper.getAttribute('data-zappy-zoom-wrapper-width-mode');
      if (widthMode === 'full') return;

      var isMobile = window.innerWidth <= 768;
      if (isMobile) {
        img.style.setProperty('position', 'relative', 'important');
        img.style.setProperty('width', '100%', 'important');
        img.style.setProperty('height', 'auto', 'important');
        img.style.setProperty('max-width', '100%', 'important');
        img.style.setProperty('display', 'block', 'important');
        img.style.setProperty('object-fit', 'cover', 'important');
        img.style.removeProperty('left');
        img.style.removeProperty('top');
        img.style.setProperty('margin', '0', 'important');
        return;
      }

      // Desktop: if the image already has zoom styles saved from the editor
      // (position:absolute + percentage-based width), trust them.
      // The saved percentages are proportional and correct for any container size,
      // since zoom/crop math is based purely on aspect ratios.
      // Recalculating here can produce different values when the container
      // dimensions differ between preview and deployed site.
      var existingPos = (img.style.position || '').replace(/s*!importants*/g, '').trim();
      var existingW = (img.style.width || '').replace(/s*!importants*/g, '').trim();
      if (existingPos === 'absolute' && existingW.indexOf('%') !== -1) {
        wrapper.style.setProperty('overflow', 'hidden', 'important');
        wrapper.style.setProperty('position', 'relative', 'important');
        return;
      }

      // Image lacks saved zoom styles — calculate from scratch
      var rect = wrapper.getBoundingClientRect();
      if (!rect || !rect.width || !rect.height) return;

      var nW = img.naturalWidth || 0, nH = img.naturalHeight || 0;
      if (!(nW > 0 && nH > 0)) return;

      var imgA = nW / nH;
      var contA = rect.width / rect.height;
      var cover = coverPercents(imgA, contA);

      var wPct = 100, hPct = 100;
      if (zoom >= 1) {
        wPct = cover.w * zoom;
        hPct = cover.h * zoom;
      } else {
        var t = (zoom - 0.5) / 0.5;
        if (!isFinite(t)) t = 0;
        t = Math.max(0, Math.min(1, t));
        wPct = 100 + t * (cover.w - 100);
        hPct = 100 + t * (cover.h - 100);
      }

      var op = img.style.objectPosition || window.getComputedStyle(img).objectPosition || '50% 50%';
      var pos = parseObjPos(op);
      var leftPct = (100 - wPct) * (pos.x / 100);
      var topPct = (100 - hPct) * (pos.y / 100);

      img.style.setProperty('position', 'absolute', 'important');
      img.style.setProperty('left', leftPct + '%', 'important');
      img.style.setProperty('top', topPct + '%', 'important');
      img.style.setProperty('width', wPct + '%', 'important');
      img.style.setProperty('height', hPct + '%', 'important');
      img.style.setProperty('max-width', 'none', 'important');
      img.style.setProperty('max-height', 'none', 'important');
      img.style.setProperty('display', 'block', 'important');
      img.style.setProperty('object-fit', zoom < 1 ? 'fill' : 'cover', 'important');
      img.style.setProperty('margin', '0', 'important');
    }

    function fixOrphanedZoomImages() {
      if (window.innerWidth > 768) return;
      var zoomImgs = document.querySelectorAll('img[data-zappy-zoom]');
      for (var j = 0; j < zoomImgs.length; j++) {
        var img = zoomImgs[j];
        if (img.closest && img.closest('[data-zappy-zoom-wrapper="true"]')) continue;
        img.style.setProperty('position', 'relative', 'important');
        img.style.setProperty('width', '100%', 'important');
        img.style.setProperty('height', 'auto', 'important');
        img.style.setProperty('max-width', '100%', 'important');
        img.style.setProperty('max-height', '300px', 'important');
        img.style.setProperty('object-fit', 'cover', 'important');
        img.style.removeProperty('left');
        img.style.removeProperty('top');
      }
    }

    function restoreWrapperDimensions(wrapper) {
      var widthMode = wrapper.getAttribute('data-zappy-zoom-wrapper-width-mode') || 'px';
      if (widthMode === 'full' || widthMode === 'grid-responsive') return;

      var storedW = wrapper.getAttribute('data-zappy-zoom-wrapper-width');
      var storedH = wrapper.getAttribute('data-zappy-zoom-wrapper-height');
      if (!storedW && !storedH) return;

      if (widthMode === 'px' && storedW) {
        var curW = (wrapper.style.width || '').replace(/s*!importants*/g, '').trim();
        if (!curW || curW === '100%' || curW.indexOf('%') !== -1) {
          wrapper.style.setProperty('width', storedW, 'important');
          wrapper.style.setProperty('max-width', '100%', 'important');
        }
      }
      if (storedH) {
        var curH = (wrapper.style.height || '').replace(/s*!importants*/g, '').trim();
        if (!curH || curH === 'auto' || curH === '100%' || curH.indexOf('%') !== -1) {
          wrapper.style.setProperty('height', storedH, 'important');
        }
      }
      wrapper.style.setProperty('overflow', 'hidden', 'important');
      wrapper.style.setProperty('position', 'relative', 'important');
    }

    function initZoomWrappers() {
      var wrappers = document.querySelectorAll('[data-zappy-zoom-wrapper="true"]');
      for (var i = 0; i < wrappers.length; i++) {
        (function(wrapper) {
          var img = wrapper.querySelector('img');
          if (!img) return;
          if (wrapper.closest && wrapper.closest('.zappy-carousel-js-init, .zappy-carousel-active')) return;
          if (window.innerWidth > 768) restoreWrapperDimensions(wrapper);
          if (img.complete && img.naturalWidth > 0) {
            setTimeout(function() { applyZoom(wrapper, img); }, 0);
          } else {
            img.addEventListener('load', function onLoad() {
              img.removeEventListener('load', onLoad);
              applyZoom(wrapper, img);
            }, { once: true });
          }
        })(wrappers[i]);
      }
      fixOrphanedZoomImages();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initZoomWrappers, { once: true });
    } else {
      setTimeout(initZoomWrappers, 50);
    }
  } catch (eOuter) {}
})();
/* END ZAPPY_PUBLISHED_ZOOM_WRAPPER_RUNTIME */


/* ZAPPY_MOBILE_MENU_TOGGLE */
(function(){
  try {
    if (window.__zappyMobileMenuToggleInit) return;
    window.__zappyMobileMenuToggleInit = true;

    function initMobileToggle() {
      var toggle = document.querySelector('.mobile-toggle, #mobileToggle');
      var navMenu = document.querySelector('#navMenu, .nav-menu, .navbar-menu');
      if (!toggle || !navMenu) return;

      // Skip if this toggle already has a click handler from the site's own JS
      if (toggle.__zappyMobileToggleBound) return;
      toggle.__zappyMobileToggleBound = true;

      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var hamburgerIcon = toggle.querySelector('.hamburger-icon');
        var closeIcon = toggle.querySelector('.close-icon');
        var isOpen = navMenu.classList.contains('active') || navMenu.style.display === 'block';

        if (isOpen) {
          navMenu.classList.remove('active');
          navMenu.style.display = '';
          if (hamburgerIcon) hamburgerIcon.style.setProperty('display', 'block', 'important');
          if (closeIcon) closeIcon.style.setProperty('display', 'none', 'important');
          document.body.style.overflow = '';
        } else {
          navMenu.classList.add('active');
          navMenu.style.display = 'block';
          if (hamburgerIcon) hamburgerIcon.style.setProperty('display', 'none', 'important');
          if (closeIcon) closeIcon.style.setProperty('display', 'block', 'important');
          document.body.style.overflow = 'hidden';
        }
      }, true);

      // Close on clicking outside
      document.addEventListener('click', function(e) {
        if (!navMenu.classList.contains('active')) return;
        if (toggle.contains(e.target) || navMenu.contains(e.target)) return;
        navMenu.classList.remove('active');
        navMenu.style.display = '';
        var hi = toggle.querySelector('.hamburger-icon');
        var ci = toggle.querySelector('.close-icon');
        if (hi) hi.style.setProperty('display', 'block', 'important');
        if (ci) ci.style.setProperty('display', 'none', 'important');
        document.body.style.overflow = '';
      });

      // Close on Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          navMenu.style.display = '';
          var hi = toggle.querySelector('.hamburger-icon');
          var ci = toggle.querySelector('.close-icon');
          if (hi) hi.style.setProperty('display', 'block', 'important');
          if (ci) ci.style.setProperty('display', 'none', 'important');
          document.body.style.overflow = '';
        }
      });

      // Close when clicking a nav link (navigating)
      navMenu.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
          navMenu.classList.remove('active');
          navMenu.style.display = '';
          var hi = toggle.querySelector('.hamburger-icon');
          var ci = toggle.querySelector('.close-icon');
          if (hi) hi.style.setProperty('display', 'block', 'important');
          if (ci) ci.style.setProperty('display', 'none', 'important');
          document.body.style.overflow = '';
        });
      });
    }

    function initPhoneButton() {
      var phoneBtn = document.querySelector('.phone-header-btn');
      if (!phoneBtn || phoneBtn.__zappyPhoneBound) return;
      phoneBtn.__zappyPhoneBound = true;

      phoneBtn.addEventListener('click', function() {
        var phoneNumber = phoneBtn.getAttribute('data-phone') || null;

        if (!phoneNumber) {
          var telLinks = document.querySelectorAll('a[href^="tel:"]');
          if (telLinks.length > 0) {
            phoneNumber = telLinks[0].getAttribute('href').replace('tel:', '');
          }
        }

        if (!phoneNumber) {
          var allLinks = document.querySelectorAll('a[href]');
          for (var i = 0; i < allLinks.length; i++) {
            var h = allLinks[i].getAttribute('href') || '';
            var cleaned = h.replace(/[-\s()]/g, '');
            if (/^(\+?\d{9,15}|0\d{8,9})$/.test(cleaned)) {
              phoneNumber = cleaned;
              break;
            }
          }
        }

        if (phoneNumber && phoneNumber.indexOf('[') === -1) {
          window.location.href = 'tel:' + phoneNumber;
        }
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { initMobileToggle(); initPhoneButton(); }, { once: true });
    } else {
      initMobileToggle();
      initPhoneButton();
    }
  } catch (e) {}
})();
/* END ZAPPY_MOBILE_MENU_TOGGLE */


/* ZAPPY_FAQ_ACCORDION_TOGGLE */
(function(){
  try {
    if (window.__zappyFaqToggleInit) return;
    window.__zappyFaqToggleInit = true;

    var answerSel = '[class*="faq-answer"], [class*="faq-content"], [class*="faq-body"], .accordion-content, .accordion-body';

    function initFaqToggle() {
      var items = document.querySelectorAll('[class*="faq-item"], .accordion-item');
      if (!items.length) return;

      items.forEach(function(item) {
        var question = item.querySelector(
          '[class*="faq-question"], [class*="faq-header"], .accordion-header, .accordion-toggle'
        );
        if (!question) return;
        if (question.__zappyFaqBound) return;
        question.__zappyFaqBound = true;
        question.style.cursor = 'pointer';

        question.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();

          var parent = item.parentElement;
          if (parent) {
            var siblings = parent.querySelectorAll('[class*="faq-item"], .accordion-item');
            siblings.forEach(function(sib) {
              if (sib !== item && sib.classList.contains('active')) {
                sib.classList.remove('active');
                var sibQ = sib.querySelector('[class*="faq-question"], [class*="faq-header"], .accordion-header');
                if (sibQ) sibQ.setAttribute('aria-expanded', 'false');
                var sibA = sib.querySelector(answerSel);
                if (sibA) {
                  sibA.style.maxHeight = '0';
                  sibA.style.overflow = 'hidden';
                  sibA.style.opacity = '0';
                  sibA.style.paddingTop = '0';
                  sibA.style.paddingBottom = '0';
                }
              }
            });
          }

          var isActive = item.classList.toggle('active');
          question.setAttribute('aria-expanded', isActive ? 'true' : 'false');

          var answer = item.querySelector(answerSel);
          if (answer) {
            answer.style.transition = 'max-height 0.35s ease, opacity 0.25s ease, padding 0.25s ease';
            if (isActive) {
              answer.style.display = '';
              answer.style.maxHeight = answer.scrollHeight + 'px';
              answer.style.overflow = 'hidden';
              answer.style.opacity = '1';
              answer.style.paddingTop = '';
              answer.style.paddingBottom = '';
            } else {
              answer.style.maxHeight = '0';
              answer.style.overflow = 'hidden';
              answer.style.opacity = '0';
              answer.style.paddingTop = '0';
              answer.style.paddingBottom = '0';
            }
          }

          var chevron = question.querySelector('[class*="chevron"], [class*="icon"], svg');
          if (chevron) {
            chevron.style.transform = isActive ? 'rotate(180deg)' : 'rotate(0deg)';
            chevron.style.transition = 'transform 0.3s ease';
          }
        });
      });

      items.forEach(function(item) {
        if (item.classList.contains('active')) return;
        var answer = item.querySelector(answerSel);
        if (answer) {
          answer.style.maxHeight = '0';
          answer.style.overflow = 'hidden';
          answer.style.opacity = '0';
          answer.style.paddingTop = '0';
          answer.style.paddingBottom = '0';
          answer.style.transition = 'max-height 0.35s ease, opacity 0.25s ease, padding 0.25s ease';
        }
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initFaqToggle, { once: true });
    } else {
      initFaqToggle();
    }
  } catch (e) {}
})();
/* END ZAPPY_FAQ_ACCORDION_TOGGLE */


/* ZAPPY_NAV_SCROLL_PADDING */
(function(){
  try {
    if (window.__zappyNavScrollPaddingInit) return;
    window.__zappyNavScrollPaddingInit = true;
    function updateScrollPadding() {
      var nav = document.querySelector('nav.navbar') || document.querySelector('nav') || document.querySelector('header');
      if (!nav) return;
      var s = window.getComputedStyle(nav);
      if (s.position !== 'fixed' && s.position !== 'sticky') return;
      var h = nav.offsetHeight;
      if (h > 0) document.documentElement.style.scrollPaddingTop = h + 'px';
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateScrollPadding, { once: true });
    } else {
      updateScrollPadding();
    }
    window.addEventListener('resize', updateScrollPadding, { passive: true });
  } catch (e) {}
})();
/* END ZAPPY_NAV_SCROLL_PADDING */


/* ZAPPY_CONTACT_FORM_PREVENT_DEFAULT */
(function(){
  try {
    var _kw=['contact','booking','inquiry','enquiry','register','signup','sign-up','order','request','apply'];
    function isContactForm(form) {
      var cls=(form.className||'').toLowerCase();
      var id=(form.id||'').toLowerCase();
      var act=(form.getAttribute('action')||'').toLowerCase();
      if(_kw.some(function(k){return cls.indexOf(k)!==-1||id.indexOf(k)!==-1||act.indexOf(k)!==-1;})) return true;
      var sec=form.closest&&form.closest('section');
      if(sec){
        var sc=(sec.className||'').toLowerCase();
        var si=(sec.id||'').toLowerCase();
        if(_kw.some(function(k){return sc.indexOf(k)!==-1||si.indexOf(k)!==-1;})) return true;
        if(sc.indexOf('form-section')!==-1||sc.indexOf('form_section')!==-1) return true;
      }
      if(window.zappyContactFormLoaded){
        var inputs=form.querySelectorAll('input,textarea,select');
        var hasEmail=false,hasPassword=false,visibleCount=0;
        for(var i=0;i<inputs.length;i++){
          var inp=inputs[i];
          var t=(inp.type||'').toLowerCase();
          var n=(inp.name||'').toLowerCase();
          if(t==='hidden'||t==='submit'||t==='button'||t==='reset') continue;
          visibleCount++;
          if(t==='email'||n.indexOf('email')!==-1||n.indexOf('mail')!==-1) hasEmail=true;
          if(t==='password') hasPassword=true;
        }
        if(hasEmail&&visibleCount>=2&&!hasPassword) return true;
      }
      return false;
    }

    function showFormFeedback(form, msg, type) {
      var old = form.querySelector('.zappy-form-feedback');
      if (old) old.remove();

      var bg = type==='success'?'#d4edda':type==='error'?'#f8d7da':'#d1ecf1';
      var fg = type==='success'?'#155724':type==='error'?'#721c24':'#0c5460';
      var bd = type==='success'?'#c3e6cb':type==='error'?'#f5c6cb':'#bee5eb';
      var ic = type==='success'?'\u2705':type==='error'?'\u274C':'\u2139\uFE0F';

      var el = document.createElement('div');
      el.className = 'zappy-form-feedback';
      el.setAttribute('role', 'alert');
      el.style.cssText = 'padding:14px 18px;border-radius:8px;margin:12px 0 0;font-size:14px;line-height:1.5;background:'+bg+';color:'+fg+';border:1px solid '+bd+';text-align:center;font-family:inherit;';
      el.innerHTML = '<span style="margin-inline-end:6px">'+ic+'</span>'+msg;

      if (type === 'success') {
        form.reset();
        var formChildren = form.children;
        for (var i = 0; i < formChildren.length; i++) {
          if (formChildren[i] !== el) formChildren[i].style.display = 'none';
        }
        form.appendChild(el);
        el.style.cssText += 'padding:32px 24px;font-size:16px;';
      } else {
        var btn = form.querySelector('button[type="submit"],input[type="submit"]');
        if (btn) btn.parentNode.insertBefore(el, btn.nextSibling);
        else form.appendChild(el);
        setTimeout(function(){ if(el.parentElement) el.remove(); }, 8000);
      }
    }

    var _coreNameFields=['name','firstName','first_name','fname','lastName','last_name','lname'];
    var _coreEmailFields=['email','emailAddress','mail','e-mail'];
    var _corePhoneFields=['phone','tel','telephone','mobile','cellphone'];
    var _coreMsgFields=['message','msg','comments','comment','description','details','notes','body','text','inquiry'];
    var _coreSubjectFields=['subject','topic','regarding','re'];
    var _allCoreFields=[].concat(_coreNameFields,_coreEmailFields,_corePhoneFields,_coreMsgFields,_coreSubjectFields);

    document.addEventListener('submit', function(e) {
      var form = e.target;
      if (!form || form.tagName !== 'FORM' || !isContactForm(form)) return;
      e.preventDefault();
      e.stopPropagation();

      var origSubmit = form.submit;
      form.submit = function(){ };

      if (form.__zappySubmitting) return;
      form.__zappySubmitting = true;

      var oldFeedback = form.querySelector('.zappy-form-feedback');
      if (oldFeedback) oldFeedback.remove();

      var btn = form.querySelector('button[type="submit"],input[type="submit"]');
      var origText = btn ? (btn.value || btn.textContent) : '';
      if (btn) {
        if (btn.tagName === 'INPUT') btn.value = 'Sending...';
        else btn.textContent = 'Sending...';
        btn.disabled = true;
      }

      var fd = new FormData(form);
      var data = {};
      for(var pair of fd.entries()){
        if(data[pair[0]]!==undefined){
          if(Array.isArray(data[pair[0]])) data[pair[0]].push(pair[1]);
          else data[pair[0]]=[data[pair[0]],pair[1]];
        } else data[pair[0]]=pair[1];
      }

      var resolvedName=(data.name||'').trim()
        ||[data.firstName||data.first_name||data.fname||'',data.lastName||data.last_name||data.lname||''].filter(Boolean).join(' ').trim()
        ||(data.email||data.emailAddress||data.mail||'').trim()
        ||'Anonymous';
      var resolvedEmail=(data.email||data.emailAddress||data.mail||data['e-mail']||'').trim();
      var resolvedPhone=data.phone||data.tel||data.telephone||data.mobile||data.cellphone||null;
      var resolvedSubject=data.subject||data.topic||data.regarding||data.re||'Contact Form Submission';
      var resolvedMsg=(data.message||data.msg||data.comments||data.comment||data.description||data.details||data.notes||data.body||data.text||data.inquiry||'').trim();
      if(!resolvedMsg){
        var _extra=Object.entries(data).filter(function(e){return _allCoreFields.indexOf(e[0])===-1;});
        if(_extra.length>0) resolvedMsg=_extra.map(function(e){var l=e[0].replace(/([A-Z])/g,' $1').replace(/[_-]/g,' ').trim();var v=Array.isArray(e[1])?e[1].join(', '):e[1];return l+': '+v;}).join('\n');
        else resolvedMsg='Form submission from '+window.location.pathname;
      }

      var extraFields={};
      Object.keys(data).forEach(function(k){if(_allCoreFields.indexOf(k)===-1&&data[k]!==''&&data[k]!=null) extraFields[k]=data[k];});

      var currentPath = window.location.pathname;
      try { var pg=new URLSearchParams(window.location.search).get('page'); if(pg) currentPath=pg; } catch(x){}

      var wid = 'fe5df167-b8e4-4b49-ba37-71a500ac59e1';

      var apiBase = (window.ZAPPY_API_BASE || 'https://api.zappy5.com').replace(/\/$/,'');
      apiBase = apiBase + '/api/email/contact-form';

      var payload={
        websiteId: wid,
        name: resolvedName,
        email: resolvedEmail,
        subject: resolvedSubject,
        message: resolvedMsg,
        phone: resolvedPhone,
        currentPagePath: currentPath
      };
      if(Object.keys(extraFields).length>0) payload.extraFields=extraFields;

      fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function(r){ return r.json(); }).then(function(result){
        if (result.success) {
          if (result.thankYouPagePath && result.ticketNumber) {
            window.location.href = result.thankYouPagePath + '?ticket=' + encodeURIComponent(result.ticketNumber);
            return;
          }
          showFormFeedback(form, result.message || 'Thank you! We will get back to you soon.', 'success');
        } else {
          showFormFeedback(form, result.error || 'Failed to send. Please try again.', 'error');
        }
      }).catch(function(){
        showFormFeedback(form, 'Unable to send message right now. Please try again later.', 'error');
      }).finally(function(){
        form.__zappySubmitting = false;
        form.submit = origSubmit;
        if (btn) {
          if (btn.tagName === 'INPUT') btn.value = origText;
          else btn.textContent = origText;
          btn.disabled = false;
        }
      });
    }, true);
  } catch (e) {}
})();
/* END ZAPPY_CONTACT_FORM_PREVENT_DEFAULT */


/* ZAPPY_PUBLISHED_GRID_CENTERING */
(function(){
  try {
    if (window.__zappyGridCenteringInit) return;
    window.__zappyGridCenteringInit = true;

    function centerPartialGridRows() {
      var grids = document.querySelectorAll('[data-zappy-explicit-columns="true"], [data-zappy-auto-grid="true"]');
      for (var g = 0; g < grids.length; g++) {
        try {
          var container = grids[g];
          // Skip if already processed
          if (container.getAttribute('data-zappy-grid-centered') === 'true') continue;

          var items = [];
          for (var c = 0; c < container.children.length; c++) {
            var ch = container.children[c];
            if (!ch || !ch.tagName) continue;
            var tag = ch.tagName.toLowerCase();
            if (tag === 'script' || tag === 'style') continue;
            if (ch.getAttribute('aria-hidden') === 'true') continue;
            if (ch.getAttribute('data-zappy-internal') === 'true') continue;
            var pos = window.getComputedStyle(ch).position;
            if (pos === 'absolute' || pos === 'fixed') continue;
            items.push(ch);
          }
          var totalItems = items.length;
          if (totalItems === 0) continue;

          var cs = window.getComputedStyle(container);
          if (cs.display !== 'grid') continue;
          var gta = (cs.gridTemplateAreas || '').trim();
          if (gta && gta !== 'none') continue;
          var gtc = (cs.gridTemplateColumns || '').trim();
          if (!gtc || gtc === 'none') continue;
          var colWidths = gtc.split(' ').filter(function(v) { return v && parseFloat(v) > 0; });
          var colCount = colWidths.length;
          if (colCount <= 1) continue;

          var itemsInLastRow = totalItems % colCount;
          if (itemsInLastRow === 0) continue;

          var colWidth = parseFloat(colWidths[0]) || 0;
          var gap = parseFloat(cs.columnGap);
          if (isNaN(gap)) gap = parseFloat(cs.gap) || 0;

          var missingCols = colCount - itemsInLastRow;
          var offset = missingCols * (colWidth + gap) / 2;

          // Detect RTL
          var dir = cs.direction || 'ltr';
          var el = container;
          while (el && dir === 'ltr') {
            if (el.getAttribute && el.getAttribute('dir')) { dir = el.getAttribute('dir'); break; }
            if (el.style && el.style.direction) { dir = el.style.direction; break; }
            el = el.parentElement;
          }
          var translateValue = dir === 'rtl' ? -offset : offset;

          // Apply transform to last-row items
          // Temporarily disable CSS transitions to prevent visible animation
          // Preserve any existing transforms (e.g., scale, rotate) by composing
          var startIndex = totalItems - itemsInLastRow;
          var savedTransitions = [];
          for (var i = startIndex; i < totalItems; i++) {
            var item = items[i];
            savedTransitions.push(item.style.transition);
            item.style.transition = 'none';
            var existingTransform = item.style.transform || '';
            var newTransform = existingTransform
              ? existingTransform + ' translateX(' + translateValue + 'px)'
              : 'translateX(' + translateValue + 'px)';
            item.style.transform = newTransform;
          }

          // Force synchronous reflow so the transform is applied instantly
          void container.offsetHeight;

          // Restore original transitions
          for (var j = startIndex; j < totalItems; j++) {
            items[j].style.transition = savedTransitions[j - startIndex];
          }

          // Mark grid as processed so we don't double-apply
          container.setAttribute('data-zappy-grid-centered', 'true');
        } catch(e) {}
      }
    }

    // Run once after DOM is fully loaded (fonts, images, layout complete)
    if (document.readyState === 'complete') {
      centerPartialGridRows();
    } else {
      window.addEventListener('load', centerPartialGridRows);
    }
  } catch(e) {}
})();
