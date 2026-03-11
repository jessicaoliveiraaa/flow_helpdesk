export type AuthTokenPayload = {
  sub: string
  role: 'ADMIN' | 'TECHNICIAN' | 'CLIENT'
  email: string
}