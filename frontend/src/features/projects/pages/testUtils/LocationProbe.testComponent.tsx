import { useLocation } from 'react-router-dom'

export function LocationProbe() {
  const location = useLocation()

  return <p data-testid="location">{location.pathname}</p>
}
