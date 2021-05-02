( function( $ ){
/**	Translation checks 
*	- additional or missing end or start spaces
*	- additional or missing end spaces
*	- additional, missing or broken placeholders
*	- different ending character
*	- wrong diacritics (ro_RO)
*	- wrong quotes (ro_RO)
*	- double spaces
*	- additional/missing slash/dash spaces (ro_RO)
*	- & symbol (ro_RO)
**/

if( settings['checks']['state'] == "enabled" || settings['ro_checks']['state'] == "enabled" )
	$(document).ready(checks_init);

var next_is_strict = true; // When false, allow Save / Approve next string with errors
var notification_error_message = "<b>Fix warnings first!</b><br><br>Alternatively, check <br><i>Save / Approve with warnings!</i><br><br>";

function checks_init(){
	if( typeof $gp !== 'undefined'){		
		init_new_translations_checks();
		run_current_translations_checks(); 
		// To do: swap for performance reasons, but initialize "Save with warnings" check first!
		
		keyboard_shortcuts();
		strings_filters();
		
		console.log("This page runs string checks...");
	}
}

function strings_filters(){
	var filters = ""
	filters +='<div class="wpgpt-filters">';
    filters += '<a href="#" class="wpgpt-filter-notices">Notices (<span></span>)</a>';
	filters += '<span class="separator">•</span>';
    filters += '<a href="#" class="wpgpt-filter-warnings">Warnings (<span></span>)</a>';
	filters += '<span class="separator">•</span>';
    filters += '<a href="#" class="wpgpt-filter-all">All</a></div>';
	$("#upper-filters-toolbar div").first().append(filters);
	
	$(".wpgpt-filter-warnings")
		.click(function(){ 
			$('#translations tr.preview.wpgpt-has-nothing, #translations tr.preview.wpgpt-has-notice').hide(200);
			$('#translations tr.preview.wpgpt-has-warning').show(200);
			})
		.find('span').html($('.wpgpt-has-warning').length);
	
	$(".wpgpt-filter-notices")
		.click(function(){ 
			$('#translations tr.preview.wpgpt-has-nothing, #translations tr.preview.wpgpt-has-warning').hide(200);
			$('#translations tr.preview.wpgpt-has-notice').show(200);
		})
		.find('span').html($('.wpgpt-has-notice').length);
		
	$(".wpgpt-filter-all")
		.click(function(){ 
			$('#translations tr.preview').show(200);
		})
}

function init_new_translations_checks(){
	$("#translations tbody tr.editor").each(function(){
		var translation_id = $(this).attr("id");
		$(this).find(".translation-actions__save").click(function(event){
		if( !run_this_translation_checks( translation_id ) && next_is_strict )
            {event.preventDefault();
			 event.stopPropagation();
			 $gp.notices.error( notification_error_message );
			}
			next_is_strict = true;
		});
				
		$(this).find(".approve").click(function(event){
			if( !run_this_translation_checks( translation_id ) && next_is_strict )
            {event.preventDefault();
			 event.stopPropagation();
			 $gp.notices.error( notification_error_message );
			}
			next_is_strict = true;
		});
		
		$(this).find(".translation-wrapper").after('<div class="wpgpt-ignore-warnings noselect"><label>Save / Approve with warnings <input type="checkbox"></label></div>');	
	});
   
   $(".wpgpt-ignore-warnings input").click(function(){
	   if ($(this).prop("checked") == true)
			next_is_strict = false;
       else
			next_is_strict = true;
   });
	
}

function run_this_translation_checks( translation_id ){   
	var original = [];
	var translated = [];
	var check_results, translations; 
	var warnings_passed = true, notices_passed = true;
	var editor_html_output = "";
	
	$("#" + translation_id + " .source-string.strings div").each( function() { original.push( $(this).find("span.original").text() ); } );
	$("#" + translation_id + " .translation-wrapper div.textareas").each(function(){ translated.push( $(this).find("textarea").val() ); } );

	translations = translated.length;
	if (original.length == 2 && translations == 3)
		original[2] = original[1];
	
	for (var i = 0; i < translations; i++){
		check_results = check_translation(original[i], translated[i]);
		
		if(check_results[0] != 'none'){
			warnings_passed = false;
		}
		
		editor_html_output += '<dl><dt>Warnings' +
		((translations > 1) ? (' #'+( i + 1 ) ) : '' ) +
		':</dt><dd>' +
		check_results[0] +
		((check_results[0] == 'none') ? ' <b>&#10003;</b>' :'') +
		'</dd></dl>';
		
		if( check_results[1]!= 'none' ){
			notices_passed = false;

			editor_html_output += '<dl><dt>Notices' +
			((translations > 1) ? (' #'+( i + 1 ) ) : '' ) +
			':</dt><dd>' +
			check_results[1] +
			'</dd></dl>';			
		}		
	}
	
		var check_list = $("#" + translation_id ).find('.meta .wpgpt-checks-list');
		if( check_list.length > 0 ){
			check_list.html(editor_html_output);	
		}
		else{
			editor_html_output = '<div class="wpgpt-checks-list">' + editor_html_output + '</div>';
			$("#" + translation_id ).find('.meta dl').first().before(editor_html_output); 
		}
		
		if( warnings_passed ){
			var next_preview;
			if( notices_passed )
				next_preview = '<div class="wpgpt-check-preview"><b>&#10003;</b></div>';
			else 
				next_preview = '<div class="wpgpt-check-preview"><img class src="' + notice_icon + '"></div>';
			
			translation_id=translation_id.replace(/(?:(editor-[^- ]*)(?:-[^' ]*))/g,'$1').replace("editor", "preview"); // Look for original ID prefix only
			setTimeout(function(){ 
				var current_preview = $("tr[id^='" + translation_id +"']").find('.wpgpt-check-preview');
				if( current_preview.length > 0 )
					current_preview.html(next_preview);
				else
					$("tr[id^='" + translation_id +"']").find('.actions .action.edit').prepend(next_preview);
		
			},750); // Important: wait for the new translation to load before display preview warning state
        }
		else{

			$("#" + translation_id).find(".wpgpt-ignore-warnings").fadeIn().css('display', 'block');
		}
	return warnings_passed;
}

function run_current_translations_checks(){ 
	$("#translations tbody tr.preview.has-translations").each(function(){
		var translated = [];
		var check_results, translations, preview_class; 
		var preview_html_output = "", editor_html_output = "";
		var preview_warning = false, preview_notice = false;
		
		let original = $(this).find('td.original .original-text').text();
		$(this).find('td.translation .translation-text').each( function(){	translated.push( $( this ).text() ); } );
		translations = translated.length;
	
		for (var i = 0; i < translations; i++){
			check_results = check_translation(original, translated[i]);
			
			editor_html_output += '<dl><dt>Warnings' +
			((translations > 1) ? (' #'+( i + 1 ) ) : '' ) +
			':</dt><dd>' +
			check_results[0] +
			((check_results[0] == 'none') ? ' <b>&#10003;</b>' :'') +
			'</dd></dl>';
			
			if( check_results[1]!= 'none' ){
				editor_html_output += '<dl><dt>Notices' +
				((translations > 1) ? (' #'+( i + 1 ) ) : '' ) +
				':</dt><dd>' +
				check_results[1] +
				'</dd></dl>';
				preview_notice = true;
			}
			
			if(check_results[0] != 'none'){
				preview_warning = true;
			}
		}
		
		editor_html_output = '<div class="wpgpt-checks-list">' + editor_html_output + '</div>';

		if( preview_warning ){
			preview_html_output = '<div class="wpgpt-warning-preview"> <img class src="' + warning_icon + '"></div>';
			$("#" + $(this).attr('id').replace('preview', 'editor')).find('.wpgpt-ignore-warnings').show();	
			preview_class = "wpgpt-has-warning";
		} else if( preview_notice ){
				preview_html_output = '<div class="wpgpt-check-preview"><img class src="' + notice_icon + '"></div>'; 
				preview_class = "wpgpt-has-notice";
				} else {
					preview_html_output = '<div class="wpgpt-check-preview"><b>&#10003;</b></div>';
					preview_class = "wpgpt-has-nothing";
				}
			
		$(this).addClass(preview_class);
		$("#" + $(this).attr('id').replace("preview", "editor")).find('.meta .status-actions').after(editor_html_output);
		$(this).find('.actions .action.edit').prepend(preview_html_output);
	});
}

function check_translation (original, translated){
	var warnings = {
		'placeholders'		:	"",
		'start_space' 		:	"",
		'end_char'			: 	"",
		'others'			:	"",
		'ro_diacritics'		:	"",
		'ro_quotes'			:	""
	};
	var notices = {
		'placeholders'		:	"",
		'start_space' 		:	"",
		'end_char'			: 	"",
		'others'			:	"",
		'ro_diacritics'	:	"",
		'ro_quotes'		:	""
	};
	
	let first_original_char = original.substr(0, 1);
	let first_translated_char = translated.substr(0, 1);
	
	let last_original_char = original.substr(original.length - 1);
	let last_translated_char = translated.substr(translated.length - 1);
	
	let last_two_original_char = original.substr(original.length-2,2);
	let last_two_translated_char = translated.substr(translated.length-2,2);
	
	var error_message = "";
		
	/** Wrong Placeholders **/
	let placeholder_pattern =  /(?:%[a-z]|%\d[$][a-z])/ig; 
	var original_ph = original.match(placeholder_pattern);
	var translated_ph = translated.match(placeholder_pattern);

	if(
		original_ph != null ||
		translated_ph != null
	){
		if(
			original_ph != null &&
			translated_ph == null
		){
			warnings['placeholders'] = "<li>Missing placeholder(s): " + original_ph.toString() + "</li>";
		} else {
			if(
				original_ph == null &&
				translated_ph != null
			){
				warnings['placeholders'] = "<li>Additional placeholder(s): " + translated_ph.toString() + "</li>";
			} else {
				if (original_ph.length < translated_ph.length)
					warnings['placeholders'] = "<li>Additional placeholder(s) found</li>";
				if (original_ph.length > translated_ph.length)
					warnings['placeholders'] = "<li>Placeholder(s) missing or broken</li>";
				if (original_ph.length == translated_ph.length) {
					original_ph.sort();
					translated_ph.sort();
					var broken_placeholders = [];
					for (var i = 0; i < original_ph.length; i++)
						if (original_ph[i] != translated_ph[i]){
							broken_placeholders.push(translated_ph[i]);
						}
					if (broken_placeholders.length){
						warnings['placeholders'] = "<li>Possible broken placeholder(s): " + broken_placeholders.toString() + "</li>";
					}
				}
			}
		}
	}

/** General checks */
if( settings['checks']['state'] == "enabled" ){
	
	/** Additional start space **/
	if(
		first_translated_char == " " &&
		first_original_char  != " "
	){  
		error_message = "<li>Additional start space</li>";
		switch(settings['start_space']['state']){
			case "warning": warnings['start_space'] = error_message; break;
			case "notice": notices['start_space'] = error_message; 
		}
	}
	
	/** Missing start space **/
	if(
		first_translated_char != " " &&
		first_original_char  == " "
	){	
		error_message = "<li>Missing start space</li>";
		switch(settings['start_space']['state']){
			case "warning": warnings['start_space'] = error_message; break;
			case "notice": notices['start_space'] = error_message; 
		}
	}
	
	/** Different ending character **/
	if( last_original_char != last_translated_char ){
		
		/** Additional end space **/
	    if( last_translated_char == " "){
			error_message = "<li>Additional end space</li>";
			switch(settings['end_space']['state']){
				case "warning": warnings['end_char'] = error_message; break;
				case "notice": notices['end_char'] = error_message; 
			}
		}
		
		/** Missing end space **/
		if( 
			last_original_char == " " &&
			warnings['end_char'] == ""
		){
			error_message = "<li>Missing end space</li>";
			switch(settings['end_space']['state']){
				case "warning": warnings['end_char'] = error_message; break;
				case "notice": notices['end_char'] = error_message; 
			}
		}
		
		/** Missing end period; Exceptions: Translator approved swap in ". and ). **/
		if( 
			last_original_char == "." &&
			last_two_original_char != '".' &&
			last_two_original_char != ').' &&
			warnings['end_char'] == ""
		){
			error_message = "<li>Missing end .</li>";
			switch(settings['end_period']['state']){
				case "warning": warnings['end_char'] = error_message; break;
				case "notice": notices['end_char'] = error_message; 
			}
		}
		
		/** Additional end period; Exceptions: … and translator approved swap in ." OR .) OR >. **/
		if( 
			last_translated_char == "." &&
			last_original_char != "…" &&
			last_two_original_char != '."' &&
			last_two_original_char != '.)' &&
			last_two_translated_char != '>.' &&
			warnings['end_char'] == ""
		){		
			error_message = "<li>Additional end .</li>";
			switch(settings['end_period']['state']){
				case "warning": warnings['end_char'] = error_message; break;
				case "notice": notices['end_char'] = error_message; 
			}
		}
		
		/** Missing end : **/
		if( 
			last_original_char == ":" &&
			warnings['end_char'] == ""
		){
			error_message = "<li>Missing end :</li>";
			switch(settings['end_colon']['state']){
				case "warning": warnings['end_char'] = error_message; break;
				case "notice": notices['end_char'] = error_message; 
			}
		}
		/** Additional end : **/
		if( 
			last_translated_char == ":" &&
			warnings['end_char'] == ""
		){
			error_message = "<li>Additional end :</li>";
			switch(settings['end_colon']['state']){
				case "warning": warnings['end_char'] = error_message; break;
				case "notice": notices['end_char'] = error_message; 
			}
		}
		
		/** Other different symbol Exceptions: … " and ) **/
		if (
			(/[^a-zA-Z1-50]/).test(last_original_char) &&
			last_original_char != "…" &&
			last_original_char != '"' &&
			last_original_char != ')' &&
			last_two_original_char != '".' &&
			last_two_original_char != ').' &&
			last_two_original_char != '."' &&
			last_two_original_char != '.)' &&
			warnings['end_char'] == ""
		){
			error_message = "<li>Notice: different ending symbol: <b>'" + last_original_char + "'</b></li>";
			switch(settings['end_different']){
				case "warning": warnings['end_char'] = error_message; break;
				case "notice": notices['end_char'] = error_message; 
			}
		}
	}
	
	/**Double spaces **/
	let double_spaces = /  /g;
	var using_double_spaces = translated.match(double_spaces);
	if( using_double_spaces != null ){
		error_message = "<li>" + using_double_spaces.length + " double space(s) detected </li>"; 
		switch(settings['double_spaces']['state']){
				case "warning": warnings['others'] += error_message; break;
				case "notice": notices['others'] += error_message; 
		}
	}
}

/** Romanian checks **/
if( settings['ro_checks']['state'] == "enabled" ){
	let not_ro_diacritics =  /[ÃãŞşŢţ]/ig;  
	let not_ro_quotes = /[^=]"(?:[^"<=]*)"/g;
	let not_ro_slash_spaces = / [/] /g;
	let not_ro_ampersand = /[&](?!.{1,7}?;)/g;

	/** RegEx explications
	**	not_ro_diacritics =  /[ÃãŞşŢţ]/ig; 		Find globally, case insensitive any of the chars inside []
	**	not_ro_quotes = /[^=]"(?:[^"<=]*)"/g;	Find globally strings, using a non-capturing group
	**											- doesn't start with =
	**											- next, have "
	**											- next, don't have ", = nor < in any of the following characters
	**											- ends with "
	** not_ro_slash_spaces = / [/] /g;			Find globally strings that have space/space
	** not_ro_ampersand = /[&](?!.{1,7}?;)/g;	Find globally strings, using negative lookahead and lazy matching
	**											- starts with &
	**											- doesn't have ; after 1 to 7 characters
	**/ 
	
	/** ro diacritics **/
	var not_using_ro_diacritics = translated.match(not_ro_diacritics);
		if(not_using_ro_diacritics != null){
			error_message = "<li>" + not_using_ro_diacritics.length + ' wrong diacritic(s) found: ' + not_using_ro_diacritics.toString() + "</li>";
			switch(settings['ro_diacritics']['state']){
				case "warning": warnings['ro_diacritics'] = error_message; break;
				case "notice": notices['ro_diacritics'] = error_message; 
			}
		}
		
	/** ro quotes **/
	var not_using_ro_quotes = translated.match(not_ro_quotes);
		if(not_using_ro_quotes != null)
		{   var i;
			for (i = 0; i < not_using_ro_quotes.length; i++) 
              not_using_ro_quotes [i] = not_using_ro_quotes[i].substring(1)
			
			error_message = "<li>" + not_using_ro_quotes.length + ' pair' + ( ( i > 1 ) ? 's' : '' ) + ' of wrong quotes: ' + not_using_ro_quotes.toString() + " Use „ ”</li>";
			switch(settings['ro_quotes']['state']){
				case "warning": warnings['ro_quotes'] = error_message; break;
				case "notice": notices['ro_quotes'] = error_message; 
			}
		}

	/** ro slash spaces **/
	var not_using_ro_slash_spaces = translated.match(not_ro_slash_spaces);
	if ( not_using_ro_slash_spaces != null ){
		error_message =  "<li>" + not_using_ro_slash_spaces.length + " / space detected </li>";
		switch(settings['ro_slash']['state']){
				case "warning": warnings['others'] += error_message; break;
				case "notice": notices['others'] += error_message; 
		}
	}
	
	/** ro ampersand **/
	var not_using_ro_ampersand = translated.match(not_ro_ampersand);
	if ( not_using_ro_ampersand!= null ){
		error_message = "<li>" + not_using_ro_ampersand.length + " & detected</li>";
		switch(settings['ro_ampersand']['state']){
				case "warning": warnings['others'] += error_message; break;
				case "notice": notices['others'] += error_message; 
		}
	}
}
   
	var warnings_results = Object.values(warnings).join("");
	warnings_results  = ( warnings_results == "" ) ? "none" : ( '<ul class="wpgpt-warnings-list">' + warnings_results + '</ul>');

	var notices_results = Object.values(notices).join("");
	notices_results  =  ( notices_results == "" ) ? "none" : ( '<ul class="wpgpt-notices-list">' + notices_results + '</ul>');
	
	var results = [ warnings_results, notices_results ]; 
	return results;
}

/**
 ** Override (again) some shortcuts
 ** Based on: https://meta.trac.wordpress.org/browser/sites/trunk/wordpress.org/public_html/wp-content/plugins/wporg-gp-customizations/templates/js/editor.js#L143
 */

function keyboard_shortcuts(){
	$gp.editor.keydown  = ( function( original ) {
		return function( event ) {
			// Shift-Enter = Save.
			if ( 13 === event.keyCode && event.shiftKey ) {
				var $textarea = $( event.target );
				
				if ( ! $textarea.val().trim() ) {
					$gp.notices.error( 'Translation is empty.' );
					return false;
				}

				// Check plural forms.
				var $textareas = $gp.editor.current.find( '.textareas:not(.active) textarea' );
				var isValid = true;
				$textareas.each( function() {
					if ( ! this.value.trim() ) {
						isValid = false;
					}
				} );

				if ( ! isValid ) {
					$gp.notices.error( 'Translation is empty.' );
					return false;
				}	
				
				if( !run_this_translation_checks( $gp.editor.current.attr( 'id' ) ) && next_is_strict ){
					$gp.notices.error( notification_error_message );
					return false;	
				} else {
					$gp.editor.save( $gp.editor.current.find( 'button.translation-actions__save' ) );
					next_is_strict = true;
				}

			} else if ( ( 107 === event.keyCode && event.ctrlKey ) || ( 65 === event.keyCode && event.shiftKey && event.ctrlKey ) ) { // Ctrl-+ or Ctrl-Shift-A = Approve.
					approve = $( '.editor:visible' ).find( '.approve' );
					
					if( approve.length > 0 ){
						
						if( !run_this_translation_checks( $gp.editor.current.attr( 'id' ) ) && next_is_strict ){
							$gp.notices.error( notification_error_message );
							return false;	
						} else {
							approve.trigger( 'click' );
							next_is_strict = true;
						}
					}
			} else {
				return original.apply( $gp.editor, arguments );
			}

			return false;
		}
	})( $gp.editor.keydown );
}

})( jQuery );