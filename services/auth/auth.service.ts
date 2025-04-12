import axios from 'axios';
import { LoginFormData } from "./auth.schema";

const API_URL = 'https://localhost:5001/api';

export const authService = {
  login: async (data: LoginFormData) => {
    const response = await axios.post(`${API_URL}/u/Auth/login`, data, {
      headers: { 
        'Content-Type': 'application/json' 
      }
    });

    return response.data;
  }
}; 