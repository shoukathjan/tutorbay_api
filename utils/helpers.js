const bcrypt = require('bcryptjs');

const key = Buffer.from(process.env.CRYPTO_KEY, 'hex');
let iv = Buffer.from(process.env.CRYPTO_IV, 'hex')

async function hashPwd(pwd) {

    var hmac = await bcrypt.hash(pwd, Number(process.env.WEBSITE_SALT));
    console.log('hmac', hmac)
    return hmac;
};

async function comparePassword(password, hashedPassword) {
    const hashedString = await bcrypt.compare(password, hashedPassword)
    console.log("hashed", hashedString)
    return hashedString;
    //if(hashedString)
}

const axios = require('axios');
const emailTemplate = require('./emailTemplate');
async function sendEmail(status, userName, email) {

    const apikey = process.env.BREVO_API_KEY
    const url = "https://api.sendinblue.com/v3/smtp/email"
    const emailData = {
        sender: {
            name: "Tutorbay",
            email: process.env.BREVO_EMAIL
        },
        to: [
            {
                email: email
            }

        ],
        subject: "Test Email",
        // htmlContent: '<html><body><h1>Hello World!!!!</h1></body></html>'
        htmlContent: await emailTemplate(status,userName)

    }
    try {
        console.log('Enter--11111')
        const response = await axios.post(url, emailData, {
            headers: {
                'Content-Type': "application/json",
                'api-key': apikey
            }
        })
        console.log('Email sent successfully................')
    } catch (error) {
        console.log("error:===", error)
    }


}

module.exports = {
    hashPwd,
    comparePassword,
    sendEmail
}