<?php
// returns all courses (approved and pending)
header('Content-Type: application/json');
$dataFile = __DIR__ . '/../data/courses.json';
if (!file_exists($dataFile)) {
  echo json_encode([]);
  exit;
}
$c = json_decode(file_get_contents($dataFile), true);
if (!$c) echo json_encode([]); else echo json_encode($c);

?>