<?php get_header(); ?>

/*
Template Name: project-details
*/


    <section class="project-details-section">
        <div class="project-content-container">
            
            <div class="back-nav-row">
                <a href="https://infronixai.com/Yexoria/" class="back-btn-link interactive-el">
                    <i class="fa-solid fa-arrow-left"></i> Back to Projects
                </a>
            </div>

           <!-- Hero Card Section -->
            <div class="project-hero-card interactive-el">
                <!-- Fetching Featured Image (Thumbnail) -->
                <?php if ( has_post_thumbnail() ) : ?>
                    <img src="<?php echo esc_url( get_the_post_thumbnail_url( get_the_ID(), 'full' ) ); ?>" class="hero-cover-img" alt="<?php the_title_attribute(); ?>">
                <?php endif; ?>
                
                <div class="hero-tags-top">
                    <?php if ( $year = get_field('project_year') ) : ?>
                        <span class="hero-tag-pill"><?php echo esc_html( $year ); ?></span>
                    <?php endif; ?>
                    
                    <?php if ( $category = get_field('category_type') ) : ?>
                        <span class="hero-tag-pill tag-accent"><?php echo esc_html( $category ); ?></span>
                    <?php endif; ?>
                </div>

                <div class="hero-overlay-bottom">
                    <div class="hero-project-title"><?php the_title(); ?></div>
                    <?php if ( $subtitle = get_field('project_subtitle') ) : ?>
                        <div class="hero-project-desc"><?php echo esc_html( $subtitle ); ?></div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Meta Data Grid -->
            <div class="meta-data-grid">
                <?php if ( $client = get_field('client_name') ) : ?>
                    <div class="meta-card-box interactive-el">
                        <div class="meta-label">Client</div>
                        <div class="meta-value"><?php echo esc_html( $client ); ?></div>
                    </div>
                <?php endif; ?>
                
                <?php if ( $year = get_field('project_year') ) : ?>
                    <div class="meta-card-box interactive-el">
                        <div class="meta-label">Year</div>
                        <div class="meta-value"><?php echo esc_html( $year ); ?></div>
                    </div>
                <?php endif; ?>
                
                <?php if ( $location = get_field('location') ) : ?>
                    <div class="meta-card-box interactive-el">
                        <div class="meta-label">Location</div>
                        <div class="meta-value"><?php echo esc_html( $location ); ?></div>
                    </div>
                <?php endif; ?>
                
                <?php if ( $category = get_field('category_type') ) : ?>
                    <div class="meta-card-box interactive-el">
                        <div class="meta-label">Category</div>
                        <div class="meta-value"><?php echo esc_html( $category ); ?></div>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Overview Section -->
            <?php if ( get_field('overview_title') || get_field('overview_desc') ) : ?>
            <div class="content-block-card interactive-el">
                <?php if ( $overview_title = get_field('overview_title') ) : ?>
                    <div class="block-title"><?php echo esc_html( $overview_title ); ?></div>
                <?php endif; ?>
                
                <?php if ( $overview_desc = get_field('overview_desc') ) : ?>
                    <div class="block-paragraph">
                        <?php echo wp_kses_post( $overview_desc ); ?>
                    </div>
                <?php endif; ?>
            </div>
            <?php endif; ?>

            <!-- Tech Stack Section -->
            <?php if ( get_field('tech_title') || get_field('tech_technology1') ) : ?>
            <div class="content-block-card interactive-el">
                <?php if ( $tech_title = get_field('tech_title') ) : ?>
                    <div class="block-title"><?php echo esc_html( $tech_title ); ?></div>
                <?php endif; ?>
                
                <div class="tech-stack-flex">
                    <?php 
                    for ( $i = 1; $i <= 10; $i++ ) {
                        // Managing the field name variation (tech_technology1 vs tech_technology_2)
                        $field_name = ($i == 1) ? 'tech_technology1' : 'tech_technology_' . $i;
                        if ( $tech_val = get_field( $field_name ) ) {
                            echo '<span class="tech-pill">' . esc_html( $tech_val ) . '</span>';
                        }
                    }
                    ?>
                </div>
            </div>
            <?php endif; ?>

            <!-- Key Features Section -->
            <?php if ( get_field('key_features_title') || get_field('key_features_list_1') ) : ?>
            <div class="content-block-card interactive-el">
                <?php if ( $feature_title = get_field('key_features_title') ) : ?>
                    <div class="block-title"><?php echo esc_html( $feature_title ); ?></div>
                <?php endif; ?>
                
                <div class="features-grid-list">
                    <?php
                    for ( $i = 1; $i <= 9; $i++ ) {
                        if ( $feature_val = get_field( 'key_features_list_' . $i ) ) {
                            echo '<div class="list-item-row"><span class="list-dot"></span> ' . esc_html( $feature_val ) . '</div>';
                        }
                    }
                    ?>
                </div>
            </div>
            <?php endif; ?>

            <!-- Challenges & Outcomes Split Grid -->
            <div class="split-cards-grid">
                
              <?php
$show_challenges = get_field('challenges');
for($i=1;$i<=4;$i++){
    if(get_field('challenges_list_'.$i)){
        $show_challenges = true;
        break;
    }
}

$show_outcomes = get_field('outcomes_title');
for($i=1;$i<=4;$i++){
    if(get_field('outcomes_'.$i)){
        $show_outcomes = true;
        break;
    }
}

if($show_challenges || $show_outcomes):
?>

<div class="split-cards-grid">

    <?php if($show_challenges): ?>
    <div class="content-block-card interactive-el">

        <?php if($title = get_field('challenges')): ?>
            <div class="block-title"><?php echo esc_html($title); ?></div>
        <?php endif; ?>

        <?php
        for($i=1;$i<=4;$i++){
            if($text = get_field('challenges_list_'.$i)){
                echo '<div class="list-item-row"><span class="list-dot"></span> '.esc_html($text).'</div>';
            }
        }
        ?>

    </div>
    <?php endif; ?>


    <?php if($show_outcomes): ?>
    <div class="content-block-card interactive-el">

        <?php if($title = get_field('outcomes_title')): ?>
            <div class="block-title"><?php echo esc_html($title); ?></div>
        <?php endif; ?>

        <?php
        for($i=1;$i<=4;$i++){
            if($text = get_field('outcomes_'.$i)){
                echo '<div class="list-item-row"><span class="list-dot"></span> '.esc_html($text).'</div>';
            }
        }
        ?>

    </div>
    <?php endif; ?>

</div>

<?php endif; ?>
                
            </div>

            <!-- Mid Banner Image Card -->
            <?php 
            $mid_banner = get_field('mid_banner');
            $mid_banner_url = is_array($mid_banner) ? $mid_banner['url'] : $mid_banner;
            
            if ( $mid_banner_url ) : 
            ?>
            <div class="mid-image-card interactive-el">
                <img src="<?php echo esc_url( $mid_banner_url ); ?>" class="mid-cover-img" alt="<?php the_title_attribute(); ?> Mid Banner">
            </div>
            <?php endif; ?>

            <!-- What We Delivered Section -->
            <?php if ( get_field('what_we_delivered') || get_field('delivered_points_1') ) : ?>
            <div class="content-block-card interactive-el">
                <?php if ( $delivered_title = get_field('what_we_delivered') ) : ?>
                    <div class="block-title"><?php echo esc_html( $delivered_title ); ?></div>
                <?php endif; ?>
                
                <?php
                for ( $i = 1; $i <= 4; $i++ ) {
                    if ( $delivered_val = get_field( 'delivered_points_' . $i ) ) {
                        echo '<div class="list-item-row"><span class="list-dot"></span> ' . esc_html( $delivered_val ) . '</div>';
                    }
                }
                ?>
            </div>
            <?php endif; ?>

            <!-- Conclusion Section -->
            <?php if ( get_field('conclusion_title') || get_field('conclusion_desc') ) : ?>
            <div class="content-block-card interactive-el">
                <?php if ( $conclusion_title = get_field('conclusion_title') ) : ?>
                    <div class="block-title"><?php echo esc_html( $conclusion_title ); ?></div>
                <?php endif; ?>
                
                <?php if ( $conclusion_desc = get_field('conclusion_desc') ) : ?>
                    <div class="block-paragraph">
                        <?php echo wp_kses_post( $conclusion_desc ); ?>
                    </div>
                <?php endif; ?>
            </div>
            <?php endif; ?>

            <div class="bottom-cta-banner interactive-el">
                <div class="cta-banner-heading">Like what you see?</div>
                <div class="cta-banner-subtext">Let's create something amazing together.</div>
                <button class="cta-action-btn">Start a Project</button>
            </div>

        </div>
    </section>


<?php get_footer(); ?>