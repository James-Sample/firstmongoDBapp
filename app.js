const { ObjectID } = require('bson')
const express = require('express')
const { connectToDb, getDb } = require('./db')

//init app & middlewre
const app = express()
app.use(express.json())

// db connection
let db
connectToDb((err) => {
    if (!err) {
        app.listen(3000, () => {
            console.log('app listening on port 3000')
        })
        db = getDb()     
    }
})

// routes

app.get('/books', (req, res) => {
    // for pagination, the || 0 means deault is page 0
    const page = req.query.p || 0
    const booksPerPage = 3

    let books = []
    db.collection('books')
        .find()
        .sort({ author: 1 })
        .skip(page * booksPerPage)      // for pagination, to ensure we skip books on previous pages
        .limit(booksPerPage)            // limit amount of books on a page
        .forEach(book => books.push(book))
        .then(() => {
            res.status(200).json(books)
        })
        .catch(() => {
            res.status(500).json({error: "couldn't fetch docs"})
        })

})

app.get('/books/:id', (req, res) => {
    
    if(ObjectID.isValid(req.params.id)){
        db.collection('books')
    .findOne({_id: ObjectID(req.params.id)})
    .then(doc => {
        res.status(200).json(doc)
    })
    .catch(err => {
        res.status(500).json({error: "couldnt fetch docs"})
    })
    } else {
        res.status(500).json({error: 'Not Valid ID'})
    }

})

app.post('/books', (req, res) => {
    const book = req.body

    db.collection('books')
    .insertOne(book)
    .then(result => {
        res.status(201).json(result)
    })
    .catch(err => {
        res.status(500).json({err: "Coudlnt create new doc"})
    })
})

app.delete('/books/:id', (req, res) => {
    if (ObjectID.isValid(req.params.id)) {
        db.collection('books')
        .deleteOne({_id: ObjectID(req.params.id)})
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            res.status(500).json({error: "Couldnt delete the doc"})
        })
    } else {
        res.status(500).json({error: "not a valid ID"})
    }
})

app.patch('/books/:id', (req, res) => {
    const updates = req.body

    if (ObjectID.isValid(req.params.id)) {
        db.collection('books')
        .updateOne({_id: ObjectID(req.params.id)}, {$set: updates})
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            res.status(500).json({error: "Couldnt update document"})
        })
    } else {
        res.status(500).json({error: "ID not valid"})
    }
})