const router = require('express').Router();
const {superAdminAuth} = require('../middleware/superAdminAuthentication')
const {
    validateLoginProcess,
    superAdminLogin,
    getAllUsers,
    updateUserStatus
}=require('../controllers/superAdminUserControllers')

router.post('/login', validateLoginProcess,superAdminLogin);
console.log('Chanduuu')
router.use(superAdminAuth)

router.patch('/update-user-status',updateUserStatus)
router.get('/get-all-users',getAllUsers)
module.exports=router