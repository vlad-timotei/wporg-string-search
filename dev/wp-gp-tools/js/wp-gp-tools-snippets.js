var snippets = {};
var snippets_keys = [];

( function( $ ){

if(settings['snippets']['state'] == "disabled") 
	return;

if( getLS( 'wpgpt-snippets') != null ){
	snippets = JSON.parse( getLS('wpgpt-snippets') ); 
	snippets_keys = Object.keys(snippets);
}

$(document).ready(snippets_init);

function snippets_init(){
	const pathname = window.location.pathname;
    if ( pathname.search("locale") != -1 ){
		var many = ($("#projects").length) ? true : false;
		var single = false;
		if(!many && $(".locale-project").length )
			single = 'project-' + pathname.replace(/(?:\/locale\/[^\/]*\/[^\/]*\/)/,'').slice(0, -1).replace('/','-');		
		init_snippets_html_placeholders(many, single);
		init_btns();	
	}
}

function init_snippets_html_placeholders(many, single){
	if( many ){
		$("#projects .project").each(function(){
			var classes = $(this).attr('class').split(' ');
			var project_slug = classes[2];
	
			var snippet_btns_html = ' <a data-wpgpt-project="'+project_slug+'" class="inactive button contribute-button wpgpt-remove-snippet">Remove snippet</a>';
			snippet_btns_html += ' <a data-wpgpt-project="'+project_slug+'" class="button contribute-button wpgpt-add-snippet">New snippet</a>';
		
			$(this).find(".project-status").prepend('<span class="wpgpt-snippet-date"></span>');
			$(this).find(".project-bottom").append(snippet_btns_html);
				
			display_snippet_info(project_slug);
		});
		
		var remove_all_btn_html = "<a  class='button contribute-button wpgpt-remove-all'>Remove all snippets!</a>"
		$(".breadcrumb").append(remove_all_btn_html);
		if(snippets_keys.length == 0) 
			$('.wpgpt-remove-all').hide();
		
	} else if( single ){
		if( snippets_keys.includes( single ) ){
			
			var progress = $('.project-status').html();
			var waiting = 0;
			var remaining = 0;
			$(".locale-sub-projects .stats.fuzzy a").each(function(){ waiting += Number($(this).text()); remaining += Number($(this).text()); });
			$(".locale-sub-projects .stats.waiting a").each(function(){ waiting += Number($(this).text()); });
			$(".locale-sub-projects .stats.untranslated a").each(function(){ remaining += Number($(this).text()); });


			var project_table = `
			<thead class="${single} single-project"><tr class="single-project">
			<th class="project-status-progress">Progress
            <span class="project-status-value">${progress}</span></th>
			<th class="project-status-remaining">Remaining
            <span class="project-status-value">${remaining}</span></th>
			<th colspan="3" class="project-status-waiting">Waiting / Fuzzy
            <span class="project-status-value">${waiting}</span></th></tr></thead>`;
			$(".locale-sub-projects").append(project_table);
			
			display_snippet_info( single );
		}
			
		else
			console.log("I don't have you - " + single);
	}
	
	$(".inactive.wpgpt-remove-snippet").hide();
}

function init_btns(){
	$(".wpgpt-add-snippet").each(function(){
		if( snippets_keys.includes( $(this).data('wpgpt-project') ) )
			$(this).text("Update snippet");
	});
	$(".wpgpt-add-snippet").click(function(){ 
		add_snippet($(this).data('wpgpt-project')); 
		button_action(this, "Update snippet");
		$('.wpgpt-remove-all').show(500);
	});
	$(".wpgpt-remove-snippet").click(function(){ 
		remove_snippet($(this).data('wpgpt-project')); 
		button_action(this,false);
	});
	$('.wpgpt-remove-all').click(remove_all_snippets);
}

function add_snippet(project_slug){
	var project_data = {};
	project_data['date'] = get_now_date();
	project_data['wrp'] =
	$("."+project_slug+" .project-status .project-status-waiting .project-status-value").html().replace(/<span.*>.*?<\/span>/ig,'') + "&" +
	$("."+project_slug+" .project-status .project-status-remaining .project-status-value").html().replace(/<span.*>.*?<\/span>/ig,'') + "&" +
	$("."+project_slug+" .project-status .project-status-progress .project-status-value").html().replace(/<span.*>.*?<\/span>/ig,'');
	project_data['img'] = $("."+project_slug+" .project-icon a img").attr('src');
	project_data['url'] = $("."+project_slug+" .project-icon a").attr('href');
	
	if( !snippets_keys.includes( project_slug ) )
		snippets_keys.push( project_slug );
	snippets[project_slug] = project_data;
	setLS('wpgpt-snippets', JSON.stringify( snippets ) );
	
	display_snippet_info(project_slug);
}

function display_snippet_info(project_slug){		
	if( snippets_keys.includes( project_slug ) ){
		console.log("got you");
		var project_data = snippets[ project_slug ];
		var wrp = project_data['wrp'].split("&");
		project_data['waiting'] = wrp[0];
		project_data['remaining'] = wrp[1];
		project_data['progress'] = wrp[2];
		
		var project_diff = {};
		var project_atributes = ["waiting", "remaining", "progress"];
	
		project_atributes.forEach(function (item) { 
			var project_atribute = $("." + project_slug + " .project-status-" + item + " .project-status-value");
			project_diff[item] = parseInt(project_atribute.text()) - parseInt(project_data[item]);
			project_atribute.find('span.wpgpt-diff').remove();
			project_atribute.append('<span class="wpgpt-diff '+ ((project_diff[item] !== 0) ? 'adif' : '') +'"> (' + ((project_diff[item] > 0) ? '+' : '') + project_diff[item] +')</span>');
		});
	
		$("."+project_slug+" .project-status span.wpgpt-snippet-date").html('Snippet from '+project_data['date']).show(500);
		$("."+project_slug+" .wpgpt-remove-snippet").removeClass("inactive");
		$("."+project_slug+" .wpgpt-remove-snippet").show(500);
		}
}

function remove_snippet(project_slug){
	const index = snippets_keys.indexOf( project_slug );
	snippets_keys.splice(index, 1);
	delete snippets[ project_slug ];
	setLS('wpgpt-snippets', JSON.stringify( snippets ) );
	
	if(snippets_keys.length == 0) $('.wpgpt-remove-all').hide();
	$("."+project_slug).find('.wpgpt-diff, .wpgpt-snippet-date' ).hide(500);
	$("."+project_slug).find('.wpgpt-add-snippet').text('Save snippet!');
}


function remove_all_snippets(){
    delLS('wpgpt-snippets');
	snippets = {};
	snippets_keys = [];
	
	$('.wpgpt-remove-all').text('Removed!');
	$('.wpgpt-remove-all').hide(2000);
	setTimeout(function(){ $('.wpgpt-remove-all').text('Remove all snippets!'); }, 2001);
	
	$('.wpgpt-remove-snippet').hide(1000);
	$('.wpgpt-add-snippet').text('Save snippet');
}

})( jQuery );


function button_action(elem, new_msg){

	if(new_msg)
		jQuery(elem).fadeOut(function() { jQuery(this).text(new_msg).fadeIn(); });
    else
		jQuery(elem).hide(100);
}


function get_now_date(){	
var today = new Date();
return today.getDate()+'/'+(today.getMonth()+1)+' at '+today.getHours() + ":" + today.getMinutes();
}
