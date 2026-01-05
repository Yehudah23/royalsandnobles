<?php
// adminStatus.php
// Returns whether the current PHP session is authenticated as admin.
header('Content-Type: application/json');
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
if (!empty($_SESSION['is_admin']) && !empty($_SESSION['admin_email'])) {
    echo json_encode(['ok' => true, 'email' => $_SESSION['admin_email']]);
    exit;
}
http_response_code(401);
echo json_encode(['ok' => false, 'error' => 'not authenticated']);
?>