import axios from "axios";

export const getRequest = async (url: string, handleSuccess: (arg0: any) => void) => {
  await axios.get(`${process.env.REACT_APP_BACKEND_URL}/${url}`, { withCredentials: true })
    .then(response=>handleSuccess(response.data))
    .catch(error=>console.error('Error fetching data:', error));
};

export const postRequest = async (url: string, data: any, handleSuccess: (responseData: any) => void) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/${url}`, data, { withCredentials: true });
    handleSuccess(response);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};