/* Utility function to check if the request from the frontend
    contains the required parameter fields */
const checkParams = (requiredParams, requestParams) => {
    for (const p of requiredParams) {
        if (!(p in requestParams)) {
            return false;
        }
    }
    return true;
};


/* Utility function to check if the request from the frontend
    contains the required body fields */
const checkBody = (requiredBodyFields, requestBody) => {
    for (const f of requiredBodyFields) {
        if (!(f in requestBody)) {
            return false;
        }
    }
    return true;
};


/* Returns {"correct": bool, "message": string}. "correct" is True if all params
    and body fields are present, False otherwise. "message" contains useful information
    about which input was missing fields. */
const allDataPresent = (requiredParams, requestParams, requiredBodyFields, requestBody) => {
    // requiredParams, requiredBodyFields: array
    // requestParams, requestBody: JSON objects

    const paramFlag = checkParams(requiredParams, requestParams);
    const bodyFlag = checkBody(requiredBodyFields, requestBody);

    if (paramFlag && bodyFlag) {
        return { "correct": true, "message": "All params and body fields are present." };
    }
    if (!paramFlag) {
        return { "correct": false, "message": "Missing some parameters:\nExpected: [" + requiredParams.join(", ") +"]\nActual: [" + Object.keys(requestParams).join(", ") + "]"};
    }
    if (!bodyFlag) {
        return { "correct": false, "message": "Missing some body fields:\nExpected: [" + requiredBodyFields.join(", ") +"]\nActual: [" + Object.keys(requestBody).join(", ") + "]"};   
    }
};

export { allDataPresent };