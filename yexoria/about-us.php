<?php
/*
Template Name: About_Page
*/
get_header();
?>

<section  id="section-1"  class="content-section  banner-1 abut ">
    <div class="container animate-element ">
        <div class="row">
            <div class="col-lg-12 text-center">
                <section id="custom-design-section">
                    <div id="our-projects-pill">
                        <img src="<?php echo esc_url( get_template_directory_uri() . '/images/stars.png' ); ?>" class="img-under" alt="Stars">
                        <div id="pill-text"><?php the_field('pill_text'); ?></div>
                    </div>
                </section>
                
                <h1 class="under-banner-h"><?php the_field('about_heading'); ?></h1>
                <p class="under-banner-pp"><?php the_field('banner_description'); ?></p>
                
                <?php 
                // Safely handle Link fields whether returned as an Array or a URL String
                $cta_link = get_field('banner_cta_copy');
                $cta_url = is_array($cta_link) ? $cta_link['url'] : $cta_link;
                $cta_target = is_array($cta_link) && isset($cta_link['target']) && $cta_link['target'] ? $cta_link['target'] : '_self';
                $cta_text = get_field('banner_cta');
                
                if ( $cta_url ) : 
                ?>
                <a href="<?php echo esc_url( $cta_url ); ?>" class="cscs" target="<?php echo esc_attr( $cta_target ); ?>">
                    <?php echo esc_html( $cta_text ); ?>
                    <img src="<?php echo esc_url( get_template_directory_uri() . '/images/lef-arrows.png' ); ?>" class="button-cls-hp" alt="Arrow">
                </a>
                <?php endif; ?>

                <div class="stats-bar-wrapper interactive-element">
                    <div class="stat-item-box">
                        <?php 
                        $cups = get_field('cups');
                        $cups_url = is_array($cups) ? $cups['url'] : $cups;
                        if ( $cups_url ) : ?>
                            <img src="<?php echo esc_url( $cups_url ); ?>" alt="Cup icon"> 
                        <?php endif; ?>
                        <?php the_field( 'cups_texts' ); ?>
                    </div>

                    <div class="stat-item-box">
                        <?php 
                        $cups_2 = get_field('cups_2');
                        $cups_url_2 = is_array($cups_2) ? $cups_2['url'] : $cups_2;
                        if ( $cups_url_2 ) : ?>
                            <img src="<?php echo esc_url( $cups_url_2 ); ?>" alt="Cup icon 2"> 
                        <?php endif; ?>
                        <?php the_field( 'cups_texts_2' ); ?>
                    </div>

                    <div class="stat-item-box">
                        <?php 
                        $cups_3 = get_field('cups_3');
                        $cups_url_3 = is_array($cups_3) ? $cups_3['url'] : $cups_3;
                        if ( $cups_url_3 ) : ?>
                            <img src="<?php echo esc_url( $cups_url_3 ); ?>" alt="Cup icon 3"> 
                        <?php endif; ?>
                        <?php the_field( 'cups_texts_3' ); ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<div class="cover-all">
    <section class="journey-section">
        <div class="container-fluid-box">
<div class="ser"></div>
            <div class="section-header-centered">
                <section class="custom-design-section">
                    <div class="our-projects-pill">
                        <div class="pill-dot"></div>
                        <span class="pill-text"><?php the_field('pill_text_journey'); ?></span>
                    </div>
                </section>
                <h2 class="section-main-title add-font">
                    <?php the_field('title_journey'); ?>
                </h2>
                <p class="section-subtitle-text add-font">
                    <?php the_field('desc_journey'); ?>
                </p>
            </div>
            
            <div class="vertical-timeline-box">
                <div class="timeline-vertical-line"></div>
                
                <div  id="section-2"  class="timeline-row-item right-side interactive-element">
                    <div class="timeline-dot-indicator"></div>
                    <div class="timeline-content-card animate-element effect-slide-left">
                        <div class="timeline-year"><img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/akar-icons_calendar.svg" alt=""> <?php the_field('timeline_year'); ?></div>
                        <div class="timeline-card-title add-font"><?php the_field('timeline__title'); ?></div>
                        <div class="timeline-card-desc add-font"><?php the_field('timeline__desc'); ?></div>
                    </div>
                </div>
                
                <div  id="section-3"     class="timeline-row-item left-side interactive-element">
                    <div class="timeline-dot-indicator"></div>
                    <div class="timeline-content-card animate-element effect-slide-right" >
                        <div class="timeline-year"><img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/akar-icons_calendar.svg" alt=""> <?php the_field('timeline_year_2'); ?></div>
                        <div class="timeline-card-title add-font"><?php the_field('timeline__title_2'); ?></div>
                        <div class="timeline-card-desc add-font"><?php the_field('timeline__desc_2'); ?></div>
                    </div>
                </div>
                
                <div  id="section-2"    class="timeline-row-item right-side interactive-element">
                    <div class="timeline-dot-indicator"></div>
                      <div class="timeline-content-card animate-element effect-slide-left">
                        <div class="timeline-year"> <img src="https://infronixai.com/Yexoria/wp-content/uploads/2026/07/akar-icons_calendar.svg" alt="">  <?php the_field('timeline_year_3'); ?></div>
                        <div class="timeline-card-title add-font"><?php the_field('timeline__title_3'); ?></div>
                        <div class="timeline-card-desc add-font"><?php the_field('timeline__desc3'); ?></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <section  id="section-6"  class="values-section animate-element effect-fade-up">
        <div class="container-fluid-box">
            <div class="section-header-centered">
                <section class="custom-design-section">
                    <div class="our-projects-pill">
                        <div class="pill-dot"></div>
                        <span class="pill-text"><?php the_field('core_values'); ?></span>
                    </div>
                </section>
                <h2 class="section-main-title">
                    <?php the_field('core_values_desc'); ?>
                </h2>
            </div>
            <div class="values-grid-layout">
                
                <div class="value-card-item interactive-element">
                    <?php 
                    $core_img_1 = get_field('core_image'); 
                    $core_url_1 = is_array($core_img_1) ? $core_img_1['url'] : $core_img_1;
                    if ( $core_url_1 ) : ?>
                        <img src="<?php echo esc_url( $core_url_1 ); ?>" class="gtg" alt=""> 
                    <?php endif; ?>
                    <h3 class="value-title-text"><?php the_field('core_title'); ?></h3>
                    <p class="value-desc-text"><?php the_field('core_desc'); ?></p>
                </div>
                
                <div class="value-card-item interactive-element">
                    <?php 
                    $core_img_2 = get_field('core_image_2'); 
                    $core_url_2 = is_array($core_img_2) ? $core_img_2['url'] : $core_img_2;
                    if ( $core_url_2 ) : ?>
                        <img src="<?php echo esc_url( $core_url_2 ); ?>" class="gtg" alt=""> 
                    <?php endif; ?>
                    <h3 class="value-title-text"><?php the_field('core_title_2'); ?></h3>
                    <p class="value-desc-text"><?php the_field('core_desc_2'); ?></p>
                </div>
                
                <div class="value-card-item interactive-element">
                    <?php 
                    $core_img_3 = get_field('core_image_3'); 
                    $core_url_3 = is_array($core_img_3) ? $core_img_3['url'] : $core_img_3;
                    if ( $core_url_3 ) : ?>
                        <img src="<?php echo esc_url( $core_url_3 ); ?>" class="gtg" alt=""> 
                    <?php endif; ?>
                    <h3 class="value-title-text"><?php the_field('core_title_copy2'); ?></h3>
                    <p class="value-desc-text"><?php the_field('core_desc_3'); ?></p>
                </div>
                
                <div class="value-card-item interactive-element">
                    <?php 
                    $core_img_4 = get_field('core_image_4'); 
                    $core_url_4 = is_array($core_img_4) ? $core_img_4['url'] : $core_img_4;
                    if ( $core_url_4 ) : ?>
                        <img src="<?php echo esc_url( $core_url_4 ); ?>" class="gtg" alt=""> 
                    <?php endif; ?>
                    <h3 class="value-title-text"><?php the_field('core_title_copy3'); ?></h3>
                    <p class="value-desc-text"><?php the_field('core_desc_4'); ?></p>
                </div>

            </div>
        </div>
    </section>
    
    <section id="section-8"  class="team-section">
        <div class="container-fluid-box animate-element effect-slide-left">
            <div class="section-header-centered">
                <section class="custom-design-section">
                    <div class="our-projects-pill">
                        <div class="pill-dot"></div>
                        <span class="pill-text"><?php the_field('team_title'); ?></span>
                    </div>
                </section>
                <h2 class="section-main-title">
                    <?php the_field('team_values_desc'); ?>
                </h2>
            </div>
            <div class="team-grid-layout">
                
                <div class="team-card-item interactive-element">
                    <div class="team-img-wrapper">
                        <?php 
                        $team_img_1 = get_field('team_member_image'); 
                        $team_url_1 = is_array($team_img_1) ? $team_img_1['url'] : $team_img_1;
                        if ( $team_url_1 ) : ?>
                            <img src="<?php echo esc_url( $team_url_1 ); ?>" class="team-photo" alt="<?php echo esc_attr( get_field('team_member_name') ); ?>">
                        <?php endif; ?>
                    </div>
                    <div class="team-info-box">
                        <div class="team-name-text"><?php the_field('team_member_name'); ?></div>
                        <div class="team-role-text"><?php the_field('team_member_position'); ?></div>
                    </div>
                </div>
                
                <div class="team-card-item interactive-element">
                    <div class="team-img-wrapper">
                        <?php 
                        $team_img_2 = get_field('team_member_image2'); 
                        $team_url_2 = is_array($team_img_2) ? $team_img_2['url'] : $team_img_2;
                        if ( $team_url_2 ) : ?>
                            <img src="<?php echo esc_url( $team_url_2 ); ?>" class="team-photo" alt="<?php echo esc_attr( get_field('team_member_name2') ); ?>">
                        <?php endif; ?>
                    </div>
                    <div class="team-info-box">
                        <div class="team-name-text"><?php the_field('team_member_name2'); ?></div>
                        <div class="team-role-text"><?php the_field('team_member_position2'); ?></div>
                    </div>
                </div>
                
                <div class="team-card-item interactive-element">
                    <div class="team-img-wrapper">
                        <?php 
                        $team_img_3 = get_field('team_member_image3'); 
                        $team_url_3 = is_array($team_img_3) ? $team_img_3['url'] : $team_img_3;
                        if ( $team_url_3 ) : ?>
                            <img src="<?php echo esc_url( $team_url_3 ); ?>" class="team-photo" alt="<?php echo esc_attr( get_field('team_member_name3') ); ?>">
                        <?php endif; ?>
                    </div>
                    <div class="team-info-box">
                        <div class="team-name-text"><?php the_field('team_member_name3'); ?></div>
                        <div class="team-role-text"><?php the_field('team_member_position3'); ?></div>
                    </div>
                </div>

            </div>
        </div>
    </section>
</div>

<?php get_footer(); ?>