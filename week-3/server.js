const express = require('express')
const app = express()

app.use(express.static('./'))

const PORT = Number(process.argv[2]) || 5000

app.get('/', (req, res) => {
  res.sendFile('jukebox.html', { root: __dirname})
})

app.listen(PORT, () => console.log(`Server started on port ${PORT}\nhttp://localhost:${PORT}`))
