( function( $ ){

/**	Translation checks 
*	- additional or missing end or start spaces
*	- additional or missing end spaces
*	- additional, missing or broken placeholders
*	- different ending character
*	- wrong diacritics (ro_RO)
*	- wrong quotes (ro_RO)
*	- double spaces
*	- additional slash spaces (ro_RO)
*	- & symbol (ro_RO)
**/

  $(document).ready(checks_init);

function checks_init(){
	if( typeof $gp !== 'undefined'){
		run_current_translations_checks();
		init_new_translations_checks();
		keyboard_shortcuts();
		console.log("Checks loaded");
	}
}

function init_new_translations_checks(){
	$("#translations tbody tr.editor").each(function(){
		var translation_id = $(this).attr("id");
		$(this).find(".translation-actions__save").click(function(){
			run_new_translation_checks(translation_id);			
		});
		$(this).find(".status-actions .approve, .status-actions .reject, .status-actions .fuzzy").click(function(){
			run_new_translation_checks(translation_id);
		});			
	});
	
	
	//$(".translation-actions__copy").on("click", function(){ console.log('Copy has been clicked;');});
	
	
	//$(document).keydown(function(event) {
		//console.log( ((event.ctrlKey) ? event.ctrlKey : '') + " " + event.which );
		//console.log(   "Event 1: " + event.keyCode + " pressed " + ((event.ctrlKey) ? ' & Ctrl pressed' : ''));
		//return false;
	//});
	
	
}

function run_new_translation_checks( translation_id ){
	var original = [];
	var translated = [];
	var check_results, translations; 
	var preview_html_output = "", editor_html_output = "";
	var original_id = /(?:(editor-[^- ]*)(?:-[^' ]*))/g;
	
	
	$("#" + translation_id + " .source-string.strings div").each( function() { original.push( $(this).find("span.original").text() ); } );
	$("#" + translation_id + " .translation-wrapper div.textareas").each(function(){ translated.push( $(this).find("textarea").val() ); } );

	translations = translated.length;
	if (original.length == 2 && translations == 3)
		original[2] = original[1];
	
	for (var i = 0; i < translations; i++){
		check_results = check_translation(original[i], translated[i]);
		
		editor_html_output += '<dl><dt>Warnings' +
							  ((translations > 1) ? (' #'+( i + 1 ) ) : '' ) +
							  ':</dt><dd>' +
							  check_results +
							  ((check_results == 'none') ? ' <b>&#10003;</b>' :'') +
							  '</dd></dl>';
		
		if(check_results != 'none')
				preview_html_output = 'error';
		
	}
	
	preview_html_output = ( preview_html_output != "" ) ? ( '<img class = "gp-checks-warnings" src="' + warning_icon + '">' ) : '<b>&#10003;</b> ';
	
	translation_id=translation_id.replace(original_id,'$1'); // Important: keep original id prefix 
	setTimeout(function(){ 
		$("tr[id^='" + translation_id  +"']").find('.meta .status-actions').after(editor_html_output); 
		$("tr[id^='" + translation_id.replace("editor", "preview") +"']").find('.actions .action.edit').prepend(preview_html_output);
		// Should work 10 out of 10 but YOLO
	},750); // Important: wait for the new translation to load 
}

function run_current_translations_checks(){ 
	$("#translations tbody tr.preview.has-translations").each(function(){
		var translated = [];
		var check_results, translations; 
		var preview_html_output = "", editor_html_output = "";
		
		
		let original = $(this).find('td.original .original-text').text();
		$(this).find('td.translation .translation-text').each( function(){	translated.push( $( this ).text() ); } );
		translations = translated.length;
	
		for (var i = 0; i < translations; i++){
			check_results = check_translation(original, translated[i]);
			
			editor_html_output += '<dl><dt>Warnings' +
							  ((translations > 1) ? (' #'+( i + 1 ) ) : '' ) +
							  ':</dt><dd>' +
							  check_results +
							  ((check_results == 'none') ? ' <b>&#10003;</b>' :'') +
							  '</dd></dl>';
								
			if(check_results != 'none')
				preview_html_output = 'error';
		}
		
		preview_html_output = ( preview_html_output != "" ) ? ( '<img class = "gp-checks-warnings" src="' + warning_icon + '">' ) : '<b>&#10003;</b> ';
		$("#" + $(this).attr('id').replace("preview", "editor")).find('.meta .status-actions').after(editor_html_output); 
		$(this).find('.actions .action.edit').prepend(preview_html_output);
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
	
	let last_two_original_char = original.substr(original.length-2,2);
	let last_two_translated_char = translated.substr(translated.length-2,2);
	
	
	let wrong_double_spaces = /  /g;
	
	/** Romanian specific rules **/
	let wrong_diacritics =  /[ÃãŞşŢţ]/ig;  
	let wrong_quotes = /[^=]"(?:[^"<=]*)"/g;
	let wrong_slash_spaces = / [/] /g;
	let wrong_and = /[&](?!.{1,7}?;)/g;
	
	/** RegEx explications - will need them
	**	wrong_double_spaces = /  /g;			Find globally double spaces
	**	wrong_diacritics =  /[ÃãŞşŢţ]/ig; 		Find globally, case insensitive any of the chars inside []
	**	wrong_quotes = /[^=]"(?:[^"<=]*)"/g;	Find globally strings, using a non-capturing group
	**											- doesn't start with =
	**											- next, have "
	**											- next, don't have ", = nor < in any of the following characters
	**											- ends with "
	** wrong_slash_spaces = / [/] /g;			Find globally strings that have space/space
	** wrong_and = /[&](?!.{1,7}?;)/g;			Find globally strings, using negative lookahead and lazy matching
	**											- starts with &
	**											- doesn't have ; after 1 to 7 characters
	**/ 
	
	/** Starts with a space **/
	if(first_translated_char == " "){
		warnings['start_space'] = "Additional start space";
		if(first_original_char  == " ")
			warnings['start_space'] += ' (same as original)';
	}
	
	/** Different ending character **/
	if( last_original_char != last_translated_char ){
		
		/** Additional end space **/
	    if( last_translated_char == " ")
			warnings['end_char'] = "Additional end space";
		
		/** Missing end . Exceptions: Translator approved swap in ". and ). **/
		if( 
			last_original_char == "." &&
			last_two_original_char != '".' &&
			last_two_original_char != ').' &&
			warnings['end_char'] == ""
		)
			warnings['end_char'] = "Missing end .";
	
		/** Additional ending . Exceptions: … and translator approved swap in ." and .) **/
		if( 
			last_translated_char == "." &&
			last_original_char != "…" &&
			last_two_original_char != '."' &&
			last_two_original_char != '.)' &&
			warnings['end_char'] == ""
		)			
			warnings['end_char'] = "Additional end .";
		
		/** Missing end : **/
		if( 
			last_original_char == ":" &&
			warnings['end_char'] == ""
		)
			warnings['end_char'] = "Missing end :";
	
		/** Additional end : **/
		if( 
			last_translated_char == ":" &&
			warnings['end_char'] == ""
		)
			warnings['end_char'] = "Additional end :";
		
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
		)
			warnings['end_char'] = "Notice: different ending symbol: <b>'" + last_original_char + "'</b>";
	}
	
	/** Using wrong diacritics **/
	var using_wrong_diacritics = translated.match(wrong_diacritics);
		if(using_wrong_diacritics != null)
			warnings['wrong_diacritics'] = using_wrong_diacritics.length + ' wrong diacritic(s) found: ' + using_wrong_diacritics.toString();
	
	/** Maybe using wrong quotes **/
	var using_wrong_quotes = translated.match(wrong_quotes);
		if(using_wrong_quotes != null)
		{   var i;
			for (i = 0; i < using_wrong_quotes.length; i++) 
              using_wrong_quotes [i] = using_wrong_quotes[i].substring(1)
			warnings['wrong_quotes'] = using_wrong_quotes.length + ' pair' + ( ( i > 1 ) ? 's' : '' ) + ' of wrong quotes: ' + using_wrong_quotes.toString();
		}

		
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
			warnings['placeholders'] = "Missing placeholder(s): " + original_ph.toString();
		} else {
			if(
				original_ph == null &&
				translated_ph != null
			){
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
	

	/** Double spaces **/
	var double_spaces = translated.match(wrong_double_spaces);
	warnings['others'] = (double_spaces != null) ? (double_spaces.length + " double spaces detected" ) : "";

	/** Slash spaces **/
	var slash_spaces = translated.match(wrong_slash_spaces);
	if (slash_spaces != null)
		warnings['others'] += (warnings['others'] != "") ? "<li>"+slash_spaces.length+" / space detected</li>" : slash_spaces.length+" / space detected";

	/** & **/
	var and_symb = translated.match(wrong_and);
	if (and_symb != null)
		warnings['others'] += (warnings['others'] != "") ? "<li>"+and_symb.length+" & detected</li>" : and_symb.length+" & detected";

	
	/** Results **/
	var results = ( warnings['start_space'] != "" ) ? ( '<li>' + warnings['start_space'] + '</li>' ) : '';
    results +=	( warnings['end_char'] != "" ) ? ( '<li>' + warnings['end_char'] + '</li>' ) : '';
	results +=	( warnings['placeholders'] != "" ) ? ( '<li>' + warnings['placeholders'] + '</li>' ) : '';
	results +=	( warnings['wrong_diacritics'] != "" ) ? ( '<li>' + warnings['wrong_diacritics'] + '</li>' ) : '';
	results +=	( warnings['wrong_quotes'] != "" ) ? ( '<li>' + warnings['wrong_quotes'] + '</li>' ) : '';
	results +=	( warnings['others'] != "" ) ? ( '<li>' + warnings['others'] + '</li>' ) : '';
	
	results = ( results == "" ) ? "none" : ( '<ul class="gp-checks-list">' +results + '</ul>');
	
	return results;
}

/** Override (again) some shortcuts */

//if( typeof $gp !== 'undefined'){
function keyboard_shortcuts(){
	$gp.editor.keydown  = ( function( original ) {
		return function( event ) {
			// Shift-Enter = Save.
			if ( 13 === event.keyCode && event.shiftKey ) {
				var $textarea = $( event.target );
				
				
				run_new_translation_checks($gp.editor.current.attr('id'));
				console.log("Keyboard shortcuts working");
				
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
				
				
				$gp.editor.save( $gp.editor.current.find( 'button.translation-actions__save' ) );

			} else {
				return original.apply( $gp.editor, arguments );
			}

			return false;
		}
	})( $gp.editor.keydown );
}
})( jQuery );