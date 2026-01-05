<?php
require __DIR__ . '/verifyToken.php';
header('Content-Type: application/json');
$projectId = 'royalsandnobles-546e7';
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$raw = file_get_contents('php://input');
$body = json_decode($raw, true) ?: [];
$id = $body['id'] ?? null;
if (!$authHeader) { http_response_code(401); echo json_encode(['error'=>'Missing token']); exit; }
$idToken = preg_match('/^Bearer\s+(.*)$/i', $authHeader, $m) ? $m[1] : $authHeader;
try {
  $payload = verifyFirebaseIdToken($idToken, $projectId);
  // only admin emails allowed
  $adminEmails = ['youremail@example.com'];
  if (!in_array($payload->email ?? '', $adminEmails)) { http_response_code(403); echo json_encode(['error'=>'Forbidden']); exit; }
  $dataFile = __DIR__ . '/../data/courses.json';
  $all = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];
  $found = false;
  foreach ($all as &$c) {
    if (($c['id'] ?? '') === $id) {
      $c['status'] = 'approved';
      $c['approved_at'] = time();
      $found = true;
      break;
    }
  }
  if ($found) {
    file_put_contents($dataFile, json_encode($all, JSON_PRETTY_PRINT));
    echo json_encode(['ok'=>true]);
  } else {
    http_response_code(404);
    echo json_encode(['error'=>'Not found']);
  }
} catch (Exception $e) {
  http_response_code(401);
  echo json_encode(['error'=>$e->getMessage()]);
}

?>