<?php
require __DIR__ . '/../../vendor/autoload.php';
use GuzzleHttp\Client;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function errorJson($msg) {
  http_response_code(401);
  echo json_encode(['error' => $msg]);
  exit;
}

function verifyFirebaseIdToken(string $idToken, string $projectId) {
  $client = new Client(['timeout' => 5]);
  $res = $client->get('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
  $keys = json_decode((string)$res->getBody(), true);
  $parts = explode('.', $idToken);
  if (count($parts) < 2) {
    throw new Exception('Invalid token format');
  }
  $header = json_decode(base64_decode(strtr($parts[0], '-_', '+/')), true);
  $kid = $header['kid'] ?? null;
  if (!$kid || !isset($keys[$kid])) {
    throw new Exception('Unknown key ID');
  }
  $publicKey = $keys[$kid];
  $payload = JWT::decode($idToken, new Key($publicKey, 'RS256'));
  if (($payload->aud ?? '') !== $projectId) throw new Exception('Invalid aud');
  $issuer = 'https://securetoken.google.com/' . $projectId;
  if (($payload->iss ?? '') !== $issuer) throw new Exception('Invalid issuer');
  return $payload; // object
}

?>
