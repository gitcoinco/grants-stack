import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Variables
let dbUsername = `${process.env["DB_USER"]}`;
let dbPassword = pulumi.secret(`${process.env["DB_PASSWORD"]}`);
let dbName = `${process.env["DB_NAME"]}`;
let dbUrl = `${process.env["DB_URL"]}`;
let apiImage = `${process.env["ECR_REGISTRY"]}/${process.env["ECR_REPOSITORY"]}:${process.env["API_IMAGE_TAG"]}`

let SUBGRAPH_MAINNET_API = `${process.env["SUBGRAPH_MAINNET_API"]}`
let SUBGRAPH_GOERLI_API = `${process.env["SUBGRAPH_GOERLI_API"]}`
let SUBGRAPH_OPTIMISM_MAINNET_API = `${process.env["SUBGRAPH_OPTIMISM_MAINNET_API"]}`
let SUBGRAPH_FANTOM_TESTNET_API = `${process.env["SUBGRAPH_FANTOM_TESTNET_API"]}`
let SUBGRAPH_FANTOM_MAINNET_API = `${process.env["SUBGRAPH_FANTOM_MAINNET_API"]}`
let SUBGRAPH_DUMMY_API = `${process.env["SUBGRAPH_DUMMY_API"]}`
let SENTRY_DSN = `${process.env["SENTRY_DSN"]}`
let OPTIMISM_ETHERSCAN_API = `${process.env["OPTIMISM_ETHERSCAN_API"]}`

// KMS Key
const grantsKey = new aws.kms.Key("grantsKey", {
    description: "grants kms key",
    deletionWindowInDays: 7,
});

// VPC
const vpc = new aws.ec2.Vpc("grants", {
    cidrBlock: "10.0.0.0/16",
    enableDnsHostnames: true,
    tags: {
        App: "Grants"
    }
});

const public_subnet = new aws.ec2.Subnet("public", {
    cidrBlock: "10.0.1.0/24",
    vpcId: vpc.id,
    tags: {
        Name: "Public",
        App: "Grants",
    },
});

const public_subnet_two = new aws.ec2.Subnet("public-two", {
    cidrBlock: "10.0.3.0/24",
    vpcId: vpc.id,
    tags: {
        Name: "Public",
        App: "Grants",
    },
});

const private_subnet = new aws.ec2.Subnet("private", {
    cidrBlock: "10.0.5.0/24",
    vpcId: vpc.id,
    availabilityZone: "us-west-2a",
    tags: {
        Name: "Private",
        App: "Grants",
    },
});

const private_subnet_two = new aws.ec2.Subnet("private-two", {
    cidrBlock: "10.0.10.0/24",
    vpcId: vpc.id,
    availabilityZone: "us-west-2b",
    tags: {
        Name: "Private",
        App: "Grants",
    },
});

const gw = new aws.ec2.InternetGateway("gw", {
    vpcId: vpc.id,
    tags: {
        App: "Grants",
    },
});

const nat_ip = new aws.ec2.Eip("nat_ip_new", {
    vpc: true,
});

const nat_gateway = new aws.ec2.NatGateway("grants_private_nat", {
    allocationId: nat_ip.id,
    subnetId: private_subnet.id,
    tags: {
        App: "Grants",
    },
}, {
    dependsOn: [gw.gw],
});

const public_route_table = new aws.ec2.RouteTable('public', {
    routes: [
      {
        cidrBlock: '0.0.0.0/0',
        gatewayId: gw.id
      }
    ],
    vpcId: vpc.id
  });

const publicRouteTableAssociation = new aws.ec2.RouteTableAssociation(
    'public-association',
    {
        routeTableId: public_route_table.id,
        subnetId: public_subnet.id
    }
);

const publicRouteTableAssociationTwo = new aws.ec2.RouteTableAssociation(
    'public-association-two',
    {
        routeTableId: public_route_table.id,
        subnetId: public_subnet_two.id
    }
);

const private_route_table = new aws.ec2.RouteTable('private', {
    routes: [
      {
        cidrBlock: '0.0.0.0/0',
        gatewayId: nat_gateway.id
      }
    ],
    vpcId: vpc.id
  });

const privateRouteTableAssociation = new aws.ec2.RouteTableAssociation(
    'private-association',
    {
        routeTableId: private_route_table.id,
        subnetId: private_subnet.id
    }
);

const privateRouteTableAssociationTwo = new aws.ec2.RouteTableAssociation(
    'private-association-two',
    {
        routeTableId: private_route_table.id,
        subnetId: private_subnet_two.id
    }
);

// Database
let dbSubnetGroup = new aws.rds.SubnetGroup("rds-subnet-group", {
    subnetIds: [private_subnet.id, private_subnet_two.id]
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

const postgresql = new aws.rds.Instance("grantsdatabase", {
    allocatedStorage: 50,
    engine: "postgres",
    instanceClass: "db.t3.medium",
    dbName: "grants",
    password: dbPassword,
    username: dbUsername,
    skipFinalSnapshot: true,
    dbSubnetGroupName: dbSubnetGroup.id,
    vpcSecurityGroupIds: [db_secgrp.id],
});

// Docker Registry

const registry = new aws.ecr.Repository("grants", {
    imageScanningConfiguration: {
        scanOnPush: true,
    },
    imageTagMutability: "MUTABLE",
});

// Load Balancer
const secgrp = new aws.ec2.SecurityGroup("grants", {
    description: "gitcoin",
    vpcId: vpc.id,
    ingress: [
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
    ],
    egress: [{
        protocol: "-1",
        fromPort: 0,
        toPort: 0,
        cidrBlocks: ["0.0.0.0/0"],
    }],
});

const grant_lb = new aws.lb.LoadBalancer("grants", {
    internal: false,
    loadBalancerType: "application",
    securityGroups: [secgrp.id],
    subnets: [private_subnet, private_subnet_two],
    enableDeletionProtection: true,
});

const grant_target = new aws.lb.TargetGroup("grants", {
    targetType: "ip",
    port: 80,
    protocol: "HTTP",
    vpcId: vpc.id,
});

const listener = new aws.lb.Listener("grants", {
    loadBalancerArn: grant_lb.arn,
    port: 80,
    protocol: "HTTP",
    defaultActions: [
        {
        type: "forward",
        targetGroupArn: grant_target.arn,
        },
    ],
});

// const listener_https = new aws.lb.Listener("grants_https", {
//     loadBalancerArn: grant_lb.arn,
//     port: 443,
//     protocol: "HTTPS",
//     defaultActions: [
//         {
//         type: "forward",
//         targetGroupArn: grant_target.arn,
//         },
//     ],
// });

// Fargate Instance
const FargateLogGroup = new aws.cloudwatch.LogGroup("fargateLogGroup", {});

const grantsEcs = new aws.ecs.Cluster("grants", {configuration: {
    executeCommandConfiguration: {
        kmsKeyId: grantsKey.arn,
        logging: "OVERRIDE",
        logConfiguration: {
            cloudWatchEncryptionEnabled: true,
            cloudWatchLogGroupName: FargateLogGroup.name,
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



const api = new aws.ecs.TaskDefinition("api", {
    family: "api",
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    cpu: "1024",
    memory: "2048",
    executionRoleArn: "arn:aws:iam::515520736917:role/ecsTaskExecutionRole",
    containerDefinitions: JSON.stringify([
        {
            name: "api",
            image: apiImage,
            cpu: 1024,
            memory: 2048,
            essential: true,
            portMappings: [{
                containerPort: 8080,
                hostPort: 8080,
            }],
            environment: [
                {
                    name: "PORT", 
                    value: "8080"
                },
                {
                    name: "DATABASE_URL", 
                    value: dbUrl
                },
                {
                    name: "SUBGRAPH_MAINNET_API",
                    value: SUBGRAPH_MAINNET_API
                },
                {
                    name: "SUBGRAPH_GOERLI_API",
                    value: SUBGRAPH_GOERLI_API
                },
                {
                    name: "SUBGRAPH_OPTIMISM_MAINNET_API",
                    value: SUBGRAPH_OPTIMISM_MAINNET_API
                },
                {
                    name: "SUBGRAPH_FANTOM_TESTNET_API",
                    value: SUBGRAPH_FANTOM_TESTNET_API
                },
                {
                    name: "SUBGRAPH_FANTOM_MAINNET_API",
                    value: SUBGRAPH_FANTOM_MAINNET_API
                },
                {
                    name: "SUBGRAPH_DUMMY_API",
                    value: SUBGRAPH_DUMMY_API
                },
                {
                    name: "SENTRY_DSN",
                    value: SENTRY_DSN
                },
                {
                    name: "OPTIMISM_ETHERSCAN_API",
                    value: OPTIMISM_ETHERSCAN_API
                }
            ],
        },
    ]),
});

const api_service = new aws.ecs.Service("api", {
    cluster: grantsEcs.id,
    taskDefinition: api.arn,
    desiredCount: 1,
    networkConfiguration: {
        subnets: [private_subnet.id],
        assignPublicIp: false,
    },
    loadBalancers: [{
        targetGroupArn: grant_target.arn,
        containerName: "api",
        containerPort: 8080,
    }],
});