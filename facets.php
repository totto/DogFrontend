<?php 

$file = 'facets.json';
$url = 'http://'.$_SERVER['HTTP_HOST'].'/dogservice/dogs/select?q=*&wt=json&facet=true&facet.field=breed&facet.field=gender&facet.limit=-1&fl=&rows=0';
$update_interval = 3; //days

if (file_exists($file)) {
    $file_updated = new DateTime( date('Y-m-d H:i:s', filemtime($file) ) );
	$current_date = new DateTime( date('Y-m-d H:i:s') );
	$interval = $current_date->diff($file_updated);
	if( $interval->format('%R%a') > $update_interval ) {
		$url_content = file_get_contents($url);
		file_put_contents($file, $url_content);
		echo $url_content;
	} else {
		echo( file_get_contents($file) );
	}
} else {
	$url_content = file_get_contents($url);
	file_put_contents($file, $url_content);
	echo $url_content;
}

?>