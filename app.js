const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const date = require(__dirname+"/date.js");
const port = 3000;
const app = new express();
let newItem= ["Eat Food", "Take Enough Sleep"];
let workItem = [""];

mongoose.connect("mongodb+srv://dbUser:ahsaan123@cluster0.op1vw.mongodb.net/todolistDB", {useNewUrlParser: true});


const listSchema = new mongoose.Schema({
    name : String
});
const item = mongoose.model("item",listSchema);


const customListSchema = new mongoose.Schema({
    name: String,
    items : [listSchema]
});
const List = mongoose.model("List",customListSchema);


const item1 = new item({
    name : "Welcome to our todoList."
});
const item2 = new item({
    name : "<-- Press + to Add an item to your list."
});
const item3 = new item({
    name : "<-- Press - to Delete an item to your list."
});

const itemsArray = [item1,item2,item3];


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static('public'));


app.get("/", function(req , res){   
let formatTime = date.getDate();
// res.render("list",{typeOfList : formatTime , newItems : newItem});
item.find({},function(err , foundItems){
    if(err){
        console.log(err);
    }else{
        if(foundItems.length === 0){
            item.insertMany(itemsArray, function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Successfully saved lists to our database");
                }
            });
            res.redirect("/");
        }else{
            res.render("list",{typeOfList : "Today" , newItems : foundItems});
        }
       
    }
})
});

app.get("/:customListName", function(req , res){
    const customListName = _.capitalize(req.params.customListName);
    
    
    List.findOne({name : customListName}, function(err , foundList){
        if(!err){
            if(!foundList){
                const  customList= new List({
                    name : customListName,
                    item : itemsArray
                });
                customList.save();
                res.redirect("/" + customListName);

            }
            else{
                res.render("list",{typeOfList : foundList.name , newItems : foundList.items});

            }
        }
    })




    
})

app.post("/", function(req , res){
    console.log(req.body);
    var itemBody = req.body.item;
    var listName = req.body.list;
    //defining a mongodb document.
    const itemDoc = new item({
        name : itemBody
    });
    if(listName === "Today"){
        itemDoc.save();
        res.redirect("/");
    }else{
        List.findOne({name : listName},function(err , foundList){
            console.log("Found " +listName);
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
    
   
    
});
app.post("/delete" , function(req, res){
    const checkedItem = req.body.checkedItem;
    const listName = req.body.listName;

    if(listName === "Today"){
        item.deleteOne({_id : checkedItem}, function(err){
            if(err){
                console.log(err);
            }else{
                console.log("Successfully Deleted the Document.");
                res.redirect("/");
            }
        })
    }
    else{
        List.findOneAndUpdate({name : listName} , {$pull : {items : {_id : checkedItem}}} , function(err,foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        })
    }
    
})

app.listen(port , function(){
    console.log("App is listening at port "+port);
});