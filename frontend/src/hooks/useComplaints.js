import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { complaintApi } from '../services';
import { getErrorMessage } from '../services/api';

export default function useComplaints(params = {}) {
  const queryClient = useQueryClient();

  const allQuery = useQuery({
    queryKey: ['complaints', params],
    queryFn: () => complaintApi.getAll(params),
    enabled: !!params.admin,
  });

  const myQuery = useQuery({
    queryKey: ['my-complaints'],
    queryFn: complaintApi.getMy,
    enabled: !!params.mine,
  });

  const detailQuery = useQuery({
    queryKey: ['complaint', params.id],
    queryFn: () => complaintApi.getById(params.id),
    enabled: !!params.id,
  });

  const createMutation = useMutation({
    mutationFn: complaintApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-complaints'] });
      toast.success('Complaint submitted');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, ...data }) => complaintApi.updateStatus(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['complaint', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['my-complaints'] });
      queryClient.invalidateQueries({ queryKey: ['worker-tasks'] });
      toast.success('Status updated');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, workerId }) => complaintApi.assign(id, workerId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['complaint', vars.id] });
      toast.success('Worker assigned');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, ...data }) => complaintApi.verify(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['complaint', vars.id] });
      toast.success('Verification updated');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const closeMutation = useMutation({
    mutationFn: ({ id, ...data }) => complaintApi.close(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Complaint closed');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return {
    allQuery,
    myQuery,
    detailQuery,
    createMutation,
    statusMutation,
    assignMutation,
    verifyMutation,
    closeMutation,
  };
}
