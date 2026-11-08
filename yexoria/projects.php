<?php
/*
Template Name: Projects  Page
*/
get_header();
?>
    <section  id="section-1" class="banner-1  services">
        <div class="container animate-element effect-fade-up">
            <div class="row">
                <div class="col-lg-12 text-center">
                    
                    <section id="custom-design-section">
                        <div id="our-projects-pill">
                            <img src="<?php echo get_template_directory_uri(); ?>/images/stars.png" class="img-under" alt="Arrow">
                            <div id="pill-text"> <?php echo esc_html( get_field( 'project_pill_text' ) ); ?></div>
                        </div>
                    </section>
                  
                        <h1 class="under-banner-h add-font">
            <?php echo wp_kses_post( get_field( 'project_heading' ) ); ?>
        </h1>
                    
                    <p class="under-banner-pp">  <?php echo esc_html( get_field( 'project_description' ) ); ?>
                    </p>
                    
<!--               <a href="<?php echo esc_url( get_field( 'project_button_link' ) ); ?>" class="cscs">-->
<!--    <?php echo esc_html( get_field( 'project_cta_text' ) ); ?>-->
<!--    <img src="<?php echo esc_url( get_template_directory_uri() . '/images/lef-arrows.png' ); ?>" class="button-cls-hp" alt="Arrow">-->
<!--</a>-->
                
                </div> </div> </div> </section> <section class="projects-main-section">
        
        <div class="ambient-star star-pos-1"></div>
        <div class="ambient-star star-pos-2"></div>
        <div class="ambient-star star-pos-3"></div>
        <div class="ambient-star star-pos-4"></div>
        <div class="ambient-glow-bg"></div>

        <div  id="section-2" class="projects-container-fluid animate-element effect-slide-left">
            
            <div class="filter-tabs-wrapper" id="project-tabs">
                <button class="tab-filter-btn add-font tab-active" data-filter="all">All</button>
                <button class="tab-filter-btn add-font" data-filter="web">Web</button>
                <button class="tab-filter-btn add-font" data-filter="mobile">Mobile</button>
                <button class="tab-filter-btn add-font" data-filter="ui">UI</button>
                  <button class="tab-filter-btn add-font" data-filter="ai"> AI</button>
                <button class="tab-filter-btn add-font" data-filter="design">Design</button>
            </div>

           <div class="projects-grid-layout" id="projects-grid">

<?php

$args = array(
    'post_type'      => 'project-details',
    'posts_per_page' => -1,
    'post_status'    => 'publish'
);

$projects = new WP_Query($args);

if($projects->have_posts()) :

while($projects->have_posts()) :
$projects->the_post();

$image = get_the_post_thumbnail_url(get_the_ID(),'large');

if(!$image){
    $image = get_template_directory_uri().'/images/project-placeholder.jpg';
}

$year = get_field('project_year');
$subtitle = get_field('project_subtitle');

$terms = get_the_terms(get_the_ID(), 'project-category');
$category_name = '';
$category_slug = '';

if($terms && !is_wp_error($terms)){
    $category_name = $terms[0]->name;
    $category_slug = $terms[0]->slug;
}

?>

<div class="grid-card-item" data-category="<?php echo esc_attr($category_slug); ?>">

    <div class="card-image-box">

        <a href="<?php the_permalink();?>">

            <img src="<?php echo esc_url($image);?>" class="card-cover-img">

        </a>

        <div class="card-tags-overlay">

            <?php if($year): ?>
            <span class="tag-pill"><?php echo esc_html($year);?></span>
            <?php endif; ?>

            <?php if($category_name): ?>
            <span class="tag-pill tag-purple">
                <?php echo esc_html($category_name);?>
            </span>
            <?php endif; ?>

        </div>

    </div>

    <div class="card-info-box">

        <div class="card-item-title add-font">

            <a href="<?php the_permalink();?>">
                <?php the_title(); ?>
            </a>

        </div>

        <div class="card-item-desc">

            <?php echo esc_html($subtitle); ?>

        </div>

    </div>

</div>

<?php

endwhile;

wp_reset_postdata();

endif;

?>

</div>

            <div  id="section-3"  class="projects-cta-banner animate-element effect-slide-right">
                <div class="cta-banner-title add-font">Your Project, our next case study.</div>
                <div class="cta-banner-desc add-font">Let's discuss your project and explore how we can bring your vision to life with cutting-edge technology and design.</div>
                <button class="cta-connect-btn add-font">Let's Connect</button>
            </div>

        </div>
    </section>

<?php
get_footer();
?>