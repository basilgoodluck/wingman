import http from "http";
import generateResponse from "./utils/prompt";
import dotenv from "dotenv";

dotenv.config()

const server = http.createServer()
const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
    console.log(`Server runs on port ${PORT}`)
})

generateResponse("best way to learn rust")