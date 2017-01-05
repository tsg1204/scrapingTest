// Grab the articles as a json
// $.getJSON("/articles", function(data) {
//   // For each one
//   for (var i = 0; i < data.length; i++) {
//     // Display the apropos information on the page
//     $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
//   }
// });

$.getJSON('/articles', function(data) {
  console.log(data);
  //for each one
  console.log("data=",data);
  for (var i = 0; i<data.length; i++){
  //display info on page
  if(data[i].note){
      noteExists = '<span style="color: yellow"><sup> *note attached*</sup></span>'
      }else{
        noteExists = "";
    }
   $('#articles').append('<h2><p data-id="' + data[i]._id + '">' + data[i].title + noteExists+'</p></h2>'+'<a href='+data[i].link +' target = "_blank">'+data[i].link+"<br />");
   $('#articles').append("___________");
 }
   $('#articles').append("___________");
});

// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      //$("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
      //$("#notes").append("<button data-id='" + data._id + "' id='deletenote'>Delete</button>");

      //if there's a note in the article
      if(data.note){
        // place the title of the note in the title input
        $('#titleinput').val(data.note.title);
        // place the body of the note in the body textarea
        $('#bodyinput').val(data.note.body);
        $('#notes').append('<button data-id="' + data._id + '" id="deletenote">Delete Note</button>');
        $('#bodyinput,#titleinput').css('background-color', '#99ddff');
      }else{
        $('#notes').append('<button data-id="' + data._id + '" id="savenote">Save Note</button>');
        $('#bodyinput,#titleinput').css('background-color', '#99ddff');
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });
  location.reload();
  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

//When the delete note button is clicked Post to deletenote on server
$(document).on('click', '#deletenote', function(){
  var thisId = $(this).attr('data-id');

  $.ajax({
    method: "POST",
    url: "/deletenote/" + thisId,
  })
    .done(function( data ) {

      console.log(data);
      $('#notes').empty();
    });

  location.reload();
  $('#titleinput').val("");
  $('#bodyinput').val("");

});



