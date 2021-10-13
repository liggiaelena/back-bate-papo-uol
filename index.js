import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs';
 
let users =[];

const posts =[];

const app = express();
app.use(cors());
app.use(express.json());

app.post("/participants", (req,res)=>{
    const {name} = req.body;

    if(!name || name.length === 0){
        res.sendStatus(400)
        return
    }
    const alredyisaname = users.find((u)=> u.name === name)
    if(alredyisaname){
        res.sendStatus(400)
        return
    }
    const participant ={
        name: name, 
        lastStatus: Date.now()
    };
    const message = {
        from: name, 
        to: 'Todos', 
        text: 'entra na sala...', 
        type: 'status', 
        time: dayjs().format("HH:mm;ss")
    };
    posts.push(message);

    users.push(participant)
    
    res.status(200).send(users)
});

app.get("/participants", (req,res)=>{

    res.send(users)
});

app.post("/messages", (req,res)=>{
    const {
        to,
        text,
        type,
    } = req.body;

    if(!to || !text || !type){
        res.sendStatus(400)
    }

    const from = req.headers.user

    const message = {
        to,
        text,
        type,
        from,
        time: dayjs().format("HH:mm:ss")
    };
    posts.push(message);
    res.send(message)

});

app.get("/messages", (req,res)=>{
    const user = req.headers.user;
    const limit = req.query.limit;
    const filterMessages = posts. filter(message=>{
        if(message.to === user || message.to === "Todos" || message.from === user){
            return true
        }
    })
    if(limit){
        const newfilter = filterMessages.filter((m,i)=>{
            if(i<limit){
                return true
            }
            i++
        })
        res.send(newfilter)
        return
    }
    res.send(filterMessages)
})

app.post("/status", (req,res)=>{
    const user = req.headers.user;
    const exist = users.find((u)=> u.name === user)
    if(!exist){
        res.sendStatus(400)
        return
    }
    exist.lastStatus = Date.now();
    res.send("ok")
})

setInterval(()=>{
 const now = Date.now();

 const expired = users.filter(participant=>{
     if(((now-participant.lastStatus)/1000>=10)){
         return true;
     }
 })
expired.forEach(p=>{
    const message = {
        from: p.name, 
        to: 'Todos', 
        text: 'entra na sala...', 
        type: 'status', 
        time: dayjs().format("HH:mm;ss")
    }
    posts.push(message)
})
    users = users.filter(p => !expired.includes(p))

},15000)

app.listen(4000);