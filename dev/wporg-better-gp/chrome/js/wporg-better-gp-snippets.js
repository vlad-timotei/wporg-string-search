( function( $ ){

  $(document).ready(snippets_init);

function snippets_init(){
	const pathname = window.location.pathname;
    if ( pathname.search("locale") != -1 ){
		/** Snippets **/
		if($("#projects").length){
			init_snippets_html_placeholders('many','');
			init_btns();
			console.log("Snippets for projectS loaded");
			
		}
		
		if($(".locale-project").length){
			
			init_snippets_html_placeholders('single');
			init_btns();
			var project_single_slug = pathname.replace(/(?:\/locale\/[^\/]*\/[^\/]*\/)/,'').slice(0, -1).replace('/','-');
			console.log("Snippets for projecT " + project_single_slug + " loaded");
		}
	}
}

/** Snippets - Saving process **/ 

function init_snippets_html_placeholders(page_type, single_project_slug){
	if( page_type == 'many' ){
		$("#projects .project").each(function(){
			var classes = $(this).attr('class').split(' ');
			var project_slug = classes[2];
	
			var snippet_btns_html = ' <a data-gp-project="'+project_slug+'" class="inactive button contribute-button remove-snippet-button">Remove snippet</a>';
			snippet_btns_html += ' <a data-gp-project="'+project_slug+'" class="button contribute-button add-snippet-button">New snippet</a>';
		
			$(this).find(".project-status").prepend('<span class="gp-diff-date"></span>');
			$(this).find(".project-bottom").append(snippet_btns_html);
		
			display_snippet_info(project_slug);
		});
	} else if( page_type == 'single' ){
		
		
		
		
	}
	
	$(".inactive.remove-snippet-button").hide();
}

function init_btns(){
	init_add_btn();
	init_remove_btn();
	init_remove_all_btn();
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


/** Snippets - Deleting process **/

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

})( jQuery );