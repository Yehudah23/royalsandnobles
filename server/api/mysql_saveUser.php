<?php
// mysql_saveUser.php - save or update user record in MySQL
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true) ?: [];
$email = isset($data['email']) ? trim($data['email']) : null;
$uid = isset($data['uid']) ? trim($data['uid']) : null;
$role = isset($data['role']) ? trim($data['role']) : null;

if (!$email) { http_response_code(400); echo json_encode(['error'=>'email required']); exit; }

try {
  $pdo = getDbConnection();
  // upsert by email
  $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
  $stmt->execute([$email]);
  $row = $stmt->fetch();
  if ($row) {
    $fields = [];
    $params = [];
    if ($uid) { $fields[] = 'uid = ?'; $params[] = $uid; }
    if ($role !== null) { $fields[] = 'role = ?'; $params[] = $role; }
    if ($fields) {
      $params[] = $row['id'];
      $pdo->prepare('UPDATE users SET ' . implode(',', $fields) . ', updated_at = NOW() WHERE id = ?')->execute($params);
    }
    echo json_encode(['ok'=>true, 'updated'=>true]);
  } else {
    $stmt = $pdo->prepare('INSERT INTO users (uid, email, role) VALUES (?, ?, ?)');
    $stmt->execute([$uid, $email, $role]);
    echo json_encode(['ok'=>true, 'created'=>true]);
  }
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error'=>$e->getMessage()]);
}

?>
