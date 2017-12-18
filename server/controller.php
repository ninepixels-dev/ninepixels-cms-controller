<?php

// Include helpers functions
include_once 'helpers.php';

// Enable GZIP
ob_start("ob_gzhandler");

// Load Config file
$GLOBALS['CONFIG'] = json_decode(file_get_contents('./np-controller/server/np.config.json'));

// Set defaults
$GLOBALS['SERVER_URL'] = $GLOBALS['CONFIG']->server_url;
$GLOBALS['CLIENT_URL'] = $GLOBALS['CONFIG']->client_url;
$GLOBALS['LANGUAGE'] = '';

$GLOBALS['WITHOUT_TOOLBAR'] = isset($_GET['toolbar']) ? '?toolbar=false' : false;

// If URL is np-admin, open administratin page
if (parseURL() === 'np-admin') {
    $GLOBALS['PAGE'] = (object) array('id' => '0', 'name' => 'login-page', 'template' => 'login-page');
    return $GLOBALS['METADATA'] = (object) array('title' => 'CMS Login Page', 'description' => 'Nine Pixels CMS Login Page',);
}

// Load assets
$assets_url = file_get_contents($GLOBALS['SERVER_URL'] . 'assets');

// If server is not accesible, through error
if ($assets_url === FALSE) {
    die('Nine Pixels CMS can\'t connect to core. Please check with server administrator.');
}

$assets = json_decode($assets_url);

// Merge all page-type data
$pages = array_merge($assets->pages, $assets->blogs);

// If there are no pages, return not found
if (empty($pages)) {
    return pageNotFound();
}

// Set reusable data
$GLOBALS['PAGES'] = $assets->pages;
$GLOBALS['OPTIONS'] = $assets->options;
$GLOBALS['LOCALES'] = $assets->locales;
$GLOBALS['METADATAS'] = $assets->metadatas;

// If language is set, set language code and url-liked language
if (!empty($assets->languages)) {
    $lang_url = parseURL(true)[1];

    foreach ($assets->languages as $language) {
        if ($language->code === $lang_url) {
            $GLOBALS['LANGUAGE'] = 'languages/' . $language->id . '/';
            $GLOBALS['LANGUAGE_CODE'] = $language->code;
            break;
        }
    }
}

// Find and return requested page
$url = parseURL();
foreach ($pages as $page) {
    if ($page->name === $url) {
        $GLOBALS['PAGE'] = $page;
        $GLOBALS['METADATA'] = getMetadata($page);
        break;
    }

    pageNotFound();
}

// Store current page in cookie
isset($_COOKIE['page']) ? $_COOKIE['page'] = json_encode($GLOBALS['PAGE']) :
                setcookie("page", json_encode($GLOBALS['PAGE']));
