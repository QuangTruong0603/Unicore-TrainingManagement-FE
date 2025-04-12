import axios from 'axios';
import { MajorResponse } from './major.schema';

const API_URL = 'https://localhost:7001/api';

export const majorService = {
  getMajors: async (): Promise<MajorResponse> => {
    const response = await axios.get(`${API_URL}/m/Major`, {
      headers: {
        'accept': 'text/plain'
      }
    });
    return response.data;
  }
}; 