var express = require("express"),
    request = require("request"),
    Book = require("../models/books"),
    BestSelling=require("../models/bestSelling");
var router = express.Router();


//add to Books DB   
//BDB => books database
router.get("/addToBDB", function (req, res) {
    res.render("DBChanges/addToBDB");
});

router.get("/results", function (req, res) {
    var query = req.query.search;
    var url = "https://www.googleapis.com/books/v1/volumes?q=" + query;
    request(url, function (error, response, body) {
        if (!error & response.statusCode == 200) {
            var data = JSON.parse(body);
            data["items"].forEach(function (book) {

                var title = book["volumeInfo"]["title"];
                if (book["saleInfo"].hasOwnProperty('listPrice')) {
                    var price = book["saleInfo"]["listPrice"]["amount"];
                } else {
                    var price = "NA";
                }
                if (book.volumeInfo.hasOwnProperty('authors')) {
                    var author = book.volumeInfo.authors[0];
                } else {
                    var author = "NA";
                }
                if (book.volumeInfo.hasOwnProperty('imageLinks')) {
                    var image = book["volumeInfo"]["imageLinks"]["thumbnail"];
                }
                else {
                    var image = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDhNVGxbe5mbz1SAXMVXT0pvfhO3YhJZwh1v4dVUFk9amcXwu6";
                }
                if (book["volumeInfo"].hasOwnProperty('description')) {
                    var description = book["volumeInfo"]["description"];
                } else {
                    var description = "NA";
                }
                var publisher = book["volumeInfo"]["publisher"];
                var newBook = { title: title, author: author, publisher: publisher, price: price, image: image, description: description };

                Book.create(newBook, function (err, newCreated) {
                    if (err) {
                        console.log(err);
                    }
                });
            });
        }
    });
});

//to delete something from Books DB having no image
router.get("/deleteImage", function (req, res) {
    Book.remove({ image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDhNVGxbe5mbz1SAXMVXT0pvfhO3YhJZwh1v4dVUFk9amcXwu6" }, function (err) {
        if (err) {
            console.log(err)
        }
    });
});

//to delete something from Books DB having no image
router.get("/deleteAuthor", function (req, res) {
    Book.remove({ author: "NA" }, function (err) {
        if (err) {
            console.log(err);
        }
    });
});

//Add to Best Selling DB
router.get("/addToBSDB", function (req, res) {
    res.render("DBChanges/addToBSDB");
});

router.get("/addBSDB", function (req, res) {

  
    var newBestSelling = { title: title, author: author, publisher: publisher, price: price, image: image, description: description };
    BestSelling.create(newBestSelling, function (err, newCreated) {
        if (err) {
            console.log(err);
        }
    });
});

module.exports = router;