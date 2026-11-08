<?php
$footer_page = get_page_by_path('footer'); // footer = page slug
$footer_id = $footer_page ? $footer_page->ID : 0;
?>
<section class="footer-section" id="premium-footer">
   <div class="footer-under"></div>
   <div class="footer-glow-top"></div>
   <div class="footer-glow-bottom"></div>

   <div id="section-8"  class="footer-container  animate-element effect-slide-left">

      <div class="footer-top-row">
         <div class="footer-cta-box">
             <a href="https://infronixai.com/Yexoria/contact-us/">
            <div class="contact-label">
               <span class="arrow-icon-small">
                  <img src="<?php echo get_template_directory_uri(); ?>/images/icons/aa.png" alt="">
               </span>
               CONTACT US
            </div>
</a>
   <div class="cta-heading">
    <?php echo wp_kses_post(get_field('footer_desc', $footer_id)); ?>
</div>

            <div class="email-block">
               <div class="email-label">Connect With Us At</div>

               <a href="mailto:hello@yexoria.ai" class="email-link">
                  hello@yexoria.ai
                  <span class="arrow-icon-large">
                     <img src="<?php echo get_template_directory_uri(); ?>/images/icons/text.png" alt="">
                  </span>
               </a>
            </div>
         </div>

         <div class="footer-badge-box">
            <div class="magnetic-wrapper" id="magnetic-badge">
               <div class="rotating-badge-inner">
                  <img src="<?php echo get_template_directory_uri(); ?>/images/footer/logo.png" class="badge-text-ring" alt="">
               </div>
            </div>
         </div>
      </div>

      <div class="footer-middle-row">
         <div class="nav-links-box">

            <a href="<?php echo home_url('/about'); ?>" class="nav-link-item">
               About Us
            </a>

            <a href="<?php echo home_url('/services'); ?>" class="nav-link-item">
               Services
            </a>

            <a href="<?php echo home_url('/projects'); ?>" class="nav-link-item">
               Projects
            </a>

            <a href="<?php echo home_url('/careers'); ?>" class="nav-link-item">
               Career
            </a>

         </div>
      </div>

      <div class="footer-bottom-row">

        <div class="big-logo-wrapper">
    <!-- Base Grey Image -->
    <img src="<?php echo get_template_directory_uri(); ?>/images/footer/yexoria.png" class="big-watermark-base" alt="Yexoria">
    
    <!-- Glow Layer (Same PHP Image URL used for Mask here) -->
    <div class="big-watermark-glow" style="-webkit-mask-image: url('<?php echo get_template_directory_uri(); ?>/images/footer/yexoria.png'); mask-image: url('<?php echo get_template_directory_uri(); ?>/images/footer/yexoria.png');"></div>
</div>
<div class="social-links-dv">
     <div class="social-links">

<?php
$socials = [
    [
        'name' => get_field('social_media_name', $footer_id),
        'link' => get_field('footer_social_link_1', $footer_id),
    ],
    [
        'name' => get_field('social_media_name2', $footer_id),
        'link' => get_field('footer_social_link_2', $footer_id),
    ],
    [
        'name' => get_field('social_media_name_3', $footer_id),
        'link' => get_field('footer_social_link_3', $footer_id),
    ],
    [
        'name' => get_field('social_media_name_4', $footer_id),
        'link' => get_field('footer_social_link_4', $footer_id),
    ],
];

foreach ($socials as $social) :
    if (!empty($social['name']) && !empty($social['link'])) :
?>
        <a href="<?php echo esc_url($social['link']['url']); ?>"
           class="social-item"
           target="<?php echo esc_attr(!empty($social['link']['target']) ? $social['link']['target'] : '_self'); ?>">
            <?php echo esc_html($social['name']); ?>
        </a>
<?php
    endif;
endforeach;
?>

</div>

         <div class="copyright-text">
            © <?php echo date('Y'); ?> Yexoria. All rights reserved
         </div>
 </div>
      </div>

   </div>

   <div class="down-side"></div>
<!-- Back to Top Button -->
<button id="back-to-top" class="back-to-top-btn" aria-label="Go to top">
    <i class="fa-solid fa-arrow-up"></i>
</button>
</section>

<script>
document.addEventListener("DOMContentLoaded", () => {
    const logoWrappers = document.querySelectorAll('.big-logo-wrapper');

    logoWrappers.forEach(wrapper => {
        const glowLayer = wrapper.querySelector('.big-watermark-glow');

        if (glowLayer) {
            // Reusable function to update coordinates
            const updateGlowPosition = (clientX, clientY) => {
                const rect = wrapper.getBoundingClientRect();
                const x = clientX - rect.left;
                const y = clientY - rect.top;
                glowLayer.style.setProperty('--mouse-x', `${x}px`);
                glowLayer.style.setProperty('--mouse-y', `${y}px`);
            };

            // 1. DESKTOP: Mouse Move Event
            wrapper.addEventListener('mousemove', (e) => {
                updateGlowPosition(e.clientX, e.clientY);
            });

            // 2. MOBILE: Touch Start (When finger touches the logo)
            wrapper.addEventListener('touchstart', (e) => {
                wrapper.classList.add('is-touching'); // Force glow to show
                updateGlowPosition(e.touches[0].clientX, e.touches[0].clientY);
            }, { passive: true });

            // 3. MOBILE: Touch Move (When finger drags across)
            wrapper.addEventListener('touchmove', (e) => {
                updateGlowPosition(e.touches[0].clientX, e.touches[0].clientY);
            }, { passive: true });

            // 4. MOBILE: Touch End (When finger leaves screen)
            wrapper.addEventListener('touchend', () => {
                wrapper.classList.remove('is-touching'); // Hide glow
            });
        }
    });
});
</script>
  <script>
        /* HOW IT WORKS: 
           We use the Intersection Observer API. It watches elements on the page 
           and triggers a function when they enter the visible part of the screen (viewport).
        */

        // Step 1: Create the observer
        const observer = new IntersectionObserver((entries) => {
            // Loop through all elements being observed
            entries.forEach(entry => {
                // If the element is visible on the screen
                if (entry.isIntersecting) {
                    // Add the 'show' class to trigger the CSS transition
                    entry.target.classList.add('show');
                } else {
                    // Optional: Remove the class when it leaves the screen 
                    // so the animation happens again when scrolling back up.
                    entry.target.classList.remove('show');
                }
            });
        }, {
            // Options: Trigger when 10% of the element is visible
            threshold: 0.1 
        });

        // Step 2: Grab all elements with the 'animate-element' class
        const hiddenElements = document.querySelectorAll('.animate-element');

        // Step 3: Tell the observer to watch each of these elements
        hiddenElements.forEach((element) => {
            observer.observe(element);
        });
        /* ===================================
   BACK TO TOP LOGIC
=================================== */
document.addEventListener("DOMContentLoaded", function() {
    const backToTopBtn = document.getElementById("back-to-top");

    if (backToTopBtn) {
        // 1. Show/Hide button on scroll
        window.addEventListener("scroll", function() {
            // Agar 300px niche scroll kiya hai toh dikhao, warna chupao
            if (window.scrollY > 300) {
                backToTopBtn.classList.add("show-btn");
            } else {
                backToTopBtn.classList.remove("show-btn");
            }
        });

        // 2. Smooth scroll to top on click
        backToTopBtn.addEventListener("click", function() {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
});
    </script>

<?php wp_footer(); ?>
</body>
</html>