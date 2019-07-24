import { Controller, Param, Body, Get, Post, Put, Delete, Patch, Req, Res, UploadedFile } from "routing-controllers";
// import { checkAuth } from '../middlewares/check-auth';
import { User } from '../models/UserModel';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import mongoose from 'mongoose';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Controller()
export class AuthRoutes {

   @Post("/auth/register")
   async register(@UploadedFile("employeeImage", { options: multer() }) file: any, @Body() body: any, @Req() req: any, @Res() res: any) {

      await User.find({ email: body.email })
         .exec()
         .then(async (user) => {
            if (user.length >= 1) {
               await res.status(409).json({
                  message: "Mail Already exists"
               });
            }
         });
      var userr: any = {
         _id: new mongoose.Types.ObjectId(),
         email: body.email,
         pass: await bcrypt.hash(body.pass, 10)
      };
      var userData = new User(userr);
      var ress: any = userData
         .save().catch((err: any) => {
            console.log(err);
            res.status(500).json({
               error: err
            });
         });
      const token = jwt.sign(
         {
            email: await ress.email,
            userId: await ress._id
         },
         "secret",
         {
            expiresIn: "1h"
         }
      );
      res.status(201).json({
         message: "User created",
         token: token
      });
   }


   @Post("/auth/login")
   async login(@UploadedFile("employeeImage", { options: multer() }) file: any, @Body() body: any, @Req() req: any, @Res() res: any) {

      await User.find({ email: body.email })
         .exec()
         .then(async (user: any) => {
            if (user.length < 1) {
               return res.status(401).json({
                  message: "Email not found"
               });
            } else {
               var result = await bcrypt.compare(body.pass, user[0].pass);
               if (result) {
                  const token = jwt.sign(
                     {
                        email: user[0].email,
                        userId: user[0]._id
                     },
                     "secret",
                     {
                        expiresIn: "1h"
                     }
                  );
                  res.status(200).json({
                     message: "Auth succ",
                     token: token
                  });
               } else {
                  res.status(401).json({
                     message: "Auth failed"
                  });
               }
            }
         })
         .catch(err => {
            console.log(err);
            res.status(500).json({
               error: err
            });
         });
   }

   @Post("/auth/reset")
   async reset(@UploadedFile("employeeImage", { options: multer() }) file: any, @Body() body: any, @Req() req: any, @Res() res: any) {
      await User.find({ email: body.email })
         .exec()
         .then(async (user: any) => {
            console.log(body);
            if (user.length < 1) {
               return res.status(401).json({
                  message: "Mail doesn\'t Exist"
               });
            } else {
               var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
               var key = user[0].pass;
               var text = user[0]._id + 'time:' + new Date();
               var cipher = crypto.createCipher(algorithm, key);
               var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');

               var finalChipher = crypto.createCipher('aes256', 'password');
               var finalEncrypt = finalChipher.update(encrypted + 'email:' + user[0].email, 'utf8', 'hex') + finalChipher.final('hex');

               var transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                     user: '7208436929.pk@gmail.com',
                     pass: 'pritpk1234'
                  }
               });
               var mailOptions = {
                  from: '7208436929.pk@gmail.com',
                  to: req.body.email,
                  subject: 'Please reset your password',
                  text: 'http://localhost:4200/auth/reset/' + finalEncrypt
               };
               if (await transporter.sendMail(mailOptions)) {
                  console.log('Email sent');
                  res.status(201).json({
                     res: 'Email Sent'
                  });
               }
            }

         })
         .catch(err => {
            console.log(err);
            res.status(500).json({
               error: err
            });
         });
   }

   @Post("/auth/reset/:id")
   async changePassword(@Param("id") id: string, @UploadedFile("employeeImage", { options: multer() }) file: any, @Body() body: any, @Req() req: any, @Res() res: any) {
      var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
      var key = 'password';
      var decipher = crypto.createDecipher(algorithm, key);
      var decrypted = decipher.update(id, 'hex', 'utf8') + decipher.final('utf8');

      var id = decrypted.split('email:')[0];
      var email = decrypted.split('email:')[1];
      console.log('email is', email);
      console.log('id is', id);
      var userr: any;

      await User.find({ email: email })
         .exec()
         .then((user: any) => {
            if (user.length < 1) {
               return res.status(401).json({
                  message: "Mail doesn\'t Exist"
               });
            }
            userr = user;
         })
         .catch(err => {
            console.log(err);
            res.status(500).json({
               message: 'Link is Expired'
            });
         });

      try {
         var finalDecipher = crypto.createDecipher('aes256', userr[0].pass);
         var finalDecrypted = finalDecipher.update(id, 'hex', 'utf8') + finalDecipher.final('utf8');

         await User.update({ _id: finalDecrypted.split('time:')[0] }, { pass: await bcrypt.hash(body.pass, 10) })
            .exec()
            .then(async (result: any) => {
               return res.status(201).json({
                  new: await result
               });
            })
            .catch(err => {
               return res.status(500).json({
                  error: err
               });
            });
         console.log(userr[0].pass);
      } catch (error) {
         res.status(500).json({
            message: 'Link is Expired'
         });
      }
   }
}