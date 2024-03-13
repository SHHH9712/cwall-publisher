"use client";

import axios from "axios";
import { useState } from "react";
import { Button } from "./ui/button";


export default function ListFolders() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const listFolders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("api/listGoogleDrive");
      setResponse(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={listFolders} disabled={loading}>List folders</Button>
      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
    </div>
  )
}