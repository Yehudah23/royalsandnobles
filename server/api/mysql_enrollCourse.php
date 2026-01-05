<?php
// mysql_enrollCourse.php - record enrollment in MySQL. Accepts JSON { courseId } and uses Authorization Bearer token or uid in body for dev.
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/verifyToken.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true) ?: [];
$courseId = isset($data['courseId']) ? trim($data['courseId']) : null;

if (!$courseId) { http_response_code(400); echo json_encode(['error'=>'courseId required']); exit; }

$uid = null;
$headers = getallheaders();
if (isset($headers['Authorization'])) {
  $parts = preg_split('/\s+/', $headers['Authorization']);
  if (count($parts)===2 && strtolower($parts[0])==='bearer') { $token = $parts[1];
    try { $payload = verifyFirebaseIdToken($token, defined('FIREBASE_PROJECT_ID')?FIREBASE_PROJECT_ID:null); if (isset($payload->sub)) $uid = $payload->sub; } catch (Exception $e) {}
  }
}
if (!$uid && isset($data['uid'])) $uid = trim($data['uid']);
if (!$uid) { http_response_code(401); echo json_encode(['error'=>'uid required']); exit; }

try {
  $pdo = getDbConnection();
  // insert ignore to prevent duplicates
  $stmt = $pdo->prepare('INSERT IGNORE INTO enrollments (uid, course_id) VALUES (?, ?)');
  $stmt->execute([$uid, $courseId]);
  echo json_encode(['ok'=>true]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error'=>$e->getMessage()]);
}

?>
