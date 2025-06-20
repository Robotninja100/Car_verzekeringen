document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('header .menu-toggle'); // More generic selector for reuse
    const mainNav = document.querySelector('header nav'); 

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            const isOpen = mainNav.classList.toggle('menu-open');
            menuToggle.classList.toggle('active'); 
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            document.body.classList.toggle('menu-is-open', isOpen);
        });

        // Close menu when a link is clicked (useful for SPA-like behavior or if menu persists across pages)
        const navLinksMobile = mainNav.querySelectorAll('a');
        navLinksMobile.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('menu-open')) {
                    // Check if it's a hash link for the current page
                    const isCurrentPageHashLink = link.pathname === window.location.pathname && link.hash !== "";
                    
                    // Always close for non-hash links or hash links to other pages.
                    // For same-page hash links, the scroll will happen, then menu closes.
                    mainNav.classList.remove('menu-open');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('menu-is-open');
                }
            });
        });
    }

    // Current Year in Footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Header Scroll Effect
    const header = document.getElementById('mainHeader'); // Assuming all pages might have this ID for header
    if (header) {
        const handleScroll = () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check on page load
    }
    
    // Reveal on Scroll
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.revealDelay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, parseInt(delay));
                    observer.unobserve(entry.target); 
                }
            });
        }, {
            root: null, 
            threshold: 0.1, 
            rootMargin: "0px 0px -50px 0px" // Adjust bottom margin to trigger a bit earlier
        });
        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    }

    // Active Nav Link on Scroll (for index.html like pages)
    const navLinks = document.querySelectorAll('header nav ul li a'); // Generic selector
    const sections = document.querySelectorAll('main section[id]'); // Generic selector

    if (navLinks.length > 0 && sections.length > 0) {
        const updateActiveNavLink = () => {
            let currentSectionId = sections[0].id; // Default to first section
            const offset = window.innerHeight / 3; 

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                if (window.pageYOffset >= sectionTop - offset && window.pageYOffset < sectionBottom - offset) {
                    currentSectionId = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                const linkHref = link.getAttribute('href');
                // Handle absolute URLs and hash links
                const linkTargetId = linkHref.includes('#') ? linkHref.substring(linkHref.lastIndexOf('#') + 1) : null;

                if (linkTargetId && linkTargetId === currentSectionId) {
                    link.classList.add('active');
                } else if (!linkTargetId && link.pathname.endsWith(currentSectionId + ".html")){ // Fallback for direct page links
                    link.classList.add('active');
                }
            });
             // Special case for initial load, if #hero is present, set its link active.
            if(window.pageYOffset < offset && document.getElementById('hero')){
                 navLinks.forEach(link => {
                    const linkHref = link.getAttribute('href');
                    if (linkHref.endsWith('#hero') || (linkHref.endsWith('/') && currentSectionId === 'hero')) { // For root path and hero
                        link.classList.add('active');
                    } else if (!linkHref.includes('#')) { // remove active from non-hash links if hero is active
                        link.classList.remove('active');
                    }
                });
            }
        };
        window.addEventListener('scroll', updateActiveNavLink);
        window.addEventListener('load', updateActiveNavLink); // Initial check
    }


    // Read More for Diensten (if .dienst-item exists)
    const dienstItemsJS = document.querySelectorAll('.dienst-item');
    dienstItemsJS.forEach(item => {
        const pElement = item.querySelector('p');
        const btnElement = item.querySelector('.read-more-btn');
        
        if (pElement && btnElement) { // Check if button exists
            const arrowElement = btnElement.querySelector('.arrow');
            let resizeTimerReadMore;
            let initialMaxHeight = 0; // Will be calculated

            function setupReadMore() {
                // Reset first
                pElement.classList.remove('is-truncated', 'expanded');
                pElement.style.maxHeight = ''; 
                btnElement.style.display = 'none'; // Hide button initially
                if(arrowElement) {
                    btnElement.setAttribute('aria-expanded', 'false');
                    arrowElement.textContent = '▼'; 
                }


                // Calculate if truncation is needed
                const pStyle = window.getComputedStyle(pElement);
                const pLineHeight = parseFloat(pStyle.lineHeight);
                const NUM_LINES_TRUNCATED = 3; 
                initialMaxHeight = pLineHeight * NUM_LINES_TRUNCATED;

                // Check if content actually overflows the calculated max height
                // scrollHeight includes all content, clientHeight is visible area
                if (pElement.scrollHeight > initialMaxHeight + (pLineHeight / 2) ) { // Add a small tolerance
                    pElement.style.maxHeight = `${initialMaxHeight}px`;
                    pElement.classList.add('is-truncated');
                    btnElement.style.display = 'inline-flex'; // Show button only if needed
                }
            }
            
            const debouncedSetupReadMore = () => {
                clearTimeout(resizeTimerReadMore);
                resizeTimerReadMore = setTimeout(setupReadMore, 250);
            };

            // Initial setup
            // Wait for images inside .dienst-item p to load, if any, or general layout shifts
            if (document.readyState === "complete") {
                setTimeout(setupReadMore, 150); // Delay slightly for rendering
            } else {
                window.addEventListener('load', () => setTimeout(setupReadMore, 150));
            }
            window.addEventListener('resize', debouncedSetupReadMore);
            
            btnElement.addEventListener('click', () => {
                const isNowExpanded = pElement.classList.toggle('expanded');
                if(arrowElement) {
                    btnElement.setAttribute('aria-expanded', String(isNowExpanded));
                    arrowElement.textContent = isNowExpanded ? '▲' : '▼';
                }
                
                if (isNowExpanded) {
                    pElement.style.maxHeight = pElement.scrollHeight + 'px'; // Expand to full content height
                } else {
                    pElement.style.maxHeight = `${initialMaxHeight}px`; // Collapse back
                }
            });
        }
    });
});