import {PermitModel} from "@/models/permit";

export interface RoleModel{
    cakeRoleId:number
    cakeRoleName:string
    cakeRoleDescription:string
    cakeRoleLevel:number
    cakePermitList:PermitModel[]
    createTime:Date
}