let isPDF = false;
let pdfFields = null;

// Check if we're viewing a PDF
async function initializePDFHandler() {
  isPDF = window.location.href.endsWith('.pdf');
  
  if (isPDF) {
    try {
      // Initialize PDF.js
      pdfFields = await PDFHandler.getFormFields();
      chrome.runtime.sendMessage({ type: 'PDF_DETECTED', fields: pdfFields.length });
    } catch (error) {
      console.error('Error initializing PDF handler:', error);
    }
  }
}

// Watch for PDF viewers that might load dynamically
const observer = new MutationObserver(checkForPDF);
observer.observe(document.body, { childList: true, subtree: true });

// Initial check
checkForPDF();

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'CHECK_PDF') {
    sendResponse({ isPDF, fieldCount: pdfFields?.length || 0 });
  }
  
  if (request.action === 'FILL_FORM') {
    try {
      const result = await fillPDFForm(request.formData);
      sendResponse({ success: result.success, message: result.message });
    } catch (error) {
      sendResponse({ success: false, message: error.message });
    }
  } else if (request.action === "fillForm") {
    try {
      // Get all visible form fields from the PDF
      const formFields = await extractFormFields();
      
      // Use AI to analyze and match fields
      const matchedFields = await analyzeAndMatchFields(formFields, request.formData);
      
      // Fill the form with matched data
      const success = await fillFormFields(matchedFields);
      
      sendResponse({ success });
    } catch (error) {
      console.error('Error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Keep the message channel open for async response
});

function checkForPDF() {
  isPDF = window.location.href.toLowerCase().endsWith('.pdf') || 
          document.querySelector('embed[type="application/pdf"]') !== null ||
          document.querySelector('object[type="application/pdf"]') !== null;
  
  // Notify the popup about PDF status
  chrome.runtime.sendMessage({ action: "updatePDFStatus", isPDF });
}

async function extractFormFields() {
  const fields = [];
  
  // Get all input fields, including PDF form fields
  document.querySelectorAll('input, textarea, [contenteditable="true"]').forEach(field => {
    const fieldInfo = {
      element: field,
      type: field.type || 'text',
      name: field.name || '',
      id: field.id || '',
      label: getFieldLabel(field),
      placeholder: field.placeholder || '',
      value: field.value || ''
    };
    fields.push(fieldInfo);
  });

  return fields;
}

function getFieldLabel(field) {
  // Try to find a label
  const labelElement = field.labels?.[0] || 
                      document.querySelector(`label[for="${field.id}"]`) ||
                      field.closest('label');
  
  if (labelElement) {
    return labelElement.textContent.trim();
  }

  // Look for nearby text that might be a label
  const previousText = field.previousSibling?.textContent?.trim() ||
                      field.previousElementSibling?.textContent?.trim();
  
  return previousText || '';
}

async function analyzeAndMatchFields(formFields, userData) {
  // Prepare the analysis prompt
  const fieldsDescription = formFields.map(f => ({
    label: f.label,
    type: f.type,
    name: f.name,
    id: f.id,
    placeholder: f.placeholder
  }));

  // Use AI to analyze and match fields
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "You are an AI assistant that matches form fields with user data. Analyze the form fields and suggest the best matches from the user's data."
      }, {
        role: "user",
        content: JSON.stringify({
          formFields: fieldsDescription,
          userData: userData
        })
      }],
      temperature: 0.3
    })
  });

  const result = await response.json();
  const matches = JSON.parse(result.choices[0].message.content);

  // Return matched fields with their elements
  return matches.map(match => ({
    ...match,
    element: formFields.find(f => f.id === match.id || f.name === match.name)?.element
  }));
}

async function fillFormFields(matchedFields) {
  let filledCount = 0;

  for (const field of matchedFields) {
    if (field.element && field.value) {
      field.element.value = field.value;
      field.element.dispatchEvent(new Event('input', { bubbles: true }));
      field.element.dispatchEvent(new Event('change', { bubbles: true }));
      filledCount++;
    }
  }

  return filledCount > 0;
}

async function fillPDFForm(formData) {
  if (!isPDF || !pdfFields) {
    return { success: false, message: 'No PDF form detected' };
  }

  let filledFields = 0;
  const fieldMappings = {
    'name': ['name', 'full name', 'fullname'],
    'email': ['email', 'e-mail', 'emailaddress'],
    'phone': ['phone', 'telephone', 'contact'],
    'address': ['address', 'street', 'location'],
    // Add more mappings as needed
  };

  for (const field of pdfFields) {
    const fieldName = field.name.toLowerCase();
    let matched = false;

    // Check each form data field against the PDF field
    for (const [dataKey, dataValue] of Object.entries(formData)) {
      const mappings = fieldMappings[dataKey.toLowerCase()] || [dataKey.toLowerCase()];
      
      if (mappings.some(mapping => fieldName.includes(mapping))) {
        const success = await PDFHandler.fillFormField(field, dataValue);
        if (success) {
          filledFields++;
          matched = true;
          break;
        }
      }
    }
  }

  return {
    success: filledFields > 0,
    message: `Successfully filled ${filledFields} fields`
  };
}

// Initialize when the content script loads
initializePDFHandler();

