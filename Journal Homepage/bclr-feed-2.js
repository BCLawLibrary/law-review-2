var columns = [

    //Type
    {"data": "type", "title": "Type", className: "contentType",
    //if the article type ends in s remove the s to create the display text
    render: function (data,type,row){return data.replace(/s\b/, "");}},

    //Title
    {"data": "title", "title": "Title", className: "title",
    render: function (data,type,row){return '<h2 tabindex=0 role="link">' + data + '</h2>';}},

    //Authors
    {"data": "creator0", "title": "Author", className: "author"},
    {"data": "creator1", "title": "Author", className: "author"},
    {"data": "creator2", "title": "Author", className: "author"},
    {"data": "creator3", "title": "Author", className: "author"},
    {"data": "creator4", "title": "Author", className: "author"},

    //Issue
    {"title": "Issue", "data": "issue", "name": "issue", className: "issueInItem",
    render: function (data,type,row){
      if ( type === 'display') {
        if (data.substring(0,2) < 59) {
            display = data.replace(":6",":E.Supp.");}
        else {
          display = data.replace(":9",":E.Supp.");}
        return '<a class="issueLinkInItem" href="#" issue="'+data+'">Boston College Law Review ' +display+'</a>';
      }
      else {return data;}}},

    //Date Created - date uploaded to Digital Commons. Used for first sort
    {"data": "dateCreated", "title": "Date Created", "name": "dateCreated", className: "dateCreated",
      render: function (data,type,row){
        if ( type === 'display') {
        //get date and format
        var options = {year: 'numeric', month: 'long', day: 'numeric' };
        var date = new Date(data);
        return date.toLocaleDateString('en-us', options);
        }
        else {return data;}}},

    //Short Abstract
    {"data": "descriptionAbstract", "title": "Blurb", className: "shortAbstract",
    //don't add an elipsis if the abstract is not truncated
    //Cut off at next space once we hit 128 chars
    render: function (data, type, row) {
      if (data.length > 127) {return data.substring(0, data.indexOf(" ",128))+"...";}
      else {return data;}}},

    //Abstract
    {"data": "descriptionAbstract", "title": "Abstract", className: "abstract"},

    //Link
    {"data": "identifier1", "title": "Link", className: "link",
    render: function (data,type,row){
      if ( type === 'display') {return '<a href="' + data + '">View PDF</a>';}
      else {return data;}}},

    //Volume
    {"title": "Volume", "data": "volume", "name": "volume"},



    //First Page
    {"data": "spage", "title": "First Page", "name": "firstPage", "type": "num-fmt"},

    //BCLR Online Badge
    {"data": "spage", "title": "E. Supp.", "name": "E. Supp.", className: "badge bclrOnline",
    render: function (data,type,row){return data.replace(/[0-9]/g, '');}},

    //slug - used to create direct links to E.Supp. - BCLR Online essays
    {"data": "slug", "title": "slug", "name": "slug", "className":"slugCell",
    render: function (data,type,row){
      if ( type === 'display') {return '<a href="bclr/e-supp-online/' + data + '">Read Essay</a>';}
      else {return data;}}}
  ];

  function checkHash() {
      //load correct page/view based on the hash URL
      var table = $('.dataTable').DataTable();
      $("#bclr-wrapper, #volume").removeClass();//remove any special display classes
      $('#volume').val('default');
      $('.view-title').text('');
      $('#issue-wrapper, #searching, #search-all, #search-archive, .span-x, .dataTables_info, #more').hide();
      $('#bclr-table_filter input').unbind('focus').focus(function() {
                  $('#searching, #search-all, .span-x').show();
              });
      var hash = window.location.hash;

      if (hash) {
          $('.responsive-columns.section').slideUp(500);
          var pageType = hash.match(/#(.*)\//).pop();
          if (pageType == "item") {
              window.scrollTo(0, 0);
              var itemNumber = hash.replace("#item/","");
              table
                  .search("");
              table
                  .columns()
                  .search("");
              table
                  .page
                  .len(10);
              table
                  .columns(11)
                  .search(itemNumber)
                  .draw();
              $("#bclr-wrapper")
                  .removeClass()
                  .addClass("item");
              $('#bclr-table tr .title')
                  .unbind(); //unbind the title on the item display
              $('html, body').animate({
                  scrollTop: $('body').offset().top
              }, 0);
          }
          else if (pageType == "issue") {
              table
                  .search("");
              table
                  .columns()
                  .search("");
              table
                  .page
                  .len(10);
              issue = hash.replace("#issue/","");
              table
                  .column(7)
                  .search(issue)
                  .draw();
              $('#volume').val(issue);
              $("#bclr-wrapper")
                  .removeClass();
              $('#volume')
                  .addClass('issue');
              var displayIssue = "Volume "+issue.replace(':',', Issue ')
              if (issue.substring(0,2) < 59) {
                          displayIssue = displayIssue.replace(", Issue 6",", Electronic Supplement");
                      }
              else {
                          displayIssue = displayIssue.replace(", Issue 9",", Electronic Supplement");
                      };
              $('.view-title')
                  .text(displayIssue);
              $('#issue-wrapper, .dataTables_info')
                  .show();
      }

      else if (pageType == "recent") {
          type = hash.replace("#recent/","");
            if (type == "issue") {
                var latestText = $('#volume option:nth-child(2)').text();
                if (latestText.includes('E.Supp.')) { //Latest issue does not include E.Supp.
                        var latest = $('#volume option:nth-child(3)').val();
                    }
                else {
                        var latest = $('#volume option:nth-child(2)').val();
                }
                $('#volume').val(latest);
                history.pushState("", document.title, "#issue/"+latest);
                checkHash();
            }
            else if (type == "E.-Supp.") {
                var latestText = $('#volume option:contains(E.Supp.)').first().text();
                if (latestText.includes('E.Supp.')) { //Make sure this is the E.Supp.
                        var latest = $('#volume option:contains(E.Supp.)').first().val();
                        $('#volume').val(latest);
                        history.pushState("", document.title, "#issue/"+latest);
                        checkHash();
                    }
            }

            else {//Show generic view - most recent items
                table
                    .search("");
                table
                    .page
                    .len(10);
                table
                    .columns()
                    .search("")
                    .draw();
                $("#bclr-wrapper")
                    .removeClass();
                $('.view-title')
                    .text('All Recent Volumes');
                $('#issue-wrapper, .dataTables_info')
                    .show();
                $('#bclr-table_filter input').unbind('focus').focus(function() {
                    $('#searching, #search-archive, .span-x').show();
                });
            }
        }
        // Only show more button when there are additional records to display - placed here because more button should not display when there is no hash/on the homepage
        if (table.page.len() >= table.page.info().recordsDisplay) {
            $('#more').hide();
        }
        else {
            $('#more').show();
        };
      }
      else {//if there is no hash or the hash is invalid, show the homepage
          table
              .search("");
          table
              .page
              .len(5);
          table
              .columns()
              .search("")
          table
              .columns(0)
              .search("Article")
              .draw();
          $('#bclr-table_filter input').focus(function() {
              history.pushState("", document.title, "#recent/");
              checkHash();
              $('#searching, #search-archive, .span-x').show();
          });
          $('.view-title')
              .text('Recent Articles');
          $('#issue-wrapper')
              .show();
          $("#bclr-wrapper")
              .removeClass()
              .addClass("home-table");
          $('.responsive-columns.section').slideDown(500);
          $('.col-md-3.col-sm-8.col-xs-12').show();
      };
      $('html, body').animate({
          scrollTop: $("body").offset().top
      }, 500);
      $('#e-supp').fadeIn(600);
  };

  function create(data) {
      //select main div and put a table there
      //use bootstrap css to customize table style: http://getbootstrap.com/css/#tables

    $(document).ready(function(){
      $('#bclr-content').html('<table cellpadding="0" cellspacing="0" border="0" class="table table-condensed table-responsive" id="bclr-table"></table>');
      //initialize the DataTable object and put settings in
      var table = $("#bclr-table").DataTable({
        "autoWidth": false,
        "data": data,
        "columns": columns,
        //order on date, then volume number, then issue, then first page
        "order": [[8, "desc"],[12, "desc"],[7, "desc"],[13, "asc"]],
          "dom":"ftir",
          "language": {search:"", searchPlaceholder:"Search BCLR", info:"Showing _START_ to _END_ of _TOTAL_", infoFiltered:""},
        "pagingType": "simple",//no page numbers
            "pageLength": 2,
          "columnDefs": [{"visible": false, "targets": [12,13,14]}],
          initComplete: function () {
          this.api().columns(7).every( function () {//create volume drop-down
            var column = this;
                  $('#volume').append( '<option value="default">All</option>' );
            column.data().unique().sort().reverse().each( function(d,j) {
                      var display
                        if (d.substring(0,2) < 59) {
                                display = d.replace(":6",":E.Supp.");}
                        else {
                            display = d.replace(":9",":E.Supp.");}
              $('#volume').append( '<option value="'+d+'">'+display+'</option>' )
            });
          });
                $('#volume').append( '<option value="more">More</option>' );
              //add issue header
              $('#bclr-table_filter').after('<div id="issue-wrapper"><div id="issue-inner"><div class="title-text"><span id="searching">Searching </span><span class="view-title"></span></div><div class="buttons"><button class="btn btn-default" id="search-all">Search All</button><button class="btn btn-default" id="search-archive">Search Archive</button><button class="span-x"> X</button></div></div></div>');
              //load correct page on back or forward browser button
              window.onpopstate = function(event) {
                  if (window.location.hash == "pagecontent") {}//If the user uses the skip navigation link, follow the default behavior
                  else {
                  checkHash();
                  table.draw();}
              }
              //add back button for item view
              var div = $('<div>');
                $(div)
                    .addClass('itemBack')
                    .html('<a tabindex=0 role="link">Back</a>');
                $('#bclr-table_wrapper')
                    .prepend(div);
              $('#loading').fadeOut(200, function() {
                  $('#bclr-wrapper').fadeIn(600);
              });
        }, 	//end of initComplete
        //---------Callback!-----//
          "drawCallback": function(settings) {
            // By default, the back button (displayed on article pages only) returns to the default view.
            $('.itemBack').unbind().click(function() {
                    history.pushState("", document.title, window.location.pathname+ window.location.search);
                    checkHash();
                });
            // Click on article title opens a new view with information about that article
            $('#bclr-table tr .title').unbind().click(function(event) {
                var article=$(this).parent().find('.link a').attr("href");
                var itemNumber = article.match(/article\=(.*)\&context/).pop()
                var item = "#item/"+itemNumber;
                history.pushState("", document.title, item);
                checkHash();
                // If the article view was entered from a different page, the back button will return to that page, instead of going to the default view.
                $('.itemBack').unbind().click(function() {
                    window.history.back();
                });
            });
            // More button shows 10 additional records
            var table = $('.dataTable').DataTable();
            var tableLength = table.page.len();
            $('#more').unbind().click(function() {
                table.page.len(tableLength+10).draw();
            });
            //Make enter keypress produce click
            $('span.span-x, .title h2, .itemBack a, #e-supp h2, #e-supp h3').unbind('keypress').keypress(function(e) {
                var key = e.which;
                if (key == 13) {
                  $(this).click();
                  return false;
            }
            });
          //issue links on items
          $('.issueLinkInItem').unbind().click(function(e){
            e.preventDefault();
            issue=$(this).attr('issue');
            history.pushState("", document.title, "#issue/"+issue);
            checkHash();
          });

          },
         //end of drawCallback
        "createdRow": function( row, data, dataIndex ) {
         $(row).addClass(data.type);

       }
      }); //End of var table

        //Event listener to the volme drop-down to redraw on change
      $('#volume').unbind().change( function() {
            if ($(this).val()=="more") {
                window.location="http://lawdigitalcommons.bc.edu/bclr/all_issues.html";
            }
            else if ($(this).val()=="default") {
                history.pushState("", document.title, "#recent/");
                checkHash();
            }
            else {
              volume=$(this).val();
              history.pushState("", document.title, "#issue/"+volume);
              checkHash();
            }
      });


        $('.subjects .subject').unbind().click(function(){ //make subject badges filter the table
            var subject=$(this).text().replace(" ","-");
            history.pushState("", document.title, "#focus/"+subject);
            checkHash();
        });
        $('.subjects .recent, #search-all').unbind().click(function(){ //All button
            $('#volume').val('default');
            history.pushState("", document.title, "#recent/");
            checkHash();
        });
        $('.subjects .bclrOnline').unbind().click(function(){ //E. Supp. button
            $('#volume').val('default');
            history.pushState("", document.title, "#recent/E.-Supp.");
            checkHash();
        });
        $('.subjects .latest').unbind().click(function(){ //Latest issue button
            var latestText = $('#volume option:nth-child(2)').text();
            var n = 2;
            while (latestText.includes('E.Supp.')) { //skip down list until you reach a non-E.Supp. issue
                n++
                latestText = $('#volume option:nth-child(' + n + ')').text();
            }
            var latest = $('#volume option:nth-child(' + n + ')').val();

            $('#volume').val(latest);
            history.pushState("", document.title, "#issue/"+latest);
            checkHash();
        });
        $('.subjects .home').unbind().click(function(){ //BCLR Home Button
            $('#volume').val('default');
            history.pushState("", document.title, window.location.pathname+ window.location.search);
            checkHash();
        });
        $('#search-all').unbind().click(function(){ //Search all button
            $('#volume').val('default');
            history.pushState("", document.title, "#recent/");
            checkHash();
            $('#bclr-table_filter input').focus();
        });
        $('#search-archive').unbind().click(function() {
            window.location="http://lawdigitalcommons.bc.edu/do/search/?q=&fq=virtual_ancestor_link%3A%22http%3A%2F%2Flawdigitalcommons.bc.edu%2Fbclr%22";
        });
        $('.span-x').click(function() {
            $('#bclr-table_filter input').val('');
            $('#searching, #search-all, #search-archive, .span-x').hide();
        });
        checkHash();

        //E. Supp. feature on home page
        const allData = data;//uses data directly from JSON, rather than DataTables API

        var comments = allData.filter(function (el) {
            return (el["type"] == "Essay");
        });
      comments = comments.filter(function (el) {
        return (el["spage"].indexOf("E. Supp.") >= 0);
      });

        comments.sort(function(a, b) {
          var dateA = a["dateCreated"]; // ignore upper and lowercase
        var dateB = b["dateCreated"]; // ignore upper and lowercase
          if (dateA < dateB) {
              return 1;
            }
            if (dateA > dateB) {
                return -1;
            }
          // dates must be equal
            return 0;
        });
    //only include 10 most recent essays - a random item will display
       comments = comments.slice(0,10);
     console.log(comments);
        var rand = comments[Math.floor(Math.random() * comments.length)];
        var title = $('<h2>');
        title
            .html(rand.title)
            .addClass('e-supp-title')
            .attr('tabindex', 0, 'role','link')
            .appendTo('#e-supp');
      $('h2.e-supp-title').wrapInner("<a class='e-supp-link' href='bclr/e-supp-online/"+rand.slug+"'></a>");
        var author = $('<p>')
        author
            .text(rand.creator0)
            .addClass('author')
            .appendTo('#e-supp');

        $('#e-supp h3 a').attr('href', 'bclr/e-supp-online');
    }); //(document).ready end
  } //end of create()

  //Get data from S3 Bucket
  $.ajax({
    url: "https://s3.us-east-1.amazonaws.com/bc-law-library-bclr/bclr.json",
    success: function(response) {
      create(response);
    },
    error: function(err) {
      $("#bclr-wrapper").html("<p><strong>There was an error loading the data. Please try refreshing the page.</strong></p>");
      $('#loading').fadeOut(200, function() {
        $("#bclr-wrapper").fadeIn(600);
      });
    }
  });
