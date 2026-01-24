"use client";
import styles from "./page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";



export default function Home() {

  const [roomId, setRoomId] = useState("");
  const router = useRouter();
  return (
    <div className={styles.page}>
      
    <div className="">
      <div className=" bg-red ">Join the room</div>
      <input value={roomId} onChange={e => { setRoomId(e.target.value) }} type="text" placeholder="RoomId" />
      <button onClick={() => {
        router.push(`/room/${roomId}`)
      }}> Join the room</button>
    </div>

    </div>
  );
}
