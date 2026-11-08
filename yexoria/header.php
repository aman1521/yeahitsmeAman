<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
    <style>
/* --- Wrapper Styling --- */
.big-logo-wrapper {
  position: relative;
  display: block; 
  width: 100%;

  padding: 0 !important; /* Koi extra padding na ho */
  line-height: 0; 
  font-size: 0;
  cursor: default;
}

/* --- Base Image Styling --- */
.big-watermark-base {
  display: block;
  width: 100% !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* --- The Magic Glow Layer --- */
.big-watermark-glow {
  position: absolute;
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%;
  pointer-events: none; 
  
  /* MAGIC FIX: Mask ko exactly <img> tag ki tarah scale karna */
  -webkit-mask-size: 100% auto !important;
  mask-size: 100% auto !important;
  -webkit-mask-position: top left !important;
  mask-position: top left !important;
  -webkit-mask-repeat: no-repeat !important;
  mask-repeat: no-repeat !important;

  /* Desktop Spotlight Gradient */
  background: radial-gradient(
    circle 150px at var(--mouse-x, 50%) var(--mouse-y, 50%), 
    #c084fc 0%, 
    transparent 100%
  );
  
  opacity: 0; 
  transition: opacity 0.3s ease; 
}

/* Hover & Touch par glow show hoga */
.big-logo-wrapper:hover .big-watermark-glow,
.big-logo-wrapper.is-touching .big-watermark-glow {
  opacity: 1;
}

.sr-only {
  width: 1px;
  height: 1px;
  position: absolute;
  overflow: hidden;
}

/* ===================================
   BACK TO TOP BUTTON
=================================== */
.back-to-top-btn {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    
    /* --- Glass Effect Start --- */
    /* Tinted, semi-transparent background */
    background: linear-gradient(135deg, rgba(81, 162, 255, 0.35), rgba(92, 26, 144, 0.35));
    
    /* Blurs whatever is behind the button */
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    
    /* Subtle highlight on top/left edges */
    border: 1px solid rgba(255, 255, 255, 0.25);
    
    /* Combined outer shadow + subtle top inner light reflection */
    box-shadow: 
        0 8px 32px 0 rgba(0, 0, 0, 0.37),
        inset 0 1px 1px 0 rgba(255, 255, 255, 0.3);
    /* --- Glass Effect End --- */

    color: #fff;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    z-index: 999;

    display: flex;
    justify-content: center;
    align-items: center;

    opacity: 0;
    visibility: hidden;
    transform: translateY(20px);
    transition: all 0.3s ease-in-out;
}

/* Optional: Subtle hover interaction for extra responsiveness */
.back-to-top-btn:hover {
    background: linear-gradient(135deg, rgba(81, 162, 255, 0.5), rgba(92, 26, 144, 0.5));
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 
        0 8px 32px 0 rgba(0, 0, 0, 0.45),
        inset 0 1px 2px 0 rgba(255, 255, 255, 0.5);
}

/* JS is class ko add karega jab user niche scroll karega */
.back-to-top-btn.show-btn {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}


/* Mobile ke liye spotlight size adjust */
@media (max-width: 768px) {
  .big-watermark-glow {
    background: radial-gradient(
      circle 100px at var(--mouse-x, 50%) var(--mouse-y, 50%), 
      #c084fc 0%, 
      transparent 100%
    );
  }
      .back-to-top-btn {
        bottom: 20px;
        right: 20px;
        width: 45px;
        height: 45px;
        font-size: 18px;
    }
}
    </style>

</head>

<body <?php body_class(); ?>>

<section class="main-section-animation">

    <span class="home-animation"></span>
    <span class="home-animation"></span>


    <div class="rain-bo">
        <img src="<?php echo get_template_directory_uri(); ?>/images/rainbow.png" alt="">
    </div>
<?php if ( !is_front_page() ) : ?>

<div class="rain-bo rain-bo-2">
    <img src="<?php echo get_template_directory_uri(); ?>/images/about/about.png" class="under-about" alt="">
</div>

<?php endif; ?>

    <div class="particles"></div>

 <nav class="navbar navbar-expand-lg fixed-top">
    <div class="container">

        <a href="<?php echo home_url(); ?>" class="logo">
            <img src="<?php echo get_template_directory_uri(); ?>/images/logo-yexoria.png" width="150" alt="">
        </a>

        <!-- Mobile Toggle -->
        <button class="navbar-toggler border-0 shadow-none text-white"
                type="button"
                onclick="showSidebar()">
            ☰
        </button>

        <!-- Desktop Menu -->
        <div class="navbar-collapse desktop-menu">

            <ul class="navbar-nav mx-auto">

                <li class="nav-item">
                    <a href="<?php echo home_url('/about'); ?>" class="newcs nav-link">
                        About Us
                    </a>
                </li>

                <li class="nav-item">
                    <a href="<?php echo home_url('/services'); ?>" class="newcs nav-link">
                        Services
                    </a>
                </li>

                <li class="nav-item">
                    <a href="<?php echo home_url('/projects'); ?>" class="newcs nav-link">
                        Projects
                    </a>
                </li>

                <li class="nav-item">
                    <a href="<?php echo home_url('/blog'); ?>" class="newcs nav-link">
                        Blog
                    </a>
                </li>

            </ul>

            <a href="<?php echo home_url('/contact'); ?>" class="primary-btn">
                Contact Us
            </a>

        </div>

    </div>
</nav>

<!-- Mobile Sidebar -->
<div class="custom-sidebar">

    <div class="sidebar-close" onclick="closeSidebar()">
        ✕
    </div>

    <ul class="sidebar-menu">
          <a href="<?php echo home_url(); ?>" class="logo">
            <img src="<?php echo get_template_directory_uri(); ?>/images/logo-yexoria.png" width="150" alt="">
        </a>

        <li>
            <a href="<?php echo home_url('/about'); ?>" class="newcs nav-link">
                About Us
            </a>
        </li>

        <li>
            <a href="<?php echo home_url('/services'); ?>" class="newcs nav-link">
                Services
            </a>
        </li>

        <li>
            <a href="<?php echo home_url('/projects'); ?>" class="newcs nav-link">
                Projects
            </a>
        </li>

        <li>
            <a href="<?php echo home_url('/blog'); ?>" class="newcs nav-link">
                Blog
            </a>
        </li>

        <li style="margin-top:25px;">
            <a href="<?php echo home_url('/contact'); ?>" class="primary-btn">
                Contact Us
            </a>
        </li>

    </ul>

</div>

<style>

.custom-sidebar {
    position: fixed;
    top: 0px;
    right: 0;
    width: 100%;
    height: 100vh;
    z-index: 99999;
    background: rgb(0 0 0 / 19%);
    backdrop-filter: blur(15px);
    transform: translateX(100%);
    transition: all .35s ease;
    padding: 30px 30px 30px;
}

.custom-sidebar.active{
    transform:translateX(0);
}

.sidebar-close{
    position:absolute;
    top:20px;
    right:25px;
    font-size:32px;
    color:#fff;
    cursor:pointer;
    line-height:1;
}

.sidebar-menu{
    list-style:none;
    padding:0;
    margin:0;
}

.sidebar-menu li{
    margin-bottom:25px;
}

.sidebar-menu a{
    text-decoration:none;
}

@media (max-width:991px){

    .navbar-collapse{
        display:none !important;
    }

    .navbar-toggler{
        display:block !important;
    }
}

@media (min-width:992px){

    .custom-sidebar{
        display:none;
    }

    .navbar-toggler{
        display:none !important;
    }
}
</style>

