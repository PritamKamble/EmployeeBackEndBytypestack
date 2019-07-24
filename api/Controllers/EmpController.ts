import { Controller, Param, Body, Get, Post, Put, Delete, Patch, Req, Res, UploadedFile } from "routing-controllers";
import { Emp } from '../models/EmpModels';
import multer = require("multer");
import * as mongoose from 'mongoose';
import fs from 'fs';



const storage = multer.diskStorage({
   destination: function (req: any, file: any, cb: any) {
      cb(null, './uploads');
   },
   filename: function (req, file, cb) {
      cb(null, new Date().toISOString() + file.originalname);
   }
});

const fileFilter = (req: any, file: any, cb: any) => {
   // reject a file
   if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
   } else {
      cb(null, false);
   }
};

const upload = multer({
   storage: storage,
   limits: {
      fileSize: 1024 * 1024 * 5
   },
   fileFilter: fileFilter
});


@Controller()
export class EmpRoutes {


   @Get("/employee/")
   async emp_get_all(@Req() req: any, @Res() res: any) {
      await Emp.find()
         .exec()
         .then(response => {
            res.status(200).json(response);
         })
         .catch(err => {
            res.status(500).json(err);
         });
   };

   @Post("/employee/")
   async emp_create_emp(@UploadedFile("employeeImage", { options: upload }) file: any, @Body() body: any, @Req() req: Request, @Res() res: Response) {
      let emp = {
         firstName: body.firstName,
         lastName: body.lastName,
         email: body.email,
         gender: (body.gender ? body.gender : ''),
         age: (body.age ? body.age : ''),
         dateOfBirth: (body.dateOfBirth ? body.dateOfBirth : ''),
         salary: (body.salary ? body.salary : ''),
         address: (body.address ? body.address : ''),
         contact: (body.contact ? body.contact : ''),
         hobbies: (body.hobbies ? body.hobbies : ''),
         techSkills: (body.techSkills ? body.techSkills : ''),
         state: (body.state ? body.state : ''),
         city: (body.city ? body.city : ''),
         zipCode: (body.zipCode ? body.zipCode : ''),
         employeeImage: (file ? file.path : "uploads/default-avatar.png")
      };
      Emp.insertMany(emp).then(result => {
         console.log(result);
      })
         .catch(err => {
            console.log(err);
         });
      return body;
   }

   @Get("/employee/:empId")
   async emp_get_emp(@Param("empId") id: string, @Body() body: any, @Req() req: any, @Res() res: any) {
      await Emp.findById(id)
         .exec()
         .then(doc => {
            if (doc) {
               res.status(200).json({
                  emp: doc,
                  request: {
                     type: "GET",
                     url: "http://localhost:3000/employee/" + doc._id
                  }
               });
            } else {
               res.status(404)
                  .json({ message: "No valid entry found for provided ID" });
            }
         })
         .catch(err => {
            res.status(500).json({
               pathofmethod: 'api_ctrl_employee_emp_get_emp()',
               error: err
            });
         });
   }

   @Patch("/employee/:empId")
   async updateEmp(@UploadedFile("employeeImage", { options: upload }) file: any, @Param("empId") id: string, @Body() body: any, @Req() req: any, @Res() res: any) {

      const updateOps: any = {};

      updateOps['firstName'] = req.body.firstName;
      updateOps['lastName'] = req.body.lastName;
      updateOps['email'] = req.body.email;
      updateOps['gender'] = req.body.gender;
      updateOps['age'] = req.body.age;
      updateOps['dateOfBirth'] = req.body.dateOfBirth;
      updateOps['salary'] = req.body.salary;
      updateOps['address'] = req.body.address;
      updateOps['contact'] = req.body.contact;
      updateOps['hobbies'] = req.body.hobbies;
      updateOps['techSkills'] = req.body.techSkills;
      updateOps['state'] = req.body.state;
      updateOps['city'] = req.body.city;
      updateOps['zipCode'] = req.body.zipCode;

      if (req.file) {
         updateOps['employeeImage'] = req.file.path;
      }

      await Emp.update({ _id: id }, { $set: updateOps })
         .exec()
         .then(result => {
            res.status(200).json({
               message: "Employee updated",
               request: {
                  type: "GET",
                  url: "http://localhost:3000/employee/" + id
               }
            });
         })
         .catch(err => {
            res.status(500).json({
               pathofmethod: 'api_ctrl_employee_emp_update_emp()',
               error: err
            });
         });
   }

   @Delete("/employee/:empId")
   async deleteEmp(@Param("empId") id: string, @Body() body: any, @Req() req: any, @Res() res: any) {
      Emp.findById(id)
         .exec()
         .then((result: any) => {
            if (result.employeeImage != "uploads/default-avatar.png") {
               fs.unlinkSync(result.employeeImage);
            }
         });
      await Emp.deleteOne({ _id: id })
         .exec()
         .then(result => {
            res.status(200).json({
               message: "Employee deleted",
               request: {
                  type: "POST",
                  url: "http://localhost:3000/employee/" + id,
                  body: { firstName: "String", lastName: "String" },
                  result: result
               }
            });
         })
         .catch(err => {
            res.status(500).json({
               pathofmethod: 'api_ctrl_employee_emp_delete_emp()',
               error: err
            });
         });
   }

   private createPromise(data: any, timeout: number): Promise<any> {
      return new Promise<any>((ok, fail) => {
         setTimeout(() => ok(data), timeout);
      });
   }

}