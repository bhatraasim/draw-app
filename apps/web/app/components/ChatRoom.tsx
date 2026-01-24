import axios from "axios"
import { BACKEND_URL } from "../config"
import ChatRoomClient from "./ChatRoomClient"


async function getChats(roomId : string) {
    const respose = await axios.get(`${BACKEND_URL}/chats/${roomId}`)
   
    return respose.data.messages
}

export default async function ChatRoom({id}: {id: string}) {

    const chats = await getChats(id)
  return <ChatRoomClient  messages={chats} id={id}/>;
}

