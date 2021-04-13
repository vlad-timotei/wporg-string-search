// ==UserScript==
// @name         Search translations across projects
// @namespace    https://translate.wordpress.org
// @version      0.1
// @description  Search translations across projects in a locale
// @author       Vlad Timotei
// @match        https://translate.wordpress.org/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @updateURL    https://raw.githubusercontent.com/vlad-timotei/wporg-string-search/main/src/wporg-search-strings-across-projects.js
// @downloadURL  https://raw.githubusercontent.com/vlad-timotei/wporg-string-search/main/src/wporg-search-strings-across-projects.js
// ==/UserScript==

var tabs = [];
var tabs_state = {
  'this-project': 'closed',
  'wp': 'closed',
  'consistency': 'closed'
};
var search_url = [];

(function() {
  'use strict';
  let params = new URLSearchParams(document.location.search.substring(1));
  let is_result_page = params.get("resultpage");

  const style_rules = `
    <style type="text/css">
    #search-in-projects { display: inline-block; }
    #search-in-projects-action,
    #search-in-projects input,
    #search-in-projects label {vertical-align: middle}
    #search-in-projects input[type=checkbox] {margin-left: 5px;}
    #search-in-projects-close-tabs { display:none; }
    #search-in-projects-action { font-size: 1.1em;}
    .search-in-projects-notice { padding-bottom:15px; }
    #search-in-projects-dismiss-notice { cursor:pointer; }
    #result_page_notice span {color:#d04300; font-weight: 500;}
    </style>
    `;
  $('head').append(style_rules);

  const search_html_output = `
    <form id='search-in-projects' autocomplete='on'>
	<input type='text' id='search-in-projects-for-what' placeholder='Search for...'  >
	<button type='button' id='search-in-projects-action'>Search</button>
	<button type='button' id='search-in-projects-close-tabs'>Close all results</button>
	<input type='checkbox' id='search-in-this-project' class='search-in-projects-option'>
	<label for='search-in-this-project'>this project</label>
	<input type='checkbox' id='search-in-wp' class='search-in-projects-option'>
	<label for='search-in-wp'> WordPress </label>
	<input type='checkbox' id='search-in-consistency' class='search-in-projects-option'>
	<label for='search-in-consistency'> consistency tool</label>
    </form>`;

  const result_page_html_output = `
    <p id="result_page_notice">
    When you're done on these result pages click <span>Close all results</span> in the main tab to close them all.</p>
    `
  if (is_result_page !== null) {
    $(".filter-toolbar").after(result_page_html_output);
    $(".consistency-form").before(result_page_html_output);
    $(document).ready(function() {
      $([document.documentElement, document.body]).animate({
        scrollTop: $(".breadcrumb").offset().top
      }, 5);
    });
  } else
    $(".filter-toolbar").after(search_html_output);

  $("#search-in-projects-action").click(search_in_projects);
  $("#search-in-projects-close-tabs").click(close_tabs);

  // User options stored in Local Storage
  if (getLS('opt-search-in-this-project') === null) {
    setLS('opt-search-in-this-project', true);
    setLS('opt-search-in-wp', true);
    setLS('opt-search-in-consistency', true);
  }

  $(".search-in-projects-option").each(function() {
    $(this).prop('checked', (getLS('opt-' + $(this).prop('id')) == 'true'));
  });

  $('.search-in-projects-option').click(function() {
    if ($(this).prop("checked") == true)
      setLS('opt-' + $(this).prop('id'), true);
    else
      setLS('opt-' + $(this).prop('id'), false);
  });

  //Initial notice
  const text_initial_notice = `
    Please note that your browser will block this script to open more than one new window at a time.
    In order to fix that, please click on the browser notice first time you use cross-search and select
    <i>Always allow pop ups from translate.wordpress.org</i>`;
  if (getLS('opt-search-notice-dismissed') === null)
    $("#search-in-projects").before('<div class="search-in-projects-notice"> ' + text_initial_notice + ' <a id="search-in-projects-dismiss-notice">Dismiss this notice</a><div>');

  $("#search-in-projects-dismiss-notice").click(function() {
    $(".search-in-projects-notice").hide(500);
    setLS('opt-search-notice-dismissed', true);

  });

})();

function search_in_projects() {
  const searching_for = $("#search-in-projects-for-what").val();
  const protocol = 'https://';
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const resultpage = '&resultpage=yes';
  const filters = '?filters[term]=' + searching_for + '&filters[status]=current';
  var findlocale = pathname.split("/");
  const current_locale = $(findlocale).get(-3) + '/' + $(findlocale).get(-2);

  search_url['this-project'] = encodeURI(protocol + hostname + pathname + filters + resultpage);
  search_url['wp'] = encodeURI(protocol + hostname + '/projects/wp/dev/' + current_locale + filters + resultpage);
  search_url['consistency'] = encodeURI(protocol + hostname + '/consistency/?search=' + searching_for + '&set=' + current_locale + resultpage);

  if (searching_for != '') {
    for (const [s_key, s_value] of Object.entries(search_url)) {
      if ($("#search-in-" + s_key).prop("checked") == true) {
        tabs[s_key] = window.open(s_value, "_blank");
        tabs_state[s_key] = 'opened';
      }
    }
    $("#search-in-projects-close-tabs").show();
  } else {
    $('#search-in-projects-for-what').attr("placeholder", "String cannot be empty!");
    setTimeout(function() {
      $('#search-in-projects-for-what').attr("placeholder", "Search for...");
    }, 3000);
  }
}

function close_tabs() {
  for (const [tab_key] of Object.entries(tabs_state)) {
    if (tabs_state[tab_key] === 'opened') {
      tabs[tab_key].close();
      tabs_state[tab_key] = 'closed';
    }
  }
  $("#search-in-projects-close-tabs").hide();
}


function setLS(name, value) {
  localStorage.setItem(name, value);
}

function getLS(name) {
  return localStorage.getItem(name);
}