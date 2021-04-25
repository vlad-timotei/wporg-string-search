(function() {
  'use strict';
  
  $(document).ready(main_init);
  
})();


function main_init(){
	const pathname = window.location.pathname;
    if ( pathname == "/locale/ro/default/" ){
		/* Snippets */
		init_snippets_html_placeholders();
		init_add_btn();
		init_remove_btn();
		init_remove_all_btn();
	}
	
	if( pathname.search('projects') != -1){
		/*Additional checks*/
		run_additional_checks();
	}
	
}

/* Additional checks - spaces, dots, placeholders */
function run_additional_checks(){
	$("#translations thead tr").first().append('<th class="gp-checks-th">—</th>');
	$("#translations tr.editor td").not(".my-glossary td").attr('colspan',6);
	
	$("#translations tbody tr.preview.has-translations").each(function(){
		let original = $(this).find('td.original .original-text').text();
		let translated = $(this).find('td.translation .translation-text').text();
		let check_results = check_translation(original, translated);
		let preview_html_output = '<td class="gp-checks-preview">' + (( check_results != 'none') ? '<span class = "gp-checks-warnings" >Probleme!</span>' : '<span class = "gp-checks-passed"> OK </span>') + '</td>';
		let editor_html_output =  '<dl><dt>Warnings:</dt><dd>' + check_results + '</ul></dd></dl>';
		
		$("#" + $(this).attr('id').replace("preview", "editor")).find('.meta .status-actions').after(editor_html_output); 
		$(this).append(preview_html_output);
	});
	
	
}

function check_translation (original, translated){
	var warnings = {
		'start_space' 	:	"",
		'end_char'		: 	"",
		'placeholders'	:	"",
		'wrong_diacritics'	:	"",
		'wrong_quotes'	:	"",
		'others'		:	""
		
	};
	
	
	let first_original_char = original.substr(0, 1);
	let first_translated_char = translated.substr(0, 1);
	
	let last_original_char = original.substr(original.length - 1);
	let last_translated_char = translated.substr(translated.length - 1);
	
	let wrong_diacritics =  /[ÃãŞşŢţ]/ig;
	let wrong_quotes = /["]/g;
	
	/* Starts with a space */
	if(first_translated_char == " "){
		warnings['start_space'] = "Additional start space";
		if(first_original_char  == " ")
			warnings['start_space'] += '*';
	}
	
	/* Different ending character */
	if( last_original_char != last_translated_char ){
		
		/* Additional end space */
	    if( last_translated_char == " ")
			warnings['end_char'] = "Additional end space";
		
		/* Missing end . */
		if( last_original_char == "." && warnings['end_char'] == "" )
			warnings['end_char'] = "Missing end .";
	
		/* Additional end . */
		if( last_translated_char == "." && warnings['end_char'] == "" && last_original_char != "…" )
			warnings['end_char'] = "Additional end .";
	
		/* Missing end : */
		if( last_original_char == ":" && warnings['end_char'] == "" )
			warnings['end_char'] = "Missing end :";
	
		/* Additional end : */
		if( last_translated_char == ":" && warnings['end_char'] == "" )
			warnings['end_char'] = "Additional end :";
		
		/* Other different symbol */
		if ((/[^a-zA-Z1-50]/).test(last_original_char) && warnings['end_char'] == "" && last_original_char != "…")
			warnings['end_char'] = "Differend ending symbol: <b>" + last_original_char + "</b>";
	}
	
	/* Using wrong diacritics */
	var using_wrong_diacritics = translated.match(wrong_diacritics);
		if(using_wrong_diacritics != null)
			warnings['wrong_diacritics'] = 'You are using wrong diacritics: ' + using_wrong_diacritics.toString();
	
	/* Maybe using wrong quotes */
	var using_wrong_quotes = translated.match(wrong_quotes);
		if(using_wrong_quotes != null)
			warnings['wrong_quotes'] = 'You might be using wrong quotes: "';
		
	/* Wrong Placeholders */
	let placeholder_pattern =  /(?:%[a-z]|%\d[$][a-z])/ig; 
	var original_ph = original.match(placeholder_pattern);
	var translated_ph = translated.match(placeholder_pattern);

	if (original_ph != null || translated_ph != null) {
		if (original_ph != null && translated_ph == null) {
			warnings['placeholders'] = "Missing placeholder(s): " + original_ph.toString();
		} else {
			if (original_ph == null && translated_ph != null) {
				warnings['placeholders'] = "Additional placeholder(s): " + translated_ph.toString();
			} else {
				if (original_ph.length < translated_ph.length)
					warnings['placeholders'] = "Additional placeholder(s) found";
				if (original_ph.length > translated_ph.length)
					warnings['placeholders'] = "Placeholder(s) missing or broken";
				if (original_ph.length == translated_ph.length) {
					original_ph.sort();
					translated_ph.sort();
					var broken_placeholders = [];
					for (var i = 0; i < original_ph.length; i++)
						if (original_ph[i] != translated_ph[i])
							broken_placeholders.push(translated_ph[i]);
					if (broken_placeholders.length)
						warnings['placeholders'] = "Possible broken placeholder(s): " + broken_placeholders.toString();
				}

			}
		}
	}
	
	/* Results */
	var results = ( warnings['start_space'] != "" ) ? ( '<li>' + warnings['start_space'] + '</li>' ) : '';
    results +=	( warnings['end_char'] != "" ) ? ( '<li>' + warnings['end_char'] + '</li>' ) : '';
	results +=	( warnings['placeholders'] != "" ) ? ( '<li>' + warnings['placeholders'] + '</li>' ) : '';
	results +=	( warnings['wrong_diacritics'] != "" ) ? ( '<li>' + warnings['wrong_diacritics'] + '</li>' ) : '';
	results +=	( warnings['wrong_quotes'] != "" ) ? ( '<li>' + warnings['wrong_quotes'] + '</li>' ) : '';
	
	results = ( results == "" ) ? "none" : ( '<ul class="gp-checks-list">' +results + '</ul>');
	
	return results;
}


/* Snippets - Saving process */ 

function init_snippets_html_placeholders(){
	$("#projects .project").each(function(){
		var classes = $(this).attr('class').split(' ');
		var project_slug = classes[2];
		
		
		var snippet_btns_html = ' <a data-gp-project="'+project_slug+'" class="inactive button contribute-button remove-snippet-button">Remove snippet</a>';
		snippet_btns_html += ' <a data-gp-project="'+project_slug+'" class="button contribute-button add-snippet-button">Save snippet</a>';
		
		$(this).find(".project-status").prepend('<span class="gp-diff-date"></span>');
		$(this).find(".project-bottom").append(snippet_btns_html);
		
		display_snippet_info(project_slug);
	});
	$(".inactive.remove-snippet-button").hide();
}

function init_add_btn(){
		$(".add-snippet-button").click(function(){ 
	    add_snippet_in_list($(this).data('gp-project'), $(this).data('gp-project-saved'));
		add_snippet($(this).data('gp-project')); 
		$(this).data("gp-project-saved", "yes");
		temp_msg(this, "Snippet saved", "New snippet", false);
	    $('.remove-all-snippets-button').show(500);
	});
}

function add_snippet(project_slug){
	var project_data = {};
	project_data['date'] = get_now_date();
    project_data['waiting'] = $("."+project_slug+" .project-status .project-status-waiting .project-status-value").html().replace(/<span.*>.*?<\/span>/ig,'');
    project_data['remaining'] = $("."+project_slug+" .project-status .project-status-remaining .project-status-value").html().replace(/<span.*>.*?<\/span>/ig,'');
	project_data['progress'] = $("."+project_slug+" .project-status .project-status-progress .project-status-value").html().replace(/<span.*>.*?<\/span>/ig,'');
	setLS('gp-'+project_slug, JSON.stringify(project_data));
	display_snippet_info(project_slug);
}

function add_snippet_in_list(this_project, this_project_saved){
	var projects_saved_list; 
	if(this_project_saved !== 'yes')
		if(getLS('gp-projects-saved-list') === null){
			projects_saved_list = [this_project];
			setLS('gp-projects-saved-list', JSON.stringify(projects_saved_list));
		}
		else {
		  projects_saved_list = JSON.parse(getLS('gp-projects-saved-list'));
		  projects_saved_list.push(this_project);
		  setLS('gp-projects-saved-list', JSON.stringify(projects_saved_list));
		}
	
}

function display_snippet_info(project_slug){		
	if(getLS('gp-'+project_slug) !== null){
		var project_data = JSON.parse(getLS('gp-'+project_slug));
		var project_diff = {};
		var project_atributes = ["waiting", "remaining", "progress"];
	
		project_atributes.forEach(function (item) { 
			var project_atribute = $("." + project_slug + " .project-status .project-status-" + item + " .project-status-value");
			project_diff[item] = parseInt(project_atribute.text()) - parseInt(project_data[item]);
			project_atribute.find('span.gp-diff').remove();
			project_atribute.append('<span class="gp-diff '+ ((project_diff[item] !== 0) ? 'adif' : '') +'"> (' + ((project_diff[item] > 0) ? '+' : '') + project_diff[item] +')</span>');
		});
	
		$("."+project_slug+" .project-status span.gp-diff-date").html('Snippet from '+project_data['date']).show(500);
		$("."+project_slug+" .add-snippet-button").data("gp-project-saved", "yes");
		$("."+project_slug+" .remove-snippet-button").removeClass("inactive");
		$("."+project_slug+" .remove-snippet-button").show(500);

		}
}


/* Snippets - Deleting process */

function init_remove_btn(){
	$(".remove-snippet-button").click(function(){ 
	    remove_snippet_from_list($(this).data('gp-project'));
		remove_snippet($(this).data('gp-project')); 
		$(this).data("gp-project-saved", "no");
		temp_msg(this,"Snippet removed","Remove Snippet",true);
	});
	
}

function remove_snippet_from_list(project_slug){
	
	var list = JSON.parse(getLS('gp-projects-saved-list'));
    for( var i = 0; i < list.length; i++)
        if ( list[i] === project_slug) 
            list.splice(i, 1); 
	list = JSON.stringify(list);
	
	if(list == "[]")
		$(".remove-all-snippets-button").hide(500);
	
    setLS('gp-projects-saved-list', list);
}

function remove_snippet(project_slug){
	delLS('gp-'+project_slug);
	$("."+project_slug).find('.gp-diff, .gp-diff-date' ).hide(500);
	$("."+project_slug).find('.add-snippet-button').text('Save snippet!');
}

function init_remove_all_btn(){
	var snippets_list = getLS('gp-projects-saved-list');
	var remove_all_btn_html = "<a  class='button contribute-button remove-all-snippets-button'>Remove all snippets!</a>"
	$(".breadcrumb").append(remove_all_btn_html);
	$('.remove-all-snippets-button').click(remove_all_snippets);
	if(snippets_list === null || snippets_list == '[]' ) $('.remove-all-snippets-button').hide();
}

function remove_all_snippets(){
	var list = JSON.parse(getLS('gp-projects-saved-list'));
    for( var i = 0; i < list.length; i++)
       delLS('gp-'+list[i]);
    delLS('gp-projects-saved-list');
	$('.remove-all-snippets-button').text('Removed!');
	$('.remove-all-snippets-button').hide(2000);
	setTimeout(function(){ $('.remove-all-snippets-button').text('Remove all snippets!'); }, 2001);
	
	$('.remove-snippet-button').hide(1000);
	$('.add-snippet-button').text('Save snippet');
	
}

/* Other functions */
function temp_msg(elem, new_msg, default_msg, dissapear){

	$(elem).fadeOut(function() { $(this).text(new_msg).fadeIn(500); });
	
	if(dissapear == true)
		setTimeout(function(){ $(elem).hide(1000).text(default_msg); }, 500);
	else
		setTimeout(function(){ $(elem).fadeOut(function() { $(this).text(default_msg).fadeIn(500); }); }, 3000);
	
}

function get_now_date(){	
var today = new Date();
return today.getDate()+'/'+(today.getMonth()+1)+' at '+today.getHours() + ":" + today.getMinutes();
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