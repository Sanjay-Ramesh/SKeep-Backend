const express = require('express');
const app = express();

const swaggerjsdoc = require("swagger-jsdoc");
const swaggerui = require("swagger-ui-express");

// Import body-parser and set up urlencodedParser
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use('/uploads',express.static('uploads'));
const fs = require('fs');




const multer = require('multer');

const localStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads')
    },
    filename: (req,file,cb)=>{
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random()*1E9)
        console.log(file.originalname.split("."))
        cb(null,file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.')[1])
    }
})

const upload = multer({storage:localStorage});

// Enable CORS for all origins
const cors = require('cors');
app.use(cors({
    origin: '*'
}));




const uuid = require("uuid")

const port = 3000;

/**
 * @swagger
 * components:
 *      schema:
 *          Notes:
 *              type: array
 *              items:
 *                  type: object
 *                  properties:
 *                      Note:
 *                          type: object
 *                          properties:
 *                              id:
 *                                  type: string
 *                              Title:
 *                                  type: string
 *                              Body:
 *                                  type: string
 *                              List:
 *                                  type: array 
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          title:
 *                                              type: string
 *                                          completed:
 *                                              type: boolean
 *                              tags:
 *                                  type: array
 *                                  items:
 *                                      type: string
 *                              timeStamp:
 *                                  type: string
 *                              image:
 *                                  type: string
 *                              
 *                      timeStamp:
 *                          type: string
 *          removeNote:
 *              type: string
 *          
 *          updateNote:
 *              type: object
 *              properties:
 *                  Note:
 *                      type: object
 *                      properties:
 *                          id:
 *                              type: string
 *                          Title:
 *                              type: string
 *                          Body:
 *                              type: string
 *                          List:
 *                              type: array
 *                              items:
 *                                  type: object
 *                                  properties:
 *                                      title:
 *                                          type: string
 *                                      completed:
 *                                          type: boolean
 *                          tags:
 *                              type: array
 *                              items:
 *                                  type: string
 *                          timeStamp:
 *                              type: string
 *   
 *          search:
 *              type: object
 *              properties:
 *                  key:
 *                      type: string
 *          addNote:
 *              type: object
 *              properties:
 *                  Note:
 *                      type: object
 *                      properties:
 *                          Title:
 *                              type: string
 *                          Body:
 *                              type: string
 *                          List:
 *                              type: array
 *                              items:
 *                                  type: object
 *                                  properties:
 *                                      title:
 *                                          type: string
 *                                      completed:
 *                                          type: boolean
 *                          tags:
 *                              type: array
 *                              items:
 *                                  type: string
 * 
 *  
 *                         
 *                  
 *                    
 */



/**
 * @swagger
 * /:
 *  get:
 *      summary: To get all the notes from local storage
 *      description: This api is used to fetch data from local storage
 *      responses:
 *          200:
 *              description: The note were retrieved successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                              $ref: '#components/schema/Notes'
 *                             
 */
app.get('/', async (req, res) => {
    // Get the notes from storage
    const notes = await storage.getItem('notes');

    // Get the current timestamp
    const timestamp = Date.now();
    const dateObject = new Date(timestamp);

    // Send the notes and timestamp in the response
    res.status(200).send({ notes: notes, timeStamp:dateObject });
});



/**
 * @swagger
 * /addNote:
 *  put:
 *      summary: This api is used to update an note object
 *      description: This api is used to update an note object
 *      requestBody:
 *          required: true
 *          content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#components/schema/addNote'
 *      responses:
 *          200:
 *              description: Note Added successfully
 *              
 */
app.put('/addNote',upload.single('noteImage') ,urlencodedParser, async (req, res) => {
    try {
        // Get the current list of notes
        let notes = await storage.getItem('notes');
        const timestamp = Date.now();
        const dateObject = new Date(timestamp);
        // New note to add
        console.log(JSON.parse(req.body.note))
        let newNote = JSON.parse(req.body.note)
        newNote['id']=uuid.v1()
        newNote['timeStamp']=dateObject
        newNote['image']="http://localhost:3000/uploads/"+ req.file.filename
        // Check if the note already exists based on the unique identifier (id)
        const isNoteExists = notes.some((note) => note.id === newNote.id);

        if (!isNoteExists) {
            // Add the new note to the list
            notes.push(newNote);

            // Save the updated list back to storage
            await storage.setItem('notes', notes);

            res.status(200).send("Note Added Successfully");
        } else {
            res.status(400).send("Note Already Exists");
        }
    } catch (err) {
        console.error('Error adding note:', err);
        res.status(500).send("Internal Server Error");
    }
});

/**
 * @swagger
 * /removeNotes:
 *  get:
 *      summary: This api is used to remove an note object
 *      description: This api is used to remove an note object
 *      parameters:
 *        - in: header 
 *          name: id
 *          schema:
 *             type: string
 *          required: true
 *          description: The Note id to delete
 *      responses:
 *          200:
 *              description: Note Removed successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#components/schema/removeNote'
 */
app.get('/removeNotes', urlencodedParser, async (req, res) => {
    // Note ID to remove
    const id = 124;
    // Get the current list of notes
    const notes = await storage.getItem('notes');
    let temp = []
    // Filter out the note with the given ID
    notes.map(note => {
        if (note.id != id) {
            temp.push(note)
        }
    });
    // Save the updated list back to storage
    storage.setItem('notes', temp);
    res.status(200).send("Note ${id} removed successfully");
});



/**
 * @swagger
 * /updateNotes:
 *  post:
 *      summary: This api is used to update an note object
 *      description: This api is used to update an note object
 *      parameters:
 *          - in: header
 *            name: noteImage
 *            type:
 *              image/jpeg:
 *                  schema:
 *                      type: string
 *                      contentMediaType: image/jpeg
 *                      contentEncoding: base64
 *                          
 *      requestBody:
 *          required: true
 *          content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#components/schema/updateNote'
 *      responses:
 *          200:
 *              description: Note Removed successfully
 *              
 */


app.post('/updateNote',urlencodedParser,async (req,res)=>{
    // const id=req.body.id;
    // console.log(req.body)
    // let notes = await storage.getItem('notes');
    // for(let i=0;i<notes.length;i++){
    //     if(notes[i].id==id){
    //         notes[i]=req.body.note[0];
    //     }
    // }
    // console.log(req.body.note)
    // storage.setItem('notes',notes)
    // res.status(200).send(`Note ${id} updated successfully`)
    storage.setItem('notes',req.body.notes)
    res.status(200).send(`Notes updated successfully`)
})


/**
 * @swagger
 * /search:
 *  post:
 *      summary: This api is used to search from note objects
 *      description: This api is used to search notes using tag, title and body
 *      requestBody:
 *          required: true
 *          content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#components/schema/search'
 *      responses:
 *          200:
 *              description: API SUCCESS 👍
 *              
 */

app.post('/search', urlencodedParser, async (req, res) => {
    // Search key
    // console.log(req.body.key)
    let key = req.body.key;
    // Get the current list of notes
    const notes = await storage.getItem('notes');
    let temp = []
    notes.map((note, idx) => {
        // console.log(note);
        // Check if the note matches the search key in its Title or Body
        if ((note.Title.toLowerCase().includes(key.toLowerCase()) || note.Body.toLowerCase().includes(key.toLowerCase()))) {
            temp.push(note);
        }

        // Check if the search key exists in the tags of the note
        note?.tags.map(tag => {
            if (tag.toLowerCase().includes(key.toLowerCase()) && !temp.includes(note)) {
                temp.push(note);
            }
        });

        // Check if the search key exists in the List titles of the note
         note?.List.map((item) => {
            if (item.title.toLowerCase().includes(key.toLowerCase()) && !temp.includes(note)) {
                temp.push(note);
            }
        });
    });
    // Send the search results in the response
    res.send(temp);
});




const storage = require('node-persist');




const options = {
    definition:{
        openapi:"3.0.0",
        info:{
            title:"Skeep API Swagger Doc",
            version:"0.1",
            description:"REST API for Skeep application",
            contact:{
                name: "Sanjay Ramesh",
                email: "sanjayramesh2111@gmail.com",
            }
        },
        servers:[{
            url:"http://localhost:3000/",
        },
    ]
    },
    apis: ["./index.js"]
};


/**
 * @swagger
 * components:
 *      schemas:
 *          Notes:
 *              type: array
 *              items:
 *                  type: object
 *                  properties:
 *                      Note:
 *                          type: object
 *                          properties:
 *                              id:
 *                                  type: string
 *                              Title:
 *                                  type: string
 *                              Body:
 *                                  type: string
 *                              List:
 *                                  type: array 
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          title:
 *                                              type: string
 *                                          completed:
 *                                              type: boolean
 *                              tags:
 *                                  type: array
 *                                  items:
 *                                      type: string
 *                              timeStamp:
 *                                  type: string
 *                              image:
 *                                  type: string
 *                              
 *                      timeStamp:
 *                          type: string
 *          removeNote:
 *              type: string
 *          
 *          updateNote:
 *              type: object
 *              properties:
 *                  Note:
 *                      type: object
 *                      properties:
 *                          id:
 *                              type: string
 *                          Title:
 *                              type: string
 *                          Body:
 *                              type: string
 *                          List:
 *                              type: array
 *                              items:
 *                                  type: object
 *                                  properties:
 *                                      title:
 *                                          type: string
 *                                      completed:
 *                                          type: boolean
 *                          tags:
 *                              type: array
 *                              items:
 *                                  type: string
 *                          timeStamp:
 *                              type: string
 *   
 *          search:
 *              type: object
 *              properties:
 *                  key:
 *                      type: string
 *          addNote:
 *              type: object
 *              properties:
 *                  Note:
 *                      type: object
 *                      properties:
 *                          Title:
 *                              type: string
 *                          Body:
 *                              type: string
 *                          List:
 *                              type: array
 *                              items:
 *                                  type: object
 *                                  properties:
 *                                      title:
 *                                          type: string
 *                                      completed:
 *                                          type: boolean
 *                          tags:
 *                              type: array
 *                              items:
 *                                  type: string
 * 
 *  
 *                         
 *                  
 *                    
 */



const specs = swaggerjsdoc(options)
app.use("/api-docs",swaggerui.serve,swaggerui.setup(specs))

app.listen(port, async () => {
    // Initialize storage
    await storage.init();

    // Get the initial list of notes from storage or create it if it doesn't exist
    let notes = await storage.getItem('notes');
    if (!notes) {
        notes = [];
        await storage.setItem('notes', notes);
    }

    console.log(`REST API Notes System listening on port ${port}`);
});
