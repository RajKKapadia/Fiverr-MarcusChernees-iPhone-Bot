const { formatDialogflowResponse, getDialogflowParameters } = require('../helper/untils');
const { ERROR_MESSAGE } = require('../helper/constant');
const { searchProducts } = require('../helper/airtableAPIs');

const handleAirtableCall = async (phoneData, session) => {
    let responseData = {};
    // make airtable call
    let response = {};
    if (phoneData.variant === '') {
        response = await searchProducts(`${phoneData.product} ${phoneData.model}`, phoneData.storage, phoneData.type, '');
    } else {
        response = await searchProducts(`${phoneData.product} ${phoneData.model} ${phoneData.variant}`, phoneData.storage, phoneData.type, '');
    }
    if (response.status == 1) {
        let records = response.records;
        let outString = 'We have the following phones avaialble with us...\n';
        for (let index = 0; index < records.length; index++) {
            const element = records[index];
            if (index == records.length - 1) {
                outString += `(${index + 1}) ${element.fields['nombre_completo_link_formatted']}.\n`
            } else {
                outString += `(${index + 1}) ${element.fields['nombre_completo_link_formatted']}\n`
            }
        }
        outString += 'You can reply with the option number from above to move forward the purchase.';
        let oc = [
            {
                name: `${session}/contexts/phone_vars`,
                lifespanCount: 50,
                parameters: {
                    phoneData: phoneData,
                    records: records
                }
            },
            {
                name: `${session}/contexts/await_buy_option`,
                lifespanCount: 1
            }
        ];
        responseData = formatDialogflowResponse(outString, oc);
        return responseData;
    } else {
        responseData = formatDialogflowResponse(
            `We don't have ${phoneData.product} ${phoneData.model} ${phoneData.variant} in ${phoneData.storage} in ${phoneData.type} condition, Is there anything else I can help you with?`,
            []
        );
        return responseData;
    }
};

const handleUserProvideProductPhone = async (req) => {
    let parameters = getDialogflowParameters(req, 'phone_vars');
    let session = req.body.session;
    let responseData = {};
    if (Object.keys(parameters).length > 0) {
        let model = parameters.model;
        let phoneData = {
            product: model.product,
            model: model.number,
            variant: '',
            storage: `${parameters.storage.number} GB`,
            type: parameters.type
        };
        // check model not specified
        if (phoneData.model === undefined) {
            let oc = [
                {
                    name: `${session}/contexts/await_phone_model`,
                    lifespanCount: 1
                }
            ];
            responseData = formatDialogflowResponse(`Which specific model are you looking for the ${phoneData.product}? Like iPhone 14, iPhone 14 Pro Max, etc.`, oc);
            return responseData
        }
        // check for the variant
        if (model.hasOwnProperty('variant')) {
            phoneData.variant = model.variant;
        } else {
            phoneData.variant = '';
        }
        responseData = await handleAirtableCall(phoneData, session);
        return responseData;
    } else {
        responseData = formatDialogflowResponse(ERROR_MESSAGE, []);
        return responseData;
    }
};

const handleUserAskingAboutAlternatives = async (req) => {
    let parameters = getDialogflowParameters(req, 'phone_vars');
    let session = req.body.session;
    let responseData = {};
    if (Object.keys(parameters).length > 0) {
        let color = undefined;
        if (parameters.hasOwnProperty('color')) {
            if (parameters.color !== '') {
                color = parameters.color;
            }
        }
        if (color !== undefined) {
            responseData = formatDialogflowResponse('The color functionality will not work because of the Spanish language at this point.', []);
            return responseData;
        }
        let storage = undefined;
        let type = undefined;
        if (parameters.hasOwnProperty('storage')) {
            if (Object.keys(parameters.storage).length > 0) {
                storage = `${parameters.storage.number} GB`;
            }
        }
        if (parameters.hasOwnProperty('type')) {
            if (parameters.type !== '') {
                type = parameters.type;
            }
        }
        if (parameters.hasOwnProperty('phoneData')) {
            let phoneData = parameters.phoneData;
            if (storage !== undefined) {
                phoneData.storage = storage;
            }
            if (type !== undefined) {
                phoneData.type = type;
            }
            console.log(storage, type);
            console.log(phoneData);
            responseData = await handleAirtableCall(phoneData, session);
            return responseData;
        } else {
            responseData = formatDialogflowResponse(ERROR_MESSAGE, []);
            return responseData;
        }
    } else {
        responseData = formatDialogflowResponse(ERROR_MESSAGE, []);
        return responseData;
    }
};

const handleUserAskingAboutCondition = (req) => {
    let parameters = getDialogflowParameters(req, 'phone_vars');
    if (Object.keys(parameters).length > 0) {
        let selectedOption = parameters.selectedOption
        let record = parameters.records[selectedOption - 1];
        let outString = `The phone condition is ${record.fields['Condition']}, warranty info is ${record.fields['warranty_info']}, battery info is ${record.fields['bateria_automated']}, battery percentage is ${record.fields['bateria%_cuando_llego']} and aesthetic is ${record.fields['estetico']}.`;
        responseData = formatDialogflowResponse(outString, []);
        return responseData
    } else {
        responseData = formatDialogflowResponse(ERROR_MESSAGE, []);
        return responseData;
    }
};

const handleUserProvidesPhoneBuyOption = (req) => {
    let parameters = getDialogflowParameters(req, 'phone_vars');
    let session = req.body.session;
    if (Object.keys(parameters).length > 0) {
        let option = parameters.option;
        let record = parameters.records[option - 1];
        let oc = [
            {
                name: `${session}/contexts/await_confirmation`,
                lifespanCount: 1
            },
            {
                name: `${session}/contexts/phone_vars`,
                lifespanCount: 50,
                parameters: {
                    selectedOption: option
                }
            }
        ];
        responseData = formatDialogflowResponse(`Do you confirm to buy the ${record.fields['nombre_completo_link_formatted']}?`, oc);
        return responseData
    } else {
        responseData = formatDialogflowResponse(ERROR_MESSAGE, []);
        return responseData;
    }
};

const handleUserConfirmsPhoneBuy = (req) => {
    let parameters = getDialogflowParameters(req, 'phone_vars')
    if (Object.keys(parameters).length > 0) {
        responseData = formatDialogflowResponse(`You order is confirmed, we will contact you very soon.`, []);
        return responseData
    } else {
        responseData = formatDialogflowResponse(ERROR_MESSAGE, []);
        return responseData;
    }
};

module.exports = {
    handleUserProvideProductPhone,
    handleUserAskingAboutAlternatives,
    handleUserAskingAboutCondition,
    handleUserProvidesPhoneBuyOption,
    handleUserConfirmsPhoneBuy
};
