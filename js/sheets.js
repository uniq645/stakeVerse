//read: trans, events, portfolio

//write: user, trans, portfolio

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



function appendData() {
const sheet = document.getElementById('appendSheet').value;
const values = document.getElementById('appendValues').value.split(',');
makeRequest({
    action: 'append',
    sheet: sheet,
    values: JSON.stringify(values)
});
}

function updateData(sheet,condCol,condVal,updCol,updVal) {
const sheet = sheet;
const conditionColumn = condCol;
const conditionValue = condVal;
const updateColumn = updCol;
const updateValue = updVal;
makeRequest({
    action: 'update',
    sheet: sheet,
    condition: JSON.stringify({column: conditionColumn, value: conditionValue}),
    updateValues: JSON.stringify({column: updateColumn, value: updateValue})
});
}

function readData() {
const sheet = document.getElementById('readSheet').value;
makeRequest({
    action: 'read',
    sheet: sheet
});
}

function queryData(sheet, condCol, element) {
const sheet = sheet;
let query = `WHERE ${condCol} = '${element}'`;
makeRequest({
    action: 'query',
    sheet: sheet,
    query: query
});
}