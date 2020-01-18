$(document).ready(function(){
    //This version will use a modal or popup window to display footnotes
    //create content areas for the social buttons and information gathered from the feed
    $(".Abstract").before("<div id='added'><div class='meta'></div><div class='socialBar'></div></div>");
    $(".WordSection1").prepend("<div id='articleHeader'></div>");

    //get feed data - use to grab article metadata
    //Get the slug from the URL
    var slug = window.location.pathname;

    //if the last character is a slash, remove it
    if (slug[slug.length -1] == "/") {
        slug = slug.substring(0, slug.length - 1);
    };


    //get just the slug from the path
    slug = slug.substring(slug.lastIndexOf("/") + 1);
    if (slug.includes('.')) {
        slug = slug.substring(0, slug.lastIndexOf('.'));
    };

    $.ajax({
        url: "https://s3.us-east-1.amazonaws.com/bc-law-library-bclr/bclr-online.json",
        success: function(response) {
            console.log(response);
            var meta = response.filter(obj => {
            return obj.slug === slug
            });
            console.log(meta);
            var PDFLink = meta[0].identifier1;
            var volume = meta[0].volume;
            //get date and format
            var options = {year: 'numeric', month: 'long', day: 'numeric' };
            var date = new Date(meta[0].dateCreated);
            var textDate = date.toLocaleDateString('en-us', options);


            $(".meta").append("<span class='date'>"+textDate+"</span><a class='pdf' href='"+PDFLink+"'>View PDF</a>");
            $("#articleHeader").append("<em>E. Supp. - BCLR Online, Volume "+volume+"</em>");

        },
        error: function(err) {
            console.log("Error loading article metadata");
        }
    });




    //Add the modal div
    var modal = $('<div>');
    $(modal)
        .addClass('modal')
        .attr('ID','bclr-modal')
        .attr('aria-modal','true')
        .attr('role','dialog')
        .appendTo('.WordSection1');



    var modalContent = $('<div>');
    $(modalContent)
        .addClass('modal-content')
        .attr('ID','bclr-modal-content')
        .appendTo('#bclr-modal');

    //button to close modal window
    var closeButton = $('<a>');
        $(closeButton)
            .addClass('closeButton fnbutton')
            .attr('tabindex','0')
            .attr('aria-label','close')
            .text('X')
            .appendTo('#bclr-modal-content')
            
    //previous and next footnote links
    var previous = $('<a>');
    $(previous)
        .addClass('previous fnbutton')
        .attr('tabindex','0')
        .text('< previous')
        .attr('aria-label','previous')
        .appendTo('#bclr-modal-content');

        var next = $('<a>');
    $(next)
        .addClass('next fnbutton')
        .attr('tabindex','0')
        .text('next >')
        .attr('aria-label','next')
        .appendTo('#bclr-modal-content');

    var modalContentInner = $('<div>')
        .addClass('modal-content-inner')
        .attr('ID','bclr-modal-content-inner')
        .appendTo('#bclr-modal-content');


    //Add icons for sharing and replying
    var url = window.location.href;
    var title = $("div.WordSection1 h3").text();
    $(".socialBar").append(
        'Share and react: <a href="https://www.facebook.com/sharer/sharer.php?u=' + url + '" class="icon-facebook"><span class="sr-only">Facebook</span></a>'
        + '<a href="https://twitter.com/intent/tweet?url=' + url + '" class="icon-twitter"><span class="sr-only">Twitter</span></a>'
        + '<a href="https://docs.google.com/forms/d/1J2yCZc9E2fpJwNydVdqn_qoEKIJoLXtVaELuHhv7Y8s/viewform?usp=pp_url&entry.1220397118=' + title + '" class="pencil"><span class="reply">Reply</span></a>'
    );


    //Section migrated to chrome extension
    /*
    //Add a space to the beginning of footnotes for formatting (can move to extension)
    $(".footnoteTextOuter span.footnoteP:first-child").each(function(){
        var $footnote = $(this);
        $footnote.contents().filter(function(){
            return this.nodeType == 3;
        }).wrap("<span class='footnoteText'></span>");
        var $spanToPad = $footnote.find("a.footnote").next();
        $spanToPad.text(" " + $spanToPad.text());
    });

    //Change class of double digit footnotes for alignment purposes (can move to extension)
    $("span.NoterefInText").each(function(){
        if ($(this).text().length > 1){
            $(this).addClass("doubleDigits");
        }
    });
    
    //add aria roles & labels to footnotes for accessibility (can move to extension)
    $('a.footnoteLink').attr('role','doc-noteref');
    $('span.footnoteTextOuter').attr('role','doc-footnote');
    $('a.footnoteTextNew').attr('role','doc-backlink');
    $('.MsoFootnoteReference').parent().attr('aria-label','Footnote');
    $('.AuNoteRefInNote').attr('aria-label','Footnote');
    $('.NoterefInText, .NoterefInNote, .AuNoteRefInText').each(function(){
        var footNumb = $(this).text();
        //console.log(footNumb);
        if (isNaN(footNumb)) {
            footNumb = "";
        }
        footNumb = 'Footnote ' + footNumb;
        $(this).parent().attr('aria-label', footNumb.trim());
    });
    */

    //pass footnote text through anchorme to link URLs
    $('span.footnoteP').each(function(){
        footText = $(this).html();
        $(this).html(anchorme(footText));
    });

    //hide bottom footnote section
    $('span.footnoteDiv').parent().hide();

    $("div.WordSection1 p.Head3").wrapInner("<h5></h5>");

    //Interface actions
    
    //variables
    var lastNote = $(".footnoteLink").length;

    //sub-function: constrain tabbing when modal box is open
    function constrainTabs(){
        $('#bclr-modal a').last().keydown(function(event){
            if (event.keyCode == 9 && !(event.shiftKey)) {
                event.preventDefault();
                $('#bclr-modal a').first().focus();
            }
        });
        $('#bclr-modal a').first().keydown(function(event){
            if (event.keyCode == 9 && event.shiftKey) {
                event.preventDefault();
                $('#bclr-modal a').last().focus();
            }
        });
    }
    

    //sub-function: fix errors in how footnotes display in modal box
    function fixAsterisk(){
        $("#bclr-modal span.allCaps").attr("style","text-transform:uppercase");
        if ($("#bclr-modal a.footnote").is(":empty")) {
            if ($("#bclr-modal span.AuNoteRefInNote").length) {
                $("#bclr-modal span.AuNoteRefInNote").detach().appendTo($("#bclr-modal a.footnote")); //make asterisk a link
            }
        } else if ($("#bclr-modal span.AuNoteRefInNote").length) {
            $("#bclr-modal span.footnoteP:first").contents().filter(function(){
                return this.nodeType == 3;
            }).detach().appendTo($("#bclr-modal a.footnote")); //make sure full copyright statement is linked
            $("#bclr-modal a.footnote").prepend($("#bclr-modal span.AuNoteRefInNote")); //move asterisk to front
        } else {
            /*if ($("#bclr-modal span.footnoteP:first").contents().eq(1).text().substring(0,1) == " ") {
                var trimmed = $("#bclr-modal span.footnoteP:first").contents().eq(1).text().replace(/^\s+/g, '');
                $("#bclr-modal span.footnoteP:first").contents().eq(1).wrap("<span class='footnoteInterior'></span>");
                $("#bclr-modal span.footnoteInterior").text(trimmed); //remove extra whitespace
            } */
            if ($("#bclr-modal span.footnoteP:first").contents().eq(1).text().substring(0,1) != " ") {
                $("#bclr-modal span.footnoteP:first").contents().eq(1).wrap("<span class='footnoteInterior'></span>");
                $("#bclr-modal span.footnoteInterior").prepend("<span class='padding'> </span>");
            }
            if ($("#bclr-modal span.footnoteP:first").contents().eq(1).text().substring(0,3) == 'See' || $("#bclr-modal span.footnoteP:first").contents().eq(1).text() == 'Id.') {
                $("#bclr-modal span.footnoteP:first").contents().eq(1).wrap("<i></i>")
            }
        };
    }

    //sub-function: clicking the footnote closes the modal box and goes to the footnote in the text
    function backLink(num,mod) {
        $('#bclr-modal a.footnote').click(function(event){
            var footnoteRef = $("a.footnoteLink[name=_ftnref" + (num + mod) + "]");
            $("#bclr-modal-content-inner").empty();
            $('#bclr-modal').hide();
            $(footnoteRef).focus();
        });
    }

    //clicking footnote links opens the modal box and adds the content of the footnote
    $("a.footnoteLink").click(function(event){
        var name = $(this).attr("href").substring(1);
        var num = parseInt(name.substring(4)); //extract number from name itself
        var footnote = $("a.footnote[name=" + name + "]") //footnote associated with the link
        event.preventDefault(); //This removes default anchor functionality
        var footnoteInner = $(footnote).parent().parent().clone();
        $("#bclr-modal-content-inner").empty().append(footnoteInner);
        if (num == lastNote) {
            $("a.next").hide();
        }
        else {
            $("a.next").show();
        }
        if (name == '_ftn1') {
            $("a.previous").hide();
        }
        else {
            $("a.previous").show();
        }
        $("#bclr-modal").show();

        //move focus to close button
        $("#bclr-modal a.closeButton").focus();

        fixAsterisk();

        backLink(num,0);

        constrainTabs();
    });

    //next and previous buttons
    $("a.previous").click(function(event){
        var name = $("#bclr-modal a.footnote").attr("href").substring(1);
        var num = parseInt(name.substring(7))-1; //we want the number before
        var footnote = $("a.footnote[name=_ftn" + num + "]") //footnote associated with the link
        event.preventDefault(); //This removes default anchor functionality
        var footnoteInner = $(footnote).parent().parent().clone();
        $("#bclr-modal-content-inner").empty().append(footnoteInner);
        if (num == lastNote) { //this case should never actually happen
            $("a.next").hide();
        }
        else {
            $("a.next").show();
        }   
        if (num == 1) {
            $("a.previous").hide();
            $("a.next").focus(); //move focus to next button
        }
        else {
            $("a.previous").show();
        }

        fixAsterisk();
        
        backLink(num,1);

        constrainTabs();
    });
    $("a.next").click(function(event){
        var name = $("#bclr-modal a.footnote").attr("href").substring(1);
        var num = parseInt(name.substring(7))+1; //we want the number after
        var footnote = $("a.footnote[name=_ftn" + num + "]") //footnote associated with the link
        event.preventDefault(); //This removes default anchor functionality
        var footnoteInner = $(footnote).parent().parent().clone();
        $("#bclr-modal-content-inner").empty().append(footnoteInner);
        if (num == lastNote) {
            $("a.next").hide();
            $("a.previous").focus(); //move focus to previous button
        }
        else {
            $("a.next").show();
        }
        if (num == 1) { //this case should never actually happen
            $("a.previous").hide();
        }
        else {
            $("a.previous").show();
        }

        fixAsterisk();

        backLink(num,-1);

        constrainTabs();
    });


    //enter keypress activates next, previous, and close buttons
    $('a.next, a.previous, a.closeButton').keypress(function(event) {
        if (event.keyCode == 13) {
            $(this).click();
        }
    })


    //modal box closing function
    function closeBox() {
        var name = $("#bclr-modal a.footnote").attr("href").substring(1);
        var num = parseInt(name.substring(7)); //extract number from name itself
        var footnote = $("a.footnoteLink[name=_ftnref" + num + "]"); //footnote marker associated with the link
        $(footnote).focus(); //return focus to footnote link in the text
        $("#bclr-modal-content-inner").empty();
        $('#bclr-modal').hide();
        
    }

    //close button closes modal div
    $('.closeButton').click(function(){
        closeBox();
    });

    //esc key closes modal box
    $('body').keydown(function(event) {
        if (event.keyCode == 27 && $('#bclr-modal').is(':visible')) {
            closeBox();
        }
    });

    //clicking outside the modal box closes it
    $('#bclr-modal').on('click', function(e) {
        if (e.target !== this)
            return;
        closeBox();
    }); 


});