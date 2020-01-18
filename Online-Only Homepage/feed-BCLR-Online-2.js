function authorFirstLast(data, type, row) {
  if (data) {
    return data.split(", ")[1] + " " + data.split(", ")[0];
  }
  else {
    return "";
  }
}

var columns = [
  //Volume
    {"title": "Volume", "data": "volume", "name": "volume",  className: "volume", render: function (data,type,row){

      if ( type === 'display') {return "Volume "+ data}
      else {return data;}
    }},

  //Type
  {"data": "type", "title": "Type", className: "contentType",
  //if the article type ends in s remove the s to create the display text
  render: function (data,type,row){return data.replace(/s\b/, "");}},



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

function create(data) {
  //select main div and put a table there
  //use bootstrap css to customize table style: http://getbootstrap.com/css/#tables

  $(document).ready(function(){
    $('#bclr-content').html('<table cellpadding="0" cellspacing="0" border="0" class="table table-condensed table-responsive" id="bclr-table"></table>');

    //Fade out the loading graphic
    $('#loading').fadeOut(200, function() {
      $("#bclr-wrapper").fadeIn(600);
    });
    //initialize the DataTable object and put settings in
    var table = $("#bclr-table").DataTable({
      "autoWidth": false,
      "data": data,
      "columns": columns,
      //order on date
      "order": [[13, "desc"]],
      "dom":"ftir",
	    "language": {search:"", searchPlaceholder:"Search online-only essays", info:"Showing _START_ to _END_ of _TOTAL_", infoFiltered:""},
      "pagingType": "simple",//no page numbers
		  "pageLength": 6,
	    "columnDefs": [{"visible": false, "targets": [8,11,12,15]}], // This says what columns are hidden
      //"searching": false, //remove search bar
	    initComplete: function () {
        //add commas between authors
        $("td.author").each(function(){
          $thisAuthor = $(this);
          if($thisAuthor.next("td.author").text()){
            $thisAuthor.text($thisAuthor.text() + ",");
          }
        });
      }, 	//Does anything go here?
      //---------Callback!-----//
    	"drawCallback": function(settings) {


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

	    } //end of drawCallback
    }); //End of var table
  }); //(document).ready end
} //end of create()

//Get data from S3 Bucket
$.ajax({
  url: "https://s3.us-east-1.amazonaws.com/bc-law-library-bclr/bclr-online.json",
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
