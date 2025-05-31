<?php
$subject = 'New Customer Order'; // Subject of your email
$to = 'muzaffar.mustafaev1@gmail.com';  // Recipient's E-mail

// Get POST values
$name = isset($_POST['name']) ? strip_tags(trim($_POST['name'])) : '';
$email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$phone = isset($_POST['phone']) ? strip_tags(trim($_POST['phone'])) : '';
$msg = isset($_POST['message']) ? strip_tags(trim($_POST['message'])) : '';
$service = isset($_POST['service']) ? strip_tags(trim($_POST['service'])) : '';
$date = isset($_POST['date']) ? strip_tags(trim($_POST['date'])) : '';
$time = isset($_POST['time']) ? strip_tags(trim($_POST['time'])) : '';

// Prepare message body
$message = '';
$message .= 'Name: ' . $name . "\n";
$message .= 'Email: ' . $email . "\n";
$message .= 'Phone: ' . $phone . "\n";
$message .= 'Service: ' . $service . "\n";
$message .= 'Date & Time: ' . $date . " " . $time . "\n";
$message .= 'Message: ' . $msg . "\n";

// Prepare headers
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: " . $name . " <" . $email . ">\r\n";
$headers .= "Reply-To: " . $email . "\r\n";

// Send email
if (mail($to, $subject, $message, $headers)) {
    echo 'sent';
} else {
    echo 'failed';
}
?>
