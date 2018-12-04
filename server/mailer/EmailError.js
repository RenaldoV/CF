class EmailError extends Error {

  constructor(missingFields) {
    super();
    if (missingFields.length > 0) {
      var message = "The following fields are invalid: ";
      for (let field in missingFields) {
        message += field + ", ";
      }
      this.message = message;
      this.name = 'Invalid fields ERROR';
      this.message = message;
      this.stack = (new Error()).stack;
    }

  }
}


module.exports = EmailError;
