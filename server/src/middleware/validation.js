/**
 * Simple request validation middleware factory.
 * Pass a function that receives the body and returns an error string or null.
 */
export function validateBody(validateFn) {
  return (req, res, next) => {
    const error = validateFn(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
    next();
  };
}

/**
 * Validate create/update of an API key record.
 */
export function validateApiKey(body) {
  const { platformName, keyLabel, keyValue, createdBy } = body;

  if (!platformName || !platformName.trim()) {
    return 'platformName is required';
  }
  if (!keyLabel || !keyLabel.trim()) {
    return 'keyLabel is required';
  }
  if (!keyValue || !keyValue.trim()) {
    return 'keyValue is required';
  }
  if (!createdBy || !createdBy.trim()) {
    return 'createdBy is required';
  }
  if (body.endpointUrl && !isValidUrl(body.endpointUrl)) {
    return 'endpointUrl must be a valid URL';
  }
  if (body.docsUrl && !isValidUrl(body.docsUrl)) {
    return 'docsUrl must be a valid URL';
  }
  if (body.expirationDate) {
    const d = new Date(body.expirationDate);
    if (isNaN(d.getTime())) {
      return 'expirationDate must be a valid date';
    }
  }
  return null;
}

function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}