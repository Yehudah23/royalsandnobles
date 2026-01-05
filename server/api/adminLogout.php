<?php
// adminLogout.php
// Destroys the admin session (if any)

header('Content-Type: application/json');
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
// unset admin markers
unset($_SESSION['is_admin']);
unset($_SESSION['admin_email']);
// destroy session cookie
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params['path'], $params['domain'], $params['secure'], $params['httponly']
    );
}
session_destroy();

echo json_encode(['ok' => true, 'message' => 'logged out']);

?>