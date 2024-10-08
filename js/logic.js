//Create a User class
class User {
    constructor(userID, userName){
        this.ID = userID;
        this.NAME = userName;
        this.ASSET = Porfolio();
    }
}
//All integrity-data objects must have presyncing and backsyncing.

//must be configures to work with api
class Currency{
    constructor(name, sym){
        this.NAME = name;
        this.SYM = sym;
    }

    priceUsd(rawPrice){
        return 0;
    }
}

//state holds  only 3 values
class Transaction{
    //id,state, prodct 
} 

//netincome and pph det leaderbo
class Porfolio{
    constructor(account=0, loyal=0, pph=0, tot=0, daily=0){
        this.acc = account;
        this.loyal = loyal;
        this.pph = pph;
        this.totEarn = tot;
        this.daily = daily;
    }
}

class Task{}

class Price{
    constructor(value, cur="USDT"){
        this.priceUsd = value;
        this.Currency = Currency()
    }
    updatePrice(curValue, sym){
        //connect with de api with sym
        let upd;
        this.value = curValue * upd;
    }
}

let coins = [
    {
        name: "TON",
    },
    {
        name: "USDT",
        net: "TRC20"
    },
    {
        name: "",
    }
]
//*
/*testPort = Porfolio();
var profit = document.getElementsByClassName("card");
profit[0].innerHTML = testPort.PPH;
profit[1].innerHTML = testPort.LOYAL;

//BackEnd: Subsriptin ref Packages.
//On home page*/


