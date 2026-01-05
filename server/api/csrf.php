<?php
// csrf.php - simple CSRF token helper using PHP session
if (session_status() !== PHP_SESSION_ACTIVE) session_start();

function generateCsrfToken() {
  if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(24));
    $_SESSION['csrf_token_time'] = time();
  }
  return $_SESSION['csrf_token'];
}

function validateCsrfToken($token) {
  if (empty($_SESSION['csrf_token'])) return false;
  // Optional: expire tokens after 1 hour
  $maxAge = 60 * 60;
  if (!empty($_SESSION['csrf_token_time']) && (time() - $_SESSION['csrf_token_time']) > $maxAge) {
    unset($_SESSION['csrf_token']);
    unset($_SESSION['csrf_token_time']);
    return false;
  }
  return hash_equals($_SESSION['csrf_token'], (string)$token);
}

?>
