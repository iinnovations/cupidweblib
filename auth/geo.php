<?php
    function ip_details($ip) {
        //$json = file_get_contents("http://ipinfo.io/{$ip}");
        $json = file_get_contents("http://ipinfo.io/");
        $details = json_decode($json);
        return $details;
    }

    $details = ip_details("8.8.8.8");

    $_SESSION['user']['serverextip'] = $details->ip;
    $_SESSION['user']['serverloc'] = $details->loc;

?>