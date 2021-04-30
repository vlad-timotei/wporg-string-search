( function( $ ){

  $(document).ready(snippets_init);

function snippets_init(){
	const pathname = window.location.pathname;
    if ( pathname.search("locale") != -1 ){
		/** Snippets **/
		if($("#projects").length){
			init_snippets_html_placeholders('many','');
			init_btns();
			console.log("Snippets for projects loaded");
			
		}
		
		if($(".locale-project").length){
			
			init_snippets_html_placeholders('single');
			init_btns();
			var project_single_slug = pathname.replace(/(?:\/locale\/[^\/]*\/[^\/]*\/)/,'').slice(0, -1).replace('/','-');
			console.log("Snippets for project " + project_single_slug + " loaded");
		}
	}
}

/** Snippets - Saving process **/ 

function init_snippets_html_placeholders(page_type, single_project_slug){
	if( page_type == 'many' ){
		$("#projects .project").each(function(){
			var classes = $(this).attr('class').split(' ');
			var project_slug = classes[2];
	
			var snippet_btns_html = ' <a data-wpgpt-project="'+project_slug+'" class="inactive button contribute-button wpgpt-remove-snippet">Remove snippet</a>';
			snippet_btns_html += ' <a data-wpgpt-project="'+project_slug+'" class="button contribute-button wpgpt-add-snippet">New snippet</a>';
		
			$(this).find(".project-status").prepend('<span class="wpgpt-snippet-date"></span>');
			$(this).find(".project-bottom").append(snippet_btns_html);
		
			display_snippet_info(project_slug);
		});
	} else if( page_type == 'single' ){
		// ToDo: display stuff for single project
	}
	
	$(".inactive.wpgpt-remove-snippet").hide();
}

function init_btns(){
	init_add_btn();
	init_remove_btn();
	init_remove_all_btn();
}

function init_add_btn(){
		$(".wpgpt-add-snippet").click(function(){ 
	    add_snippet_in_list($(this).data('wpgpt-project'), $(this).data('wpgpt-saved'));
		add_snippet($(this).data('wpgpt-project')); 
		$(this).data("wpgpt-saved", "yes");
		temp_msg(this, "Snippet saved", "New snippet", false);
	    $('.wpgpt-remove-all').show(500);
	});
}

function add_snippet(project_slug){
	var project_data = {};
	project_data['date'] = get_now_date();
    project_data['waiting'] = $("."+project_slug+" .project-status .project-status-waiting .project-status-value").html().replace(/<span.*>.*?<\/span>/ig,'');
    project_data['remaining'] = $("."+project_slug+" .project-status .project-status-remaining .project-status-value").html().replace(/<span.*>.*?<\/span>/ig,'');
	project_data['progress'] = $("."+project_slug+" .project-status .project-status-progress .project-status-value").html().replace(/<span.*>.*?<\/span>/ig,'');
	setLS('wpgpt-'+project_slug, JSON.stringify(project_data));
	display_snippet_info(project_slug);
}

function add_snippet_in_list(this_project, this_project_saved){
	var projects_saved_list; 
	if(this_project_saved !== 'yes')
		if(getLS('wpgpt-snippets-list') === null){
			projects_saved_list = [this_project];
			setLS('wpgpt-snippets-list', JSON.stringify(projects_saved_list));
		}
		else {
		  projects_saved_list = JSON.parse(getLS('wpgpt-snippets-list'));
		  projects_saved_list.push(this_project);
		  setLS('wpgpt-snippets-list', JSON.stringify(projects_saved_list));
		}
	
}

function display_snippet_info(project_slug){		
	if(getLS('wpgpt-'+project_slug) !== null){
		var project_data = JSON.parse(getLS('wpgpt-'+project_slug));
		var project_diff = {};
		var project_atributes = ["waiting", "remaining", "progress"];
	
		project_atributes.forEach(function (item) { 
			var project_atribute = $("." + project_slug + " .project-status .project-status-" + item + " .project-status-value");
			project_diff[item] = parseInt(project_atribute.text()) - parseInt(project_data[item]);
			project_atribute.find('span.wpgpt-diff').remove();
			project_atribute.append('<span class="wpgpt-diff '+ ((project_diff[item] !== 0) ? 'adif' : '') +'"> (' + ((project_diff[item] > 0) ? '+' : '') + project_diff[item] +')</span>');
		});
	
		$("."+project_slug+" .project-status span.wpgpt-snippet-date").html('Snippet from '+project_data['date']).show(500);
		$("."+project_slug+" .wpgpt-add-snippet").data("wpgpt-saved", "yes");
		$("."+project_slug+" .wpgpt-remove-snippet").removeClass("inactive");
		$("."+project_slug+" .wpgpt-remove-snippet").show(500);

		}
}

/** Snippets - Deleting process **/
function init_remove_btn(){
	$(".wpgpt-remove-snippet").click(function(){ 
	    remove_snippet_from_list($(this).data('wpgpt-project'));
		remove_snippet($(this).data('wpgpt-project')); 
		$(this).data("wpgpt-saved", "no");
		temp_msg(this,"Snippet removed","Remove Snippet",true);
	});
	
}

function remove_snippet_from_list(project_slug){
	
	var list = JSON.parse(getLS('wpgpt-snippets-list'));
    for( var i = 0; i < list.length; i++)
        if ( list[i] === project_slug) 
            list.splice(i, 1); 
	list = JSON.stringify(list);
	
	if(list == "[]")
		$(".wpgpt-remove-all").hide(500);
	
    setLS('wpgpt-snippets-list', list);
}

function remove_snippet(project_slug){
	delLS('wpgpt-'+project_slug);
	$("."+project_slug).find('.wpgpt-diff, .wpgpt-snippet-date' ).hide(500);
	$("."+project_slug).find('.wpgpt-add-snippet').text('Save snippet!');
}

function init_remove_all_btn(){
	var snippets_list = getLS('wpgpt-snippets-list');
	var remove_all_btn_html = "<a  class='button contribute-button wpgpt-remove-all'>Remove all snippets!</a>"
	$(".breadcrumb").append(remove_all_btn_html);
	$('.wpgpt-remove-all').click(remove_all_snippets);
	if(snippets_list === null || snippets_list == '[]' ) $('.wpgpt-remove-all').hide();
}

function remove_all_snippets(){
	var list = JSON.parse(getLS('wpgpt-snippets-list'));
    for( var i = 0; i < list.length; i++)
       delLS('wpgpt-'+list[i]);
    delLS('wpgpt-snippets-list');
	$('.wpgpt-remove-all').text('Removed!');
	$('.wpgpt-remove-all').hide(2000);
	setTimeout(function(){ $('.wpgpt-remove-all').text('Remove all snippets!'); }, 2001);
	
	$('.wpgpt-remove-snippet').hide(1000);
	$('.wpgpt-add-snippet').text('Save snippet');
	
}

})( jQuery );


function temp_msg(elem, new_msg, default_msg, dissapear){

	jQuery(elem).fadeOut(function() { jQuery(this).text(new_msg).fadeIn(500); });
	
	if(dissapear == true)
		setTimeout(function(){ jQuery(elem).hide(1000).text(default_msg); }, 500);
	else
		setTimeout(function(){ jQuery(elem).fadeOut(function() { jQuery(this).text(default_msg).fadeIn(500); }); }, 3000);
	
}


function get_now_date(){	
var today = new Date();
return today.getDate()+'/'+(today.getMonth()+1)+' at '+today.getHours() + ":" + today.getMinutes();
}
