class Item {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
}
const itemList = [];

const shop = document.getElementById('shop');
const itemTemplate = document.getElementById('itemTemplate');
function createItem(name = '*user input*', price = 0) {
  //get user input
  if (name === '*user input*' && price === 0) {
    name = document.getElementById("Name").value;
    price = parseFloat(document.getElementById("Price").value);
  }

  //create new item (back-end)
  let newItem = new Item(name, price);
  itemList.push(newItem);

  //create new item (front-end)
  let newButton = itemTemplate.cloneNode(true);
  let textNode = document.createTextNode(name);
  newButton.appendChild(textNode);
  newButton.classList.toggle('hidden');
  newButton.id = name;
  shop.appendChild(newButton);

  resetInput();
}

function resetInput() {
  document.getElementById('Name').value = '';
  document.getElementById('Price').value = '';
}

function importItems() {
  //access uploaded file
  let upload = document.getElementById("upload");
  let file = upload.files[0];
  if (file.length === 0) {return};

  let reader = new FileReader();

  reader.onload = (e) => {
    let file = e.target.result;
    let text = file.split(',');
    console.log(text);

    //convert file contents to items
    for (let i = 0; i < text.length; i++) {
      let name = text[i];
      i++;
      let price = Number(text[i]);
      createItem(name, price);
    }
  };
  reader.readAsText(file);
}

function getItem(item) {
  for (i = 0; i < itemList.length; i++) {
    if (itemList[i].name === item) {
      return itemList[i];
    }
  }
}

function getPrice(item) {
  for (i = 0; i < itemList.length; i++) {
    if (itemList[i].name === item) {
      return itemList[i].price.toFixed(2);
    }
  }
}

class Basket {
  constructor() {
    this.items = [];
  }
  addItem(item) {this.items.push(item)}
  getTotal() {
    return this.items.reduce((a, b) => a + b.price, 0);
  }
}

const salesRecord = {
  baskets: [],
  getTotal() {
    return this.baskets.reduce((a, b) => a + b.getTotal(), 0);
  }
}

let currentBasket = new Basket;
function addToBasket() {
  let item = getItem(event.target.id);
  currentBasket.items.push(item);
  updateTotal();
  logToBasketDisplay(item);
}

const basketView = document.getElementById("basketView");
function toggleBasket() {
  basketDisplay.classList.toggle("hidden");
}

const paymentScreen = document.getElementById("payment");
let toggle = true;
function togglePayment() {
  if (toggle) {
    paymentScreen.style.display = "flex";
  } else {
    paymentScreen.style.display = "none";
  }

  toggle = !toggle;
}

const helpText = document.getElementById("helpText");
const toggleHelp = () => helpText.classList.toggle("hidden");

const basketDisplay = document.getElementById('basketDisplay');
const billTemplate = document.getElementById('billTemplate');
function logToBasketDisplay(item) {
  let itemInfo = `${item.name} @ $${item.price.toFixed(2)}`;

  let newBillItem = billTemplate.cloneNode("true");
  let textNode = document.createTextNode(itemInfo);
  newBillItem.appendChild(textNode);
  newBillItem.classList.toggle('hidden');
  basketDisplay.firstElementChild.appendChild(newBillItem);
}

function saleNoise() {
  let audio = new Audio('cashNoise.mp3');
  audio.loop = false;
  audio.play();
}

function calculateChange(cash) {
  let change = document.getElementById("change");
  let total = currentBasket.getTotal();
  if (cash === 0) {cash = total;}

  let diff = cash - total;
  change.innerHTML = `LAST SALE:
    Total $${total.toFixed(2)} |
    Paid $${cash.toFixed(2)} | 
    Change $${diff.toFixed(2)}`;
}

function resetBasketDisplay() {
  let i = currentBasket.items.length;

  for (i; i > 0; i--) {
    basketDisplay.firstElementChild.lastChild.remove();
  }
}

const total = document.getElementById("total");
function updateTotal() {
  total.innerHTML = "TOTAL: $" + currentBasket.getTotal().toFixed(2);
}

function animateSale() {
  total.style.display = "none";
  saleMsg.style.display = "flex";

  //flashing msg in display; probably a better way to do this with webkit
  setTimeout(function() {saleMsg.style.color = "black"}, 200);
  setTimeout(function() {saleMsg.style.color = "lime"}, 400);
  setTimeout(function() {saleMsg.style.color = "black"}, 600);
  setTimeout(function() {saleMsg.style.color = "lime"}, 800);

  setTimeout(function() {saleMsg.style.display = "none"}, 1400);
  setTimeout(function() {total.style.display = "flex"}, 1400);
}

const coversBill = pay => pay >= currentBasket.getTotal();

const saleMsg = document.getElementById("sale");
function finishSale(cash = currentBasket.getTotal()) {
  if (!coversBill(cash)) {
    return alert("insufficient payment selected");
  }

  if (currentBasket.items.length < 1) {
    return alert("sale cancelled: basket is empty");
  }

  if (currentBasket.getTotal() < 0) {
    return alert("error: total less than $0.00 - sale cancelled");
  }

  saleNoise();
  calculateChange(cash);
  resetBasketDisplay();
  salesRecord.baskets.push(currentBasket);
  currentBasket = new Basket;
  updateTotal();
  animateSale();
}

function cancelSale() {
  resetBasketDisplay();
  currentBasket = new Basket;
  updateTotal();
}

function keyInCash() {
  let guess = Math.ceil(currentBasket.getTotal()).toFixed(2);

  let cash = prompt("Enter Cash Amount:", guess);

  if (cash === null) {
    return console.log("input cancelled by user");
  }

  if (!coversBill(cash)) {
    alert("insufficient payment selected");
    return keyInCash();
  } else {
    finishSale(parseFloat(cash));
  }
}

let discountCounter = 0;
function discount() {
  let amount = prompt("Enter Cash Amount to discount:", "1.10");

  if (amount === null) {
    return alert("cancelled by user");
  }

  amount = Number(amount);
  amount = amount - amount * 2;

  discountCounter++;
  let discountName = "discount" + discountCounter;
  
  let discountItem = new Item(discountName, amount);
  currentBasket.items.push(discountItem);
  itemList.push(discountItem);

  updateTotal();
  logToBasketDisplay(discountItem);
}

let itemLog = [];
function logItems(basket) {
  basket.items.forEach(item => itemLog.push(item.name));
}

class Tally {
  constructor(name, count) {
      this.name = name;
      this.count = count;
      this.price = getPrice(name);
  }
}

let salesBreakdown = [];
function tallyItems(itemLog) {

  for (let i = 0, len = itemLog.length; i < len; i++) {

 let indexOfCurrentItem = salesBreakdown
    .map(function(obj) {return obj.name;})
    .indexOf(itemLog[i]);

  let seen = indexOfCurrentItem > -1;

    if (seen) {
      salesBreakdown[indexOfCurrentItem].count++;
    } else if (!seen) {
      let newTally = new Tally(itemLog[i], 1);
      salesBreakdown.push(newTally);
    };
  }
}

function makeReportString(salesBreakdown, grandTotal) {
  let report = [];

  salesBreakdown.forEach((obj) => report.push(
    `${obj.count} x ${obj.name} @ $${obj.price} = $${(obj.count * obj.price).toFixed(2)}`));

  let t = new Date();
  let time = t.getHours() + ':' + t.getMinutes() + ' ';
  let date = t.getDate() + '/' + t.getMonth() + 1 + '/' + t.getFullYear();
  let timestamp = time + date + '\n';

  return 'SALES REPORT:\n' 
  + timestamp 
  + `\n\nGrand Total: $${grandTotal} \n` 
  + report.join("\n")
  + '\n\nThis report was generated automatically by Free POS';
}

function resetTrade() {
  currentBasket = new Basket;
  salesRecord.baskets = [];
  itemLog = [];
  salesBreakdown = [];
  discountCounter = 0;
}

function salesReport() {

  let grandTotal = salesRecord.getTotal().toFixed(2);

  let runReport = confirm(
    `Current Total Trade: $${grandTotal}\n
    Do you want to run the End of Business report?\n
    Warning: this will clear and reset trade records.`);

  if (runReport !== true) {
    return;
  }

  salesRecord.baskets.forEach(logItems);

  console.log(itemLog);

  tallyItems(itemLog);

  let reportString = makeReportString(salesBreakdown, grandTotal);

  resetTrade();

  if (confirm(reportString + "\n Do you want to download a copy of this report?")) {
    let blob = new Blob([reportString], {type: 'text/plain;charset=utf8'});
    saveAs(blob, "SalesReport.txt");
  }
}