import "reflect-metadata"; // this shim is required
import { createExpressServer } from "routing-controllers";
import { EmpRoutes } from "./api/Controllers/EmpController";
import { AuthRoutes } from './api/Controllers/AuthController';
import mongoose from 'mongoose';
import bodyParser = require("body-parser");
import * as express from 'express';

// connecting mongoose
mongoose.connect('mongodb+srv://node-shop:node-shop@node-shop-rest-slxeu.mongodb.net/test?retryWrites=true&w=majority',
    { useNewUrlParser: true });
mongoose.connection.on('open', () => {
   console.info('Connected to Mongo.');
});
mongoose.connection.on('error', (err: any) => {
   console.error(err);
});
// creates express app, registers all controller routes and returns you express app instance
const app = createExpressServer({
   cors: true,
   controllers: [EmpRoutes, AuthRoutes] // we specify controllers we want to use
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
// run express application on port 3000
app.listen(3000);

