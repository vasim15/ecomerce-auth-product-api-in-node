import express from 'express'
const router = express.Router();

import { registerController,loginController,userController,refreshController, productController } from '../controllers'
import auth from '../middalware/auth';
import admin from '../middalware/admin'
import payment from '../controllers/payment';


router.post('/register',registerController.register);
router.post('/login',loginController.login);
router.get('/me',auth,userController.me);
router.post('/refresh',refreshController.refresh);
router.post('/logout',auth,loginController.logout);
router.post('/product',[auth, admin],productController.store);
router.put('/product/:id',[auth, admin],productController.update);
router.delete('/product/:id',[auth, admin],productController.destroy);
router.get('/products',productController.index);
router.get('/product/:id',productController.show);



router.post('/payment/paynow', payment.paynow)
router.post("/payment/callback", payment.callback);



router.get('/',(req,res) => {
    res.status(200).json('this is working');
    console.log('klsjdflkskdlfl')

});


export default router;