<?php
// adminChangePassword.php
// Change an admin's password. Accepts JSON POST: { email, currentPassword, newPassword }
// Verifies the current password against server/data/admins.json and updates the stored hash.

header('Content-Type: application/json');

$raw = file_get_contents('php://input');
$data = json_decode($raw, true) ?: [];
$email = isset($data['email']) ? trim($data['email']) : null;
$current = isset($data['currentPassword']) ? $data['currentPassword'] : null;
$new = isset($data['newPassword']) ? $data['newPassword'] : null;

if (!$email || !$current || !$new) {
    http_response_code(400);
    echo json_encode(['error' => 'email, currentPassword and newPassword are required']);
    exit;
}

$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) mkdir($dataDir, 0755, true);
$adminsFile = $dataDir . '/admins.json';
if (!file_exists($adminsFile)) file_put_contents($adminsFile, json_encode([]));

$admins = json_decode(file_get_contents($adminsFile), true) ?: [];
$emailLower = strtolower($email);
$adminIndex = null;
foreach ($admins as $i => $a) {
    if (isset($a['email']) && strtolower($a['email']) === $emailLower) { $adminIndex = $i; break; }
}

if ($adminIndex === null) {
    http_response_code(404);
    echo json_encode(['error' => 'admin not found']);
    exit;
}

$stored = $admins[$adminIndex];
$hash = $stored['passwordHash'] ?? '';
// Allow password change if the admin is authenticated via session
$sessionOk = false;
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
if (!empty($_SESSION['is_admin']) && isset($_SESSION['admin_email']) && strtolower($_SESSION['admin_email']) === $emailLower) {
    $sessionOk = true;
}

if (!$sessionOk) {
    // require current password
    if (!password_verify($current, $hash)) {
        http_response_code(401);
        echo json_encode(['error' => 'current password incorrect']);
        exit;
    }
}

// Update password
$newHash = password_hash($new, PASSWORD_DEFAULT);
$admins[$adminIndex]['passwordHash'] = $newHash;
$admins[$adminIndex]['updatedAt'] = date('c');
file_put_contents($adminsFile, json_encode($admins, JSON_PRETTY_PRINT));

echo json_encode(['ok' => true, 'message' => 'password updated']);

?>