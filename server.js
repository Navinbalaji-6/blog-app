const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;
const URL =process.env.MONGODB_URL
const { MongoClient } = require("mongodb")

app.use(express.json({ extended: false }));

const withDB = async(operations) =>{
    try{
        const client = await MongoClient.connect(URL);
        const db = client.db("mernblog");
        await operations(db);
        client.close();
        }
        catch(error){
            res.status(500).json({message:"Error connecting to database",error})
        }
}

app.get('/api/articles/:name', async (req, res) => {
    withDB(async(db)=>{
    const articleName = req.params.name;
    const articleInfo = await db.collection('articles').findOne({name: articleName});
    res.status(200).json(articleInfo);
    },res)
});

app.post('/api/articles/:name/add-comments', (req,res) => {
    const {username,text} = req.body
    const articleName = req.params.name
    
    withDB(async(db)=>{
        const articleInfo = await db
        .collection("articles")
        .findOne({name:articleName});
        await db.collection('articles').updateOne(
            {name:articleName},
            {
                $set: {
                    comments: articleInfo.comments.concat({username,text}),
                },
            }
        );
        const updateArticleInfo = await db.collection('articles').findOne({
            name:articleName
        })
        res.status(200).json(updateArticleInfo);
    }, res);
});

app.get('/article-content', (req,res) =>{
    withDB(async(db)=>{
    const data = await db.collection('article-content').find({}).toArray();
    const articles = data.map(({_id,...rest}) => rest);
    res.status(200).json(articles);
    }, res);
})

app.get('/', (req,res) => res.send("Hello world"));
app.post('/', (req,res) => res.send(`${req.body.name}`));

app.get("/hello/:name",(req,res)=> res.send(`Hello ${req.params.name}`));

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));