const emailTemplate = async(statusText,userName) => {
  return ` 
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Status Notification</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #E9EBED; /* Light gray */
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #4186CD 0%, #1C3247 100%); /* Light blue to darker blue */
      color: #ffffff;
      padding: 32px 24px;
      text-align: center;
    }
    .header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 32px;
      color: #1C3247; /* Darker blue for text */
    }
    .status {
      font-size: 18px;
      font-weight: 600;
      margin: 16px 0;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      transition: all 0.3s ease;
    }
    .status img {
      display: block;
      margin: 0 auto 8px;
      width: 80px; /* Adjust size as needed */
      height: auto;
    }
    .approved {
      background-color: #4186CD; /* Light blue */
      color: #ffffff;
    }
    .rejected {
      background-color: #FF821E; /* Orange */
      color: #ffffff;
    }
    .on-hold {
      background-color: #26160; /* Dark blue */
      color: #ffffff;
    }
    .cta-button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #FF821E; /* Orange */
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      margin: 16px 0;
      transition: background-color 0.3s ease;
    }
    .cta-button:hover {
      background-color: #e5730d; /* Slightly darker orange for hover */
    }
    .footer {
      background-color: #d7d9db; /* Slightly darker light gray */
      padding: 24px;
      text-align: center;
      font-size: 13px;
      color: #1C3247; /* Darker blue */
    }
    .footer a {
      color: #4186CD; /* Light blue */
      text-decoration: none;
      margin: 0 8px;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    @media (max-width: 600px) {
      .container {
        margin: 16px;
        border-radius: 8px;
      }
      .content {
        padding: 24px;
      }
      .header {
        padding: 24px 16px;
      }
      .header h2 {
        font-size: 20px;
      }
      .status img {
        width: 60px; /* Smaller size for mobile */
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Account Status Notification</h2>
    </div>
    <div class="content">
      <p>Dear ${userName},</p>

      <p>We are pleased to inform you that your account request has been thoroughly reviewed by our Super Admin team. Please find the current status of your account below:</p>

      <div class="status {{statusClass}}">
        <!--- <img src="https://yourcompany.com/images/{{statusClass}}.png" alt="{{statusText}} Icon"> -->
        Status: <strong>${statusText}</strong>
      </div>

      <!--- <p>{{statusMessage}}</p> -->

      <p>Should you have any questions or require further clarification, please do not hesitate to reach out to our support team. We are here to assist you.</p>

      <a href="mailto:support@tutorbay.ae" class="cta-button">Contact Support</a>

      <p>Thank you for choosing our services.</p>

      <p>Sincerely,<br>The Administration Team</p>
    </div>
    <div class="footer">
      <p>
        <a href="https://www.yourcompany.com">Website</a> | 
        <a href="https://twitter.com/yourcompany">Twitter</a> | 
        <a href="https://www.linkedin.com/company/yourcompany">LinkedIn</a>
      </p>
      <p>© {{year}} Your Company. All Rights Reserved.</p>
      <p>Your Company, 123 Business Street, Suite 100, City, Country</p>
    </div>
  </div>
</body>
</html>
`
}

module.exports = emailTemplate