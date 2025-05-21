const OTPEmailTemplate = async (userName, otp) => {
   
   return ` <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Tutorbay OTP Verification Email</title>
        <style type="text/css">
            /* Reset default styles */
            body, table, td, a, p, h1, h2, h3, h4, h5, h6 {
                margin: 0;
                padding: 0;
                font-family: 'Helvetica Neue', Arial, sans-serif;
            }
            img {
                border: 0;
                line-height: 100%;
                outline: none;
                text-decoration: none;
                display: block;
            }
            table {
                border-collapse: collapse !important;
            }
            body {
                height: 100% !important;
                margin: 0;
                padding: 0;
                width: 100% !important;
                background-color: #E9EBED;
            }
            /* Main container */
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            /* Header */
            .header {
                background: linear-gradient(135deg, #261B60 0%, #1C3247 100%);
                padding: 30px 20px;
                text-align: center;
                color: #ffffff;
            }
            .header img {
                max-width: 150px;
                margin: 0 auto 15px auto;
            }
            .header h1 {
                font-size: 28px;
                font-weight: 700;
                letter-spacing: 1px;
            }
            .header p {
                font-size: 16px;
                opacity: 0.9;
                margin-top: 10px;
            }
            /* Content */
            .content {
                padding: 40px 30px;
                text-align: center;
                color: #1C3247;
            }
            .content h2 {
                font-size: 22px;
                font-weight: 600;
                margin-bottom: 20px;
            }
            .content p {
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 20px;
                color: #261B60;
            }
            .otp-code {
                display: inline-block;
                background: linear-gradient(135deg, #4186CD 0%, #E9EBED 100%);
                padding: 15px 40px;
                font-size: 28px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #FF821E;
                border-radius: 8px;
                margin: 25px 0;
                border: 1px solid #E9EBED;
                transition: transform 0.2s ease-in-out;
            }
            .otp-code:hover {
                transform: scale(1.05);
            }
            /* Footer */
            .footer {
                background-color: #E9EBED;
                padding: 20px;
                text-align: center;
                font-size: 13px;
                color: #261B60;
                border-top: 1px solid #E9EBED;
            }
            .footer a {
                color: #FF821E;
                text-decoration: none;
                font-weight: 500;
            }
            .footer a:hover {
                text-decoration: underline;
            }
            /* Responsive design */
            @media only screen and (max-width: 600px) {
                .container {
                    width: 100% !important;
                    border-radius: 0;
                }
                .header {
                    padding: 20px 15px;
                }
                .header img {
                    max-width: 120px;
                }
                .content {
                    padding: 20px 15px;
                }
                .otp-code {
                    font-size: 22px;
                    padding: 12px 30px;
                    letter-spacing: 6px;
                }
            }
        </style>
    </head>
    <body>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #E9EBED; padding: 20px;">
            <tr>
                <td align="center">
                    <table role="presentation" class="container" border="0" cellpadding="0" cellspacing="0" width="600">
                        <!-- Header -->
                        <tr>
                            <td class="header">
                                <img src="[Logo_URL]" alt="Tutorbay Logo" width="150">
                                <h1>Email Verification</h1>
                                <p>Welcome to Tutorbay!</p>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td class="content">
                                <h2>Hi ${userName},</h2>
                                <p>Thank you for signing up with Tutorbay! To complete your email verification, please use the One-Time Password (OTP) below:</p>
                                <div class="otp-code">${otp}</div>
                                <p>This code is valid for the next 10 minutes. Please do not share this code with anyone for security reasons.</p>
                                <p>If you did not request this verification, please ignore this email or contact our support team.</p>
                                <p>Thank you,<br>Tutorbay Team</p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td class="footer">
                                <p>© 2025 Tutorbay. All rights reserved.</p>
                                <p><a href="[Support_URL]">Contact Support</a> | <a href="[Privacy_URL]">Privacy Policy</a> | <a href="[Unsubscribe_URL]">Unsubscribe</a></p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
`

}

module.exports = OTPEmailTemplate