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


async function handleBoost(){
  try {
      const rate = document.getElementById('earningRate');
      const hold = document.getElementById('boosterCount');
      const btName = document.querySelectorAll(".booster-name");
  
      let query = `WHERE UserID = '${uname}'`;
      let response = await makeRequest({
        action: 'query',
        sheet: 'Booster',
        query: query
      });
      //if bon is "" form SourceBuffer, set parent.attribute 
      if(response == "Error"){console.error("Errow within making request")}

      if(response.status === 'success' && Array.isArray(response.data)) {
        let bcount = 0;
      btName.forEach(element => {
       let bname = element.textContent;
        for (let i = 1; i < response.data.length; i++) {
          let info = response.data[i];
          console.log(info);
          if (info[0] == bname && (info[2] == "active" || info[2] == "working")) {
            //has active boosters
            element.parentNode.classList.add("active");
          } else {
            //no active booster for this one
            element.parentNode.classList.add("sleeping");
          }
          bcount += Number(info[5]);
          console.log(bcount)
        }
      }); 
      
      if(isNaN(bcount)){hold.textContent = 0;}else{hold.textContent = bcount / 3}
    } else{
      throw new Error('Unexpected data format from server') }    
    }
    catch (error) {
  console.error(error);
    //redirect to sign in page
  }
}


async function handleSubs(){
  try {
      const tableBody = document.querySelector('#subsTable tbody');
  
      let query = `WHERE UserID = '${uname}'`;
      let response = await makeRequest({
        action: 'query',
        sheet: 'Subs',
        query: query
      });
      
      if(response == "Error"){console.error("Errow within making request")}


      if(response.status === 'success' && Array.isArray(response.data)) {
            tableBody.innerHTML = '';
            response.data.forEach((transaction, index) => {
                if(index !=0){
                const row = tableBody.insertRow();
                row.innerHTML = `
            <td>${transaction[0]}</td>
            <td>${transaction[6]}</td>
            <td>$${transaction[4]}</td>
            <td>${transaction[3]}</td>
        `;}
            });
    } else{
      throw new Error('Unexpected data format from server') }    
    }
    catch (error) {
    console.error(error);
    //redirect to sign in page
  }
}

const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
      handleSubs();
      observer.disconnect(); // Only fetch once
  }
});

observer.observe(document.querySelector('.staking-box'));












 