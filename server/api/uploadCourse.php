<?php
require __DIR__ . '/verifyToken.php';
header('Content-Type: application/json');
$projectId = 'royalsandnobles-546e7';
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!$authHeader) { http_response_code(401); echo json_encode(['error'=>'Missing token']); exit; }
$idToken = preg_match('/^Bearer\s+(.*)$/i', $authHeader, $m) ? $m[1] : $authHeader;
try {
  $payload = verifyFirebaseIdToken($idToken, $projectId);
  $uid = $payload->sub;
  $email = $payload->email ?? null;
  // accept uploaded file
  $title = $_POST['title'] ?? '';
  $description = $_POST['description'] ?? '';
  $fileUrl = null;
  if (!empty($_FILES['file']['tmp_name'])) {
    $uploadsDir = __DIR__ . '/../uploads';
    if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0755, true);
    $fname = basename($_FILES['file']['name']);
    $target = $uploadsDir . '/' . time() . '_' . preg_replace('/[^a-zA-Z0-9_.-]/','_', $fname);
    if (!move_uploaded_file($_FILES['file']['tmp_name'], $target)) {
      http_response_code(500);
      echo json_encode(['error'=>'Failed to save file']);
      exit;
    }
    // fileUrl relative to server
    $fileUrl = '/server/uploads/' . basename($target);
  }
  // store metadata in JSON
  $dataFile = __DIR__ . '/../data/courses.json';
  $all = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];
  $id = uniqid('course_');
  $entry = [
    'id' => $id,
    'title' => $title,
    'description' => $description,
    'fileUrl' => $fileUrl,
    'uploader' => $email,
    'uid' => $uid,
    'status' => 'pending',
    'created_at' => time()
  ];
  $all[] = $entry;
  file_put_contents($dataFile, json_encode($all, JSON_PRETTY_PRINT));
  echo json_encode(['ok'=>true, 'id'=>$id, 'entry'=>$entry]);
} catch (Exception $e) {
  http_response_code(401);
  echo json_encode(['error'=>$e->getMessage()]);
}

?>