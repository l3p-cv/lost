import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { API_URL } from '../../lost_settings';

// (GET)
export const useGetInstructions = (visLevel) => {
  return useQuery(
    ['instructions', visLevel],
    () =>
      axios
        .get(`${API_URL}/instructions/getInstructions/${visLevel}`) // Use visLevel in URL
        .then((res) => res.data.instructions)
  );
};

// (DELETE)
export const useDeleteInstruction = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id) =>
      axios
        .delete(`${API_URL}/instructions/deleteInstruction/${id}`)
        .then((res) => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('instructions');
      },
    }
  );
};

// (POST)
export const useAddInstruction = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (newInstruction) =>
      axios
        .post(`${API_URL}/instructions/addInstruction`, newInstruction)
        .then((res) => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('instructions');
      },
    }
  );
};

// (PUT)
export const useEditInstruction = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (updatedInstruction) =>
      axios
        .put(`${API_URL}/instructions/editInstruction`, updatedInstruction)
        .then((res) => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('instructions');
      },
    }
  );
};