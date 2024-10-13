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


let currentBalance = 0;
let currentCurrency = 'tether';

//const acrDaily = document.getElementById('todayEarnings');
const balValue = document.getElementById('balanceValue'); 
const usdEstimation = document.getElementById('usdEstimation'); 

const selectElement = document.getElementById('currencySelect');  

var uname = '#345';
//Retrive Session and validate it

const balanceValue = document.getElementById('balanceValue');
        const currencySymbol = document.getElementById('currencySymbol');
        const currencySelect = document.getElementById('currencySelect');
         // Initial balance in USDT
         let balance = usdEstimation.textContent;
        async function fetchExchangeRates() {
            const response = await fetch('https://api.coincap.io/v2/assets');
            const data = await response.json();
            return data.data.reduce((acc, coin) => {
                acc[coin.id] = parseFloat(coin.priceUsd);
                return acc;
            }, {});
        }

        async function convertCurrency() {
            const rates = await fetchExchangeRates();
            const selectedCurrency = currencySelect.value;
            const rate = rates[selectedCurrency];

            if (rate) {
                let balance = Number(usdEstimation.textContent);
                const convertedBalance = balance / rate;
                balanceValue.textContent = convertedBalance.toFixed(6);
                currencySymbol.textContent = currencySelect.options[currencySelect.selectedIndex].text.split(' ')[1].replace('(', '').replace(')', '');
                //usdEstimation.textContent = balance.toFixed(2);
            } else {
                console.error('Exchange rate not found for selected currency');
            }
        }

        currencySelect.addEventListener('change', convertCurrency);

        // Initial conversion
        convertCurrency();


async function handlePort(){
    try {
        let query = `WHERE UserID = '${uname}'`;
        let response = await makeRequest({
          action: 'query',
          sheet: 'Portforlio',
          query: query
        });

      console.log(response);
    
      if(response == "Error"){console.error("Errow within making request")}

      if(response.status === 'success' && Array.isArray(response.data)) {
        let info = response.data[1];
        balValue.textContent = Number(info[7]).toFixed(6);
        currentBalance = info[7];
        usdEstimation.textContent = Number(info[7]).toFixed(2);
        //create a temp portfolio object
        //acrDaily.textContent = Number(port.daily).toFixed(2); 
        } 
        else{
          throw new Error('Unexpected data format from server') }    
        }
        catch (error) {
        console.error(error);
      }
  }

//fetch staking pool information
async function handlePool(){
let mname = 'pool'
    try {
        let query = `WHERE Name = '${mname}'`;
        let response = await makeRequest({
          action: 'query',
          sheet: 'Misc',
          query: query
        });

      console.log(response);
    
      if(response == "Error"){console.error("Errow within making request")}
      if(response.status === 'success' && Array.isArray(response.data)) {
        let info = response.data[1];
        let poolAmount = info[1];
        let users = info[2];
        document.getElementById('totalStaked').textContent = poolAmount;
        document.getElementById('totalUsers').textContent = users;

            const random = Math.random();
            const percentage = 55 + (random * 25);
            const userPercentage = Math.round(percentage * 100) / 100; 
            const userPercentageBar = document.getElementById('userPercentageBar');
            userPercentageBar.style.width = '0%';
            setTimeout(() => {
                userPercentageBar.style.width = userPercentage + '%';
            }, 100);
        } 
        else{
          throw new Error('Unexpected data format from server') }    
        }
        catch (error) {
        console.error(error);
      }
  }


selectElement.value = "tether"

window.onload = function() {
    //const welcomeMessage = document.getElementById('welcomeMessage');
    
    // Parse the URL to get the username
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    
    if (username) {
        // Decode the username to handle special characters
        const decodedUsername = decodeURIComponent(username);
        const item = document.querySelector(".leaderboard-link");
        uname = decodedUsername;
        console.log( `Hello, ${decodedUsername}!`);
        handlePort(); handlePool();
        setTimeout(fetchMail, 3000);
        const encodedUsername = encodeURIComponent(uname);
        var extension = `?username=${encodedUsername}`;
        let url = item.getAttribute('href');
        let extURL = url + extension;
        item.setAttribute("href", extURL);
        navItems.forEach(nav => {   
            let url = nav.getAttribute('href');
            let extURL = url + extension;
            nav.setAttribute("href", extURL);
        });
    } else {
        console.log('No user found. Please sign up.');
        window.location.href = `signup.html`;
    }
}
