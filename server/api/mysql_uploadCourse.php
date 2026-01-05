<?php
// mysql_uploadCourse.php - handle upload and store metadata in DB
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/verifyToken.php';

$headers = getallheaders();
if (!isset($headers['Authorization'])) { http_response_code(401); echo json_encode(['error'=>'Missing token']); exit; }
$parts = preg_split('/\s+/', $headers['Authorization']);
$idToken = (count($parts)===2 && strtolower($parts[0])==='bearer') ? $parts[1] : $headers['Authorization'];
try {
  $payload = verifyFirebaseIdToken($idToken, defined('FIREBASE_PROJECT_ID')?FIREBASE_PROJECT_ID:null);
  $uid = $payload->sub;
  $email = $payload->email ?? null;
} catch (Exception $e) { http_response_code(401); echo json_encode(['error'=>$e->getMessage()]); exit; }

$title = $_POST['title'] ?? '';
$description = $_POST['description'] ?? '';
$fileUrl = null;
if (!empty($_FILES['file']['tmp_name'])) {
  $uploadsDir = __DIR__ . '/../uploads';
  if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0755, true);
  $fname = basename($_FILES['file']['name']);
  $target = $uploadsDir . '/' . time() . '_' . preg_replace('/[^a-zA-Z0-9_.-]/','_', $fname);
  if (!move_uploaded_file($_FILES['file']['tmp_name'], $target)) { http_response_code(500); echo json_encode(['error'=>'Failed to save file']); exit; }
  $fileUrl = '/server/uploads/' . basename($target);
}

try {
  $pdo = getDbConnection();
  $courseId = uniqid('course_');
  $stmt = $pdo->prepare('INSERT INTO courses (course_id, title, description, file_url, uploader_email, uploader_uid, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
  $stmt->execute([$courseId, $title, $description, $fileUrl, $email, $uid, 'pending']);
  echo json_encode(['ok'=>true, 'id'=>$courseId]);
} catch (Exception $e) { http_response_code(500); echo json_encode(['error'=>$e->getMessage()]); }

?>
