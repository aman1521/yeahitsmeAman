<?php
/*
Template Name: Contact-us Page
*/
get_header();
?>

<?php
// Message display variable
$statusMsg = '';

if (isset($_POST['submit_form'])) {
    // 1. Sanitize & Fetch Data
    $name    = htmlspecialchars(strip_tags(trim($_POST['name'])));
    $email   = htmlspecialchars(strip_tags(trim($_POST['email'])));
    $company = htmlspecialchars(strip_tags(trim($_POST['company'])));
    $website = htmlspecialchars(strip_tags(trim($_POST['website'])));
    $message = htmlspecialchars(strip_tags(trim($_POST['message'])));

    // Fetch Radio and Checkboxes
    $budget   = isset($_POST['budget']) ? htmlspecialchars($_POST['budget']) : 'Not specified';
    $services = isset($_POST['service']) ? implode(", ", $_POST['service']) : 'None selected';

    // 2. Server-Side Validation
    if (!empty($name) && !empty($email) && !empty($message)) {
        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            
            // 3. Email Configuration
            $to = 'inderji8826@gmail.com'; // Receiving Email
            $subject = 'New Contact Form Submission from ' . $name;
            
            // HTML Email Template
            $htmlContent = "
                <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <h2 style='color: #5c45fd;'>New Project Inquiry</h2>
                    <p><strong>Name:</strong> {$name}</p>
                    <p><strong>Email:</strong> {$email}</p>
                    <p><strong>Company:</strong> {$company}</p>
                    <p><strong>Website:</strong> {$website}</p>
                    <p><strong>Services Needed:</strong> {$services}</p>
                    <p><strong>Budget:</strong> {$budget}</p>
                    <p><strong>Message:</strong><br/>" . nl2br($message) . "</p>
                </div>
            ";

            // Headers for HTML Email
            $headers = "MIME-Version: 1.0" . "\r\n";
            $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
            $headers .= "From: {$name} <{$email}>" . "\r\n";
            $headers .= "Reply-To: {$email}" . "\r\n";

            // 4. Send Email
            if (mail($to, $subject, $htmlContent, $headers)) {
                $statusMsg = '<div style="background-color: #d4edda; color: #155724; padding: 15px; border-radius: 12px; margin-bottom: 20px; font-family: sans-serif;">✅ Thank you! Your message has been sent successfully.</div>';
            } else {
                $statusMsg = '<div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 12px; margin-bottom: 20px; font-family: sans-serif;">❌ Something went wrong while sending the email. Please try again.</div>';
            }
        } else {
            $statusMsg = '<div style="background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 12px; margin-bottom: 20px; font-family: sans-serif;">⚠️ Please enter a valid email address.</div>';
        }
    } else {
        $statusMsg = '<div style="background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 12px; margin-bottom: 20px; font-family: sans-serif;">⚠️ Please fill in all required fields (Name, Email, Message).</div>';
    }
}
?>

<?php echo $statusMsg; ?>
      <section id="section-1" class="banner-1 services">
            <div class="container animate-element effect-fade-up">
               <div class="row">
                   <div class="col-lg-12 text-center">

        <section id="custom-design-section">
            <div id="our-projects-pill">
                <img src="<?php echo esc_url( get_template_directory_uri() . '/images/stars.png' ); ?>" class="img-under" alt="Arrow">

                <div id="pill-text">
                    <?php echo esc_html( get_field( 'contactpill_text' ) ); ?>
                </div>
            </div>
        </section>

        <h1 class="under-banner-h">
            <?php echo wp_kses_post( get_field( 'contact_heading' ) ); ?>
        </h1>

        <p class="under-banner-pp">
            <?php echo wp_kses_post( get_field( 'contact_description' ) ); ?>
        </p>

                   </div> </div> </div> </section> <section id="section-3" class="yex-contact-section">
    <div class="container animate-element effect-slide-right">
        <div class="row g-4">
            
            <div class="col-12 col-lg-8">
                <div class="yex-card yex-glow-tr h-100">
                    <?php if(isset($_GET['success'])): ?>

<div class="alert alert-success">
    Thank you! Your message has been sent successfully.
</div>

<?php endif; ?>
                   <form class="yex-form" action="" method="POST">
    
    <div class="row g-4 mb-4">
        <div class="col-md-6">
            <label class="yex-input-label">Your Name <span style="color:red;">*</span></label>
            <input type="text" name="name" class="yex-input" placeholder="John Doe" required>
        </div>
        <div class="col-md-6">
            <label class="yex-input-label">Email <span style="color:red;">*</span></label>
            <input type="email" name="email" class="yex-input" placeholder="john@example.com" required>
        </div>
    </div>

    <div class="row g-4 mb-4">
        <div class="col-md-6">
            <label class="yex-input-label">Company</label>
            <input type="text" name="company" class="yex-input" placeholder="Acme Inc.">
        </div>
        <div class="col-md-6">
            <label class="yex-input-label">Website</label>
            <input type="text" name="website" class="yex-input" placeholder="www.example.com">
        </div>
    </div>

    <div class="mb-4">
        <label class="yex-input-label">What can we help with?</label>
        <div class="yex-pills-container">
            <label class="yex-pill-label"><input type="checkbox" name="service[]" value="AI"><span>AI</span></label>
            <label class="yex-pill-label"><input type="checkbox" name="service[]" value="Web"><span>Web</span></label>
            <label class="yex-pill-label"><input type="checkbox" name="service[]" value="Mobile"><span>Mobile</span></label>
            <label class="yex-pill-label"><input type="checkbox" name="service[]" value="Design"><span>Design</span></label>
            <label class="yex-pill-label"><input type="checkbox" name="service[]" value="Cloud"><span>Cloud</span></label>
            <label class="yex-pill-label"><input type="checkbox" name="service[]" value="Audit"><span>Audit</span></label>
        </div>
    </div>

    <div class="mb-4">
        <label class="yex-input-label">Budget</label>
        <div class="yex-pills-container">
            <label class="yex-pill-label"><input type="radio" name="budget" value="<10k"><span>< $10k</span></label>
            <label class="yex-pill-label"><input type="radio" name="budget" value="10k-50k"><span>$10k – $50k</span></label>
            <label class="yex-pill-label"><input type="radio" name="budget" value="50k-200k"><span>$50k – $200k</span></label>
            <label class="yex-pill-label"><input type="radio" name="budget" value="200k+"><span>$200k+</span></label>
        </div>
    </div>

    <div class="mb-4">
        <label class="yex-input-label">Tell us about your project <span style="color:red;">*</span></label>
        <textarea name="message" class="yex-input" rows="4" placeholder="Share your vision with us..." required></textarea>
    </div>

    <button type="submit" name="submit_form" class="yex-submit-btn">
        <?php wp_nonce_field('yex_contact_form','yex_nonce'); ?>
        Send Message 
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12L2.01 3L2 10l15 2l-15 2z"/></svg>
    </button>
    
</form>
                </div>
            </div>
 <div class="col-12 col-lg-4 d-flex flex-column gap-4">
                
         <div class="yex-card yex-glow-tl">
    <h2 class="yex-title">
        <?php echo esc_html( get_field( 'form_title' ) ); ?>
    </h2>

    <p class="yex-subtitle">
        <?php echo wp_kses_post( get_field( 'form_desc' ) ); ?>
    </p>

    <div class="yex-channel-list">
        <a href="mailto:<?php echo esc_attr( get_field( 'form_email' ) ); ?>" class="yex-channel-item">
            <div class="yex-icon-circle">
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div class="yex-channel-text">
                <span class="yex-label">EMAIL</span>
                <span class="yex-value">
                    <?php echo esc_html( get_field( 'form_email' ) ); ?>
                </span>
            </div>
            <svg class="yex-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
        </a>

        <a href="#" class="yex-channel-item">
            <div class="yex-icon-circle">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </div>
            <div class="yex-channel-text">
                <span class="yex-label">CHAT</span>
                <span class="yex-value">
                    <?php echo esc_html( get_field( 'form_chat' ) ); ?>
                </span>
            </div>
    
        </a>

        <a href="#" class="yex-channel-item">
            <div class="yex-icon-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <div class="yex-channel-text">
                <span class="yex-label">BOOK A CALL</span>
                <span class="yex-value">
                    <?php echo esc_html( get_field( 'form_book_a_call' ) ); ?>
                </span>
            </div>
            <svg class="yex-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
        </a>
    </div>
</div>

<div class="yex-card">
    <div class="d-flex flex-column gap-4">

        <div class="yex-info-block">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A8A3B8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>

            <div class="yex-channel-text">
                <span class="yex-label">LOCATION</span>
                <span class="yex-value">
                    <?php echo esc_html( get_field( 'form_location' ) ); ?>
                </span>
            </div>
        </div>

        <div class="yex-info-block">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A8A3B8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>

            <div class="yex-channel-text">
                <span class="yex-label">PHONE</span>
                <span class="yex-value">
                    <?php echo esc_html( get_field( 'form_phone' ) ); ?>
                </span>
            </div>
        </div>

    </div>
</div>
<!-- 
<div class="yex-card yex-card-light">
    <span class="yex-reply-label">
        <?php echo wp_kses_post( get_field( 'form_phone_copy' ) ); ?>
    </span>

    <span class="yex-reply-time">
        <?php echo esc_html( get_field( 'form_text_time' ) ); ?>
    </span>
</div> -->
            </div>
        </div>
    </div>
</section>
   
<?php get_footer(); ?>