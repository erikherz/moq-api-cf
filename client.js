const fetch = require('node-fetch');

// Function to get data for a specific stream and optional edge URL
async function getData(stream, edge_url) {
  const workerUrl = 'https://cf-api.vivoh.earth/watch';
  let url = `${workerUrl}/${stream}`;
  
  // Add the edge_url parameter if provided
  if (edge_url) {
    url += `?edge=${encodeURIComponent(edge_url)}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('GET Response:', data);
  } catch (error) {
    console.error('Error during GET:', error);
  }
}

// Run the function with parameters passed from the command line
async function run() {
  const stream = process.argv[2];  // First argument: stream (e.g., "adena")
  const edge_url = process.argv[3]; // Second argument: edge URL (optional)

  if (!stream) {
    console.error('Please provide the "stream" parameter (e.g., "adena").');
    return;
  }

  console.log(`Sending GET request for stream: ${stream} with edge_url: ${edge_url || 'none'}`);
  await getData(stream, edge_url);
}

// Execute the run function
run();
