<?php
// enrollCourse.php
// Accepts { courseId } via JSON POST and stores an enrollment record under server/data/enrollments.json
// If Authorization: Bearer <id_token> is present and verifyToken.php exists, it will try to verify and use the token's uid.

header('Content-Type: application/json');

require_once __DIR__ . '/verifyToken.php'; // optional

$raw = file_get_contents('php://input');
$data = json_decode($raw, true) ?: [];
$courseId = isset($data['courseId']) ? trim($data['courseId']) : null;

if (!$courseId) {
    http_response_code(400);
    echo json_encode(['error' => 'courseId is required']);
    exit;
}

// Determine user UID by verifying token or falling back to provided uid in body
$headers = getallheaders();
$uid = null;
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

// fallback: allow uid in payload for permissive local dev
if (!$uid && isset($data['uid'])) $uid = trim($data['uid']);

if (!$uid) {
    http_response_code(401);
    echo json_encode(['error' => 'uid not determined. Provide Authorization header with a valid token or include uid in body (dev mode).']);
    exit;
}

$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) mkdir($dataDir, 0755, true);
$enrollFile = $dataDir . '/enrollments.json';
if (!file_exists($enrollFile)) file_put_contents($enrollFile, json_encode([]));

$enrollments = json_decode(file_get_contents($enrollFile), true) ?: [];

// prevent duplicate enrollment for same uid+courseId
foreach ($enrollments as $e) {
    if (isset($e['uid']) && isset($e['courseId']) && $e['uid'] === $uid && $e['courseId'] === $courseId) {
        echo json_encode(['ok' => true, 'message' => 'already enrolled']);
        exit;
    }
}

$now = date('c');
$record = [
    'uid' => $uid,
    'courseId' => $courseId,
    'enrolledAt' => $now,
];
$enrollments[] = $record;
file_put_contents($enrollFile, json_encode($enrollments, JSON_PRETTY_PRINT));

echo json_encode(['ok' => true, 'enrollment' => $record]);

?>