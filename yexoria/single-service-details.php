<?php
/**
 * The template for displaying all single Service Details.
 * CPT Slug: service-details
 */

get_header();
?>

<main id="primary" class="site-main single-service-page">
    
    <?php
    /* Start the WordPress Loop */
    while ( have_posts() ) :
        the_post();
        ?>

        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
            
            <!-- Hero / Banner Section -->
            <header class="service-hero-section" style="padding: 60px 0; background-color: #f8f9fa; text-align: center;">
                <div class="container">
                    <!-- Default WP Title -->
                    <h1 class="service-main-title"><?php the_title(); ?></h1>
                    
                    <!-- ACF Text Field: Short Description -->
                    <?php if ( get_field('service_short_desc') ) : ?>
                        <p class="service-subtitle">
                            <?php the_field('service_short_desc'); ?>
                        </p>
                    <?php endif; ?>
                </div>
            </header>

            <!-- Main Content Area -->
            <div class="container" style="padding: 50px 0;">
                <div class="row">
                    
                    <!-- Left Column: Content & Tabs -->
                    <div class="col-lg-8 col-md-12">
                        
                        <!-- Featured Image (Default WP Thumbnail) -->
                        <?php if ( has_post_thumbnail() ) : ?>
                            <div class="service-featured-image mb-4">
                                <?php the_post_thumbnail( 'large', array( 'class' => 'img-fluid rounded' ) ); ?>
                            </div>
                        <?php endif; ?>

                        <!-- Default WP WYSIWYG Editor Content -->
                        <div class="service-content-body">
                            <?php the_content(); ?>
                        </div>

                    </div>

                    <!-- Right Column: Sidebar with ACF Fields (Icon, Button) -->
                    <div class="col-lg-4 col-md-12">
                        <div class="service-sidebar-card" style="background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                            
                            <!-- ACF Image Field: Service Icon -->
                            <?php 
                            $service_icon = get_field('service_icon');
                            // Checking if ACF returns an array or direct URL
                            $icon_url = is_array($service_icon) ? $service_icon['url'] : $service_icon;
                            
                            if ( $icon_url ) : ?>
                                <div class="icon-wrapper mb-3 text-center">
                                    <img src="<?php echo esc_url( $icon_url ); ?>" alt="<?php the_title_attribute(); ?> Icon" style="max-width: 80px;">
                                </div>
                            <?php endif; ?>

                            <!-- ACF Link Field: Call To Action Button -->
                            <?php 
                            $cta_link = get_field('service_button_link');
                            if ( $cta_link ) : 
                                // Handling ACF Link Array safely
                                $cta_url    = is_array($cta_link) ? $cta_link['url'] : $cta_link;
                                $cta_title  = (is_array($cta_link) && $cta_link['title']) ? $cta_link['title'] : 'Get Started';
                                $cta_target = (is_array($cta_link) && $cta_link['target']) ? $cta_link['target'] : '_self';
                            ?>
                                <div class="text-center mt-4">
                                    <a href="<?php echo esc_url( $cta_url ); ?>" target="<?php echo esc_attr( $cta_target ); ?>" class="btn btn-primary btn-block">
                                        <?php echo esc_html( $cta_title ); ?>
                                    </a>
                                </div>
                            <?php endif; ?>
                            
                        </div>
                    </div>

                </div>
            </div>

        </article>

    <?php
    endwhile; // End of the loop.
    ?>

</main>

<?php get_footer(); ?>