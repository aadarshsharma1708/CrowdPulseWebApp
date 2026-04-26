import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const [name, rollNumber, pollId] = process.argv.slice(2)

if (!name || !rollNumber || !pollId) {
    console.error('Usage: node saveVoterDetail.js "<name>" "<rollNumber>" "<pollId>"')
    process.exit(1)
}

const filePath = path.join(__dirname, 'voterDetails.txt')
const record = `${new Date().toISOString()} | pollId=${pollId} | name=${name} | rollNumber=${rollNumber}\n`

fs.appendFileSync(filePath, record, 'utf8')
console.log(`Appended voter detail to ${filePath}`)
