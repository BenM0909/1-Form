const PDFHandler = {
  async getFormFields() {
    const pdfDocument = await pdfjsLib.getDocument(window.location.href).promise;
    const form = await pdfDocument.getForm();
    return form.getFields();
  },

  async fillFormField(field, value) {
    try {
      if (field.type === 'text') {
        await field.setText(value);
      } else if (field.type === 'checkbox') {
        await field.check();
      } else if (field.type === 'radio') {
        await field.select();
      }
      return true;
    } catch (error) {
      console.error('Error filling field:', error);
      return false;
    }
  }
};

