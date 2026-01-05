<?php
// mysql_listCourses.php - list all courses from DB
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

try {
  $pdo = getDbConnection();
  $stmt = $pdo->query('SELECT course_id, title, description, file_url, uploader_email, status, created_at, approved_at FROM courses ORDER BY created_at DESC');
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($rows);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([]);
}

?>
