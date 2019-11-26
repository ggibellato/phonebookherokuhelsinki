const mongoose = require('mongoose')

if(process.argv.length !==3 && process.argv.length !==5) {
  console.log('wrong parameters')
  console.log('use: ')
  console.log('node mongo.js yourpassword -> to list all the entries')
  console.log('or')
  console.log('node mongo.js yourpassword name phonenumber -> to add an entry')
  process.exit(1)
}



const password = process.argv[2]
const url = `mongodb+srv://fullstack:${password}@cluster0-b6nmi.mongodb.net/phonebook-app?retryWrites=true&w=majority`
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})

const phoneSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Phonebook = mongoose.model('Phonebook', phoneSchema)

if(process.argv.length ===5) {
  const name = process.argv[3]
  const number = process.argv[4]

  const entry = new Phonebook({name: name, number: number});
  entry.save().then(result => {
   console.log(`added ${result.name} number ${result.number} to phonebook`)
   mongoose.connection.close()
  })
}
else {
  Phonebook.find({}).then(result => {
    result.forEach(phonebook => {
      console.log(phonebook.name, phonebook.number)
    });
    mongoose.connection.close()
  })
}

