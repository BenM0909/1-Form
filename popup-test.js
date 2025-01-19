// Simulating chrome.storage.local.get
const mockStorage = {
  authToken: 'mock-token',
  userId: 'mock-user-id'
};

function checkLoginStatus(callback) {
  // Simulating asynchronous storage access
  setTimeout(() => {
    callback(mockStorage);
  }, 100);
}

function fetchForms(userId) {
  // Simulating form fetching
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 'form1', formName: 'Personal Information' },
        { id: 'form2', formName: 'Employment Details' }
      ]);
    }, 200);
  });
}

// Simulating the DOMContentLoaded event handler
async function onDOMContentLoaded() {
  console.log('Extension popup opened');

  checkLoginStatus(async (result) => {
    if (result.authToken && result.userId) {
      console.log('User is logged in');
      console.log('Fetching forms...');
      const forms = await fetchForms(result.userId);
      console.log('Fetched forms:', forms);
    } else {
      console.log('User is not logged in');
    }
  });
}

// Run the simulation
onDOMContentLoaded();

