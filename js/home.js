var selector = 0; //[1,2,3]
let stakeName;

//onclick - sel change 1 
let spec = {
    body: "",
    percent: [15,24,25,180],
    daily: 10,//def fixed
}
function updDet (sel){
    if(sel == 1)
    {   
        spec.percent = [12,16,30,80];
        spec.daily = 10;
    } else if(sel == 2){
        spec.percent = [12,16,30,80];
        spec.daily = 10;   
    } else if(sel == 3){
        spec.percent = [12,16,30,80];
        spec.daily = 10;      
    }
}
let uname;


let accBalance = 0; let tStake = 0;let base_rate=0;

const stakingOptions = [
    { yield: '105', duration: '30 days' },
    { yield: '115', duration: '90 days' },
    { yield: '121', duration: '180 days' },
    { yield: '350', duration: '365 days' }
];

let firPlan = ["91",'160',"180","210"];
let secPlan = ["113",'180',"220","300"];
let thdPlan = ["205",'310',"420","550"];

//Api calling and source data fetching
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbymvjCJEg2nEADZUVJeRHeNZT0ZfuXs_QnlFfJi8tZcsBAztiwXJ0Mm7kLGxy9bta4/exec'; // Replace with your Google Apps Script Web App URL

        async function makeRequest(data) {
            let final;
            try {
                const response = await fetch(WEBAPP_URL, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams(data),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                final = result;
            } catch (error) {
                console.error('Error:', error);
                final = "'Error: ' + error.message";
            }
            return final;
        }

        
    async function handlePort(){
        try {
            let query = `WHERE UserID = '${uname}'`;
            let response = await makeRequest({
            action: 'query',
            sheet: 'Portforlio',
            query: query
        });

        console.log(response);
        if(response == "Error"){console.error("Error when making request")}
        if(response.status === 'success' && Array.isArray(response.data)) {
            let info = response.data[1];
            pph.textContent = Number(info[2]).toFixed(3);
            base_rate = Number(info[1]).toFixed(3);
            accBalance = info[7];
            loyal.textContent = info[6];
            tStake = Number(info[9]);
         } 
            else{
                  throw new Error('Unexpected data format from server') }    
                }
                catch (error) {
                console.error(error);
                alert('Unexpected error occurred. Please try again.');
              }
          }
        

function showSliding(sel){
    if(sel == 2){   
        for(x = 0;  x<4; x++){
            stakingOptions[x].yield = secPlan[x];
            stakeName = "Legacy Stake";
        }} 
    else if(sel == 3){
        for(x = 0;  x<4; x++){
            stakingOptions[x].yield = thdPlan[x];
            stakeName = "StakeMax";
        }
    } else {
        for(x = 0;  x<4; x++){
            stakingOptions[x].yield = firPlan[x];
            stakeName = "Stable Duo";
    }  }
slidingWindow.classList.add('active');   

//Generate sliding window content dynamically
const timeline = document.getElementById('timeline');
createTimelineBoxes();

//Clear time-line boxes to prevent aggregation
const boxes = document.querySelectorAll('.timeline-box');
const closeWindowBtn = document.getElementById('closeWindow');
closeWindowBtn.addEventListener('click', () => {
    slidingWindow.classList.remove('active');
    boxes.forEach((box, i) => {
        box.remove();
    });
}); 
}


    function createTimelineBoxes() {
        stakingOptions.forEach((option, index) => {
        const box = document.createElement('div');
        box.classList.add('timeline-box');
        box.innerHTML = `
                <div class="yield">${option.yield}%</div>
                <div class="duration">${option.duration}</div>
            `;
            box.addEventListener('click', () => selectBox(index));
            timeline.appendChild(box);
        });
    }

    function selectBox(index) {
        const boxes = document.querySelectorAll('.timeline-box');
        boxes.forEach((box, i) => {
            if (i === index) {
                box.classList.add('selected');
            } else {
                box.classList.remove('selected');
            }
        });
    }

//Works adjuntly with sliding calc
function Estimate(APY=0){
    //changes estimate based on selector
    let result = document.getElementById("result");
    const stakingAmountInput = document.getElementById('stakingAmount');
    let minPPD;
    if (APY == 0){
        let percent = Number(stakingOptions[0].yield) / 100;
        minPPD= (Number(stakingAmountInput.value) * percent) / 30;
        
        result.innerHTML = `<b>Minimum Daily Profit:</b> 
        <span>${minPPD.toFixed(3)} USD($)</span> `;
    }
    return minPPD;
}
   function getDate(){
    const date = new Date();
    const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${String(date.getFullYear()).slice(2)}`;
    return formattedDate;
   } 
function stakeNow(){
    //check account balnce if enough, then buy or tell user to visit account page to recharge
    let inAmount = document.getElementById("stakingAmount").value;
    console.log(accBalance);
    if (accBalance >= inAmount){
        //1. proceed to buy
        tStake += Number(inAmount);
        accBalance -= inAmount;
        let ppd = Estimate().toFixed(3); 
        //3. Add stake Info to Subscriptions on backend
        //4. Calculate PPH and initiate earning
        let strData = String(uname+","+stakeName+",2"+","+"on"+","+inAmount+","+getDate()+","+ppd);
        values = strData.split(",");
            makeRequest({
                    action: 'append',
                    sheet: "Subs",
                    values: JSON.stringify(values)
            });
    //update total stake and earning rate  in source data
    console.log("here");
        let pph = (ppd / 24);
        makeRequest({
            action: 'update',
            sheet: "Portforlio",
            condition: JSON.stringify({column: "UserID", value: uname}),
            updateValues: JSON.stringify({column: "Base Rate", value: Number(base_rate + pph) })
        });
        makeRequest({
            action: 'update',
            sheet: "Portforlio",
            condition: JSON.stringify({column: "UserID", value: uname}),
            updateValues: JSON.stringify({column: "Account", value: Number(accBalance)})
        });
        setTimeout(()=>{
            makeRequest({
                action: 'update',
                sheet: "Portforlio",
                condition: JSON.stringify({column: "UserID", value: uname}),
                updateValues: JSON.stringify({column: "Total Stake", value: Number(tStake)})
            });
        },3000);
        alert("Staking Initiated, Delgation is successfull");   
    }
    else {
        //redirect to deposit page
        alert("Insufficient coins in wallet")
    }
}


// seetting up session links
window.onload = function() {
    // Parse the URL to get the username
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    
    if (username) {
        // Decode the username to handle special characters
        const cardLinks = document.querySelectorAll('.card a');
        const wallet = document.querySelector('.wallet-box');
        const decodedUsername = decodeURIComponent(username);
        uname = decodedUsername;
        const encodedUsername = encodeURIComponent(uname);
        var extension = `?username=${encodedUsername}`;
        let url = wallet.getAttribute('href');
        wallet.setAttribute("href", url + extension);
        navItems.forEach(item => {   
                let url = item.getAttribute('href');
                let extURL = url + extension;
                item.setAttribute("href", extURL);
            });
        cardLinks.forEach((link) => {
            let url = link.getAttribute('href');
            let extURL = url + extension;
            link.setAttribute("href", extURL);
        });
        handlePort();
        
    } else {
        console.log('No user found. Please sign up.');
        window.location.href = `signup.html`;
    }
}
