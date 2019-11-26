require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const Phonebook = require('./models/phonebook')

app.use(cors())
app.use(express.static('build'))
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

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/info', (req, res) => {
  Phonebook.find({}).then(persons => {
    res.send(`<p>Phonebook has infor for ${persons.length} people</p><p>${new Date()}</p>`)
  })
})

app.get('/api/persons', (req, res) => {
  Phonebook.find({}).then(persons => {
    res.json(persons.map(person => person.toJSON()))
  })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  const person = new Phonebook({
    name: body.name,
    number: body.number
  })
  person.save()
    .then(savedPerson => response.json(savedPerson.toJSON()))
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Phonebook.findById(req.params.id)
  .then(person => { 
    if(person) {
      res.json(person.toJSON())
    }  
     else {
       res.status(404).end()
     }
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Phonebook.findByIdAndRemove(req.params.id)
    .then(result => res.status(204).end())
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const person = new Phonebook({
    _id: req.params.id,
    name: body.name,
    number: body.number
  })
  Phonebook.findByIdAndUpdate(req.params.id, person, {new: true})
    .then(result => res.json(result.toJSON()))
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } 
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
    next(error)
  }
}
app.use(errorHandler)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
