<?php
/*
Template Name: blogs Page
*/
get_header();
?>
<body class="blog-page-wrapper" style="margin: 0; padding: 0; background-color: #0b0a10;">
   <section class="blog-main-section">
      <div class="blog-ambient-star blog-star-1"></div>
      <div class="blog-ambient-star blog-star-2"></div>
      <div class="blog-ambient-star blog-star-3"></div>
      <div class="blog-ambient-star blog-star-4"></div>
      <div class="blog-glow-bg"></div>
      <div class="blog-container-fluid">
         <div class="blog-hero-box">
            <section id="custom-design-section">
               <div id="our-projects-pill">
                  <img src="<?php echo get_template_directory_uri(); ?>/images/stars.png"  class="img-under"
                     alt="Arrow">
                  <div id="pill-text">Blogs</div>
               </div>
            </section>
            <div class="blog-main-title">
               Stories that <span class="blog-italic-accent">shape</span> the future.
            </div>
            <div class="blog-main-desc">
               Explore insights on product design, technology, strategy and innovation from the teams building meaningful digital experiences.
            </div>
         </div>
         <div class="blog-tabs-wrapper" id="blog-tabs">
            <button class="blog-tab-btn blog-tab-active interactive-el" data-filter="all">All</button>
            <button class="blog-tab-btn interactive-el" data-filter="web">Web</button>
            <button class="blog-tab-btn interactive-el" data-filter="mobile">Mobile</button>
            <button class="blog-tab-btn interactive-el" data-filter="ui">UI</button>
            <button class="blog-tab-btn interactive-el" data-filter="design">Design</button>
         </div>
         <div class="blog-list-layout" id="blog-list">
            <div class="blog-card-item interactive-el" data-category="design">
               <div class="blog-image-box">
                  <img src="https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=800" class="blog-cover-img" alt="Blog 1">
               </div>
               <div class="blog-content-box">
                  <div class="blog-tags-row">
                     <span class="blog-tag-pill">Design</span>
                     <span class="blog-tag-pill">UI/UX</span>
                  </div>
                  <div class="blog-item-title">Designing Digital Experiences That Users Love</div>
                  <div class="blog-item-desc">Discover the principles behind intuitive interfaces, seamless interactions, and user-centered products that drive engagement and retention.</div>
                  <a  href="blog-details.php"  class="blog-read-btn">Read More</a>
               </div>
            </div>
            <div class="blog-card-item interactive-el" data-category="ui">
               <div class="blog-image-box">
                  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" class="blog-cover-img" alt="Blog 2">
               </div>
               <div class="blog-content-box">
                  <div class="blog-tags-row">
                     <span class="blog-tag-pill">Design</span>
                     <span class="blog-tag-pill">UI/UX</span>
                  </div>
                  <div class="blog-item-title">Designing Digital Experiences That Users Love</div>
                  <div class="blog-item-desc">Discover the principles behind intuitive interfaces, seamless interactions, and user-centered products that drive engagement and retention.</div>
                  <button class="blog-read-btn">Read More</button>
               </div>
            </div>
            <div class="blog-card-item interactive-el" data-category="web">
               <div class="blog-image-box">
                  <img src="https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&q=80&w=800" class="blog-cover-img" alt="Blog 3">
               </div>
               <div class="blog-content-box">
                  <div class="blog-tags-row">
                     <span class="blog-tag-pill">Design</span>
                     <span class="blog-tag-pill">UI/UX</span>
                  </div>
                  <div class="blog-item-title">Designing Digital Experiences That Users Love</div>
                  <div class="blog-item-desc">Discover the principles behind intuitive interfaces, seamless interactions, and user-centered products that drive engagement and retention.</div>
                  <button class="blog-read-btn">Read More</button>
               </div>
            </div>
            <div class="blog-card-item interactive-el" data-category="mobile">
               <div class="blog-image-box">
                  <img src="https://images.unsplash.com/photo-1607799279861-4dddf9657069?auto=format&fit=crop&q=80&w=800" class="blog-cover-img" alt="Blog 4">
               </div>
               <div class="blog-content-box">
                  <div class="blog-tags-row">
                     <span class="blog-tag-pill">Design</span>
                     <span class="blog-tag-pill">UI/UX</span>
                  </div>
                  <div class="blog-item-title">Designing Digital Experiences That Users Love</div>
                  <div class="blog-item-desc">Discover the principles behind intuitive interfaces, seamless interactions, and user-centered products that drive engagement and retention.</div>
                  <button class="blog-read-btn">Read More</button>
               </div>
            </div>
            <div class="blog-card-item interactive-el" data-category="design">
               <div class="blog-image-box">
                  <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800" class="blog-cover-img" alt="Blog 5">
               </div>
               <div class="blog-content-box">
                  <div class="blog-tags-row">
                     <span class="blog-tag-pill">Design</span>
                     <span class="blog-tag-pill">UI/UX</span>
                  </div>
                  <div class="blog-item-title">Designing Digital Experiences That Users Love</div>
                  <div class="blog-item-desc">Discover the principles behind intuitive interfaces, seamless interactions, and user-centered products that drive engagement and retention.</div>
                  <button class="blog-read-btn">Read More</button>
               </div>
            </div>
         </div>
         <div class="blog-cta-banner interactive-el">
            <div class="blog-cta-title">Have something in mind?</div>
            <div class="blog-cta-desc">Let's discuss your project and explore how we can bring your vision to life with cutting-edge technology and design.</div>
            <button class="blog-cta-btn">Let's Connect</button>
         </div>
      </div>
   </section>
   
   <?php get_footer(); ?>