const formatDialogflowResponse = (message, oc) => {
    let responseData = {};
    responseData['fulfillmentText'] = message;
    if (oc.length > 0) {
        responseData['outputContexts'] = oc;
    }
    return responseData;
};

const getDialogflowParameters = (req, contextName) => {
    let parameters = {};
    let outputContexts = req.body.queryResult.outputContexts;
    outputContexts.forEach(oc => {
        if (oc.name.includes(contextName)) {
            parameters = oc.parameters;
        }
    });
    return parameters;
};

module.exports = {
    formatDialogflowResponse,
    getDialogflowParameters
};
