<?php

// Function for generating item/editor object
function npEditor($element, $class, $item, $withoutContent = false) {
    $classes = isset($item->classes) ? (empty($class) ? '' : ' ') . $item->classes : '';
    $language = empty($GLOBALS['LANGUAGE']) ? '' : $GLOBALS['LANGUAGE_CODE'];
    $visible = isset($item->visible) && $item->visible === 0 ? ' np-toggle-off' : '';

    echo '<' . $element . ' ';
    echo 'class="' . $class . $classes . $visible . '" ';
    if (isset($_COOKIE['user'])) {
        echo 'np-toolbar data-item="' . $item->id . '" data-identifier="' . $item->identifier . '" data-language="' . $language . '" data-page="' . $GLOBALS['PAGE']->id . '"';
    }
    echo '>';

    if (!$withoutContent) {
        echo $item->structure;
        echo '</' . $element . '>';
    }
}

// Function for generating image object
function npImage($item, $classes = '', $thumbs = false, $additional = false) {
    if (isset($item->image)) {
        $thumbs = $thumbs ? 'uploads/' . $thumbs . '/' : 'uploads/';
        $additional ? $additional : '';

        echo '<img class="' . $classes . '" src="' . $GLOBALS['SERVER_URL'] . $thumbs . $item->image->url . '" alt="' . (property_exists($item->image, 'alt') ? $item->image->alt : '') . '" title="' . (property_exists($item->image, 'title') ? $item->image->title : '') . '"' . $additional . '/>';
    }
}

// Function for returning requested content
function getContent($path, $filter = false) {
    $build_filter = $filter ? '?' . http_build_query($filter) : '';

    $file = file_get_contents($GLOBALS['SERVER_URL'] . $GLOBALS['LANGUAGE'] . $path . $build_filter);
    $json = json_decode($file);
    if (!empty($json)) {
        return $json;
    }
    return [];
}

// Function for returning metadata for requested page
function getMetadata($page) {
    // If page is blog
    if (isset($page->content)) {
        return (object) array('title' => $page->title, 'description' => limit_text($page->content, 20, true));
    }

    foreach ($GLOBALS['METADATAS'] as $metadata) {
        $lang = empty($GLOBALS['LANGUAGE']) ? '' : $GLOBALS['LANGUAGE_CODE'];
        $is_lang = property_exists($metadata, 'language') ? $metadata->language->code === $lang : false;

        if ($metadata->page->id === $page->id && (!empty($lang) ? $is_lang : !property_exists($metadata, 'language'))) {
            return $metadata;
        }
    }

    return (object) array('navigation' => $page->name, 'description' => $page->name, 'title' => $page->name);
}

// Function for filtering items
function filterBy($items, $key, $value, $item = true, $sort = false) {
    $array = array_filter($items, function($obj) use ($key, $value) {
        if (property_exists($obj, $key)) {
            return $obj->{$key} == $value ? true : false;
        }
    });

    if (empty($array) && isset($_COOKIE['user']) && $item) {
        return array((object) array("id" => 0, "identifier" => $value, "structure" => '<div class="np-item-holder-text">' . $value . '</div>', "classes" => "np-item-holder"));
    }

    if ($sort) {
        usort($array, function($a, $b) use ($sort) {
            $sortA = property_exists($a, $sort) ? $sort : 'id';
            $sortB = property_exists($b, $sort) ? $sort : 'id';
            return $a->{$sortA} - $b->{$sortB};
        });
    }

    return $array;
}

// Function for translating locales
function translate($string) {
    if (empty($GLOBALS['LANGUAGE_CODE'])) {
        return $string;
    }

    foreach ($GLOBALS['LOCALES'] as $locale) {
        if ($locale->origin === $string && $locale->language->code === $GLOBALS['LANGUAGE_CODE']) {
            return $locale->translate;
        }
    }

    $current = file_exists('untranslated.txt') ? file_get_contents('untranslated.txt') : '';
    $current .= $string . "\r\n";
    file_put_contents('untranslated.txt', $current);

    return $string;
}

// PageNotFound object
function pageNotFound() {
    $GLOBALS['PAGE'] = (object) array('id' => '-1', 'name' => 'Strana nije pronadjena', 'show_header' => '1', 'show_footer' => 1, 'template' => 'error_404.php');
    return $GLOBALS['METADATA'] = (object) array('title' => 'Strana nije pronadjena', 'description' => 'Page Not Found');
}

// Function for parsing URL
function parseURL($separated = false) {
    $explode = explode('?', $_SERVER['REQUEST_URI'], 2);
    $path = substr($explode[0], 1);
    if (isset($GLOBALS['LANGUAGE_CODE'])) {
        $path = str_replace($GLOBALS['LANGUAGE_CODE'] . '/', '', $path);
    }
    if ($separated) {
        return explode('/', $explode[0]);
    }
    return empty($path) || $path === 'index.php' ? 'homepage' : $path;
}

// Function for checking if object is set
function _isset(&$data1, $data2 = '') {
    return isset($data1) ? $data1 : $data2;
}

// Function for parsing link
function _url($url = '') {
    $language = isset($GLOBALS['LANGUAGE_CODE']) ? $GLOBALS['LANGUAGE_CODE'] . '/' : '';
    return $GLOBALS['CLIENT_URL'] . $language . $url . $GLOBALS['WITHOUT_TOOLBAR'];
}

// Function for generating image url
function _imageUrl($item, $thumbs = false) {
    if (isset($item->image)) {
        $thumbs = $thumbs ? 'uploads/' . $thumbs . '/' : 'uploads/';

        return $GLOBALS['SERVER_URL'] . $thumbs . $item->image->url;
    }
}

// Function for checking if user is logged in
function isLoggedIn($withoutToolbar = false) {
    if ($withoutToolbar) {
        return isset($_COOKIE['user']) && !$GLOBALS['WITHOUT_TOOLBAR'];
    }

    return isset($_COOKIE['user']) || (isset($GLOBALS['PAGE']->name) && $GLOBALS['PAGE']->name === 'login-page');
}

// Function for checking if is login page
function isLoginPage() {
    return isset($GLOBALS['PAGE']->name) && $GLOBALS['PAGE']->name === 'login-page';
}

// Format datetime object
function formatDate($date, $format) {
    return date_format(date_create($date), $format);
}

// Function for limiting text
function limit_text($text, $limit, $stripHTML = false) {
    if ($stripHTML) {
        $text = strip_tags($text);
    }

    if (str_word_count($text, 0) > $limit) {
        $words = str_word_count($text, 2);
        $pos = array_keys($words);
        $text = substr($text, 0, $pos[$limit]) . '...';
    }
    return $text;
}
