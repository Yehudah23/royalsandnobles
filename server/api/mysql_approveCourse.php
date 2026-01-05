<?php
// mysql_approveCourse.php - mark course approved in DB. Requires admin session and CSRF token.
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/csrf.php';

// validate CSRF via header or body
$raw = file_get_contents('php://input');
$data = json_decode($raw, true) ?: [];
$token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? ($data['csrf'] ?? null);
if (!$token || !validateCsrfToken($token)) { http_response_code(403); echo json_encode(['error'=>'Invalid CSRF token']); exit; }

// require admin session
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
if (empty($_SESSION['is_admin'])) { http_response_code(401); echo json_encode(['error'=>'not authenticated']); exit; }

$id = $data['id'] ?? null;
if (!$id) { http_response_code(400); echo json_encode(['error'=>'id required']); exit; }

try {
  $pdo = getDbConnection();
  $stmt = $pdo->prepare('UPDATE courses SET status = ?, approved_at = NOW() WHERE course_id = ?');
  $stmt->execute(['approved', $id]);
  if ($stmt->rowCount()) echo json_encode(['ok'=>true]); else { http_response_code(404); echo json_encode(['error'=>'not found']); }
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error'=>$e->getMessage()]);
}

?>
