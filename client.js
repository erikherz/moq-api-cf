const fetch = require('node-fetch');

const workerUrl = 'https://cf-api.vivoh.earth';
const namespace = 'ohio'; // This is your namespace, modify it if necessary

// Function to send a POST request to the Worker
async function postData() {
  const jsonData = {
    url: 'https://ohio.vivoh.earth',
    description: 'This is a test entry for the ohio namespace.'
  };

  try {
    const response = await fetch(`${workerUrl}/${namespace}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    });

    const data = await response.json();
    console.log('POST Response:', data);
  } catch (error) {
    console.error('Error during POST:', error);
  }
}

// Function to send a GET request to the Worker
async function getData() {
  try {
    const response = await fetch(`${workerUrl}/${namespace}`);
    const data = await response.json();
    console.log('GET Response:', data);
  } catch (error) {
    console.error('Error during GET:', error);
  }
}

// Function to send a DELETE request to the Worker
async function deleteData() {
  try {
    const response = await fetch(`${workerUrl}/${namespace}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    console.log('DELETE Response:', data);
  } catch (error) {
    console.error('Error during DELETE:', error);
  }
}

// Run the functions
async function run() {
  console.log('Sending POST request...');
  await postData();

  console.log('Sending GET request...');
  await getData();

  console.log('Sending DELETE request...');
  await deleteData();
}

run();
