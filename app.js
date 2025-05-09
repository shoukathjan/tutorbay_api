const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path')
const mongooseConnect = require('./config/dbConnection');
const app = express();
// const {insertGlobalConstants}=require('./controllers/workOrdersController')
// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Database Connection
mongooseConnect.DbConnect();
 

// Routes 
const usersRoute = require('./customer/routes/usersRoute');
const postRequireMents = require('./customer/routes/postRequirementsRoute')

const errorcontroller = require('./customer/controllers/errorcontroller');

//Super Admin Routes.

const superAdminUserRoutes = require('./superAdmin/routes/superAdminUserRoute')

app.use('/api/users', usersRoute);
app.use('/api/requirements', postRequireMents);


//Super Admin
// app.use('/api/accounts',SuperAdminAccountRoutes)
app.use('/api/super-admin/users',superAdminUserRoutes)

// Error Handling Middleware (optional)
app.use(errorcontroller);


app.listen(5000, () => {
    console.log(`Server is working on port 5000`);
});
module.exports = app;
