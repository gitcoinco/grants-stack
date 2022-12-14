import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Variables
let dbUsername = `${process.env["DB_USER"]}`;
let dbPassword = pulumi.secret(`${process.env["DB_PASSWORD"]}`);
let dbName = `${process.env["DB_NAME"]}`;

// KMS Key
const grantsKey = new aws.kms.Key("grantsKey", {
    description: "grants kms key",
    deletionWindowInDays: 7,
});

// VPC
const vpc = new awsx.ec2.Vpc("grants", {
    subnets: [
        { type: "public", },
        { type: "private", mapPublicIpOnLaunch: true },
    ],
});

// Database
let dbSubnetGroup = new aws.rds.SubnetGroup("rds-subnet-group", {
    subnetIds: vpcPrivateSubnetIds
});

const db_secgrp = new aws.ec2.SecurityGroup("db_secgrp", {
    description: "Security Group for DB",
    vpcId: vpc.id,
    ingress: [
        { protocol: "tcp", fromPort: 5432, toPort: 5432, cidrBlocks: ["0.0.0.0/0"] },
    ],
    egress: [{
        protocol: "-1",
        fromPort: 0,
        toPort: 0,
        cidrBlocks: ["0.0.0.0/0"],
    }],
});

const postgresql = new aws.rds.Instance("grants-database", {
    allocatedStorage: 50,
    engine: "postgres",
    instanceClass: "db.t3.medium",
    name: dbName,
    password: dbPassword,
    username: dbUsername,
    skipFinalSnapshot: true,
    dbSubnetGroupName: dbSubnetGroup.id,
    vpcSecurityGroupIds: [db_secgrp.id],
});

// Fargate Instance
const FargateLogGroup = new aws.cloudwatch.LogGroup("fargateLogGroup", {});

const grantsEcs = new aws.ecs.Cluster("grants", {configuration: {
    executeCommandConfiguration: {
        kmsKeyId: exampleKey.arn,
        logging: "OVERRIDE",
        logConfiguration: {
            cloudWatchEncryptionEnabled: true,
            cloudWatchLogGroupName: exampleLogGroup.name,
        },
    },
}});

const grantsEcsProvider = new aws.ecs.ClusterCapacityProviders("fargateCapacityProvider", {
    clusterName: grantsEcs.name,
    capacityProviders: ["FARGATE"],
    defaultCapacityProviderStrategies: [{
        base: 1,
        weight: 100,
        capacityProvider: "FARGATE",
    }],
});