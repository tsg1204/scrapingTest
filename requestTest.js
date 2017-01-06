// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {

  // First, we grab the body of the html with request
  //request("https://www.npr.org/sections/politics/", function(error, response, html) {
  //request("http://www.theblaze.com/", function(error, response, html) {
  //request("http://www.foxnews.com/politics.html/", function(error, response, html) {
  //request("http://thehill.com/", function(error, response, html) {
  request("http://rss.cnn.com/rss/cnn_allpolitics.rss", function(error, response, html) {
  //request("http://www.huffingtonpost.com/section/politics", function(error, response, html) {
  //request("http://www.msnbc.com/explore", function(error, response, html) {
  //request("https://www.vice.com/en_us/topic/politics", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

    // Now, we grab every h4 within an article tag, and do the following:
    //NPR
    //$("h2.title").each(function(i, element) {
    //The Hill
    //$("li.views-row").each(function(i, element) {
    //Fox News
    //$("li.article-ct").each(function(i, element) {
    //CNN not working, switched to rss
    $("h4.itemtitle").each(function(i, element) {
    //The Blaze
    //$("article.feed.article").each(function(i, element) {
    //The Huffingtonpost
    //$("div.card").each(function(i, element) {
    //MSNBC
    //$("article.teaser").each(function(i, element) {
    //VICE not working
    //$("div.grid__wrapper__row").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Save the text of the h4-tag as "title"
      //NPR setup
      //result.title = $(this).text();
      //result.link = $(this).children("a").attr("href");
      //The Hill setup
      //result.title = $(this).find("a").text();
      //result.link = "http://thehill.com" + $(this).find("a").attr("href");
      //The FOX News setup
      //result.title = $(this).find("h3").text();
      //result.link = "http://www.foxnews.com" + $(this).find("a").attr("href");
      //CNN setup not working
      result.title = $(this).find("a").text();
      result.link = $(this).find("a").attr("href");
      //The Blaze setup
      //result.title = $(this).find("h3").text();
      //result.link = "http://www.theblaze.com" + $(this).find("a").attr("href");
      //The Huffingtonpost setup
      //result.title = $(this).find("a").text();
      //result.link = $(this).find("a").attr("href");
      //MSNBC setup
      //result.title = $(this).find("a").text();
      //result.link = "http://www.msnbc.com" + $(this).find("a").attr("href");
      //VICE setup not working
      //result.title = $(this).find("h2.grid__wrapper__card__text__title").text();
      //result.link = "https://www.vice.com" + $(this).find("a.grid__wrapper__card").attr("href");
      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);
      console.log(entry);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
  });
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});