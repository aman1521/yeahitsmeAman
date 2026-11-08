<?php
/*
Template Name: Services Page
*/
get_header();
?>

<section id="section-1"  class="banner-1  services">
   <div class="container animate-element effect-fade-up">
      <div class="row">
         <div class="col-lg-12 text-center ">
            
            <section id="custom-design-section">
               <div id="our-projects-pill">
                  <img src="<?php echo esc_url( get_template_directory_uri() . '/images/stars.png' ); ?>" class="img-under" alt="Stars">
                  <div id="pill-text">
                     <?php 
                     $pill_text = get_field('ser_pill_text'); 
                     echo $pill_text ? esc_html($pill_text) : 'Our Services'; 
                     ?>
                  </div>
               </div>
            </section>
            
            <h1 class="under-banner-h">
               <?php 
               $banner_head = get_field('sev_banner_heading');
               echo $banner_head ? wp_kses_post($banner_head) : 'Services built for <span class="add-clr"> tomorrow. </span>'; 
               ?>
            </h1>
            
            <p class="under-banner-pp">
               <?php 
               $banner_desc = get_field('ser_description');
               echo $banner_desc ? wp_kses_post($banner_desc) : 'From AI-powered applications to intuitive user experiences, we build digital products that drive <br> meaningful impact for forward-thinking companies.'; 
               ?>
            </p>
            
            <?php 
            $cta_text = get_field('ser_cta_text');
            $cta_link = get_field('cta_button_link');
            if ( $cta_text && $cta_link ) : 
            ?>
          <a href="<?php echo esc_url($cta_link); ?>" class="cscs">
    <?php echo esc_html($cta_text); ?>
    <img src="<?php echo esc_url( get_template_directory_uri() . '/images/lef-arrows.png' ); ?>" class="button-cls-hp" alt="Arrow">
</a>
            
            <?php endif; ?>
            
         </div>
      </div>
   </div>
</section>

<div  id="section-2" class="services-page-wrapper">
   
   <section class="capabilities-section">
      <div class="container animate-element effect-slide-left">
         <div class="section-header">
            <section class="custom-design-section">
               <div class="our-projects-pill">
                  <div class="pill-dot"></div>
                  <span class="pill-text"><?php echo esc_html( get_field('our_cap') ?: 'Our Capabilities' ); ?></span>
               </div>
            </section>
            <h2 class="section-title add-font"><?php echo wp_kses_post( get_field('our_cap_title') ?: 'Everything you need to <span class="text-gradient">scale.</span>' ); ?></h2>
            <p class="section-subtitle"><?php echo wp_kses_post( get_field('our_cap_desc') ?: 'We are a capabilities and certified partners for your digital transformation.' ); ?></p>
         </div>
         
         <div class="bento-grid-wrapper">
            <div class="center-floating-logo">
               <img src="<?php echo esc_url( get_template_directory_uri() . '/images/services-logo.png' ); ?>" class="floating-logo-1" alt="Services Logo">
            </div>
            
            <div class="bento-grid">
               
               <?php if ( get_field('services_title_1') ) : ?>
               <div class="bento-card">
                  <?php $s1_img = get_field('services_image_1'); if($s1_img): ?>
<img  src="<?php echo esc_url( is_array($s1_img) ? $s1_img['url'] : $s1_img ); ?>"  alt="" class="add-jh">
<?php endif; ?>
                  
                  <h3 class="card-title"><?php echo esc_html( get_field('services_title_1') ); ?></h3>
                  <div class="card-desc"><?php echo wp_kses_post( get_field('services_desc_1') ); ?></div>
                  
                  <ul class="card-list">
                     <?php if(get_field('services_list_1_1')): ?><li><img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Container-3.svg"> <?php echo esc_html(get_field('services_list_1_1')); ?></li><?php endif; ?>
                     <?php if(get_field('services_list_1_2')): ?><li><img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Container-3.svg"> <?php echo esc_html(get_field('services_list_1_2')); ?></li><?php endif; ?>
                     <?php if(get_field('services_list_1_3')): ?><li><img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Container-3.svg"> <?php echo esc_html(get_field('services_list_1_3')); ?></li><?php endif; ?>
                     <?php if(get_field('services_list_1_4')): ?><li><img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Container-3.svg"> <?php echo esc_html(get_field('services_list_1_4')); ?></li><?php endif; ?>
                  </ul>
               </div>
               <?php endif; ?>

               <div class="bento-card card-wide">
                  <div>
                     <h3 class="card-title">Build, Ship & Scale-Together</h3>
                     <p class="card-desc">We work closely as your partner in success to ensure product reliability and growth.</p>
                     <a href="https://infronixai.com/Yexoria/projects/" class="btn-secondary">Start a Project</a>
                  </div>
                  <div class="team-avatars">
                     <img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Avatar.png" alt="User">
					    <img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Avatar.svg" alt="User">
                     <img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Avatar-1.svg" alt="User">
                   <img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Container-4.svg" alt="User">
                  </div>
               </div>

               <?php if ( get_field('services_title_2') ) : ?>
               <div class="bento-card">
                  <?php $s2_img = get_field('services_image_2'); if($s2_img): ?>
<img  src="<?php echo esc_url( is_array($s1_img) ? $s1_img['url'] : $s1_img ); ?>"  alt="" class="add-jh">
                  <?php endif; ?>
                  
                  <h3 class="card-title"><?php echo esc_html( get_field('services_title_2') ); ?></h3>
                  <div class="card-desc"><?php echo wp_kses_post( get_field('services_desc_2') ); ?></div>
                  
                  <ul class="card-list">
                     <?php if(get_field('services_list_2_1')): ?><li><img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Container-3.svg"> <?php echo esc_html(get_field('services_list_2_1')); ?></li><?php endif; ?>
                     <?php if(get_field('services_list_2_2')): ?><li><img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Container-3.svg"> <?php echo esc_html(get_field('services_list_2_2')); ?></li><?php endif; ?>
                     <?php if(get_field('services_list_2_3')): ?><li><img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Container-3.svg"> <?php echo esc_html(get_field('services_list_2_3')); ?></li><?php endif; ?>
                     <?php if(get_field('services_list_2_4')): ?><li><img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Container-3.svg"> <?php echo esc_html(get_field('services_list_2_4')); ?></li><?php endif; ?>
                  </ul>
               </div>
               <?php endif; ?>

               <?php if ( get_field('services_title_3') ) : ?>
               <div class="bento-card">
                  <?php $s3_img = get_field('services_image_3'); if($s3_img): ?>
<img  src="<?php echo esc_url( is_array($s1_img) ? $s1_img['url'] : $s1_img ); ?>"  alt="" class="add-jh">
                  <?php endif; ?>
                  
                  <h3 class="card-title"><?php echo esc_html( get_field('services_title_3') ); ?></h3>
                  <div class="card-desc"><?php echo wp_kses_post( get_field('services_desc_3') ); ?></div>
                  
                  <ul class="card-list">
                     <?php if(get_field('services_list_3_1')): ?><li><img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Container-3.svg"> <?php echo esc_html(get_field('services_list_3_1')); ?></li><?php endif; ?>
                     <?php if(get_field('services_list_3_2')): ?><li><img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Container-3.svg"> <?php echo esc_html(get_field('services_list_3_2')); ?></li><?php endif; ?>
                     <?php if(get_field('services_list_3_3')): ?><li><img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Container-3.svg"> <?php echo esc_html(get_field('services_list_3_3')); ?></li><?php endif; ?>
                     <?php if(get_field('services_list_3_4')): ?><li><img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Container-3.svg"> <?php echo esc_html(get_field('services_list_3_4')); ?></li><?php endif; ?>
                  </ul>
               </div>
               <?php endif; ?>

               <div class="stats-wrapper">
                  <div class="bento-card stat-card">
                    <img src="<?php echo esc_url( get_template_directory_uri() . '/images/services/serv.png' ); ?>" width="50px" alt="">
                     <h3 class="stat-number">98%</h3>
                     <p class="card-desc">Client Satisfaction rate</p>
                     <div class="tags">
                        <span>Strategy</span>
                        <span>Design</span>
                        <span>Engineering</span>
                     </div>
                  </div>
                  <div class="bento-card stat-card text-end">
                  <img src="<?php echo esc_url( get_template_directory_uri() . '/images/services/serv.png' ); ?>" width="50" alt="" class="service-img">
                     <h3 class="stat-number ">120+</h3>
                     <p class="card-desc gtftf">Product delivered</p>
                     <div class="toggle-graphic">
                        <div class="toggle-track">
                           <div class="toggle-knob"></div>
                        </div>
                        <span class="agle-cs">Agile approach</span>
                     </div>
                  </div>
               </div>

               <?php if ( get_field('services_title_4') ) : ?>
               <div class="bento-card">
                  <?php $s4_img = get_field('services_image_4'); if($s4_img): ?>
<img  src="<?php echo esc_url( is_array($s1_img) ? $s1_img['url'] : $s1_img ); ?>"  alt="" class="add-jh">
                  <?php endif; ?>
                  
                  <h3 class="card-title"><?php echo esc_html( get_field('services_title_4') ); ?></h3>
                  <div class="card-desc"><?php echo wp_kses_post( get_field('services_desc_4') ); ?></div>
                  
                  <ul class="card-list">
                     <?php if(get_field('services_list_4_1')): ?><li><img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Container-3.svg"> <?php echo esc_html(get_field('services_list_4_1')); ?></li><?php endif; ?>
                     <?php if(get_field('services_list_4_2')): ?><li><img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Container-3.svg"> <?php echo esc_html(get_field('services_list_4_2')); ?></li><?php endif; ?>
                     <?php if(get_field('services_list_4_3')): ?><li><img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Container-3.svg"> <?php echo esc_html(get_field('services_list_4_3')); ?></li><?php endif; ?>
                     <?php if(get_field('services_list_4_4')): ?><li><img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/Container-3.svg"><?php echo esc_html(get_field('services_list_4_4')); ?></li><?php endif; ?>
                  </ul>
               </div>
               <?php endif; ?>

            </div>
            
            <div class="bottom-banner bento-card">
               <div class="banner-text">
                  <h3>Not sure where to start?</h3>
                  <p>Grab a free audit timeline roadmap and feature breakdown. Do not hesitate.</p>               </div>
               <a href="#" class="btn-primary">Book a free audit</a>
            </div>
            
         </div>
      </div>
   </section>
   
   <section id="section-6" class="process-section">
      <div class="container animate-element effect-fade-up">
         <div class="section-header">
            <section class="custom-design-section">
               <div class="our-projects-pill">
                  <div class="pill-dot"></div>
                  <span class="pill-text"><?php echo esc_html( get_field('servcies_how_we_work') ?: 'How we work' ); ?></span>
               </div>
            </section>
            <h2 class="section-title"><?php echo wp_kses_post( get_field('servcies_how_we_work_title') ?: 'A process tuned for <span class="text-gradient">momentum.</span>' ); ?></h2>
         </div>
         
         <div class="process-circles">
            
            <?php if ( get_field('how_we_work_title_1') ) : ?>
            <div class="process-circle">
               <span class="step-num"><?php echo esc_html( get_field('how_we_work_1') ?: '01' ); ?></span>
               <h3 class="step-title"><?php echo esc_html( get_field('how_we_work_title_1') ); ?></h3>
               <p class="step-desc"><?php echo esc_html( get_field('how_we_work_desc_1') ); ?></p>
            </div>
            <?php endif; ?>

            <?php if ( get_field('how_we_work_title_2') ) : ?>
            <div class="process-circle">
               <span class="step-num"><?php echo esc_html( get_field('how_we_work_2') ?: '02' ); ?></span>
               <h3 class="step-title"><?php echo esc_html( get_field('how_we_work_title_2') ); ?></h3>
               <p class="step-desc"><?php echo esc_html( get_field('how_we_work_desc_2') ); ?></p>
            </div>
            <?php endif; ?>

            <?php if ( get_field('how_we_work_title_3') ) : ?>
            <div class="process-circle">
               <span class="step-num"><?php echo esc_html( get_field('how_we_work_3') ?: '03' ); ?></span>
               <h3 class="step-title"><?php echo esc_html( get_field('how_we_work_title_3') ); ?></h3>
               <p class="step-desc"><?php echo esc_html( get_field('how_we_work_desc_3') ); ?></p>
            </div>
            <?php endif; ?>

         </div>
      </div>
   </section>
   
   <section class="cta-section">
      <div class="container">
         <div class="cta-box">
            <h2><?php echo esc_html( get_field('stitle') ?: 'Have something in mind?' ); ?></h2>
            <div class="cta-desc"><?php echo wp_kses_post( get_field('sservcies_des') ?: "<p>Let's discuss your project and explore how we can bring your idea to life with cutting-edge technology and design.</p>" ); ?></div>
            
            <?php 
            $cta_btn_text = get_field('sservcies_button') ?: "Let's Connect";
            $cta_btn_link = get_field('sservcies_button_link') ?: '#';
            ?>
            <a href="<?php echo esc_url($cta_btn_link); ?>" class="btn-primary"><?php echo esc_html($cta_btn_text); ?></a>
         </div>
      </div>
   </section>
   
</div> <?php get_footer(); ?>