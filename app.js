//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://unsorted:AMIlihanas%4019@cluster0.wqps4.mongodb.net/todoListDB?retryWrites=true&w=majority");

const itemsSchema = mongoose.Schema({
  name:String,
});

const Item = mongoose.model("Item",itemsSchema);

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},(err,foundItems)=>{
    if(foundItems.length===0){
      res.render("list",{listTitle:"Today",newListItems: foundItems});
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
});

app.post("/", function(req, res){

  const itemName=req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name:itemName,
  });
  if(listName==="Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete",function(req,res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItem,(err)=>{
      if(!err){
        res.redirect("/");
      }
    })
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},(err,foundList)=>{
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

  
});

app.get("/:customListsName",(req,res)=>{
  const customListName=_.capitalize(req.params.customListsName);
  
  List.findOne({"name":customListName},(err,foundList)=>{
    if(!err){
      if(!foundList){
        //creating new list
        const list = new List({
          name:customListName,
          items: [],
        });
      
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
      }
    }
  })
});

app.post("");

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
