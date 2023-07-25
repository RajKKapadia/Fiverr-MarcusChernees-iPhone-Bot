const axios = require('axios').default;
require('dotenv').config();

const searchProducts = async (model, storage, type, color) => {
    let filterByFormula = '';
    if (color === '') {
        filterByFormula += `AND({modelo}="${model}", {gb}="${storage}", {condicion}="${type}")`;
    } else {
        filterByFormula += `AND({modelo}="${model}", {gb}="${storage}", {condicion}="${type}", {color}="${color}")`;
    }
    let options = {
        method: 'GET',
        url: process.env.AIRTABLE_URL,
        params: {
            filterByFormula: filterByFormula,
            maxRecords: '5',
            view: 'Raj'
        },
        headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_API_TOKEN}`
        }
    };
    let response = await axios.request(options);
    if (response.status === 200 && response.statusText === 'OK') {
        if (response.data.records.length > 0) {
            return {
                status: 1,
                records: response.data.records
            };
        } else {
            return {
                status: 0,
                records: []
            };
        }
    } else {
        return {
            status: 0,
            records: []
        };
    }
};

module.exports = {
    searchProducts
};
