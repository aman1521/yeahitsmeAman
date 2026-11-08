/* ===================================
   NAVBAR SCROLL
=================================== */

window.addEventListener('scroll',()=>{

    const navbar=document.querySelector('.navbar');

    if(window.scrollY > 50){
        navbar.classList.add('scrolled');
    }else{
        navbar.classList.remove('scrolled');
    }
});

/* ===================================
   PARTICLES
=================================== */

for(let i=0;i<50;i++){

    let particle=document.createElement('span');

    particle.classList.add('particle');

    particle.style.left=Math.random()*100+'%';
    particle.style.top=Math.random()*100+'%';

    particle.style.animationDuration=(Math.random()*5+3)+'s';

    document.querySelector('.particles').appendChild(particle);
}

// JavaScript / jQuery
jQuery(document).ready(function(){
    jQuery('#tools-carousel').owlCarousel({
        loop: true,
        margin: 30,
        nav: false,       // Hides navigation arrows
        dots: false,      // Hides pagination dots
        autoplay: true,
        autoplayTimeout: 2500,
        autoplayHoverPause: true,
        slideTransition: 'linear',
        autoplaySpeed: 3000,
        responsive:{
            0:{
                items: 3      // Mobile: show 2 logos
            },
            600:{
                items: 3      // Tablet: show 3 logos
            },
            900:{
                items: 4      // Small Desktop: show 4 logos
            },
            1200:{
                items: 6      // Large Desktop: show all 6 logos
            }
        }
    });
});

/* ===================================
   AUTO-PLAY SLIDER
=================================== */
document.addEventListener("DOMContentLoaded", function() {
    let currentItem = 1;
    const totalItems = 5;
    
    // Auto-play interval for the Pure CSS Slider
    setInterval(function() {
        // Find which radio button is currently checked (important in case user clicked an arrow manually)
        for(let i = 1; i <= totalItems; i++) {
            if(document.getElementById(`item-${i}`).checked) {
                currentItem = i;
                break;
            }
        }
        
        // Uncheck current
        document.getElementById(`item-${currentItem}`).checked = false;
        
        // Move to next
        currentItem++;
        if (currentItem > totalItems) {
            currentItem = 1; 
        }
        
        // Check next
        document.getElementById(`item-${currentItem}`).checked = true;
    }, 4500); 
});

/* ===================================
   MAGNETIC BADGE
=================================== */
document.addEventListener("DOMContentLoaded", function() {
    
    // Select the wrapper using strictly its ID
    const magneticBadge = document.getElementById("magnetic-badge");
    
    if(magneticBadge) {
        const badgeInner = magneticBadge.querySelector('.rotating-badge-inner');
        
        // Mouse Move Event: Calculate magnetic pull
        magneticBadge.addEventListener('mousemove', function(e) {
            const rect = magneticBadge.getBoundingClientRect();
            
            // Calculate center of the element
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Calculate distance of mouse from the center
            const moveX = e.clientX - centerX;
            const moveY = e.clientY - centerY;
            
            // Apply subtle translate (magnetic pull) based on distance
            // Divided by 4 to keep the effect elegant and not too extreme
            badgeInner.style.transform = `translate(${moveX / 4}px, ${moveY / 4}px)`;
        });
        
        // Mouse Leave Event: Snap back to original position smoothly
        magneticBadge.addEventListener('mouseleave', function() {
            badgeInner.style.transform = `translate(0px, 0px)`;
        });
    }

});

// INDER START
/* ===================================
   TIMELINE & SVG LINE LOGIC (SMOOTH FIGMA CURVE)
=================================== */
document.addEventListener("DOMContentLoaded", function() {
    const wrapper = document.getElementById('timeline-wrapper');
    const nodes = document.querySelectorAll('.tl-node-circle');
    const pathBg = document.getElementById('line-bg');
    const pathProgress = document.getElementById('line-progress');
    const scrollItems = document.querySelectorAll('.tl-scroll-item');
    const cards = document.querySelectorAll('.tl-card-box');

    // Force SVG lines to ignore layout transitions so they don't glitch
    if (pathBg) pathBg.style.transition = "none";
    if (pathProgress) pathProgress.style.transition = "stroke-dashoffset 0.1s linear";

    let currentPathLength = 0; 

    // Function A: Purely visual coordinate updates (Smooth Figma Bezier)
    function updatePathCoordinates() {
        if(!wrapper || nodes.length === 0 || !pathBg || !pathProgress) return;
        
        const wrapperRect = wrapper.getBoundingClientRect();
        let d = "";

        nodes.forEach((node, index) => {
            const rect = node.getBoundingClientRect();
            const x = (rect.left - wrapperRect.left) + (rect.width / 2);
            const y = (rect.top - wrapperRect.top) + (rect.height / 2);

            if (index === 0) {
                d += `M ${x} ${y} `;
            } else {
                const prevNode = nodes[index - 1];
                const prevRect = prevNode.getBoundingClientRect();
                const prevX = (prevRect.left - wrapperRect.left) + (prevRect.width / 2);
                const prevY = (prevRect.top - wrapperRect.top) + (prevRect.height / 2);
                
                const midY = prevY + (y - prevY) * 0.5; 
                
                d += `C ${prevX} ${midY}, ${x} ${midY}, ${x} ${y} `;
            }
        });

        pathBg.setAttribute('d', d);
        pathProgress.setAttribute('d', d);
    }

    // Function B: Refreshes lengths safely
    function refreshLineLengths() {
        if(!pathProgress) return;
        currentPathLength = pathProgress.getTotalLength();
        pathProgress.style.strokeDasharray = currentPathLength;
        calculateScrollProgress(); 
    }

    // Function C: Scroll line coloring (Optimized with requestAnimationFrame)
    function calculateScrollProgress() {
        if(!wrapper || !pathProgress || currentPathLength === 0) return;
        const rect = wrapper.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        let scrollPercentage = (windowHeight - rect.top) / (rect.height + windowHeight * 0.5);
        scrollPercentage = Math.max(0, Math.min(1, scrollPercentage));
        
        const drawLength = currentPathLength * (scrollPercentage * 1.3); 
        pathProgress.style.strokeDashoffset = Math.max(0, currentPathLength - drawLength);
    }

    // Track elements as they slide in
    if(scrollItems.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            let hasNewVisible = false;
            
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('tl-visible')) {
                    entry.target.classList.add('tl-visible');
                    hasNewVisible = true;
                }
            });

            if (hasNewVisible) {
                let startTime = performance.now();
                function trackAnimation(time) {
                    updatePathCoordinates(); 
                    if (time - startTime < 800) { 
                        requestAnimationFrame(trackAnimation);
                    } else {
                        refreshLineLengths(); 
                    }
                }
                requestAnimationFrame(trackAnimation);
            }
        }, { rootMargin: '0px 0px -15% 0px' });
        
        scrollItems.forEach(item => observer.observe(item));
    }

    // Hover/Click tilts for Timeline Cards
    cards.forEach(card => {
        let isPressed = false;
        
        card.addEventListener('mouseenter', () => {
            card.classList.add('tl-card-hover-active');
            card.style.transition = "border-color 0.4s ease, box-shadow 0.4s ease, transform 0.1s linear"; 
        });

        card.addEventListener('mousemove', (e) => {
            if(isPressed) return; 
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / 15) * -1; 
            const rotateY = (x - centerX) / 25;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mousedown', () => {
            isPressed = true;
            card.classList.add('tl-card-pressed');
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(0.95)`;
        });

        card.addEventListener('mouseup', () => {
            isPressed = false;
            card.classList.remove('tl-card-pressed');
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            isPressed = false;
            card.classList.remove('tl-card-hover-active');
            card.classList.remove('tl-card-pressed');
            card.style.transition = "all 0.5s ease";
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
        });
    });

    // Resize Observer
    if(wrapper) {
        const resizeObserver = new ResizeObserver(() => {
            updatePathCoordinates();
            refreshLineLengths();
        });
        resizeObserver.observe(wrapper);
    }

    // Optimized Scroll Listener (prevents lag)
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                calculateScrollProgress();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    window.addEventListener('load', () => {
        updatePathCoordinates();
        refreshLineLengths();
    });
    
    setTimeout(() => { updatePathCoordinates(); refreshLineLengths(); }, 200);
    setTimeout(() => { updatePathCoordinates(); refreshLineLengths(); }, 800);
});
// INDER END

/* ===================================
   TABS FILTERING & OTHER LOGIC
=================================== */
document.addEventListener("DOMContentLoaded", function() {
    
    // Select all tab buttons and all grid cards strictly via classes
    const filterBtns = document.querySelectorAll('.tab-filter-btn');
    const projectCards = document.querySelectorAll('.grid-card-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            
            // 1. Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('tab-active'));
            
            // 2. Add active class to clicked button
            this.classList.add('tab-active');

            // 3. Get the filter category ID from the clicked button
            const targetFilter = this.getAttribute('data-filter');

            // 4. Loop through cards and filter
            projectCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');

                // If 'all' is clicked OR the card's category matches the target filter
                if (targetFilter === 'all' || targetFilter === cardCategory) {
                    card.classList.remove('card-hidden');
                    card.classList.add('card-visible');
                } else {
                    card.classList.add('card-hidden');
                    card.classList.remove('card-visible');
                }
            });
        });
    });

});

document.addEventListener("DOMContentLoaded", function() {
    
    // Select all elements marked for interaction
    const interactiveElements = document.querySelectorAll('.interactive-el');

    interactiveElements.forEach(el => {
        let isPressed = false;
        
        // 1. Hover Enter
        el.addEventListener('mouseenter', () => {
            el.classList.add('int-hover-active');
            el.style.transition = "border-color 0.4s ease, box-shadow 0.4s ease, transform 0.1s linear"; 
        });

        // 2. Mouse Move (3D Tilt effect)
        el.addEventListener('mousemove', (e) => {
            if(isPressed) return; // Prevent tilting if user is clicking
            
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Subtle tilt calculation
            const rotateX = ((y - centerY) / 30) * -1; 
            const rotateY = (x - centerX) / 40;
            
            // Subtle scale-up with tilt
            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
        });

        // 3. Mouse Down (Click Press inward)
        el.addEventListener('mousedown', () => {
            isPressed = true;
            el.classList.add('int-pressed-active');
        });

        // 4. Mouse Up (Click Release bounce)
        el.addEventListener('mouseup', () => {
            isPressed = false;
            el.classList.remove('int-pressed-active');
            // Pop back up keeping the 3D perspective
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(-2px)`;
        });

        // 5. Mouse Leave (Reset)
        el.addEventListener('mouseleave', () => {
            isPressed = false;
            el.classList.remove('int-hover-active');
            el.classList.remove('int-pressed-active');
            el.style.transition = "all 0.4s ease";
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
        });
    });

});

// document.addEventListener('DOMContentLoaded', function() {
//     const form = document.getElementById('pf-form');
//     const inputs = form.querySelectorAll('.pf-input');
//     const submitBtn = form.querySelector('.pf-submit-btn');
//     const btnText = form.querySelector('.pf-btn-text');
//     const spinner = form.querySelector('.pf-spinner');
//     const successMsg = form.querySelector('.pf-success-msg');

//     // Remove error styling on input focus/type
//     inputs.forEach(input => {
//         input.addEventListener('input', function() {
//             if (this.classList.contains('pf-error')) {
//                 this.classList.remove('pf-error');
//             }
//         });
//     });

//     form.addEventListener('submit', function(e) {
//         e.preventDefault();
//         let isValid = true;

//         // Custom Validation Logic
//         inputs.forEach(input => {
//             if (!input.checkValidity()) {
//                 input.classList.add('pf-error');
//                 isValid = false;
//             } else {
//                 input.classList.remove('pf-error');
//             }
//         });

//         // If form is valid, trigger animation and success state
//         if (isValid) {
//             // UI Loading state
//             submitBtn.style.pointerEvents = 'none';
//             btnText.textContent = 'Sending...';
//             spinner.classList.remove('d-none');
            
//             // Simulate API request delay (1.5 seconds)
//             setTimeout(() => {
//                 spinner.classList.add('d-none');
//                 btnText.textContent = 'Submit Request';
//                 submitBtn.style.pointerEvents = 'auto';
                
//                 // Show success message and clear form
//                 successMsg.classList.remove('d-none');
//                 form.reset();

//                 // Hide success message after 4 seconds
//                 setTimeout(() => {
//                     successMsg.classList.add('d-none');
//                 }, 4000);

//             }, 1500);
//         }
//     });
// });


// Grab the pill element
const pill = document.getElementById('our-projects-pill');

// Starting angle
let currentAngle = 0;

// The speed of the animation (higher is faster)
const speed = 1.5; 

function animateBorder() {
  // Increase the angle
  currentAngle = (currentAngle + speed) % 360;
  
  // Apply the new angle directly to the CSS variable
  pill.style.setProperty('--angle', `${currentAngle}deg`);
  
  // Loop to the next frame
  requestAnimationFrame(animateBorder);
}

// Start the animation loop
if (pill) { // Added a small safety check here just in case element is missing
    animateBorder();
}


document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll(".navbar-nav .newcs");

    navLinks.forEach(link => {
        link.addEventListener("click", function () {
            navLinks.forEach(item => item.classList.remove("active"));
            this.classList.add("active");
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll(".newcs");

    links.forEach(link => {
        link.addEventListener("click", function () {
            links.forEach(item => item.classList.remove("active"));
            this.classList.add("active");
        });
    });
});
document.addEventListener("DOMContentLoaded", function() {
    
    // ==========================================
    // 1. TABS FILTERING LOGIC
    // ==========================================
    const filterBtns = document.querySelectorAll('.blog-tab-btn');
    const blogCards = document.querySelectorAll('.blog-card-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('blog-tab-active'));
            
            // Add active class to clicked button
            this.classList.add('blog-tab-active');

            // Get target category
            const targetFilter = this.getAttribute('data-filter');

            // Filter cards
            blogCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');

                if (targetFilter === 'all' || targetFilter === cardCategory) {
                    card.classList.remove('blog-hidden');
                    card.classList.add('blog-visible');
                } else {
                    card.classList.add('blog-hidden');
                    card.classList.remove('blog-visible');
                }
            });
        });
    });

    // ==========================================
    // 2. MOUSE 3D & BOUNCE EFFECTS
    // ==========================================
    const interactiveElements = document.querySelectorAll('.interactive-el');

    interactiveElements.forEach(el => {
        let isPressed = false;
        
        // Hover Enter
        el.addEventListener('mouseenter', () => {
            el.classList.add('int-hover-active');
            el.style.transition = "border-color 0.4s ease, box-shadow 0.4s ease, transform 0.1s linear"; 
        });

        // Mouse Move (3D Tilt effect)
        el.addEventListener('mousemove', (e) => {
            if(isPressed) return; 
            
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Subtle tilt 
            const rotateX = ((y - centerY) / 40) * -1; 
            const rotateY = (x - centerX) / 50;
            
            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
        });

        // Mouse Down (Click Press inward)
        el.addEventListener('mousedown', () => {
            isPressed = true;
            el.classList.add('int-pressed-active');
        });

        // Mouse Up (Click Release bounce)
        el.addEventListener('mouseup', () => {
            isPressed = false;
            el.classList.remove('int-pressed-active');
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(-2px)`;
        });

        // Mouse Leave (Reset)
        el.addEventListener('mouseleave', () => {
            isPressed = false;
            el.classList.remove('int-hover-active');
            el.classList.remove('int-pressed-active');
            el.style.transition = "all 0.4s ease";
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
        });
    });

});

   document.addEventListener("DOMContentLoaded", () => {
  // Select all instances of the pill
  const pills = document.querySelectorAll('.our-projects-pill');
  let currentAngle = 0;

  function animateGradient() {
    // Increase the angle smoothly (change the '1' to make it spin faster or slower)
    currentAngle = (currentAngle + 1) % 360; 
    
    // Apply the new angle to every pill on the page
    pills.forEach(pill => {
      pill.style.setProperty('--angle', `${currentAngle}deg`);
    });
    
    // Call the next frame for a smooth infinite loop
    requestAnimationFrame(animateGradient);
  }

  // Start the animation
  animateGradient();
});

document.addEventListener("DOMContentLoaded", () => {
    // Responsive Screen Sizing
    const container = document.getElementById('ambition-orbit-section');
    const wrapper = document.getElementById('ambition-scale-wrapper');
    
    function handleResize() {
        if (!container || !wrapper) return;
        const maxWidth = 550; 
        const currentWidth = container.clientWidth;
        
        if (currentWidth < maxWidth) {
            wrapper.style.transform = `scale(${currentWidth / maxWidth})`;
        } else {
            wrapper.style.transform = 'scale(1)';
        }
    }
    window.addEventListener('resize', handleResize);
    handleResize();

    // Theming and Text Cycle Logic
    const dynamicSphere = document.getElementById('dynamic-sphere');
    const dynamicText = document.getElementById('dynamic-text');
    
    // Cycle Data array maps the text, the center gradient, and the global color theme
    const cycleData = [
        { text: 'INTELLIGENCE', gradientClass: 'sphere-gradient-intel', themeClass: 'theme-intel' },
        { text: 'CREATIVITY', gradientClass: 'sphere-gradient-create', themeClass: 'theme-create' },
        { text: 'YEXORIA', gradientClass: 'sphere-gradient-yex', themeClass: 'theme-yex' }
    ];
    
    let currentIndex = 0;
    const displayTime = 2000; 
    const fadeOutTime = 500; 
    
    function runTextCycle() {
        if(!container || !dynamicText || !dynamicSphere) return;
        const data = cycleData[currentIndex];
        
        // Remove all previous themes from the main container
        container.classList.remove('theme-intel', 'theme-create', 'theme-yex');
        
        // Add current theme class (this updates ALL CSS variables for waves, rings, stars, icons)
        container.classList.add(data.themeClass);
        
        // Update text and inner sphere gradient
        dynamicText.textContent = data.text;
        dynamicSphere.classList.add(data.gradientClass);
        
        // Trigger fade-in
        requestAnimationFrame(() => {
             dynamicText.classList.add('dynamic-text-visible');
        });
        
        // Wait, fade out, then recurse
        setTimeout(() => {
            dynamicText.classList.remove('dynamic-text-visible');
            dynamicSphere.classList.remove(data.gradientClass);
            
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % cycleData.length;
                runTextCycle(); 
            }, fadeOutTime);
            
        }, displayTime);
    }
    
    // Begin Cycle
    runTextCycle();
});

   document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector('.big-logo-wrapper');
  const glowLayer = document.querySelector('.big-watermark-glow');

  if (wrapper && glowLayer) {
    wrapper.addEventListener('mousemove', (e) => {
      // Get the exact boundaries of the wrapper
      const rect = wrapper.getBoundingClientRect();
      
      // Calculate mouse position relative to the wrapper
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Pass coordinates to CSS
      glowLayer.style.setProperty('--mouse-x', `${x}px`);
      glowLayer.style.setProperty('--mouse-y', `${y}px`);
    });
  }
});



 document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector('.big-logo-wrapper');
  const glowLayer = document.querySelector('.big-watermark-glow');

  if (wrapper && glowLayer) {
    wrapper.addEventListener('mousemove', (e) => {
      // Get the exact boundaries of the wrapper
      const rect = wrapper.getBoundingClientRect();
      
      // Calculate mouse position relative to the wrapper
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Pass coordinates to CSS
      glowLayer.style.setProperty('--mouse-x', `${x}px`);
      glowLayer.style.setProperty('--mouse-y', `${y}px`);
    });
  }
});



function showSidebar() {
    let sidebar = document.querySelector('.custom-sidebar');

    if(sidebar){
        sidebar.classList.add('active');
    }
}

function closeSidebar() {
    let sidebar = document.querySelector('.custom-sidebar');

    if(sidebar){
        sidebar.classList.remove('active');
    }
}