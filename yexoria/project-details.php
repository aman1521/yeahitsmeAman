<?php
get_header();

if (have_posts()) :
while (have_posts()) : the_post();

$year      = get_field('project_year');
$client    = get_field('client_name');
$location  = get_field('location');
$category  = get_field('category_type');
$subtitle  = get_field('project_subtitle');

$image = get_the_post_thumbnail_url(get_the_ID(),'full');

if(!$image){
    $image = get_template_directory_uri().'/images/project-placeholder.jpg';
}
?>
   

    <section class="project-details-section">
        <div class="project-content-container">
            
            <div class="back-nav-row">
                <a href="#" class="back-btn-link interactive-el">
                    <i class="fa-solid fa-arrow-left"></i> Back to Projects
                </a>
            </div>

            <div class="project-hero-card interactive-el">
              <img src="<?php echo esc_url($image); ?>" class="hero-cover-img" alt="<?php the_title(); ?>">

<div class="hero-tags-top">

<?php if($year): ?>
<span class="hero-tag-pill"><?php echo esc_html($year); ?></span>
<?php endif; ?>

<?php if($category): ?>
<span class="hero-tag-pill tag-accent">
<?php echo esc_html($category); ?>
</span>
<?php endif; ?>

</div>

<div class="hero-overlay-bottom">

<div class="hero-project-title">
<?php the_title(); ?>
</div>

<div class="hero-project-desc">
<?php echo esc_html($subtitle); ?>
</div>

</div>

            <div class="meta-data-grid">

<div class="meta-card-box interactive-el">
<div class="meta-label">Client</div>
<div class="meta-value"><?php echo esc_html($client); ?></div>
</div>

<div class="meta-card-box interactive-el">
<div class="meta-label">Year</div>
<div class="meta-value"><?php echo esc_html($year); ?></div>
</div>

<div class="meta-card-box interactive-el">
<div class="meta-label">Location</div>
<div class="meta-value"><?php echo esc_html($location); ?></div>
</div>

<div class="meta-card-box interactive-el">
<div class="meta-label">Category</div>
<div class="meta-value"><?php echo esc_html($category); ?></div>
</div>

</div>

            <div class="content-block-card interactive-el">
 <div class="block-title">
<?php the_field('overview_title'); ?>
</div>

<div class="block-paragraph">
<?php the_field('overview_desc'); ?>
</div>
            </div>

            <div class="content-block-card interactive-el">
            <div class="block-title">
<?php the_field('tech_title'); ?>
</div>

<div class="tech-stack-flex">

<?php

for($i=1;$i<=10;$i++){

$tech=get_field('tech_technology_'.$i);

if($tech){

echo '<span class="tech-pill">'.$tech.'</span>';

}

}

?>

</div>
            </div>

            <div class="content-block-card interactive-el">
             <div class="block-title">
<?php the_field('key_features_title'); ?>
</div>

<div class="features-grid-list">

<?php

for($i=1;$i<=9;$i++){

$item=get_field('key_features_list_'.$i);

if($item){

?>

<div class="list-item-row">
<span class="list-dot"></span>
<?php echo esc_html($item); ?>
</div>

<?php

}

}

?>

</div>
            </div>

            <div class="split-cards-grid">
                <div class="content-block-card interactive-el">
                  <div class="block-title">
<?php the_field('challenges'); ?>
</div>

<?php

for($i=1;$i<=4;$i++){

$item=get_field('challenges_list_'.$i);

if($item){

echo '<div class="list-item-row"><span class="list-dot"></span>'.$item.'</div>';

}

}

?>
                </div>
                <div class="content-block-card interactive-el">
                   <div class="block-title">
<?php the_field('outcomes_title'); ?>
</div>

<?php

for($i=1;$i<=4;$i++){

$item=get_field('outcomes_'.$i);

if($item){

echo '<div class="list-item-row"><span class="list-dot"></span>'.$item.'</div>';

}

}

?>
                </div>
            </div>

            <div class="mid-image-card interactive-el">
               <?php

$banner=get_field('mid_banner');

if($banner):

?>

<img src="<?php echo esc_url($banner['url']); ?>" class="mid-cover-img">

<?php endif; ?>
            </div>

            <div class="content-block-card interactive-el">
               <div class="block-title">
<?php the_field('what_we_delivered'); ?>
</div>

<?php

for($i=1;$i<=4;$i++){

$item=get_field('delivered_points_'.$i);

if($item){

echo '<div class="list-item-row"><span class="list-dot"></span>'.$item.'</div>';

}

}

?>
            </div>

            <div class="content-block-card interactive-el">
                <div class="block-title">
<?php the_field('conclusion_title'); ?>
</div>

<div class="block-paragraph">

<?php the_field('conclusion_desc'); ?>

</div>
            </div>

            <div class="bottom-cta-banner interactive-el">
                <div class="cta-banner-heading">Like what you see?</div>
                <div class="cta-banner-subtext">Let's create something amazing together.</div>
                <button class="cta-action-btn">Start a Project</button>
            </div>

        </div>
    </section>
<?php

endwhile;
endif;

get_footer();

?>