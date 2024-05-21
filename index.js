"use strict";
const excelToJson = require("convert-excel-to-json");
const fs = require("fs");
const http = require("http");
const dotenv = require("dotenv");

dotenv.config();

const jsonData = excelToJson({
  source: fs.readFileSync("accPropertyIds17May2024.xlsx"),
  header: {
    rows: 1,
  },
  columnToKey: {
    A: "propertyId",
    B: "propertyName",
  },
});

const server = http.createServer((req, res) => {
  if (
    req.method === "GET" &&
    req.url.match(/\/api\/validateRegCode\/([0-9]+)/)
  ) {
    const regCodeFromReq = req.url.split("/")[3]; // index 3 is the reg code
    console.log("🚀 ~ server ~ regCodeFromReq:", regCodeFromReq)
    const isRegCodeValid = jsonData.Export.find(
      (data) => data.propertyId.toString() === regCodeFromReq
    );
    console.log("property", isRegCodeValid);
    if (isRegCodeValid) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Registration code is valid" }));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Registration code is not valid" }));
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Route not found" }));
  }
});

console.log("process.env.ENV", process.env.ENV);

const PORT = process.env.ENV == 'development' ? 5001 : 'https://clients-kdm.com/';

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
