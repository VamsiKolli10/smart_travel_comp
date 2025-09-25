export default function Button({ variant='primary', size='md', full=false, children, ...props }){
  const classes = [
    'btn',
    variant === 'primary' ? 'btn--primary' : variant === 'secondary' ? 'btn--secondary' : 'btn--outline',
    size === 'sm' ? 'btn--sm' : size === 'lg' ? 'btn--lg' : '',
    full ? 'btn--full-width' : ''
  ].filter(Boolean).join(' ')
  return <button className={classes} {...props}>{children}</button>
}