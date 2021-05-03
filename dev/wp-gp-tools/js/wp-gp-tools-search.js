var user_settings = { 'search' : 'enabled' }; 

if(getLS('wpgpt-user-settings') !== null)
	user_settings = JSON.parse( getLS('wpgpt-user-settings') ); 

if( user_settings ['search'] == "enabled"){
( function( $ ){

	var tabs = [];
	var tabs_state = {
		'consistency': 'closed',  
		'wp': 'closed', 
		'plugin': 'closed',
		'this-project': 'closed',
		'google-translate': 'closed',
		'references': 'closed',
		'panel_links': 'closed'
	};
	var search_url = {
		'consistency': '',  
		'wp': '', 
		'plugin': '',
		'this-project': ''
		};
	var user_search_settings = {
		'this-project' : true, 
		'wp' : true, 
		'consistency' : true,
		'plugin' : false,
		'plugin-slug' : '',
		'copy-me' : false
	}
	var notice_time;

	const protocol = 'https://';
	const hostname = window.location.hostname;
	const pathname = window.location.pathname;
	const resultpage = '&resultpage=yes';
	var findlocale = pathname.split("/");
	const current_locale = $(findlocale).get(-3) + '/' + $(findlocale).get(-2);
	const short_locale = $(findlocale).get(-3);
	let params = new URLSearchParams(document.location.search.substring(1));
	let is_result_page = params.get("resultpage");
	
	if (getLS('wpgpt-search') !== null)
		user_search_settings = JSON.parse( getLS('wpgpt-search') ); 

	let search_html_output = "" +
    "<form class='wpgpt-search' name='wpgpt-search' method='post' autocomplete='on'>" +
	"<span class='error-notice'></span>" +
	"<input type='text' class='wpgpt-search-word' name='wpgpt-search-word' placeholder='Search for...'  >" +
	"<input type='submit' class='wpgpt-search-action' value='Search'><br >" +
	"<label class='noselect'><input type='checkbox' data-search-project='this-project' class='wpgpt-search-option'> this project </label>" +
	"<button type='button' class='wpgpt-search-close-tabs' style='display:none;'>Close all</button><br>" +
	"<label class='noselect'><input type='checkbox' data-search-project='wp' class='wpgpt-search-option'> WordPress </label><br>" +
	"<label class='noselect'><input type='checkbox' data-search-project='plugin' class='wpgpt-search-option wpgpt-search-plugin-option'> another plugin </label>" +
	"<input type='text' class='wpgpt-search-plugin-slug' name='wpgpt-search-plugin-slug' placeholder=' enter slug' size='15'  >" +
	"<br><label class='noselect'><input type='checkbox' data-search-project='consistency' class='wpgpt-search-option'> consistency tool</label>" +
	"<br>" +
    "</form>";
	
	let actions_html_output = '' +
	'<button type="button" class="wpgpt-actions_copy with-tooltip' +
	( (user_search_settings['copy-me']) ? ' active' : '' ) +
	'" aria-label="Click this and another to copy">' +
	'<span class="screen-reader-text">Click this and another to copy</span><span aria-hidden="true" class="dashicons dashicons-clipboard"></span>' +
	'</button><span aria-hidden="true" class="wpgpt-actions_plus' +
	( (user_search_settings['copy-me']) ? ' dashicons dashicons-plus">' : '"><span class="separator"></span>' ) +
	'</span><button type="button" class="wpgpt-actions wpgpt-actions_permalink with-tooltip" aria-label="Permalink to translation">' +
	'<span class="screen-reader-text">Permalink to translation</span><span aria-hidden="true" class="dashicons dashicons-admin-links"></span></button>' +
	'<button type="button" class="wpgpt-actions wpgpt-actions_history with-tooltip" aria-label="Translation History">' +
	'<span class="screen-reader-text">Translation History</span><span aria-hidden="true" class="dashicons dashicons-backup"></span></button>' +
	'<button type="button" class="wpgpt-actions wpgpt-actions_consistency with-tooltip" aria-label="View original in consistency tool">' +
	'<span class="screen-reader-text">View original in consistency tool</span><span aria-hidden="true" class="dashicons dashicons-list-view"></span></button>';
	
    const result_page_html_output = "<p class=\"wpgpt-results-notice\">When you're done on these result pages click <span>Close all</span> in the main tab to close them all.</p>";


	
	$(document).ready(elements_init);
  
function elements_init(){
	
	if (is_result_page !== null) {
		$(".filter-toolbar").after(result_page_html_output);
		$(".consistency-form").before(result_page_html_output);
		$([document.documentElement, document.body]).animate({ scrollTop: $(".breadcrumb").offset().top }, 5);
		jQuery(".translations-unique").toggle();
	} else {
		
	$(".editor-panel .editor-panel__right .panel-content").append(search_html_output);
	$(".wpgpt-search-option").each(function() { $(this).prop( 'checked', user_search_settings[ $(this).data('search-project') ] ); } );
	if( user_search_settings['plugin'] ) { $(".wpgpt-search-plugin-slug").show(); }
	fill_plugin_slug();
	
	$(".editor-panel__right .panel-header").append(actions_html_output);
	
	var menu_links;
	$(".editor").each(function(){
		menu_links = [];
		$(this).find(".button-menu__dropdown li a").each( function(){ menu_links.push( $(this).attr('href') ); } );
		$(this).find(".wpgpt-actions_permalink").data('link', "https://translate.wordpress.org/" + menu_links[0]);
		$(this).find(".wpgpt-actions_history").data('link', "https://translate.wordpress.org/" + menu_links[1]);
		$(this).find(".wpgpt-actions_consistency").data('link', menu_links[2]);
	});
	
	display_google_translate();
	
	$(".wpgpt-search").submit(submit_form, event);
	
	$(".wpgpt-search-close-tabs").click( function(){close_tabs('all');});
	$(".wpgpt-search-plugin-option").click( function(){ $(".wpgpt-search-plugin-slug").toggle(); } );
	
	$('.wpgpt-search-option').click(function() {
		if ($(this).prop("checked") == true)
			user_search_settings[$(this).data('search-project')] = true;
		else
			user_search_settings[$(this).data('search-project')] = false;
    
		$(".wpgpt-search-option").each(function() { $(this).prop( 'checked', user_search_settings[ $(this).data( 'search-project' ) ] ); } );
		setLS('wpgpt-search', JSON.stringify( user_search_settings ) );
	});
	
	$(".source-details__references ul li a").click(function(event){
		event.preventDefault();
		open_tab('references', $(this).attr('href') );
	});
		
	
	$(".wpgpt-actions_copy, .wpgpt-actions_plus").click(toggle_copy);
	
	$(".wpgpt-actions").click(function(){
		if( user_search_settings['copy-me'] ){
			var _this = this;
			var current_aria_label = $(_this).attr("aria-label");
			copyToClipboard($(_this).data('link'));
			$(_this).attr("aria-label","Copied!");
			setTimeout(function() { $(_this).attr("aria-label", current_aria_label); }, 2000);
		}
		else
			open_tab('panel_links', $(this).data('link') );
	});
	
	$(".wpgpt-google-translate.wpgpt-google-translate").click( function(){ open_tab('google-translate', $(this).data('gt-string') ); } );
	
	$(window).on("beforeunload", function(){close_tabs('all');} );
	}
}

function copyToClipboard(text) {
   const elem = document.createElement('textarea');
   elem.value = text;
   document.body.appendChild(elem);
   elem.select();
   document.execCommand('copy');
   document.body.removeChild(elem);
}

function toggle_copy(){
	if( user_search_settings['copy-me'] ){
			user_search_settings['copy-me'] = false;
			$(".wpgpt-actions_plus").each( function(){ $(this)	.html('<span class="separator"></span>')	.removeClass("dashicons dashicons-plus"); } );
			$(".wpgpt-actions_copy").each( function(){ $(this)	.removeClass("active"); } );
		}
	else{
		user_search_settings['copy-me'] = true;
		$(".wpgpt-actions_plus").each( function(){ $(this)	.html('')	.addClass("dashicons dashicons-plus"); } );
		$(".wpgpt-actions_copy").each(function(){ $(this) .addClass("active"); } );
	}
	setLS('wpgpt-search', JSON.stringify( user_search_settings ) );
}

function open_tab(tab_key, tab_uri){
	if (tabs_state[tab_key] == 'opened')
	      tabs[tab_key].close();
    tabs[tab_key] = window.open( tab_uri, "_blank");
	tabs_state[tab_key] = 'opened';
}

function fill_plugin_slug(){
	$(".wpgpt-search-plugin-slug").each(function() {
		$(this).val(user_search_settings['plugin-slug']);
    });
}

function submit_form(event){
    event.preventDefault();
	let parameters = deparam($(this).serialize());
	search_in_projects(parameters['wpgpt-search-word'],parameters['wpgpt-search-plugin-slug']);
}

function search_in_projects(searching_for, also_searching_in_plugin) {

  var any_tab = 0; 
  const filters = '?filters[term]=' + searching_for + '&filters[status]=current';
  
  search_url['this-project'] = encodeURI(protocol + hostname + pathname + filters + resultpage);
  search_url['wp'] = encodeURI(protocol + hostname + '/projects/wp/dev/' + current_locale + filters + resultpage);
  search_url['consistency'] = encodeURI(protocol + hostname + '/consistency/?search=' + searching_for + '&set=' + current_locale + resultpage);
  
  if(user_search_settings['plugin']){
	  user_search_settings['plugin-slug'] = also_searching_in_plugin;
	  setLS('wpgpt-search', JSON.stringify( user_search_settings ) );
	  fill_plugin_slug();
	  search_url['plugin'] = encodeURI(protocol + hostname + '/projects/wp-plugins/' + also_searching_in_plugin + '/dev/' + current_locale + filters + resultpage);
  }
  
  if (searching_for != '' && (also_searching_in_plugin != '' || !user_search_settings['plugin'])) {
	close_tabs('searching');
    for (const [s_key, s_value] of Object.entries(search_url)) {
		if (user_search_settings[s_key]) {
			tabs[s_key] = window.open(s_value, "_blank");
			tabs_state[s_key] = 'opened';
			any_tab=1;
     }
    }
	
	if(any_tab)
		$(".wpgpt-search-close-tabs").show();
    else
		 display_notice("Choose a project!");

  } else {
		 display_notice("String/slug cannot be empty!");
  }
}

function display_notice(msg){
	$('.error-notice').html(msg);
	clearTimeout(notice_time);
    notice_time = setTimeout(function() { $('.error-notice').html("");}, 3000);
}

function display_google_translate(){
	var orig_txt, string_id;
	$(".wpgpt-search").each(function() {
		string_id = $(this).closest('tr').attr('id');
		orig_txt = $( "#" + string_id + " .source-string__singular span.original" ).text();
		var google_search_url = encodeURI(protocol + 'translate.google.com/?sl=en&tl='+ short_locale +'&text=' + orig_txt + '&op=translate'); 
		var google_search_output = "<button type='button' class='wpgpt-google-translate' data-gt-string='" + google_search_url + "'>Google Translate</button>";
		$("#"+string_id+" .editor-panel__left .panel-header h3").append(google_search_output); 	
	});
}

function close_tabs(tags_group) {
  
  for (const [tab_key] of Object.entries(tabs_state)) {
    if ( ( tabs_state[tab_key] === 'opened' ) && ( tags_group == 'all' || ( tab_key !== 'google-translate' && tab_key !== 'references' ) ) ) {
		tabs[tab_key].close();
		tabs_state[tab_key] = 'closed';
    }
  }
 
  $(".wpgpt-search-close-tabs").hide();
  $(".wpgpt-search-word, .wpgpt-search-action ").show();
}

})( jQuery );
}

function deparam(query) {
    var pairs, i, keyValuePair, key, value, map = {};
    if (query.slice(0, 1) === '?') {
        query = query.slice(1);
    }
    if (query !== '') {
        pairs = query.split('&');
        for (i = 0; i < pairs.length; i += 1) {
            keyValuePair = pairs[i].split('=');
            key = decodeURIComponent(keyValuePair[0]);
            value = (keyValuePair.length > 1) ? decodeURIComponent(keyValuePair[1]) : undefined;
            map[key] = value;
        }
    }
    return map;
}

function setLS(name, value) {
  localStorage.setItem(name, value);
}

function getLS(name) {
  return localStorage.getItem(name);
}

function delLS(name){
  localStorage.removeItem(name);
}

/** toDo - this doesn't work - maybe relocate
let params = new URLSearchParams(document.location.search.substring(1));
let is_result_page = params.get("resultpage");
	if (is_result_page !== null) {
   
    $(document).ready(function() {
	jQuery("#toggle-translations-unique").click();
	 
	 if($(".breadcrumb").lenght)
      $([document.documentElement, document.body]).animate({
        scrollTop: $(".breadcrumb").offset().top
      }, 5);
	  
    });
  }
*/