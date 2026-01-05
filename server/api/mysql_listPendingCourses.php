<?php
// mysql_listPendingCourses.php - list pending courses; requires admin session or token
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/verifyToken.php';

$isAdmin = false;
$headers = getallheaders();
// try session
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
if (!empty($_SESSION['is_admin'])) $isAdmin = true;

// try token
if (!$isAdmin && isset($headers['Authorization'])) {
  $parts = preg_split('/\s+/', $headers['Authorization']);
  if (count($parts)===2 && strtolower($parts[0])==='bearer') {
    $token = $parts[1];
    try { $payload = verifyFirebaseIdToken($token, defined('FIREBASE_PROJECT_ID')?FIREBASE_PROJECT_ID:null); if (in_array($payload->email ?? '', ['youremail@example.com'])) $isAdmin = true; } catch (Exception $e) {}
  }
}

if (!$isAdmin) { http_response_code(403); echo json_encode(['error'=>'forbidden']); exit; }

try {
  $pdo = getDbConnection();
  $stmt = $pdo->prepare('SELECT course_id as id, title, description, file_url, uploader_email as uploader FROM courses WHERE status = ? ORDER BY created_at DESC');
  $stmt->execute(['pending']);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($rows);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error'=>$e->getMessage()]);
}

?>
