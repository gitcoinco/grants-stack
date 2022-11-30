import { rds } from "@pulumi/aws";
import { ComponentResource, Output, ComponentResourceOptions } from "@pulumi/pulumi";
import * as postgresql from "@pulumi/postgresql";


export interface DBArgs {
    dbName: string;
    dbUser: string;
    dbPassword: string;
}

export class DB extends ComponentResource {
    public readonly dbAddress: Output<string>;
    public readonly dbName: Output<string>;
    public readonly dbUser: Output<string>;
    public readonly dbPassword: Output<string | undefined>;

    constructor(name: string, args: DBArgs, opts?: ComponentResourceOptions) {
        super("aws:db", name, args, opts);

        // create rds db instance
        const rdsName = `${name}-rds`;
        const rdsInstance = this.createPostgresServer(rdsName, args);

        this.dbAddress = rdsInstance.address;
        this.dbName = rdsInstance.dbName;
        this.dbUser = rdsInstance.username;
        this.dbPassword = rdsInstance.password;

        this.registerOutputs({}); // no outputs

    }

    createPostgresServer(rdsName: string, args: DBArgs, opts?: ComponentResourceOptions) {
        return new rds.Instance(rdsName, {
            dbName: args.dbName,
            username: args.dbUser,
            password: args.dbPassword,
            engine: "postgres",
            instanceClass: "db.t3.micro",
            allocatedStorage: 20,
            storageType: "gp2",
            skipFinalSnapshot: true,
            publiclyAccessible: false,
        }, { parent: this });
    }
}