<?php
// mysql_getMyCourses.php - return enrolled course IDs for a given user
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/verifyToken.php';

$uid = null;
$headers = getallheaders();
if (isset($headers['Authorization'])) {
  $parts = preg_split('/\s+/', $headers['Authorization']);
  if (count($parts)===2 && strtolower($parts[0])==='bearer') { $token = $parts[1];
    try { $payload = verifyFirebaseIdToken($token, defined('FIREBASE_PROJECT_ID')?FIREBASE_PROJECT_ID:null); if (isset($payload->sub)) $uid = $payload->sub; } catch (Exception $e) {}
  }
}
if (!$uid && isset($_GET['uid'])) $uid = trim($_GET['uid']);
if (!$uid) { http_response_code(401); echo json_encode(['error'=>'uid required']); exit; }

try {
  $pdo = getDbConnection();
  $stmt = $pdo->prepare('SELECT DISTINCT course_id FROM enrollments WHERE uid = ?');
  $stmt->execute([$uid]);
  $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);
  echo json_encode(['ok'=>true, 'courses'=>$rows]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error'=>$e->getMessage()]);
}

?>
