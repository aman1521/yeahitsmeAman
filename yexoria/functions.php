<?php

/* ==========================
   Theme Setup
========================== */

function yexoria_setup() {

    // Dynamic Title Tag
    add_theme_support('title-tag');

    // Featured Image Support
    add_theme_support('post-thumbnails');

    // Custom Logo Support
    add_theme_support('custom-logo');

    // HTML5 Support
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script'
    ));

    // Navigation Menu
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'yexoria'),
    ));

}
add_action('after_setup_theme', 'yexoria_setup');


/* ==========================
   Load CSS & JS
========================== */

function yexoria_assets() {

    // WordPress Default jQuery
    wp_enqueue_script('jquery');

    /* ==========================
       CSS Files
    ========================== */

    // Bootstrap CSS
    wp_enqueue_style(
        'bootstrap',
        get_template_directory_uri() . '/css/bootstrap.min.css',
        array(),
        '5.3.3'
    );

  wp_enqueue_style(
    'fontawesome',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    array(),
    '6.5.1'
);

    // Owl Carousel CSS
    wp_enqueue_style(
        'owl-carousel',
        'https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css',
        array(),
        '2.3.4'
    );

    wp_enqueue_style(
        'owl-theme',
        'https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.theme.default.min.css',
        array(),
        '2.3.4'
    );

wp_enqueue_style(
    'main-style',
    get_template_directory_uri() . '/style.css',
    array(),
    filemtime(get_template_directory() . '/style.css')
);

    /* ==========================
       JS Files
    ========================== */

    // Owl Carousel JS
    wp_enqueue_script(
        'owl-js',
        'https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js',
        array('jquery'),
        '2.3.4',
        true
    );

    // Bootstrap JS
    wp_enqueue_script(
        'bootstrap-js',
        get_template_directory_uri() . '/js/bootstrap.bundle.min.js',
        array('jquery'),
        '5.3.3',
        true
    );

    // Main JS
    wp_enqueue_script(
        'main-js',
        get_template_directory_uri() . '/js/script.js',
        array('jquery'),
        filemtime(get_template_directory() . '/js/script.js'),
        true
    );
    

}
add_action('wp_enqueue_scripts', 'yexoria_assets');

if (function_exists('acf_add_options_page')) {

    acf_add_options_page(array(
        'page_title' => 'Theme Settings',
        'menu_title' => 'Theme Settings',
        'menu_slug'  => 'theme-settings',
        'capability' => 'edit_posts',
        'redirect'   => false,
    ));

    acf_add_options_sub_page(array(
        'page_title'  => 'Footer Settings',
        'menu_title'  => 'Footer',
        'parent_slug' => 'theme-settings',
    ));
}
/*==============================
Yexoria Contact Form
==============================*/

add_action('init', 'yexoria_contact_form');

function yexoria_contact_form(){

    if(
        !isset($_POST['submit_form']) ||
        !isset($_POST['yex_nonce']) ||
        !wp_verify_nonce($_POST['yex_nonce'],'yex_contact_form')
    ){
        return;
    }

    $name     = sanitize_text_field($_POST['name']);
    $email    = sanitize_email($_POST['email']);
    $company  = sanitize_text_field($_POST['company']);
    $website  = sanitize_text_field($_POST['website']);
    $budget   = sanitize_text_field($_POST['budget']);
    $message  = sanitize_textarea_field($_POST['message']);

    $services = '';

    if(!empty($_POST['service'])){
        $services = implode(', ', array_map('sanitize_text_field', $_POST['service']));
    }

    /*=========================
      ADMIN EMAIL
    =========================*/

    $admin_email = get_option('admin_email');
    // ya direct likh do:
    // $admin_email = 'hello@yexoria.ai';

    $subject = 'New Contact Form Submission - Yexoria';

    $body = "
New inquiry received.

Name: {$name}

Email: {$email}

Company: {$company}

Website: {$website}

Services: {$services}

Budget: {$budget}

Message:

{$message}
";

    $headers = array(
        'Content-Type: text/plain; charset=UTF-8',
        'Reply-To: '.$name.' <'.$email.'>'
    );

    wp_mail($admin_email,$subject,$body,$headers);

    /*=========================
      AUTO REPLY
    =========================*/

    $reply_subject = 'Thank you for contacting Yexoria';

    $reply_message = "
Hi {$name},

Thank you for reaching out to Yexoria.

We have successfully received your inquiry.

Our team will review your request and get back to you shortly.

Best Regards,

Yexoria Team
";

    $reply_headers = array(
        'Content-Type: text/plain; charset=UTF-8'
    );

    wp_mail($email,$reply_subject,$reply_message,$reply_headers);

    wp_redirect(add_query_arg('success','1',wp_get_referer()));

    exit;

}
require_once get_template_directory() . '/shortcode/blog-banner.php';