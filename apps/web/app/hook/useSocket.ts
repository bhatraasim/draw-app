import { useEffect, useState } from "react";
import { WS_URL } from "../config";

export function useSocket(){
    const [ loading , setLoading ] = useState(true)
    const [ socket , setSocket ]  = useState<WebSocket>()


    useEffect(() => {
      const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTcyNTU2MTdiMDcxMjA4MDQzZTEyOGQiLCJpYXQiOjE3NjkxMDA2NzAsImV4cCI6MTc2OTcwNTQ3MH0.fzn4ImtMQqwSnCUQZMUBzrVHHV1Anx0ls9T25IW3UPE`)

      ws.onopen = ()=>{
        setLoading(false)
        setSocket(ws)

      }
    }, [])


    return {
        socket ,
        loading
    }
    
}