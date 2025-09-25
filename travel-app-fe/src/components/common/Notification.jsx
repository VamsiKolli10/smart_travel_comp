export default function Notification({ message, type='info', show=false }){
  const cls = ['notification', type, show ? 'show' : ''].join(' ')
  return show ? <div className={cls} role="status">{message}</div> : null
}