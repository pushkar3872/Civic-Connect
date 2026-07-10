const complaintService = require('../services/complaintService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createComplaint = asyncHandler(async (req, res) => {
  const complaint = await complaintService.createComplaint(req.body, req.user);
  res.status(201).json(new ApiResponse(201, complaint, 'Complaint created successfully'));
});

const getAllComplaints = asyncHandler(async (req, res) => {
  const complaints = await complaintService.getAllComplaints(req.query);
  res.status(200).json(new ApiResponse(200, complaints, 'Complaints fetched successfully'));
});

const getMyComplaints = asyncHandler(async (req, res) => {
  const complaints = await complaintService.getMyComplaints(req.user);
  res.status(200).json(new ApiResponse(200, complaints, 'Your complaints fetched successfully'));
});

const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await complaintService.getComplaintById(req.params.id, req.user, req.headers.authorization);
  res.status(200).json(new ApiResponse(200, complaint, 'Complaint fetched successfully'));
});

const updateComplaintStatus = asyncHandler(async (req, res) => {
  const complaint = await complaintService.updateComplaintStatus(
    req.params.id,
    req.body,
    req.user,
    req.headers.authorization
  );
  res.status(200).json(new ApiResponse(200, complaint, 'Complaint status updated successfully'));
});

const assignWorker = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const complaint = await complaintService.assignWorker(
    req.params.id,
    req.body.workerId,
    authHeader
  );
  res.status(200).json(new ApiResponse(200, complaint, 'Worker assigned successfully'));
});

const verifyComplaint = asyncHandler(async (req, res) => {
  const complaint = await complaintService.verifyComplaint(req.params.id, req.body, req.user);
  res.status(200).json(new ApiResponse(200, complaint, 'Complaint verification updated successfully'));
});

const closeComplaint = asyncHandler(async (req, res) => {
  const complaint = await complaintService.closeComplaint(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, complaint, 'Complaint closed successfully'));
});

const deleteComplaint = asyncHandler(async (req, res) => {
  await complaintService.deleteComplaint(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Complaint deleted successfully'));
});

const getComplaintsByWorker = asyncHandler(async (req, res) => {
  console.log('[ComplaintController] getComplaintsByWorker - entry', {
    paramsWorkerId: req.params.workerId,
    authHeaderProvided: Boolean(req.headers.authorization),
    reqUser: req.user,
  });

  const complaints = await complaintService.getComplaintsByWorker(
    req.params.workerId,
    req.user,
    req.headers.authorization
  );
  res.status(200).json(new ApiResponse(200, complaints, 'Worker complaints fetched successfully'));
});

module.exports = {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignWorker,
  verifyComplaint,
  closeComplaint,
  deleteComplaint,
  getComplaintsByWorker,
};
