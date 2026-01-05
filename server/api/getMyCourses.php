<?php
// getMyCourses.php
// Returns a list of course IDs the authenticated user is enrolled in (from server/data/enrollments.json)
// Accepts optional query param uid (for dev) or uses Authorization Bearer <token> to determine uid.

header('Content-Type: application/json');
require_once __DIR__ . '/verifyToken.php'; // optional

$uid = null;
// try Authorization header
$headers = getallheaders();
if (isset($headers['Authorization'])) {
    $parts = preg_split('/\s+/', $headers['Authorization']);
    if (count($parts) === 2 && strtolower($parts[0]) === 'bearer') {
        $token = $parts[1];
        try {
            if (function_exists('verifyIdToken')) {
                $payload = verifyIdToken($token);
                if (isset($payload['sub'])) $uid = $payload['sub'];
            } elseif (function_exists('verifyFirebaseIdToken')) {
                $payload = verifyFirebaseIdToken($token, defined('FIREBASE_PROJECT_ID') ? FIREBASE_PROJECT_ID : null);
                if (isset($payload->sub)) $uid = $payload->sub;
            }
        } catch (Exception $e) {
            error_log('verifyIdToken error: ' . $e->getMessage());
        }
    }
}

// fallback: allow uid via query param for development
if (!$uid && isset($_GET['uid'])) $uid = trim($_GET['uid']);

if (!$uid) {
    http_response_code(401);
    echo json_encode(['error' => 'uid not provided. Provide Authorization header with a valid token or ?uid= for dev.']);
    exit;
}

$dataDir = __DIR__ . '/../data';
$enrollFile = $dataDir . '/enrollments.json';
if (!file_exists($enrollFile)) {
    echo json_encode(['ok' => true, 'courses' => []]);
    exit;
}

$enrollments = json_decode(file_get_contents($enrollFile), true) ?: [];
$result = [];
foreach ($enrollments as $e) {
    if (isset($e['uid']) && $e['uid'] === $uid && isset($e['courseId'])) $result[] = $e['courseId'];
}

echo json_encode(['ok' => true, 'courses' => array_values(array_unique($result))]);

?>