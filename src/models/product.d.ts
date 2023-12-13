import {Label} from "@/models/label";

export interface Product{
    cakeProductId:number
    cakeProductName:string
    cakeProductPhoto:string
    cakeProductPrice:number
    cakeLabelList:Label[]
    createTime:Date
}