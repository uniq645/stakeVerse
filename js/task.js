
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


async function handleTask(){
    try {
        let query = `WHERE ID = '#task'`;
        let response = await makeRequest({
          action: 'query',
          sheet: 'Misc',
          query: query
        });

      console.log(response);
    
      if(response == "Error"){console.error("Errow within making request")}
      if(response.status === 'success' && Array.isArray(response.data)) {
        let tasks=[];
        for(let i=1; i < response.data.length; i++ ){
        let info = response.data[i];//console.log(info)
        let tasklet ={name: info[0],points: Number(info[1]),id: i,type: info[2], 
            code: info[6],dest:info[4], desc:info[3], cooldown: info[7]};
        tasks.push(tasklet);
         }
        console.log(tasks);
        populateTasks(tasks);
        const navy = document.querySelector(".navbar");
        navy.style.display = "flex";
        } 
        else{
          throw new Error('Unexpected data format from server') }    
        }
       catch (error) {
        console.error(error);
      }
  }

let accBalance = 0;
let currentPoints = 0;
function updateData(sheet,condCol,condVal,updCol,updVal) {
    makeRequest({
        action: 'update',
        sheet: sheet,
        condition: JSON.stringify({column: condCol, value: condVal}),
        updateValues: JSON.stringify({column: updCol, value: updVal})
    });
}

let uname = "#345";

function updatePoints(points) {
    currentPoints += points;
    updateData("Portforlio","UserID",uname,"Loyal Points",currentPoints); 
}
//Fetch porforlio to add rewards when necessary
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
        accBalance = info[7];
        currentPoints = info[6];
        } 
        else{
          throw new Error('Unexpected data format from server') }    
        }
        catch (error) {
        console.error(error);
      }
  }

  submitVerification.onclick = function() {
    const verificationCode = verificationInput.value.trim();
    if (verificationCode == currentTask.code) {
        if(currentTask.type == "video" || currentTask.type == "article" || currentTask.type=="bot"){
            setTimeout(() => {
                alert(`Task "${currentTask.name}" completed! You earned ${currentTask.points} points.`);
                updatePoints(currentTask.points);
                taskCompletionTimes[currentTask.id] = Date.now();
                localStorage.setItem('taskCompletionTimes', JSON.stringify(taskCompletionTimes));
                updateTaskStatus(currentTask);
                modal.style.display = 'none';
                verificationInput.value = '';
            }, 1000);
        }
    } else if(verificationCode && currentTask.type == "join"){
        updateData("Misc","Name",currentTask.name,currentTask.code,verificationCode); 
        alert("Awaiting manual review ! (48 hours at most)"); 
        taskCompletionTimes[currentTask.id] = Date.now();
        localStorage.setItem('taskCompletionTimes', JSON.stringify(taskCompletionTimes));
        updateTaskStatus(currentTask);
        modal.style.display = 'none';
        verificationInput.value = '';
    }
    else {
        alert('Please enter a valid verification code or UID.');
        return;
    }
}  

window.onload = function() {
  // Parse the URL to get the username
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username');
  
  if (username) {
      // Decode the username to handle special characters
      const cardLinks = document.querySelectorAll('.card a');
      const decodedUsername = decodeURIComponent(username);
      uname = decodedUsername;
      console.log( `Hello, ${decodedUsername}!`);
      const encodedUsername = encodeURIComponent(uname);
      var extension = `?username=${encodedUsername}`;
      handleTask();
      setTimeout(()=>handlePort(),3500)
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
  } else {
      console.log('No user found. Please sign up.');
      window.location.href = `signup.html`;
  }
}
