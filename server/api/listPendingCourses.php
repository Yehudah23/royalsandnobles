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
  // For demo we allow only admin emails to list pending
  $adminEmails = ['youremail@example.com'];
  if (!in_array($payload->email ?? '', $adminEmails)) {
    http_response_code(403);
    echo json_encode(['error'=>'Forbidden']);
    exit;
  }
  $dataFile = __DIR__ . '/../data/courses.json';
  if (!file_exists($dataFile)) { echo json_encode([]); exit; }
  $all = json_decode(file_get_contents($dataFile), true) ?: [];
  $pending = array_values(array_filter($all, function($c){ return ($c['status'] ?? '') === 'pending'; }));
  echo json_encode($pending);
} catch (Exception $e) {
  http_response_code(401);
  echo json_encode(['error'=>$e->getMessage()]);
}

?>