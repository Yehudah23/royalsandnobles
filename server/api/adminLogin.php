<?php
// adminLogin.php
// Admin login endpoint using password hashing and admin records in server/data/admins.json
// Development convenience: the first login with the default password 'welcome'
// will create an admin record for that email. After creation, passwords are
// stored hashed using password_hash().
// WARNING: This is still intended for internal/dev use. Protect the endpoint
// and consider using a proper auth provider or Firebase custom claims in production.

header('Content-Type: application/json');

$raw = file_get_contents('php://input');
$data = json_decode($raw, true) ?: [];
$email = isset($data['email']) ? trim($data['email']) : null;
$password = isset($data['password']) ? $data['password'] : null;

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'email and password are required']);
    exit;
}

$DEFAULT_ADMIN_PASSWORD = 'welcome';

$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) mkdir($dataDir, 0755, true);
$usersFile = $dataDir . '/users.json';
if (!file_exists($usersFile)) file_put_contents($usersFile, json_encode([]));
$adminsFile = $dataDir . '/admins.json';
if (!file_exists($adminsFile)) file_put_contents($adminsFile, json_encode([]));

$users = json_decode(file_get_contents($usersFile), true) ?: [];
$admins = json_decode(file_get_contents($adminsFile), true) ?: [];

$emailLower = strtolower($email);
$adminIndex = null;
foreach ($admins as $i => $a) {
    if (isset($a['email']) && strtolower($a['email']) === $emailLower) { $adminIndex = $i; break; }
}

$now = date('c');

if ($adminIndex === null) {
    // No admin record found. Allow bootstrap if password equals default.
    if ($password !== $DEFAULT_ADMIN_PASSWORD) {
        http_response_code(401);
        echo json_encode(['error' => 'invalid credentials']);
        exit;
    }
    // create admin record with hashed default password
    $passwordHash = password_hash($DEFAULT_ADMIN_PASSWORD, PASSWORD_DEFAULT);
    $adminEntry = [
        'email' => $email,
        'passwordHash' => $passwordHash,
        'createdAt' => $now,
        'updatedAt' => $now,
    ];
        $admins[] = $adminEntry;
        file_put_contents($adminsFile, json_encode($admins, JSON_PRETTY_PRINT));

        // secure session cookie parameters
        $cookieParams = session_get_cookie_params();
        session_set_cookie_params([
            'lifetime' => $cookieParams['lifetime'] ?? 0,
            'path' => $cookieParams['path'] ?? '/',
            'domain' => $cookieParams['domain'] ?? '',
            'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);

        // also ensure user record exists with role admin
    $foundIndex = null;
    foreach ($users as $i => $u) {
        if (isset($u['email']) && strtolower($u['email']) === $emailLower) { $foundIndex = $i; break; }
    }
    if ($foundIndex === null) {
        try { $uid = bin2hex(random_bytes(8)); } catch (Exception $e) { $uid = 'admin-' . time(); }
        $entry = [
            'email' => $email,
            'uid' => $uid,
            'role' => 'admin',
            'createdAt' => $now,
            'updatedAt' => $now,
        ];
        $users[] = $entry;
    } else {
        $users[$foundIndex]['role'] = 'admin';
        $users[$foundIndex]['updatedAt'] = $now;
    }
    file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
    // start session and mark admin (regenerate id)
    if (session_status() !== PHP_SESSION_ACTIVE) session_start();
    session_regenerate_id(true);
    $_SESSION['is_admin'] = true;
    $_SESSION['admin_email'] = $email;
    require_once __DIR__ . '/csrf.php';
    $token = generateCsrfToken();
    echo json_encode(['ok' => true, 'message' => 'admin created', 'userEmail' => $email, 'csrf' => $token]);
    exit;
} else {
    // Admin record exists; verify password
    $stored = $admins[$adminIndex];
    $hash = $stored['passwordHash'] ?? '';
    if (!password_verify($password, $hash)) {
        http_response_code(401);
        echo json_encode(['error' => 'invalid credentials']);
        exit;
    }
    // Successful login: ensure users.json has admin role
    $foundIndex = null;
    foreach ($users as $i => $u) {
        if (isset($u['email']) && strtolower($u['email']) === $emailLower) { $foundIndex = $i; break; }
    }
    if ($foundIndex === null) {
        try { $uid = bin2hex(random_bytes(8)); } catch (Exception $e) { $uid = 'admin-' . time(); }
        $entry = [
            'email' => $email,
            'uid' => $uid,
            'role' => 'admin',
            'createdAt' => $now,
            'updatedAt' => $now,
        ];
        $users[] = $entry;
        file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
        if (session_status() !== PHP_SESSION_ACTIVE) session_start();
        session_regenerate_id(true);
        $_SESSION['is_admin'] = true;
        $_SESSION['admin_email'] = $email;
        require_once __DIR__ . '/csrf.php';
        $token = generateCsrfToken();
        echo json_encode(['ok' => true, 'message' => 'admin ensured', 'userEmail' => $email, 'csrf' => $token]);
        exit;
    } else {
        // already present; return success
        if (session_status() !== PHP_SESSION_ACTIVE) session_start();
        session_regenerate_id(true);
        $_SESSION['is_admin'] = true;
        $_SESSION['admin_email'] = $email;
        require_once __DIR__ . '/csrf.php';
        $token = generateCsrfToken();
        echo json_encode(['ok' => true, 'message' => 'login successful', 'userEmail' => $email, 'csrf' => $token]);
        exit;
    }
}

?>