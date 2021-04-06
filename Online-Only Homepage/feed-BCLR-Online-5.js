// on BCLR E. Supp. Online homepage
// uses JSON stored on AWS to retrieve essay, symposium, response data
//last updated 3/2021 - added sortable dropdown

function authorFirstLast(data, type, row) {
  if (data) {
    return data.split(", ")[1] + " " + data.split(", ")[0];
  }
  else {
    return "";
  }
}


function checkHash() {
  //load correct page/view based on the hash URL
  var table = $('.dataTable').DataTable();
  var hash = window.location.hash;
  var type = "";

  if (hash) {
    var type = hash.replace("#","");
    //catch bug if page is loaded on a hash - make dropdown match
    $('#type').val(type);
  } else {
    $('#type').val("default");
  }

  table
    .search("");
  table
    .columns()
    .search("");
  table
    .page
    .len(6);
  table
    .columns(1)
    .search(type)
    .draw();

  // Only show more button when there are additional records to display
  if (table.page.len() >= table.page.info().recordsDisplay) {
      $('#more').hide();
  }
  else {
      $('#more').show();
  };
  
  console.log('checkHash called');
} // end checkHash

var columns = [
  //Volume
    {"title": "Volume", "data": "volume", "name": "volume",  className: "volume", render: function (data,type,row){

      if ( type === 'display' && data != "") {return "Volume "+ data}
      else {return data;}
    }},

  //Type
  {"data": "type", "title": "Type", className: "contentType",
  //if the article type ends in s remove the s to create the display text
    render: function (data,type,row){
      //console.log(data.replace("Miscellaneous", "Response").replace(/s\b/, ""));
      return data.replace("Miscellaneous", "Response").replace(/s\b/, "");
    }
  },

  //Authors
  {"data": "creator0", "title": "Author", className: "author",
    render: authorFirstLast},
  {"data": "creator1", "title": "Author", className: "author",
    render: authorFirstLast},
  {"data": "creator2","title": "Author", className: "author",
    render: authorFirstLast},
  {"data": "creator3", "title": "Author", className: "author",
    render: authorFirstLast},
  {"data": "creator4", "title": "Author", className: "author",
    render: authorFirstLast},

  //Title
  {"data": "title", "title": "Title", className: "title",
  render: function (data,type,row){
    var titleURL = "https://www.bc.edu/bc-web/schools/law/academics-faculty/law-reviews/bclr/e-supp-online/" + row.slug;
    return '<h2 tabindex=0 role="link"><a href=' + titleURL +'>' + data + '</a></h2>';
  }},

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

  //Issue
  {"title": "Issue", "data": "issue", "name": "issue"},

  //First Page
  {"data": "spage", "title": "First Page", "name": "firstPage", "type": "num-fmt"},

  //Date Created - date uploaded to Digital Commons. Used for first sort
  {"data": "dateCreated", "title": "Date Created", "name": "dateCreated", className: "date",
      render: function (data,type,row){
        if ( type === 'display') {
          //get date and format
          var options = {year: 'numeric', month: 'long', day: 'numeric' };
          var date = new Date(data);
          return date.toLocaleDateString('en-us', options);
        } else {return data;}
      }
  },

  //Social
  {"data": "slug", "title": "Social", "name": "social", className: "social",
    render: function (data,type,row){
      var articleURL = "https://www.bc.edu/bc-web/schools/law/academics-faculty/law-reviews/bclr/e-supp-online" + data;
      return '<div class="social-icons"><a href="https://www.facebook.com/sharer/sharer.php?u=' + articleURL + '" class="social-icon icon-facebook"><span class="sr-only">Facebook</span></a>'
      + '<a href="https://twitter.com/intent/tweet?url=' + articleURL + '" class="social-icon icon-twitter"><span class="sr-only">Twitter</span></a>'
      + '<a href="https://docs.google.com/forms/d/1J2yCZc9E2fpJwNydVdqn_qoEKIJoLXtVaELuHhv7Y8s/viewform?usp=pp_url&entry.1220397118=' + articleURL + '" class="social-icon icon-pencil"><span class="sr-only">Reply</span></a></div>';
    }
  },

  {"data": "slug", "title": "Slug", "name": "slug"}];

//---Function code starts here -----//

function create(data1) {
  //select main div and put a table there
  //use bootstrap css to customize table style: http://getbootstrap.com/css/#tables

  $(document).ready(function(){
    $('#bclr-content').html('<table cellpadding="0" cellspacing="0" border="0" class="table table-condensed table-responsive" id="bclr-table"></table>');
    $('#bclr-content2').html('<table cellpadding="0" cellspacing="0" border="0" class="table table-condensed table-responsive" id="bclr-table2"></table>');

    //Fade out the loading graphic
    $('#loading').fadeOut(200, function() {
      $("#bclr-wrapper").fadeIn(600);
    });
    //initialize the DataTable object and put settings in
    var table = $("#bclr-table").DataTable({
      "autoWidth": false,
      "data": data1,
      "columns": columns,
      //order on date
      "order": [[13, "desc"]],
      "dom":"ftir",
	    "language": {search:"", searchPlaceholder:"Search online-only content", info:"Showing _START_ to _END_ of _TOTAL_", infoFiltered:""},
      "pagingType": "simple",//no page numbers
		  "pageLength": 6,
	    "columnDefs": [{"visible": false, "targets": [8,11,12,15]}], // This says what columns are hidden
      //"searching": false, //remove search bar
	    initComplete: function () {
        //create sorting drop-down
        $('div#bclr-table_filter').wrap('<div id="bclr-table-topbar"></div>');
        $('div#bclr-table_filter').after('<div id="type-select"><label>View: <select id="type" name="type"></select></label></div>');
        //add values to sorting drop-down
        this.api().columns(1).every( function () {
          var column = this;
          $('#type').append( '<option value="default">All Content</option>' );
          column.data().unique().sort().each( function(d,j) {
            $('#type').append( '<option value="'+d.toLowerCase().split(' ')[0]+'">'+d+'s</option>' );
          });
        });
        //add commas between authors
        $("td.author").each(function(){
          $thisAuthor = $(this);
          if($thisAuthor.next("td.author").text()){
            $thisAuthor.text($thisAuthor.text() + ",");
          }
        });
 
        //add aria-label to search bar
        $('div#bclr-table_filter input').attr('aria-label','Search');

        //load correct page on back or forward browser button
        window.onpopstate = function(event) {
          if (window.location.hash == "pagecontent") {}//If the user uses the skip navigation link, follow the default behavior
          else {
            checkHash();
            table.draw();}
        }
        //load correct page if arrived to a hash
        var hash = window.location.hash;
        if (hash) {
          $('#type').val(hash.replace('#',''));
          //console.log('loaded on hash');
          checkHash();
        } else {
          $('#type').val('default');
          //console.log('loaded on default');
          checkHash();
        }

        //hide more button if less than six entries
        tableLen = $("#bclr-table tr").length;
        if (tableLen < 7) {
          $("#more").hide();
        }
      }, 	//Does anything go here?
      //---------Callback!-----//
    	"drawCallback": function(settings) {

      	// More button shows 10 additional records
      	var table = $('.dataTable').DataTable();
        var tableLength = table.page.len();
      	$('#more').unbind().click(function() {
          firstLen = $("#bclr-table tr").length;
          table.page.len(tableLength+10).draw();
          lenAdded = $("#bclr-table tr").length - firstLen;
          console.log(lenAdded);
          if (lenAdded != 10) {
            $("#more").hide();
          }
      	});

        //Make enter keypress produce click
      	$('span.span-x, .title h2, .itemBack a, #e-supp h2, #e-supp h3').unbind('keypress').keypress(function(e) {
      		var key = e.which;
      		if (key == 13) {
    		    $(this).click();
    		    return false;
          }
    	  });

        //Event listener to the volme drop-down to redraw on change
        $('#type').unbind().change( function() {
          if ($(this).val()=="default") {
            history.pushState("", document.title, window.location.href.split('#')[0]);
            //console.log('default detected');
            checkHash();
          }
          else {
            type=$(this).val();
            history.pushState("", document.title, "#"+type);
            //console.log('hash detected');
            checkHash();
          }
        });

        //console.log('drawcallback called');
	    } //end of drawCallback
    }); //End of var table

  }); //(document).ready end
} //end of create()

//Get essay data from S3 Bucket
$.ajax({
  url: "https://s3.us-east-1.amazonaws.com/bc-law-library-bclr/bclr-online.json",
  success: function(response) {
    var data1 = response;
    //console.log(data1);
    create(data1);
  },
  error: function(err) {
    $("#bclr-wrapper").html("<p><strong>There was an error loading the data. Please try refreshing the page.</strong></p>");
    $('#loading').fadeOut(200, function() {
      $("#bclr-wrapper").fadeIn(600);
    });
  }
});
