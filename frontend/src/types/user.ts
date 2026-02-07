export interface Transaction {
  id: string
  type: string
  amount: number
  date: string
}

export interface UserData {
  name: string
  email: string
  phone: string
  location: string
  points: number
  memberSince: string
  membershipTier: string
  recentTransactions: Transaction[]
}

export interface MembershipBenefit {
  id: string
  title: string
  description?: string
}

// Authentication interfaces
export interface LoginRequest {
  username: string
  email?: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  fullName: string
  phoneNumber: string
  address: string
  dateOfBirth: string
  gender: string
  image?: string
  roleId: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: {
      id: string
      username: string
      email: string
      fullName: string
      phoneNumber: string
      address: string
      dateOfBirth: string
      gender: string
      image?: string
      roleId: string
      createdAt: string
      updatedAt: string
    }
    token: string
  }
  error?: string
}

export interface User {
  name: string
  id: string
  username: string
  email: string
  fullName: string
  phoneNumber: string
  address: string
  dateOfBirth: string
  gender: string
  image?: string
  roleId: string
  createdAt: string
  updatedAt: string
  member?: {
    memberId: string
    score: number
  }
} 