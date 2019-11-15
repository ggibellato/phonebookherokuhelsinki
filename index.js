const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

app.use(cors())
app.use(bodyParser.json())
app.use(morgan((tokens, req, res) => {
  let ret = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'];
    
  const body = req.body
  if(Object.entries(body).length !== 0) {
    ret = ret.concat(JSON.stringify(body));
  }
  return ret.join(' ')
}))

let persons = [
  {
    id: 1,
    name: "Karl Scott",
    number: "030-123456"
  },
  {
    id: 2,
    name: "Mark Black",
    number: "044-5532232"
  },
  {
    id: 3,
    name: "John Doll",
    number: "055-19709892"
  },
  {
    id: 4,
    name: "Mary Watson",
    number: "044-342245"
  },
  {
    id: 5,
    name: "Sam Robert",
    number: "040-1309109834"
  }
]

const generateId = () => {
  return Math.floor(Math.random() * Math.floor(999999999999))
}

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/info', (req, res) => {
  res.send(`<p>Phonebook has infor for ${persons.length} people</p><p>${new Date()}</p>`)
})

app.get('/api/persons', (req, res) => {
   res.json(persons)
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  if(!body.name) {
    return response.status(400).json({
      error: 'name is missing'
    })
  }
  if(!body.number) {
    return response.status(400).json({
      error: 'number is missing'
    })
  }
  if(persons.find( p => p.name === body.name)) {
    return response.status(400).json({
      error: 'name already exist on the phonebook'
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)

  response.json(person)
})


app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  if(person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)
  res.status(204).end()
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
