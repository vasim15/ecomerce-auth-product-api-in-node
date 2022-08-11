import express, { json } from 'express';
import cors from 'cors'
import mongoose from 'mongoose';
import path from 'path';


import { PORT,DB_URL } from './config';
import routers from './routers'
import errorHandler from './middalware/errorHandler'


const app = express();


mongoose.connect(DB_URL,{ useNewUrlParser: true,
    useUnifiedTopology: true,
});


const db = mongoose.connection;
db.on('error',()=>{console.error.bind(console,'connection Error')});
db.once('open',()=>{console.log('Db connected success')});

app.use(cors());
global.appRoot = path.resolve(__dirname);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api',routers);
app.use('/uploads',express.static('uploads'));

app.use(errorHandler);


app.listen(PORT,()=>{
    console.log('server is running on '+PORT);
})