<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$musicFolder = 'music/';
$files = array_diff(scandir($musicFolder), array('.', '..'));
$musicFiles = array();

foreach ($files as $file) {
    if (pathinfo($file, PATHINFO_EXTENSION) === 'mp3') {
        $musicFiles[] = $file;
    }
}

header('Content-Type: application/json');
echo json_encode($musicFiles);
?>
