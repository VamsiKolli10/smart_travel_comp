import { useState } from 'react'
export default function useNotification(){
  const [message, setMessage] = useState(null)
  const [type, setType] = useState('info')
  const [show, setShow] = useState(false)
  return { message, type, show, setMessage, setType, setShow }
}