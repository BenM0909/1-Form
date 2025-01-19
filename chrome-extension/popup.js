// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAOynljZxRBWBI5gAZET2Mmrdlk1hKa2hc",
  authDomain: "form-d9742.firebaseapp.com",
  projectId: "form-d9742",
  storageBucket: "form-d9742.firebasestorage.app",
  messagingSenderId: "43982469253",
  appId: "1:43982469253:web:2ac5d4eaa0433a14e911ec"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', async function() {
  const status = document.getElementById('status');
  const formSelector = document.getElementById('formSelector');
  const loginPrompt = document.getElementById('loginPrompt');
  const formList = document.getElementById('formList');
  const fillForm = document.getElementById('fillForm');
  const result = document.getElementById('result');

  // Check if we're on a PDF
  chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
    try {
      const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'CHECK_PDF' });
      
      if (response.isPDF) {
        status.innerHTML = `
          <div class="success">
            PDF form detected with ${response.fieldCount} fillable fields
          </div>
        `;
        
        // Check authentication after confirming PDF
        auth.onAuthStateChanged(handleAuthStateChanged);
      } else {
        status.innerHTML = `
          <div class="warning">
            No PDF form detected. Please open a PDF form to use auto-fill.
          </div>
        `;
        formSelector.style.display = 'none';
        loginPrompt.style.display = 'none';
      }
    } catch (error) {
      status.innerHTML = `
        <div class="error">
          Error: Could not detect PDF form. Please refresh the page.
        </div>
      `;
    }
  });

  async function handleAuthStateChanged(user) {
    if (user) {
      loginPrompt.style.display = 'none';
      formSelector.style.display = 'block';
      await loadUserForms(user.uid);
    } else {
      loginPrompt.style.display = 'block';
      formSelector.style.display = 'none';
    }
  }

  async function loadUserForms(userId) {
    try {
      formList.innerHTML = '<option value="">Loading forms...</option>';
      fillForm.disabled = true;

      const formsSnapshot = await db.collection('forms')
        .where('userId', '==', userId)
        .get();

      formList.innerHTML = '<option value="">Select a form</option>';
      
      formsSnapshot.forEach(doc => {
        const form = doc.data();
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = form.formName || 'Untitled Form';
        formList.appendChild(option);
      });

      if (formsSnapshot.empty) {
        formList.innerHTML = '<option value="">No forms found</option>';
      }
    } catch (error) {
      console.error('Error loading forms:', error);
      result.innerHTML = `
        <div class="error">
          Error loading forms: ${error.message}
        </div>
      `;
    }
  }

  formList.addEventListener('change', function() {
    fillForm.disabled = !this.value;
  });

  fillForm.addEventListener('click', async function() {
    const selectedFormId = formList.value;
    if (!selectedFormId) return;

    try {
      fillForm.disabled = true;
      fillForm.textContent = 'Filling form...';
      result.innerHTML = '<div class="info">Processing...</div>';

      const formDoc = await db.collection('forms').doc(selectedFormId).get();
      const formData = formDoc.data();

      chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
        const response = await chrome.tabs.sendMessage(tabs[0].id, {
          action: 'FILL_FORM',
          formData: formData
        });

        if (response.success) {
          result.innerHTML = `
            <div class="success">
              ${response.message}
            </div>
          `;
        } else {
          result.innerHTML = `
            <div class="error">
              ${response.message}
            </div>
          `;
        }

        fillForm.textContent = 'Auto-Fill PDF Form';
        fillForm.disabled = false;
      });
    } catch (error) {
      console.error('Error:', error);
      result.innerHTML = `
        <div class="error">
          Error: ${error.message}
        </div>
      `;
      fillForm.textContent = 'Auto-Fill PDF Form';
      fillForm.disabled = false;
    }
  });
});

