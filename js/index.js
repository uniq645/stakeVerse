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
                //final = "'Error: ' + error.message";
                return "Error";
            }
            return final;
        }

        function appendData(sheetarg,strData) {
            const sheet = sheetarg;
            const values = strData.split(',');
            makeRequest({
                action: 'append',
                sheet: sheet,
                values: JSON.stringify(values)
            });
          }
        
        function getDate(){
            const date = new Date();
            const month = date.getMonth() + 1; // getMonth() returns a zero-based month, so we add 1 to get the correct month
            const day = date.getDate();
            const year = date.getFullYear();
            
            const formattedDate = `${month}/${day}/${year}`;
            console.log(formattedDate);
            return formattedDate;
          }

    async function generateRefId(userId) {
            // Convert the userId to an ArrayBuffer
            const encoder = new TextEncoder();
            const data = encoder.encode(userId);
          
            // Hash the userId using SHA-256
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          
            // Convert the hash to a Base64 string
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray));
          
            // Take the first 8 characters of the Base64 string
            const shortHash = hashBase64.substring(0, 8);
          
            // Combine with a prefix for easy identification
            return `REF${shortHash}`;
        }

    async function addUserToGoogleSheets(userId, username,password = "tg_user", refId, referredBy, date,email="not_yet") {
         let strData = String(userId+","+username+","+password+","+refId+","+referredBy+","+date+","+email);
        const values =strData.split(",");
           const response = makeRequest({
                action: 'append',
                sheet: 'User',
                values: JSON.stringify(values)
            });
            return response;
          }

function Initiate(uname){
    let new_info = String(uname+","+0.001+","+0.001+",,,,"+1000+","+0.5+","+0.5);
    appendData("Portforlio", new_info);
    const boosters =[{name:"Lucky Spark", point: 2},{name:"Stampede",point:5},{name:"Block Buster",point:11}];
    for(let i=0; i < boosters.length; i++){
      let info = boosters[i];
      if(i == 0){
        new_info = String(info.name+","+info.point+","+"active"+","+uname+","+getDate()+",0");
      } else{
        new_info = String(info.name+","+info.point+","+"disabled"+","+uname+","+getDate()+",0");
      }
      appendData("Booster", new_info);
    }
    
    appendData("Leaderboard", uname);
    let welcome = `Welcome to StakeVerse. You have 1000 loyal points and one free booster avaiable
    to kickstart your passive earning.`;
  appendData("Settings", uname+","+welcome);
}

async function valUser(user_id, uname) {
    const userID = user_id;
    const username = uname;
    let userExist = false;
    let response = await makeRequest({
        action: 'read',
        sheet: "User"
    });
    
    for(let x = 1; x < response.data.length; x++){
      let info = response.data[x];

      if(userID == info[0] || username.toUpperCase() == String(info[1]).toUpperCase()){
          //Username or email exists already
          userExist = true;
          console.log("User already exists!");
          break;;
      }
    }
    return userExist;
}


window.onload = function() {
    document.getElementById('loader').style.display = 'flex';
    // Function to get URL parameters
    function getUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        //const username = urlParams.get('username');
        return {
            userId: urlParams.get('user_id'),
            username: urlParams.get('username')
        };
    }
    

    // Get user_id and username from URL
    //let username = getUrlParameters();
    const { userId, username } = getUrlParameters();

    // Check if both user_id and username are present
    if (userId || username) {
        // Create an object with user data
        console.log("checking");
        var userData = {
            user_id: String(userId + "tg"),
            username: username
        };
        

        // Function to check if user exists or create new user
        async function checkOrCreateUser(userData) {
            var existingUser = await valUser(userData.user_id, userData.username);

            if (existingUser == true) {
                // User exists, redirect to dashboard
                console.log("true");
                const encodedUsername = encodeURIComponent(userData.user_id);
                console.log(encodedUsername);
                window.location.href = './home.html?username=' + encodedUsername;
            } else {
                let newRefId = await generateRefId(userData.user_id);
                console.log("false");
                // Create new user
                userData.user_id = String(userData.user_id);
                let response = await addUserToGoogleSheets(userData.user_id, userData.username, "tg_user", newRefId, "tg_ref", getDate());
                Initiate(userData.user_id);
                if (response.status !== 'success') { 
                    console.error('Failed to add user to Google Sheets');
                    alert("Please check your internet connectivity !");
                }else{
                    localStorage.setItem("stakeverse_id",userId);
                    localStorage.setItem("stakeverse_user",username);
                    const encodedUsername = encodeURIComponent(userData.user_id);
                    setTimeout(()=>{window.location.href = './home.html?username=' + encodedUsername;},1000);
                }   
            }
        }

        // Call the function to check or create user
        checkOrCreateUser(userData);
    } else {
        console.log('User ID or username missing from URL');
        // Handle the case where user_id or username is missing
        document.getElementById('loader').style.display = 'none';
    }
}