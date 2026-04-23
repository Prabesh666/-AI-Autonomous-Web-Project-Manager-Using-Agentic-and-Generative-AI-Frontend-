import{n}from"./api-DEXHMIGU.js";var e=async(t,a,r={})=>n.post("/agents/run",{projectId:a,type:t,...r}),g=async t=>n.get(`/agents/status/${t}`);export{e as n,g as t};
