import axios from 'axios';
import { API_URL } from '../../lost_settings';

export const getImageMarkdown = async (encodedPath) => {
  try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
          `${API_URL}/media/get-image-markdown`,
          { encodedPath },
          {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          }
      );
      return res.data.markdown;
  } catch (err) {
      console.error('Failed to get image markdown:', err);
      throw err;
  }
};