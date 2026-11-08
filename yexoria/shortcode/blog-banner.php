<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function yexoria_blog_banner_shortcode() {

    ob_start();
    ?>

    <div class="blog-hero-box">

        <section id="custom-design-section">
            <div id="our-projects-pill">
                <img src="<?php echo esc_url( get_template_directory_uri() . '/images/stars.png' ); ?>" class="img-under" alt="Arrow">
                <div id="pill-text">
                    <?php echo esc_html( get_field( 'blogpill_text' ) ); ?>
                </div>
            </div>
        </section>

        <div class="blog-main-title">
            <?php echo wp_kses_post( get_field( 'blog_heading' ) ); ?>
        </div>

        <div class="blog-main-desc">
            <?php echo wp_kses_post( get_field( 'blog_description' ) ); ?>
        </div>

    </div>

    <?php
    return ob_get_clean();
}

add_shortcode( 'blog_banner', 'yexoria_blog_banner_shortcode' );