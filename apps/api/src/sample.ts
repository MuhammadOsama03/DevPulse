export type Service = {id:string;name:string;status:"healthy"|"degraded";latencyMs:number};
// Illustrative demo values only. These are not real measurements.
export const demoServices:Service[]=[{id:"gateway",name:"API Gateway",status:"healthy",latencyMs:42},{id:"worker",name:"Background Worker",status:"degraded",latencyMs:230}];
