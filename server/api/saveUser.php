<?php
// saveUser.php
// Accepts { email, uid, role } via JSON POST and stores in server/data/users.json
// If Authorization header with Bearer <id_token> is provided and server/api/verifyToken.php
// is present, it will try to verify the token before writing. Otherwise it will write
// in permissive mode (useful for local dev only).

header('Content-Type: application/json');

require_once __DIR__ . '/verifyToken.php'; // optional - include if present

$raw = file_get_contents('php://input');
$data = json_decode($raw, true) ?: [];
$email = isset($data['email']) ? trim($data['email']) : null;
$uid = isset($data['uid']) ? trim($data['uid']) : null;
$role = isset($data['role']) ? trim($data['role']) : null;

if (!$email) {
    http_response_code(400);
    echo json_encode(['error' => 'email is required']);
    exit;
}

// try to verify incoming Firebase ID token if present
$authUid = null;
$headers = getallheaders();
if (isset($headers['Authorization'])) {
    $parts = preg_split('/\s+/', $headers['Authorization']);
    if (count($parts) === 2 && strtolower($parts[0]) === 'bearer') {
        $token = $parts[1];
        try {
            // verifyIdToken or verifyFirebaseIdToken may be defined by verifyToken.php
            if (function_exists('verifyIdToken')) {
                $payload = verifyIdToken($token);
                if (isset($payload['sub'])) $authUid = $payload['sub'];
            } elseif (function_exists('verifyFirebaseIdToken')) {
                $payload = verifyFirebaseIdToken($token, defined('FIREBASE_PROJECT_ID') ? FIREBASE_PROJECT_ID : null);
                if (isset($payload->sub)) $authUid = $payload->sub;
            }
        } catch (Exception $e) {
            // verification failed; continue in permissive mode but log error
            error_log('verifyIdToken error: ' . $e->getMessage());
        }
    }
}

$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) mkdir($dataDir, 0755, true);
$usersFile = $dataDir . '/users.json';
if (!file_exists($usersFile)) file_put_contents($usersFile, json_encode([]));

$users = json_decode(file_get_contents($usersFile), true) ?: [];

// Use uid if provided; otherwise try to find by email
$key = null;
if ($uid) {
    foreach ($users as $i => $u) {
        if (isset($u['uid']) && $u['uid'] === $uid) { $key = $i; break; }
    }
}
if ($key === null) {
    foreach ($users as $i => $u) {
        if (isset($u['email']) && strtolower($u['email']) === strtolower($email)) { $key = $i; break; }
    }
}

$now = date('c');
$entry = [
    'email' => $email,
    'uid' => $uid ?: null,
    'role' => $role ?: null,
    'updatedAt' => $now,
];

if ($key === null) {
    // create new
    $entry['createdAt'] = $now;
    $users[] = $entry;
} else {
    // merge
    $users[$key] = array_merge($users[$key], array_filter($entry, function($v){return $v !== null;}));
}

file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));

echo json_encode(['ok' => true, 'user' => $entry]);

?>