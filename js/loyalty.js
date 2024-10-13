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

        
    let uname;
    let hold= [0,0,0]; //count for all bosters
    function UIB(num){
        let boosters = ["Lucky Spark","Stampede","Block Buster"];
        return String(boosters[num]+"_"+uname);
    }
    async function handleBoost(){
        try {
            let query = `WHERE UserID = '${uname}'`;
            let response = await makeRequest({
            action: 'query',
            sheet: 'Booster',
            query: query
        });

        console.log(response);
        if(response == "Error"){console.error("Error when making request")}
        if(response.status === 'success' && Array.isArray(response.data)) {
            for (let i = 1; i < response.data.length; i++) {
                let info = response.data[i];
                if(UIB(0) == info[6].toString()){
                hold[0] += Number(info[5]);
                }
                if(UIB(1) == info[6].toString()){
                    hold[1] += Number(info[5]);
                }  
                if(UIB(2) == info[6].toString()){
                    hold[2] += Number(info[5]);
                }             
            }
              console.log(hold);
         } 
            else{
                  throw new Error('Unexpected data format from server') }    
                }
                catch (error) {
                console.error(error);
              }
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
            updatePoints(info[6]);
            let tStake = Number(info[9]);
         } 
            else{
                  throw new Error('Unexpected data format from server') }    
                }
                catch (error) {
                console.error(error);
              }
          }

          window.onload = function() {
            //const welcomeMessage = document.getElementById('welcomeMessage');
            
            // Parse the URL to get the username
            const urlParams = new URLSearchParams(window.location.search);
            const username = urlParams.get('username');
            
            if (username) {
                // Decode the username to handle special characters
                const decodedUsername = decodeURIComponent(username);
                uname = decodedUsername;
                console.log( `Hello, ${decodedUsername}!`);
                handlePort(); handleBoost();
                const encodedUsername = encodeURIComponent(uname);
                var extension = `?username=${encodedUsername}`;
                navItems.forEach(item => {   
                        let url = item.getAttribute('href');
                        let extURL = url + extension;
                        item.setAttribute("href", extURL);
                    });
            } else {
                console.log('No user found. Please sign up.');
                window.location.href = `signup.html`;
            }
        }
        