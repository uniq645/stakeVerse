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


// This function should be called when the signup page loads
function captureReferral() {
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get('ref');
    if (refId) {
      // Store the refId in a hidden form field or in localStorage
      //document.getElementById('referredBy').value = refId;
      // Or
      localStorage.setItem('referredBy', refId);
    }
}

var valLoad ="";
// Call this function when the page loads
window.onload = function() {
  checkbox.checked = false;
  checkmark.style.display = 'block';
  loading.style.display = 'none';
  checkbox.disabled = false;
  captureReferral();

};

function circleLoad(boolButton){ 
  const button = boolButton ? document.getElementById('sign_in'):document.getElementById('sign_up');
      const loader = button.querySelector('.loader');
          loader.classList.add('show');
          setTimeout(() => {
              loader.classList.remove('show');
          }, 3000);
}


function generateUserId(length = 8) {
    return Math.random().toString(36).substr(2, length);
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
  
  function getDate(){
    const date = new Date();
    const month = date.getMonth() + 1; // getMonth() returns a zero-based month, so we add 1 to get the correct month
    const day = date.getDate();
    const year = date.getFullYear();
    
    const formattedDate = `${month}/${day}/${year}`;
    console.log(formattedDate);
    return formattedDate;
  }

  async function valUser() {
    const signUpEmail = document.getElementById('signUpEmail').value.trim();
    const username = document.getElementById("signUpName").value.trim();
    let userExist = false;
    let response = await makeRequest({
        action: 'read',
        sheet: "User"
    });
    
    for(let x = 1; x < response.data.length; x++){
      let info = response.data[x];

      if(signUpEmail.toUpperCase() == String(info[6]).toUpperCase()||username.toUpperCase() == String(info[1]).toUpperCase()){
          //Username or email exists already
          userExist = true;
          console.log("User already exists!");
          break;;
      }
    }
    return userExist;
}

function showStatus(message, col = "#f84e4e", opt=0){
  var emailError = document.getElementById('signUpError');
  if(opt == 1){emailError = document.getElementById('signInError');}
  emailError.textContent = message;
emailError.style.color = col;
  emailError.classList.add('show');
setTimeout(()=>{emailError.classList.remove('show')},5000);
}

let validEmail = false;
document.addEventListener('DOMContentLoaded', function() {
  var emailError = document.getElementById('signUpError');
  var emailForm = document.getElementById('signUpForm');
  var emailInput = document.getElementById('signUpEmail');

  emailInput.addEventListener('input', function() {
      var email = this.value;
      var regex = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook)\.com$/;;

      if (!regex.test(email)) {
          validEmail = false; 
      } else {
        validEmail = true;
      }  
  });
});



async function handleSignup(event) {
    try {
      event.preventDefault();
      const username = document.getElementById("signUpName").value.trim();
      const password = document.getElementById("signUpPassword").value.trim();
      const referredBy = localStorage.getItem('referredBy') || '';
      const showSignInButton = document.getElementById('showSignIn');
      const signUpEmail = document.getElementById('signUpEmail').value.trim();
      const signUpBtn = document.getElementById("sign_up");

      if (!username || !password) {
        alert('Please fill in both username and password');
        return;
      }else if(checkbox.checked == false) {
        showStatus("Verification failed, Please solve recaptcha!");
        return;
      }
      if (validEmail == false){
        showStatus("Please enter valid email address!");
        return;
  }

      signUpBtn.textContent = "Validating info...";
      setTimeout(()=>{signUpBtn.textContent = "SIGN UP";},3000);
      let userExist = await valUser();
      if (userExist == true){
            showStatus("User with same username or email already exists!");
      }else {
      circleLoad(false); //sign up or sign in load validator
      // Generate user IDs
      const newUserId = generateUserId();
      const newRefId = await generateRefId(newUserId);
  
      // Send data to Google Sheets
      let response = await addUserToGoogleSheets(newUserId, username, password, newRefId, referredBy, getDate(),signUpEmail);
      console.log(response);
      if (response.status !== 'success') { 
        throw new Error('Failed to add user to Google Sheets');
    }else{
        showStatus("Account created successfully!","green",opt=1);
        setTimeout(()=>{showSignInButton.click();},500);
        
    }
      // Clear referral info and redirect
      localStorage.removeItem('referredBy');
      //Initiate Seesion
      const sessionData = {
        uname: newUserId,
        username: username,
        expiresAt: Date.now() + 3600000 // 1 hour in milliseconds
      };
      
      localStorage.setItem('session', JSON.stringify(sessionData));
      Initiate(newUserId); 
      }
      
    } catch (error) {
      alert('Please check your internet connection and try again!');
    }
  }
  function Initiate(uname){
    //Take uname and creates necessary objects to kisckstart User
    //Creates portfolio, creates booster, creates payment settings
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

  function appendData(sheetarg,strData) {
    const sheet = sheetarg;
    const values = strData.split(',');
    makeRequest({
        action: 'append',
        sheet: sheet,
        values: JSON.stringify(values)
    });
  }

//Make sure backend is well configured to receive POST requests. whether with nodeJS or APPscript
async function addUserToGoogleSheets(userId, username,password, refId, referredBy, date,email) {
    let strData = String(userId+","+username+","+password+","+refId+","+referredBy+","+date+","+email);
    const values =strData.split(",");
   const response = makeRequest({
        action: 'append',
        sheet: 'User',
        values: JSON.stringify(values)
    });
    return response;
  }


async function handleSignin(event){
    try {
        event.preventDefault();
        //const showSignUpButton = document.getElementById('showSignUp');
        const username = document.getElementById("signInName").value.trim();
        const password = document.getElementById("signInPassword").value.trim();
        const signInError = document.getElementById('signInError');
  
        // Input validation
        if (!username || !password) {
          alert('Please fill in both username and password');
          return;
        }
        
        circleLoad(true);
        //get the usename and fetch corresponding password from sheets, if sheets
        let query = `WHERE Username = '${username}'`;
        let response = await makeRequest({
          action: 'query',
          sheet: 'User',
          query: query
        });
      if(response == "Error"){console.error("Errow within making request")}

      if(response.status === 'success' && Array.isArray(response.data)) {
        let found = false;
        for (let i = 1; i < response.data.length; i++) {
          let user = response.data[i];
          if (username == user[1] && user[2] == password) {
              found = true;
              console.log(response);
              // User found and password matches
              console.log('Login successful!');
              //Initiate Seesion
              const sessionData = {
                uname: user[0],
                username: username,
                expiresAt: Date.now() + 3600000 // 1 hour in milliseconds
              };
              const encodedUsername = encodeURIComponent(user[0]);
              setTimeout(()=>{window.location.href = `home.html?username=${encodedUsername}`;},1100)//}
              setTimeout(() => {
                showStatus("Sign-in Successfully Done!","green",opt=1);
            }, 500);
              return;
          }
      }
      showStatus('Incorrect Username or Password. Please try again!', "#f84e4e", opt=1);
    } 
        else{
          throw new Error('Unexpected data format from server') }
            
        }
        catch (error) {
        console.error(error);
        alert('Please check your internet connection and try again');

      }
  }

  