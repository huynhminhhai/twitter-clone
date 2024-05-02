export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface LoginRequestBody {
  email: string
  password: string
}

export interface LogoutRequestBody {
  refresh_token: string
}
