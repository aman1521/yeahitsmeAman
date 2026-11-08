<?php
/*
Template Name: Home
*/
get_header();

// THE FIX: We keep this INSIDE the PHP tags so the server reads it as code, not text!
if ( have_posts() ) :
    while ( have_posts() ) : the_post();
?>

<!-- banner -->
<section id="section-1"  class="banner-1"> 
   <div class="container animate-element effect-fade-up">
      <div class="row">
         <div class="col-lg-12 text-center">
            <section id="custom-design-section">
               <div   id="our-projects-pill">
                  <img src="<?php echo get_template_directory_uri(); ?>/images/stars.png" class="img-under" alt="Arrow">
                  <div id="pill-text"><?php the_field('banner_pill_text'); ?></div>
               </div>
            </section>
            <h1 class="under-banner-h"><?php the_field('banner_heading'); ?> 
             <span class="add-clr"> <?php the_field('color_heading'); ?> </span> </h1>
            <p class="under-banner-pp"><?php the_field('banner_description'); ?> </p>
            <a href="<?php the_field('cta_button_link', get_queried_object_id()); ?>" class="cscs"><?php the_field('banner_cta_text', get_queried_object_id()); ?> <img src="<?php echo get_template_directory_uri(); ?>/images/lef-arrows.png" class="button-cls-hp" alt="Arrow"> </a>
         </div>
      </div>
   </div>
</section>

<section class="banner-2">
   <div class="main-middle"> 
      <div class="middle">
         <div class="mouse"></div>
      </div>
      <div class="bg-cover1">
         <img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/06/uf.png" alt="">
      </div>
   </div>
</section>

<section id="ambition-orbit-section" class="ambition-container theme-intel">
   <div class="star" style="top: 15%; left: 30%;"></div>
   <div class="star" style="top: 25%; left: 70%;"></div>
   <div class="star" style="top: 60%; left: 20%;"></div>
   <div class="star" style="top: 80%; left: 65%;"></div>
   <div class="star" style="top: 40%; left: 85%;"></div>
   <div id="ambition-scale-wrapper" class="ambition-wrapper">
      
      <div id="dynamic-sphere" class="center-sphere">
         <div id="dynamic-glow" class="dynamic-glow-layer"></div>
         <div id="dynamic-text-container" class="dynamic-text-container">
            <span id="dynamic-text" class="center-text">INTELLIGENCE</span>
         </div>
      </div>

      <div class="orbit-ring ring-200 ring-cw"></div>
      <div class="orbit-ring ring-300 ring-ccw"></div>

      
      <div   class="orbit-ring ring-400 ring-ccw ">
         <div class="node pos-left node-ccw">
            <img src="<?php echo get_template_directory_uri(); ?>/images/ai.svg" alt="ai">
         </div>
         <div class="node pos-bottom node-cw">
            <img src="<?php echo get_template_directory_uri(); ?>/images/mind.svg" alt="mind">
         </div>
         <div class="node pos-top node-cw">
            <img src="<?php echo get_template_directory_uri(); ?>/images/power.svg" alt="lightning">
         </div>
         <div class="node pos-right node-ccw">
            <img src="<?php echo get_template_directory_uri(); ?>/images/circle.svg" alt="target">
         </div>
         <div class="node pos-right-2 node-ccw">
            <img src="<?php echo get_template_directory_uri(); ?>/images/code.svg" alt="code">
         </div>
         <div class="node pos-top-right node-cw">
            <img src="<?php echo get_template_directory_uri(); ?>/images/team.svg" alt="user">
         </div>
      </div>
   </div>
</section>


<div class="tl-page-wrapper">
   <div class="tl-ambient-glow tl-glow-1"></div>
   <div class="tl-ambient-glow tl-glow-2"></div>
   <section   id="section-2" class="tl-main-section animate-element effect-slide-left">
      <div class="tl-header-box">
         <section class="custom-design-section">
            <div class="our-projects-pill">
               <div class="pill-dot"></div>
               <span class="pill-text"><?php the_field('services_pill_text'); ?></span> 
            </div>
         </section>
         <div class="tl-title">
            AI-Powered Solution, <span class="tl-title-highlight">Built for Scale.</span>
         </div>
         <div class="tl-subtitle"> 
          <?php the_field('services_subtitle'); ?>
         </div>
      </div>
      <div class="tl-timeline-container" id="timeline-wrapper">
         <svg class="tl-svg-canvas" id="svg-canvas">
            <defs>
               <linearGradient id="gradient-line" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#5C1A90" />
                  <stop offset="50%" stop-color="#51A2FF" />
                  <stop offset="100%" stop-color="#51A2FF" />
               </linearGradient>
            </defs>
            <path class="tl-path-bg" id="line-bg"></path>
            <path class="tl-path-animated" id="line-progress"></path>
         </svg>
         <div class="tl-row tl-align-left tl-scroll-item">
            <div class="tl-node-circle"><i class="fa-regular fa-lightbulb tl-icon"></i></div>
            <div class="tl-card-box">
               <div class="tl-card-title"> <?php the_field('service_card_title'); ?></div>
               <div class="tl-card-desc"> <?php the_field('service_description'); ?></div>
            </div>
         </div>
         <div class="tl-row tl-align-right tl-scroll-item">
            <div class="tl-node-circle"><i class="fa-regular fa-lightbulb tl-icon"></i></div>
            <div class="tl-card-box">
    <div class="tl-card-title"> <?php the_field('service_card_title2'); ?></div>
               <div class="tl-card-desc"> <?php the_field('service_description2'); ?></div>
            </div>
         </div>
         <div class="tl-row tl-align-left tl-scroll-item">
            <div class="tl-node-circle"><i class="fa-regular fa-lightbulb tl-icon"></i></div>
            <div class="tl-card-box">
    <div class="tl-card-title"> <?php the_field('service_card_title3'); ?></div>
               <div class="tl-card-desc"> <?php the_field('service_description3'); ?></div>
            </div>
         </div>
         <div class="tl-row tl-align-right tl-scroll-item">
            <div class="tl-node-circle"><i class="fa-regular fa-lightbulb tl-icon"></i></div>
            <div class="tl-card-box">
               <div class="tl-card-title"> <?php the_field('service_card_title4'); ?></div>
               <div class="tl-card-desc"> <?php the_field('service_description4'); ?></div>
            </div>
         </div>
         <div class="tl-row tl-align-center tl-scroll-item" id="final-image-row">
            <div class="tl-node-circle tl-final-node">
               <img src="https://infronixai.com/wp-content/uploads/2026/06/Container-8.png" class="tl-final-img" alt="Final Goal">
            </div>
         </div>
      </div>
   </section>
   <div class="tools-slider-section-dsdsd">
       
   
<section id="tools-slider-section" class="tools-slider-wrapper">

    <?php if(get_field('slider_text')) : ?>
        <div class="slider-heading">
            <?php the_field('slider_text'); ?>
        </div>
    <?php endif; ?>

    <div class="carousel-container">
        <div class="fade-overlay left-fade"></div>
        <div class="fade-overlay right-fade"></div>

        <div id="tools-carousel" class="owl-carousel owl-theme">

            <?php
            for ($i = 1; $i <= 7; $i++) {

                $image = get_field('slider_image_' . $i);

                // Show only if image exists
                if (!empty($image)) { ?>
                    <div class="item">
                        <img
                            src="<?php echo esc_url($image['url']); ?>"
                            alt="<?php echo esc_attr($image['alt'] ?: 'Slider Image'); ?>"
                            loading="lazy">
                    </div>
                <?php }
            }
            ?>

        </div>
    </div>

</section>
</div>
</div>

<div id="section-1" class="global-page-wrapper" style="margin: 0; padding: 0; background-color: #0b0a10;">
   <section class="css-slider-section animate-element ">
<div class="ser2"></div>
      
<div class="header-container">
         <section class="tl-main-section">
            <div class="tl-header-box">
               <section class="custom-design-section">
                  <div class="our-projects-pill">
                     <div class="pill-dot"></div>
                     <span class="pill-text"><?php the_field('projects_pill_text'); ?> </span>
                  </div>
               </section>
               <div class="section-title">
                  <h4 class="slider-title-under"> Built in Private, Deployed at <span class="title-accent">Scale.</span> </h4>
               </div>
               <div class="section-desc">
<?php the_field('projects_desc'); ?>               </div>
            </div>
            <div class="pure-3d-slider-container">
               <input type="radio" name="slider" id="item-1" class="hidden-radio" checked>
               <input type="radio" name="slider" id="item-2" class="hidden-radio">
               <input type="radio" name="slider" id="item-3" class="hidden-radio">
               <input type="radio" name="slider" id="item-4" class="hidden-radio">
               <input type="radio" name="slider" id="item-5" class="hidden-radio">
               <div class="cards-wrapper">
                  <label class="slider-card-label" for="item-1" id="card-1">
                     <img src="<?php echo get_template_directory_uri(); ?>/images/projects/cloud.svg" class="card-img" alt="cloud">
                     <div class="card-overlay">
                        <div class="card-head"><?php the_field('projects_card_title'); ?> </div> 
                        <div class="card-info"><?php the_field('projects_description'); ?> </div>
                     </div>
                  </label>
                  <label class="slider-card-label" for="item-2" id="card-2">
                     <img src="<?php echo get_template_directory_uri(); ?>/images/projects/cloud.svg" class="card-img" alt="cloud">
                     <div class="card-overlay">
                      <div class="card-head"><?php the_field('projects_card_title2'); ?> </div> 
                        <div class="card-info"><?php the_field('projects_description2'); ?> </div>
                     </div>
                  </label>
                  <label class="slider-card-label" for="item-3" id="card-3">
                     <img src="<?php echo get_template_directory_uri(); ?>/images/projects/cloud.svg" class="card-img" alt="cloud">
                     <div class="card-overlay">
                        <div class="card-head"><?php the_field('projects_card_title3'); ?> </div> 
                        <div class="card-info"><?php the_field('projects_description3'); ?> </div>
                     </div>
                  </label>
                  <label class="slider-card-label" for="item-4" id="card-4">
                     <img src="<?php echo get_template_directory_uri(); ?>/images/projects/cloud.svg" class="card-img" alt="cloud">
                     <div class="card-overlay">
                       <div class="card-head"><?php the_field('projects_card_title4'); ?> </div> 
                        <div class="card-info"><?php the_field('projects_description4'); ?> </div>
                     </div>
                  </label>
                  <label class="slider-card-label" for="item-5" id="card-5">
                     <img src="<?php echo get_template_directory_uri(); ?>/images/projects/cloud.svg" class="card-img" alt="cloud">
                     <div class="card-overlay">
                         <div class="card-head"><?php the_field('projects_card_title5'); ?> </div> 
                        <div class="card-info"><?php the_field('projects_description5'); ?> </div>
                     </div>
                  </label>
               </div>
               <div class="slider-arrows-wrapper">
                  <label for="item-5" class="nav-arrow-btn prev-arrow arrow-set-1">
                  <img src="<?php echo get_template_directory_uri(); ?>/images/icons/left.png" class="arrow-img" alt="">
                  </label>
                  <label for="item-2" class="nav-arrow-btn next-arrow arrow-set-1">
                  <img src="<?php echo get_template_directory_uri(); ?>/images/icons/right.png" class="arrow-img" alt="">
                  </label>
                  <label for="item-1" class="nav-arrow-btn prev-arrow arrow-set-2">
                  <img src="<?php echo get_template_directory_uri(); ?>/images/icons/left.png" class="arrow-img" alt="">
                  </label>
                  <label for="item-3" class="nav-arrow-btn next-arrow arrow-set-2">
                  <img src="<?php echo get_template_directory_uri(); ?>/images/icons/right.png" class="arrow-img" alt="">
                  </label>
                  <label for="item-2" class="nav-arrow-btn prev-arrow arrow-set-3">
                  <img src="<?php echo get_template_directory_uri(); ?>/images/icons/left.png" class="arrow-img" alt="">
                  </label>
                  <label for="item-4" class="nav-arrow-btn next-arrow arrow-set-3">
                  <img src="<?php echo get_template_directory_uri(); ?>/images/icons/right.png" class="arrow-img" alt="">
                  </label>
                  <label for="item-3" class="nav-arrow-btn prev-arrow arrow-set-4">
                  <img src="<?php echo get_template_directory_uri(); ?>/images/icons/left.png" class="arrow-img" alt="">
                  </label>
                  <label for="item-5" class="nav-arrow-btn next-arrow arrow-set-4">
                  <img src="<?php echo get_template_directory_uri(); ?>/images/icons/right.png" class="arrow-img" alt="">
                  </label>
                  <label for="item-4" class="nav-arrow-btn prev-arrow arrow-set-5">
                  <img src="<?php echo get_template_directory_uri(); ?>/images/icons/left.png" class="arrow-img" alt="">
                  </label>
                  <label for="item-1" class="nav-arrow-btn next-arrow arrow-set-5">
                  <img src="<?php echo get_template_directory_uri(); ?>/images/icons/right.png" class="arrow-img" alt="">
                  </label>               
               </div>
               
            </div>
               <div class="slider-btn-cs">
            <a href="<?php the_field('btn_link', get_queried_object_id()); ?>" class="primary-btn primary-btn-22"><?php the_field('btn_text', get_queried_object_id()); ?> <img src="<?php echo get_template_directory_uri(); ?>/images/lef-arrows.png" class="button-cls-hp" alt="Arrow"> </a>
            </div>
         </section>
      </div>

      <section id="section-8"  class="tl-main-section">
         <div class="tl-header-box animate-element effect-slide-left">
            <section class="custom-design-section ">
               <div class="our-projects-pill">
                  <div class="pill-dot"></div>
                  <span class="pill-text"><?php the_field('clients_pill_text'); ?></span>
               </div>
            </section>
            <div class="testi-title">
               <?php the_field('clients_title'); ?>
               <span class="title-highlight"><?php the_field('clients_color'); ?></span>
            </div>
         </div>
         <div class="marquee-container">
            <div class="marquee-track track-left" id="scroll-left-track">
               <div class="testi-card">
                  <div class="quote-icon"> <img src="<?php echo get_template_directory_uri(); ?>/images/icons/q.png" alt=""> </div>
                  <div class="testi-desc"><?php the_field('testimonials_desc'); ?></div>
                  <div class="client-info">
                     <span class="client-name"><?php the_field('testimonials_name'); ?></span>
                     <span class="client-role"><?php the_field('testimonials_position'); ?></span>
                  </div>
               </div>
             <div class="testi-card">
                  <div class="quote-icon"> <img src="<?php echo get_template_directory_uri(); ?>/images/icons/q.png" alt=""> </div>
                  <div class="testi-desc"><?php the_field('testimonials_desc2'); ?></div>
                  <div class="client-info">
                     <span class="client-name"><?php the_field('testimonials_name2'); ?></span>
                     <span class="client-role"><?php the_field('testimonials_position2'); ?></span>
                  </div>
               </div>  
				<div class="testi-card">
                  <div class="quote-icon"> <img src="<?php echo get_template_directory_uri(); ?>/images/icons/q.png" alt=""> </div>
                  <div class="testi-desc"><?php the_field('testimonials_desc3'); ?></div>
                  <div class="client-info">
                     <span class="client-name"><?php the_field('testimonials_name3'); ?></span>
                     <span class="client-role"><?php the_field('testimonials_position3'); ?></span>
                  </div>
               </div>
           <div class="testi-card">
                  <div class="quote-icon"> <img src="<?php echo get_template_directory_uri(); ?>/images/icons/q.png" alt=""> </div>
                  <div class="testi-desc"><?php the_field('testimonials_desc4'); ?></div>
                  <div class="client-info">
                     <span class="client-name"><?php the_field('testimonials_name4'); ?></span>
                     <span class="client-role"><?php the_field('testimonials_position4'); ?></span>
                  </div>
               </div>
             <div class="testi-card">
                  <div class="quote-icon"> <img src="<?php echo get_template_directory_uri(); ?>/images/icons/q.png" alt=""> </div>
                  <div class="testi-desc"><?php the_field('testimonials_desc'); ?></div>
                  <div class="client-info">
                     <span class="client-name"><?php the_field('testimonials_name'); ?></span>
                     <span class="client-role"><?php the_field('testimonials_position'); ?></span>
                  </div>
               </div>
            </div>
         </div>
         <div class="marquee-container" style="margin-top: 30px;">
            <div class="marquee-track track-right" id="scroll-right-track">
              <div class="testi-card">
                  <div class="quote-icon"> <img src="<?php echo get_template_directory_uri(); ?>/images/icons/q.png" alt=""> </div>
                  <div class="testi-desc"><?php the_field('testimonials_desc2'); ?></div>
                  <div class="client-info">
                     <span class="client-name"><?php the_field('testimonials_name2'); ?></span>
                     <span class="client-role"><?php the_field('testimonials_position2'); ?></span>
                  </div>
               </div>
      <div class="testi-card">
                  <div class="quote-icon"> <img src="<?php echo get_template_directory_uri(); ?>/images/icons/q.png" alt=""> </div>
                  <div class="testi-desc"><?php the_field('testimonials_desc3'); ?></div>
                  <div class="client-info">
                     <span class="client-name"><?php the_field('testimonials_name3'); ?></span>
                     <span class="client-role"><?php the_field('testimonials_position3'); ?></span>
                  </div>
               </div>
            <div class="testi-card">
                  <div class="quote-icon"> <img src="<?php echo get_template_directory_uri(); ?>/images/icons/q.png" alt=""> </div>
                  <div class="testi-desc"><?php the_field('testimonials_desc4'); ?></div>
                  <div class="client-info">
                     <span class="client-name"><?php the_field('testimonials_name4'); ?></span>
                     <span class="client-role"><?php the_field('testimonials_position4'); ?></span>
                  </div>
               </div>
             <div class="testi-card">
                  <div class="quote-icon"> <img src="<?php echo get_template_directory_uri(); ?>/images/icons/q.png" alt=""> </div>
                  <div class="testi-desc"><?php the_field('testimonials_desc'); ?></div>
                  <div class="client-info">
                     <span class="client-name"><?php the_field('testimonials_name'); ?></span>
                     <span class="client-role"><?php the_field('testimonials_position'); ?></span>
                  </div>
               </div>
            </div>
         </div>
   </section>
</div>

<?php 
    endwhile; 
endif; 

get_footer(); 
?>