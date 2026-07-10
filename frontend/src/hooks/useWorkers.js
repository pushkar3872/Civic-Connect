import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { workerApi } from '../services';
import { getErrorMessage } from '../services/api';

export default function useWorkers(options = {}) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['workers', options.params],
    queryFn: () => workerApi.getAll(options.params),
    enabled: options.listEnabled !== false && options.enabled !== false,
  });

  const tasksQuery = useQuery({
    queryKey: options.myTasks ? ['worker-tasks', 'me'] : ['worker-tasks', options.workerId],
    queryFn: options.myTasks ? workerApi.getMyTasks : () => workerApi.getTasks(options.workerId),
    enabled: options.enabled !== false && (options.myTasks || !!options.workerId),
  });

  const performanceQuery = useQuery({
    queryKey: ['worker-performance'],
    queryFn: workerApi.getPerformance,
    enabled: !!options.performance,
  });

  const createMutation = useMutation({
    mutationFn: workerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Worker created');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => workerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Worker updated');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: workerApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast.success('Worker removed');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return {
    listQuery,
    tasksQuery,
    performanceQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
