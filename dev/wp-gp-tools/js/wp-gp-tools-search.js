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
var notice_time;

const protocol = 'https://';
const hostname = window.location.hostname;
const pathname = window.location.pathname;
const resultpage = '&resultpage=yes';
var findlocale = pathname.split("/");
const current_locale = $(findlocale).get(-3) + '/' + $(findlocale).get(-2);
const short_locale = $(findlocale).get(-3);

  display_html_output();
  sync_user_options();
  display_google_translate();
  $(document).ready(main_init);
  
function display_html_output(){
	
	let params = new URLSearchParams(document.location.search.substring(1));
	let is_result_page = params.get("resultpage");
	let search_html_output = "";
    search_html_output += "<form class='wpgpt-search' name='wpgpt-search' method='post' autocomplete='on'>";
	search_html_output += "<span class='error-notice'></span>";
	search_html_output += "<input type='text' class='wpgpt-search-word' name='wpgpt-search-word' placeholder='Search for...'  >";
	search_html_output += "<input type='submit' class='wpgpt-search-action' value='Search'><br >";
	search_html_output += "<label class='noselect'><input type='checkbox' data-search-project='this-project' class='wpgpt-search-option'> this project </label><br >"
	search_html_output += "<label class='noselect'><input type='checkbox' data-search-project='plugin' class='wpgpt-search-option wpgpt-search-plugin-option'> another plugin </label>";
	search_html_output += " <input type='text' class='wpgpt-search-plugin-slug' name='wpgpt-search-plugin-slug' placeholder=' enter slug' size='15'  >";
	search_html_output += "<br ><label class='noselect'><input type='checkbox' data-search-project='wp' class='wpgpt-search-option'> WordPress </label><br >";
	search_html_output += "<label class='noselect'><input type='checkbox' data-search-project='consistency' class='wpgpt-search-option'> consistency tool</label>";
	search_html_output += "<br ><br ><button type='button' class='wpgpt-search-close-tabs'>Close all</button>";
    search_html_output += "</form>";

    const result_page_html_output = "<p class=\"wpgpt-results-notice\">When you're done on these result pages click <span>Close all</span> in the main tab to close them all.</p>";

  if (is_result_page !== null) {
    $(".filter-toolbar").after(result_page_html_output);
    $(".consistency-form").before(result_page_html_output);
    $(document).ready(function() {
		console.log("d");
		jQuery("#toggle-translations-unique").click();
	  if($(".breadcrumb").lenght)
      $([document.documentElement, document.body]).animate({
        scrollTop: $(".breadcrumb").offset().top
      }, 5);
	  
    });
  } else
    $(".editor-panel .editor-panel__right .panel-content").append(search_html_output);
}

function sync_user_options(){
	
	if (getLS('wpgpt-search-this-project') === null) {
    setLS('wpgpt-search-this-project', true);
    setLS('wpgpt-search-wp', true);
    setLS('wpgpt-search-consistency', true);
	setLS('wpgpt-search-plugin', false);
  }
  
  $(".wpgpt-search-option").each(function() {
    $(this).prop('checked', (getLS('wpgpt-search-' + $(this).data('search-project')) == 'true'));
  });
  
  $('.wpgpt-search-option').click(function() {
    if ($(this).prop("checked") == true)
		setLS('wpgpt-search-' + $(this).data('search-project'), true);
    else
		setLS('wpgpt-search-' + $(this).data('search-project'), false);
    
	$(".wpgpt-search-option").each(function() {
		$(this).prop('checked', (getLS('wpgpt-search-' + $(this).data('search-project')) == 'true'));
    });
  
  });
  
  if(getLS('wpgpt-search-plugin') == 'true')
	  $(".wpgpt-search-plugin-slug").show();
  
  fill_plugin_slug();
}

function main_init(){
	
	$(".wpgpt-search").submit(submit_form, event);
	$(".wpgpt-search-close-tabs").click( function(){close_tabs('all');});
		
	$(".wpgpt-search-plugin-option").click(function(){
	
	$(".wpgpt-search-plugin-slug").toggle();
	});
	
	$(".wpgpt-google-translate.wpgpt-google-translate").click(function(){
		open_tab('google-translate', $(this).data('gt-string') );
	});
	
	$(".source-details__references ul li a").click(function(event){
		event.preventDefault();
		open_tab('references', $(this).attr('href') );
	});
	
	$(".panel-header-actions .button-menu__dropdown li a").click(function(event){
		event.preventDefault();
		open_tab('panel_links', $(this).attr('href') );
	});

	$(window).on("beforeunload", function(){close_tabs('all');} );

}

function open_tab(tab_key, tab_uri){
	if (tabs_state[tab_key] == 'opened')
	      tabs[tab_key].close();
    tabs[tab_key] = window.open( tab_uri, "_blank");
	tabs_state[tab_key] = 'opened';
}

function fill_plugin_slug(){
	$(".wpgpt-search-plugin-slug").each(function() {
		$(this).val(getLS('wpgpt-search-plugin-slug'));
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
  
  if(getLS('wpgpt-search-plugin') == 'true'){
	  setLS('wpgpt-search-plugin-slug', also_searching_in_plugin);
	  fill_plugin_slug();
	  search_url['plugin'] = encodeURI(protocol + hostname + '/projects/wp-plugins/' + also_searching_in_plugin + '/dev/' + current_locale + filters + resultpage);
  }
  
  if (searching_for != '' && (also_searching_in_plugin != '' || getLS("wpgpt-search-plugin") == 'false')) {
	close_tabs('searching');
    for (const [s_key, s_value] of Object.entries(search_url)) {
		if (getLS("wpgpt-search-"+s_key)== 'true') {
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