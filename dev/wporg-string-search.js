var tabs = [];
var tabs_state = {
	'consistency': 'closed',  
	'wp': 'closed', 
	'plugin': 'closed',
    'this-project': 'closed'
};
var search_url = {
	'consistency': '',  
	'wp': '', 
	'plugin': '',
    'this-project': ''
};
var notice_time; 

/* //, $("#"+$(this).closest('tr').attr('id')+" form .search-in-projects-plugin-slug").val()); */

(function() {
  'use strict';
  display_html_output();
  sync_user_options();
  display_glossary();
  $(document).ready(main_init);

})();

function display_html_output(){
	
	let params = new URLSearchParams(document.location.search.substring(1));
	let is_result_page = params.get("resultpage");
	let search_html_output = "";
    search_html_output += "<form class='search-in-projects' name='search-in-projects' method='post' autocomplete='on'>";
	search_html_output += "<span class='error-notice'></span>";
	search_html_output += "<input type='text' class='search-in-projects-word' name='search-in-projects-word' placeholder='Search for...'  >";
	search_html_output += "<input type='submit' class='search-in-projects-action' value='Search'><br >";
	search_html_output += "<label class='noselect'><input type='checkbox' data-search-project='this-project' class='search-in-projects-option'> this project </label><br >"
	search_html_output += "<label class='noselect'><input type='checkbox' data-search-project='plugin' class='search-in-projects-option search-in-projects-plugin-option'> another plugin </label>";
	search_html_output += " <input type='text' class='search-in-projects-plugin-slug' name='search-in-projects-plugin-slug' placeholder=' enter slug' size='15'  >";
	search_html_output += "<br ><label class='noselect'><input type='checkbox' data-search-project='wp' class='search-in-projects-option'> WordPress </label><br >";
	search_html_output += "<label class='noselect'><input type='checkbox' data-search-project='consistency' class='search-in-projects-option'> consistency tool</label>";
	search_html_output += "<br ><br ><button type='button' class='search-in-projects-close-tabs'>Close all</button>";
    search_html_output += "</form>";

    const result_page_html_output = "<p id=\"result_page_notice\">When you're done on these result pages click <span>Close all results</span> in the main tab to close them all.</p>";

  if (is_result_page !== null) {
    $(".filter-toolbar").after(result_page_html_output);
    $(".consistency-form").before(result_page_html_output);
    $(document).ready(function() {
	  if($(".breadcrumb").lenght)
      $([document.documentElement, document.body]).animate({
        scrollTop: $(".breadcrumb").offset().top
      }, 5);
    });
  } else
    $(".editor-panel .editor-panel__right .panel-content").append(search_html_output);
}



function sync_user_options(){
	
	if (getLS('opt-search-in-this-project') === null) {
    setLS('opt-search-in-this-project', true);
    setLS('opt-search-in-wp', true);
    setLS('opt-search-in-consistency', true);
	setLS('opt-search-in-plugin', false);
  }
  
  $(".search-in-projects-option").each(function() {
    $(this).prop('checked', (getLS('opt-search-in-' + $(this).data('search-project')) == 'true'));
  });
  
  $('.search-in-projects-option').click(function() {
    if ($(this).prop("checked") == true)
      setLS('opt-search-in-' + $(this).data('search-project'), true);
    else
      setLS('opt-search-in-' + $(this).data('search-project'), false);
    
	$(".search-in-projects-option").each(function() {
		$(this).prop('checked', (getLS('opt-search-in-' + $(this).data('search-project')) == 'true'));
    });
  
  });
  
  
  if(getLS('opt-search-in-plugin') == 'true'){
	  $(".search-in-projects-plugin-slug").show();
  }
  
  fill_plugin_slug();
  
	
}

function main_init(){
  $(".search-in-projects").submit(submit_form, event);
  $(".search-in-projects-close-tabs").click(close_tabs);
  $(".search-in-projects-dismiss-notice").click(function() {
    $(".search-in-projects-notice").hide(500);
    setLS('opt-search-notice-dismissed', true);
  });
  $(".search-in-projects-plugin-option").click(function(){
   $(".search-in-projects-plugin-slug").toggle();
  });
  
  
}

function fill_plugin_slug(){
	$(".search-in-projects-plugin-slug").each(function() {
    $(this).val(getLS('opt-search-in-plugin-slug'));
    });
}

function submit_form(event){
    event.preventDefault();
	let parameters = deparam($(this).serialize());
	search_in_projects(parameters['search-in-projects-word'],parameters['search-in-projects-plugin-slug']);
}

function search_in_projects(searching_for, also_searching_in_plugin) {

  const protocol = 'https://';
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const resultpage = '&resultpage=yes';
  const filters = '?filters[term]=' + searching_for + '&filters[status]=current';
  var findlocale = pathname.split("/");
  const current_locale = $(findlocale).get(-3) + '/' + $(findlocale).get(-2);
  var any_tab = 0; 
  
  search_url['this-project'] = encodeURI(protocol + hostname + pathname + filters + resultpage);
  search_url['wp'] = encodeURI(protocol + hostname + '/projects/wp/dev/' + current_locale + filters + resultpage);
  search_url['consistency'] = encodeURI(protocol + hostname + '/consistency/?search=' + searching_for + '&set=' + current_locale + resultpage);
  
  if(getLS('opt-search-in-plugin') == 'true'){
	  setLS('opt-search-in-plugin-slug', also_searching_in_plugin);
	  fill_plugin_slug();
	  search_url['plugin'] = encodeURI(protocol + hostname + '/projects/wp-plugins/' + also_searching_in_plugin + '/dev/' + current_locale + filters + resultpage);
  }
  
  if (searching_for != '' && (also_searching_in_plugin != '' || getLS("opt-search-in-plugin") == 'false')) {
	close_tabs();
    for (const [s_key, s_value] of Object.entries(search_url)) {
     if (getLS("opt-search-in-"+s_key)== 'true') {
        tabs[s_key] = window.open(s_value, "_blank");
        tabs_state[s_key] = 'opened';
		any_tab=1;
     }
    }
	
	if(any_tab)
		$(".search-in-projects-close-tabs").show();
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

function close_tabs() {
  for (const [tab_key] of Object.entries(tabs_state)) {
    if (tabs_state[tab_key] === 'opened') {
      tabs[tab_key].close();
      tabs_state[tab_key] = 'closed';
    }
  }
  $(".search-in-projects-close-tabs").hide();
  $(".search-in-projects-word, .search-in-projects-action ").show();
}


function display_glossary(){
	$(".search-in-projects").each(function() {show_string_glossary($(this).closest('tr').attr('id'))});
}

function show_string_glossary(string_id){

	var orig_txt = $( "#" + string_id + " .source-string__singular span.original" ).text();
	my_glossary_output="";
	my_glossary.forEach(function (item, index) {show_word_in_glossary (item, index, orig_txt)});
	if(my_glossary_output!=""){
		my_glossary_output="<table class='my-glossary glossary'><thead><tr><th colspan='2'>My Glossary</th></tr></thead>"+my_glossary_output+"</table>";
		$("#"+string_id+" .search-in-projects").append(my_glossary_output); 
	}
}

function show_word_in_glossary(item, index, original_string){
	if(original_string.toLowerCase().includes(my_glossary[index][0].toLowerCase()))
		my_glossary_output+="<tr><td>"+my_glossary[index][0]+" </td><td> "+my_glossary[index][1]+"</td></tr>";
}

function setLS(name, value) {
  localStorage.setItem(name, value);
}

function getLS(name) {
  return localStorage.getItem(name);
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