<?php get_header(); ?>

<main class="container">
    <?php
    while(have_posts()) :
        the_post();
        the_content();
    endwhile;
    ?>
</main>

<?php get_footer(); ?>