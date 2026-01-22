import express from "express";
import jwt from "jsonwebtoken"
import { middleware } from "./middleware";
import { JWT_SECERT } from "@repo/backend-common"
import { CreateUserSchema  ,  CreateSigninSchema , CreateRoomSchema} from "@repo/common/types"

const app = express();
app.use(express.json());




app.post( " signup" , async (req , res) => {
  
  const data = CreateUserSchema.safeParse(req.body)
  if(!data.success){
     res.json({
      message : " incorrect inputs"
    })
    return
  }

  
  // db call  

  res.json({
    userId : 123
  })
})

app.post( "signin" , async (req , res) => {
  
  const data = CreateSigninSchema.safeParse(req.body)
  if(!data.success){
     res.json({
      message : " incorrect inputs"
    })
    return
  }

  const userId = 1
  
  const token = jwt.sign({
    userId,
  },JWT_SECERT)
})


app.post("/room" , middleware , async (req , res) => {
  const data = CreateRoomSchema.safeParse(req.body)
  if(!data.success){
     res.json({
      message : " incorrect inputs"
    })
    return
  }
})

app.listen(3001, () => {
  console.log("HTTP server running on 3001" );
});
