import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Create VPC
const appVpc = new aws.ec2.Vpc("app-vpc", {
  cidrBlock: "172.31.0.0/16",
  enableDnsHostnames: true,
});

// Create Gateway
const appGateway = new aws.ec2.InternetGateway("app-gateway", {
  vpcId: appVpc.id,
});


// // Construct a VPC
// export const vpc = new awsx.ec2.Vpc("vpc");

// // Create an Aurora Serverless MySQL database
// const dbsubnet = new aws.rds.SubnetGroup("dbsubnet", {
//   subnetIds: vpc.privateSubnetIds,
// });


// export const db = new aws.rds.Cluster("default", {
//   engine: "aurora",
//   engineMode: "serverless",
//   // engineVersion: "5.6.10a",
//   dbSubnetGroupName: dbsubnet.name,
//   masterUsername: "pulumi",
//   masterPassword: "Password",
//   skipFinalSnapshot: true,
// });

// // A function to run to connect to our database.
// export function queryDatabase(): Promise<any> {
//   return new Promise((resolve, reject) => {
//     var postgres  = require('postgres'); // CHECK

//     console.log("---> A0");
//     console.log("---> A1", db.endpoint.get());
//     console.log("---> A2", db.masterUsername.get());
//     console.log("---> A3", db.masterPassword.get());
//     console.log("---> A4", db.databaseName.get());


//     var connection = postgres.createConnection({
//       host     : db.endpoint.get(),
//       user     : db.masterUsername.get(),
//       password : db.masterPassword.get(),
//       database : db.databaseName.get(),
//     });

//     connection.connect();

//     console.log("querying...")
//     connection.query('SELECT 1 + 1 AS solution', function (error: any, results: any, fields: any) {
//       if (error) { reject(error); return }
//       console.log("RESULT", results[0]);
      
//       resolve(results[0].solution);
//     });

//     connection.end();
//   });
// }

const Pool = require("pg").Pool;

export const pool = new Pool({
  user: process.env["USER_NAME"],
  password: process.env["USER_PASSWORD"],
  host: process.env["RDS_ADDRESS"],
  port: process.env["RDS_PORT"],
  database: process.env["DATABASE_NAME"]
});


// module.exports = pool;