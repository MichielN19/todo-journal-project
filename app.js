import express from "express";
import pg from "pg";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "todo-journal-project",
  password: "error",
  port: 5432,
});

db.connect();

let items = [
  { id: 1, title: "Slapen", doneTime: "12:00", isChecked: false }
];

function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const formattedDate = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  return { date: formattedDate, time: `${hours}:${minutes}:${seconds}` };
}


async function GetAllItems() {
  const result = await db.query("SELECT id, title, ischecked, to_char(donetime, 'HH24:MI') AS donetime FROM items ORDER BY id ASC");
  return result.rows;
}

async function AddNewItem(itemTitle, doneTime) {
  await db.query("INSERT INTO items (title, donetime) VALUES ($1, $2)", [itemTitle, doneTime]);
  const result = await db.query("SELECT * FROM items WHERE title = $1", [itemTitle]);

  items.push(result.rows[0]);
}

async function CheckItem(itemId, itemDonetime) {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  console.log(timeString);
  console.log(itemDonetime);
  console.log(itemId);

  if(itemDonetime <= timeString) {
    try {
      await db.query("DELETE FROM items WHERE id = $1", [itemId]);
      console.log("Succesfully checked the item");
    } catch (error) {
      console.log(error); 
    }
  } else {
    try {
      await db.query("UPDATE items SET isChecked = true WHERE id = $1", [itemId]);
    } catch (error) {
      console.log(error);
    }
  }
}

async function CheckItemTime(itemDonetime) {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}:00`;
  console.log(timeString);

  if(itemDonetime <= timeString) {
    try {
      await db.query("DELETE FROM items WHERE donetime = $1", [itemDonetime]);
      console.log("Succesfully deleted the item");
    } catch (error) {
      console.log(error); 
    }
  }
}

async function CheckIscheckedBool(itemId) {
  const result = await db.query("SELECT isChecked FROM items WHERE id = $1", [itemId]);
  return result.rows[0].ischecked;

}

async function UncheckItem (itemId) {
  const result = await db.query("UPDATE items SET isChecked = false WHERE id = $1", [itemId]);
  console.log(result.rows);
  return result.rows;
}


app.get("/", async (req, res) => {
  items = await GetAllItems();
  const itemsResult = await db.query("SELECT donetime, ischecked FROM items");
  const itemsData = itemsResult.rows;


  itemsData.forEach(async row => {
    console.log(row.ischecked);

    if(row.ischecked == true) {
     itemsData.forEach(async row => {
        console.log(row.donetime);
        await CheckItemTime(row.donetime);
      });
    }
  });


  const { date, time } = getCurrentTime();
  res.render('index.ejs', { listItems: items, date: date, time: time });
  console.log(items);
});

app.post("/add", async (req, res) => {
  const itemTitle = req.body.newItemTitle;
  const itemDoneTime = req.body.newItemTime;

  try {
    await AddNewItem(itemTitle, itemDoneTime);
    res.redirect("/");
    console.log(items);
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});


app.post("/edit", async (req, res) => {
  const currentItemId = req.body.UpdateItemId;
  const currentItemTitle = req.body.UpdateItemTitle;
  const currentItemTime = req.body.UpdateItemTime;

  try {
    const result = await db.query("UPDATE items SET title = $1, donetime = $2 WHERE id = $3 RETURNING *", [currentItemTitle, currentItemTime, currentItemId]);
    console.log(result.rows[0]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/check", async (req, res) => {
  const checkDoneTime = req.body.CheckItemDoneTime;
  const checkItemId = req.body.CheckItemId;

  const itemBool = await CheckIscheckedBool(checkItemId);
  console.log(`Item bool is: ${itemBool}`);

  if(itemBool == false) {
    await CheckItem(checkItemId, checkDoneTime);
    console.log("Checked items");
  } else {
    await UncheckItem(checkItemId);
    console.log("Unchecked item");
  }


  res.redirect("/");

});

app.post("/delete", async (req, res) => {
  const deleteItemId = req.body.DeleteItemId;
  console.log(deleteItemId);

  try {
    await db.query("DELETE FROM items WHERE id = $1", [deleteItemId]);
    res.redirect("/");
  } catch (error) {
    console.log(error); 
  }
});

app.listen(port, () => {
  console.log(`Port is runnig on ${port}`);
});
