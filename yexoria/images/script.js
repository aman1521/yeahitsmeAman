
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

// This script scales the entire 500x500 orbit structure down proportionately 
// if the screen width is smaller than the widget size, making it 100% responsive.
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById('ambition-orbit-section');
  const wrapper = document.getElementById('ambition-scale-wrapper');
  
  function handleResize() {
    // 550 allows 500px for the outer ring + 50px buffer for the nodes sticking out
    const maxWidth = 550; 
    const currentWidth = container.clientWidth;
    
    if (currentWidth < maxWidth) {
      // Calculate scale ratio and apply it
      const scaleRatio = currentWidth / maxWidth;
      wrapper.style.transform = `scale(${scaleRatio})`;
    } else {
      // Restore natural size on large screens
      wrapper.style.transform = 'scale(1)';
    }
  }

  window.addEventListener('resize', handleResize);
  
  // Trigger once on load to ensure it fits mobile screens immediately
  handleResize();
});

// JavaScript / jQuery
$(document).ready(function(){
    $('#tools-carousel').owlCarousel({
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
                items: 2      // Mobile: show 2 logos
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



(function initTimelineComponent() {
            // 1. Logic to calculate and draw the smooth S-curve line connecting the nodes
            function drawLine() {
                const wrapper = document.querySelector('#ai-timeline-section .timeline-wrapper');
                const nodes = document.querySelectorAll('#ai-timeline-section .node');
                const pathBg = document.getElementById('line-bg');
                const pathProgress = document.getElementById('line-progress');
                
                if(!wrapper || !pathBg || !pathProgress || nodes.length === 0) return;

                // Get coordinates relative to the wrapper
                const wrapperRect = wrapper.getBoundingClientRect();
                let d = "";

                nodes.forEach((node, index) => {
                    const rect = node.getBoundingClientRect();
                    // Find absolute center of the node circle
                    const x = (rect.left - wrapperRect.left) + (rect.width / 2);
                    const y = (rect.top - wrapperRect.top) + (rect.height / 2);

                    if (index === 0) {
                        d += `M ${x} ${y} `;
                    } else {
                        const prevNode = nodes[index - 1];
                        const prevRect = prevNode.getBoundingClientRect();
                        const prevX = (prevRect.left - wrapperRect.left) + (prevRect.width / 2);
                        const prevY = (prevRect.top - wrapperRect.top) + (prevRect.height / 2);

                        // Create a smooth Bezier curve dragging vertically halfway between points
                        const cpY = prevY + (y - prevY) / 2;
                        d += `C ${prevX} ${cpY}, ${x} ${cpY}, ${x} ${y} `;
                    }
                });

                pathBg.setAttribute('d', d);
                pathProgress.setAttribute('d', d);
                
                // Set up line length for scroll animation
                const length = pathProgress.getTotalLength();
                pathProgress.style.strokeDasharray = length;
                pathProgress.style.strokeDashoffset = length;
            }

            // 2. Logic for On-Scroll Animations (Cards popping in and line drawing)
            function setupAnimations() {
                const items = document.querySelectorAll('#ai-timeline-section .item');
                const pathProgress = document.getElementById('line-progress');

                if(!items.length || !pathProgress) return;

                // Card Reveal Observer
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                        }
                    });
                }, { rootMargin: '0px 0px -15% 0px' });

                items.forEach(item => observer.observe(item));

                // Line Draw on Scroll
                window.addEventListener('scroll', () => {
                    const scrollPercentage = (document.documentElement.scrollTop + document.body.scrollTop) / (document.documentElement.scrollHeight - document.documentElement.clientHeight);
                    const length = pathProgress.getTotalLength();
                    
                    // Draw the line as the user scrolls down
                    const drawLength = length * scrollPercentage * 1.5; 
                    pathProgress.style.strokeDashoffset = Math.max(0, length - drawLength);
                });
            }

            // Initialize on load and recalculate line on resize
            window.addEventListener('resize', drawLine);
            
            // Allow DOM to settle before calculating the line
            setTimeout(() => {
                drawLine();
                setupAnimations();
            }, 100);
        })();

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

document.addEventListener("DOMContentLoaded", function() {
    
    const wrapper = document.getElementById('timeline-wrapper');
    const nodes = document.querySelectorAll('.tl-node-circle');
    const pathBg = document.getElementById('line-bg');
    const pathProgress = document.getElementById('line-progress');
    const scrollItems = document.querySelectorAll('.tl-scroll-item');
    const cards = document.querySelectorAll('.tl-card-box');

    // 1. Edge-to-Edge SVG Path Drawing Logic
    function drawTimelineLine() {
        if(!wrapper || nodes.length === 0) return;
        
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
                const cpY = prevY + (y - prevY) / 2;
                d += `C ${prevX} ${cpY}, ${x} ${cpY}, ${x} ${y} `;
            }
        });

        pathBg.setAttribute('d', d);
        pathProgress.setAttribute('d', d);
        const length = pathProgress.getTotalLength();
        pathProgress.style.strokeDasharray = length;
        pathProgress.style.strokeDashoffset = length;
        calculateScrollProgress();
    }

    // 2. Scroll Logic to Draw Line
    function calculateScrollProgress() {
        const rect = wrapper.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        let scrollPercentage = (windowHeight - rect.top) / (rect.height + windowHeight * 0.5);
        scrollPercentage = Math.max(0, Math.min(1, scrollPercentage));
        const length = pathProgress.getTotalLength();
        const drawLength = length * (scrollPercentage * 1.3); 
        pathProgress.style.strokeDashoffset = Math.max(0, length - drawLength);
    }

    // 3. Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('tl-visible');
            }
        });
    }, { rootMargin: '0px 0px -20% 0px' });
    scrollItems.forEach(item => observer.observe(item));

    // 4. MOUSE EVENTS (Hover, Tilt, Press & Release Reverse)
    cards.forEach(card => {
        let isPressed = false;
        
        // Mouse Enter
        card.addEventListener('mouseenter', () => {
            card.classList.add('tl-card-hover-active');
            card.style.transition = "border-color 0.4s ease, box-shadow 0.4s ease, transform 0.1s linear"; 
        });

        // Mouse Move (3D Tilt) - Paused if pressed
        card.addEventListener('mousemove', (e) => {
            if(isPressed) return; // Stop tilt effect while pressing down
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / 15) * -1; 
            const rotateY = (x - centerX) / 25;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        // Mouse Down (Click Press)
        card.addEventListener('mousedown', () => {
            isPressed = true;
            card.classList.add('tl-card-pressed');
        });

        // Mouse Up (Click Release - Reverse Effect)
        card.addEventListener('mouseup', () => {
            isPressed = false;
            card.classList.remove('tl-card-pressed');
            // Bounce back slightly up
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(-5px)`;
        });

        // Mouse Leave (Reset Everything)
        card.addEventListener('mouseleave', () => {
            isPressed = false;
            card.classList.remove('tl-card-hover-active');
            card.classList.remove('tl-card-pressed');
            card.style.transition = "all 0.5s ease";
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
        });
    });

    // Listeners
    window.addEventListener('load', drawTimelineLine);
    window.addEventListener('resize', drawTimelineLine);
    window.addEventListener('scroll', calculateScrollProgress);
});


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

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pf-form');
    const inputs = form.querySelectorAll('.pf-input');
    const submitBtn = form.querySelector('.pf-submit-btn');
    const btnText = form.querySelector('.pf-btn-text');
    const spinner = form.querySelector('.pf-spinner');
    const successMsg = form.querySelector('.pf-success-msg');

    // Remove error styling on input focus/type
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.classList.contains('pf-error')) {
                this.classList.remove('pf-error');
            }
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = true;

        // Custom Validation Logic
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.classList.add('pf-error');
                isValid = false;
            } else {
                input.classList.remove('pf-error');
            }
        });

        // If form is valid, trigger animation and success state
        if (isValid) {
            // UI Loading state
            submitBtn.style.pointerEvents = 'none';
            btnText.textContent = 'Sending...';
            spinner.classList.remove('d-none');
            
            // Simulate API request delay (1.5 seconds)
            setTimeout(() => {
                spinner.classList.add('d-none');
                btnText.textContent = 'Submit Request';
                submitBtn.style.pointerEvents = 'auto';
                
                // Show success message and clear form
                successMsg.classList.remove('d-none');
                form.reset();

                // Hide success message after 4 seconds
                setTimeout(() => {
                    successMsg.classList.add('d-none');
                }, 4000);

            }, 1500);
        }
    });
});


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
animateBorder();

  document.addEventListener("DOMContentLoaded", () => {
         
         function drawTimelinePaths() {
         const svg = document.getElementById('svg-canvas');
         const bgPath = document.getElementById('line-bg');
         const animatedPath = document.getElementById('line-progress');
         const container = document.getElementById('timeline-wrapper');
         const nodes = document.querySelectorAll('.tl-node-circle');
         
         if (!svg || !bgPath || !animatedPath || nodes.length === 0) return;
         
         const containerRect = container.getBoundingClientRect();
         let pathString = '';
         
         nodes.forEach((node, index) => {
            // Calculate center coordinates of each node relative to the SVG container
            const rect = node.getBoundingClientRect();
            const x = (rect.left - containerRect.left) + (rect.width / 2);
            const y = (rect.top - containerRect.top) + (rect.height / 2);
         
            if (index === 0) {
                // Move to the very first node
                pathString += `M ${x} ${y} `;
            } else {
                const prevNode = nodes[index - 1];
                const prevRect = prevNode.getBoundingClientRect();
                const prevX = (prevRect.left - containerRect.left) + (prevRect.width / 2);
                const prevY = (prevRect.top - containerRect.top) + (prevRect.height / 2);
         
                const dx = x - prevX;
                const dy = y - prevY;
         
                // This logic creates the EXACT curve shown in the reference vectors
                // By forcing the control points to be strictly horizontal (Y-axis unchanged from the start/end points),
                // it creates a beautiful "S" curve that comes out flat, drops down, and enters flat.
                const cp1x = prevX + (dx * 0.5); 
                const cp1y = prevY;              
                const cp2x = x - (dx * 0.5);     
                const cp2y = y;                  
         
                // Append the cubic bezier curve string
                pathString += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y} `;
            }
         });
         
         // Apply path to both the background track and the animated gradient track
         bgPath.setAttribute('d', pathString);
         animatedPath.setAttribute('d', pathString);
         
         // Prep the animated line for the scroll effect by setting dash arrays equal to its total length
         const totalLength = bgPath.getTotalLength();
         animatedPath.style.strokeDasharray = totalLength;
         animatedPath.style.strokeDashoffset = totalLength;
         }
         
         function handleScrollAnimation() {
         const animatedPath = document.getElementById('line-progress');
         const rows = document.querySelectorAll('.tl-scroll-item');
         
         if (!animatedPath) return;
         
         const totalLength = animatedPath.getTotalLength();
         
         // Setup drawing the path based on scroll depth
         const scrollTop = window.scrollY || document.documentElement.scrollTop;
         const windowHeight = window.innerHeight;
         
         rows.forEach((row, index) => {
            const rect = row.getBoundingClientRect();
            // Once the item enters 80% down the viewport, activate the row
            if (rect.top < windowHeight * 0.8) {
                row.classList.add('tl-visible');
            } else {
                row.classList.remove('tl-visible');
            }
         });
         
         // Animate Line Progress
         // Calculate bounds of the first and last elements to know our scrollable distance
         const firstNode = rows[0].getBoundingClientRect();
         const lastNode = rows[rows.length - 1].getBoundingClientRect();
         
         // Find distance drawn between first node and the center of the screen
         const startOffset = firstNode.top - (windowHeight * 0.5);
         const endOffset = lastNode.top - (windowHeight * 0.5);
         const distance = endOffset - startOffset;
         
         let drawPercentage = (0 - startOffset) / distance;
         
         // Clamp percentage between 0 and 1
         drawPercentage = Math.max(0, Math.min(1, drawPercentage));
         
         // Apply draw calculation
         animatedPath.style.strokeDashoffset = totalLength - (totalLength * drawPercentage);
         }
         
         // Initialize Canvas Paths
         drawTimelinePaths();
         handleScrollAnimation();
         
         // Re-draw path coords dynamically on window resize (especially important for the Media Queries)
         window.addEventListener('resize', () => {
         drawTimelinePaths();
         handleScrollAnimation();
         });
         
         // Run on scroll
         window.addEventListener('scroll', handleScrollAnimation);
         });
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