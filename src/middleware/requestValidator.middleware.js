const requestValidator = (property, schemaModel) => (req, res, next) => {
  let errorResponse = [];
  const acceptedProperties = ["query", "body"];

  if (!acceptedProperties.includes(property)) {
    throw new Error("Invalid method provided for validation");
  }

  const { error, value } = schemaModel.validate(req[property], {
    abortEarly: false,
  });

  if (error) {
    error.details.forEach((errorDetail) => {
      let errorObjectBuilder = {
        code: "INVALID_FORMAT",
        field: errorDetail.context.label,
      };
      errorResponse.push(errorObjectBuilder);
    });
    res.status(400).send({ errors: errorResponse });
  } else {
    req[property] = value;
    next();
  }
};

export default requestValidator;
