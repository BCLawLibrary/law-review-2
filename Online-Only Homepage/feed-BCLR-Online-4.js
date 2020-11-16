// on BCLR E. Supp. Online homepage
// uses JSON stored on AWS to retrieve essay data
// uses JSON pulled from google sheets to retrieve response data
//last updated 10/2020 - update to Google Sheets API V4

function authorFirstLast(data, type, row) {
  if (data) {
    return data.split(", ")[1] + " " + data.split(", ")[0];
  }
  else {
    return "";
  }
}

//function to clean JSON file produced by Google Sheets
function jsonStrip(results) {
  //console.log(results);
  var entries = results.feed.entry;
  //console.log(entries);
  var output = [];
  for (var step = 0; step < entries.length; step++) {
      var testObj = {};
      var newKeys = [];
      var newVals = [];
      for (var step2 = 0; step2 < Object.keys(entries[step]).length; step2++) {
          var keyName = Object.keys(entries[step])[step2];
          var myReg = /\bgsx\$/;
          if (myReg.test(keyName)) {
              absReg = /descriptionabstract/;
              dateReg=/datecreated/;
              if (absReg.test(keyName)) {
                keyNameCap = keyName.replace("abstract","Abstract");
                newKeys = keyNameCap.substring(4);
              }
              else if (dateReg.test(keyName)) {
                keyNameCap = keyName.replace("created","Created");
                newKeys = keyNameCap.substring(4);
              }
              else {
                newKeys = keyName.substring(4);
              }
              newVals = entries[step][keyName]["$t"];
              testObj[newKeys] = newVals;
          };
      };
      output.push(testObj);
  };
  //console.log(output);
  return output;
}

var columns = [
  //Volume
    {"title": "Volume", "data": "volume", "name": "volume",  className: "volume", render: function (data,type,row){

      if ( type === 'display' && data != "") {return "Volume "+ data}
      else {return data;}
    }},

  //Type
  {"data": "type", "title": "Type", className: "contentType",
  //if the article type ends in s remove the s to create the display text
  render: function (data,type,row){return data.replace(/\bComment/, "Response").replace(/s\b/, "");}},

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

function create(data1, data2) {
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

	    } //end of drawCallback
    }); //End of var table

    if (data2) {  //test that response data loaded correctly
      //initialize the 2nd DataTable object and put settings in
      var table = $("#bclr-table2").DataTable({
        "autoWidth": false,
        "data": data2,
        "columns": columns,
        //order on date
        "order": [[13, "desc"]],
        "dom":"ftir",
        "language": {search:"", searchPlaceholder:"Search responses", info:"Showing _START_ to _END_ of _TOTAL_", infoFiltered:""},
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
          //hide more button if less than six entries
          tableLen = $("#bclr-table2 tr").length;
          if (tableLen < 7) {
            $("#more2").hide();
          }
        }, 	//Does anything go here?
        //---------Callback!-----//

        "drawCallback": function(settings) {

          // More2 button shows 10 additional records
          var table = $('.dataTable').DataTable();
          var tableLength = table.page.len();
          $('#more2').unbind().click(function() {
            firstLen = $("#bclr-table2 tr").length;
            table.page.len(tableLength+10).draw();
            lenAdded = $("#bclr-table2 tr").length - firstLen;
            console.log(lenAdded);
            if (lenAdded != 10) {
              $("#more2").hide();
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
            
        } //end of drawCallback
      }); //End of var table2
    };

  }); //(document).ready end
} //end of create()

//Get essay data from S3 Bucket
$.ajax({
  url: "https://s3.us-east-1.amazonaws.com/bc-law-library-bclr/bclr-online.json",
  success: function(response) {
    var data1 = response;
    //console.log(data1);

    //Get response data from google sheets
    $.ajax({
      //url: "https://www.bc.edu/content/dam/bc1/schools/law/js/bclr/bclr-responses.json",
      //url: "https://spreadsheets.google.com/feeds/list/1bnHcCgRlEZxmDgUSBfrd6KRNzlwFHeMTBlQ15Rog4SM/od6/public/values?alt=json",
      url: "https://sheets.googleapis.com/v4/spreadsheets/1bnHcCgRlEZxmDgUSBfrd6KRNzlwFHeMTBlQ15Rog4SM/values/A:T?key=AIzaSyD8Y28YJpVhE4XlVlOoA74Ws47YdPz5nGA",
      success: function(json) {
        var data2 = json["values"]; //spreadsheet data lives in an array with the name values
        //rewrite data to an object with key-value pairs.
        data2 = data2.map(function(n,i) {
          var dataObj = {
            title:n[0],
            creator0:n[1],
            creator1:n[2],
            creator2:n[3],
            creator3:n[4],
            creator4:n[5],
            descriptionAbstract:n[6],
            dateCreated:n[7],
            type:n[8],
            identifier0:n[9],
            identifier1:n[10],
            volume:n[11],
            issue:n[12],
            subject0:n[13],
            subject1:n[14],
            subject2:n[15],
            subject3:n[16],
            subject4:n[17],
            spage:n[18],
            slug:n[19]
          }
          return dataObj;
        });
        data2.splice(0,1); //remove the first row, which contains the orginal column headers
        create(data1,data2); //send to callback
      },
      error: function(err) {
        create(data1, false); //send to callback, with response section disabled
        $("#response-section").html("<p><strong>There was an error loading the data. Please try refreshing the page.</strong></p>");
      }
    });
  },
  error: function(err) {
    $("#bclr-wrapper").html("<p><strong>There was an error loading the data. Please try refreshing the page.</strong></p>");
    $('#loading').fadeOut(200, function() {
      $("#bclr-wrapper").fadeIn(600);
    });
  }
});
