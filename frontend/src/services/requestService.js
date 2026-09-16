import api from "./api";

export const createRequest = (data) =>
  api.post("/requests", data).then((r) => r.data.data);

export const getOwnerRequests = () =>
  api.get("/requests/owner").then((r) => r.data.data);

export const getMyRequests = () =>
  api.get("/requests/customer").then((r) => r.data.data);

export const respondToRequest = (id, status) =>
  api.patch(`/requests/${id}/respond`, { status }).then((r) => r.data);

export const sendMessage = (id, text) =>
  api.post(`/requests/${id}/messages`, { text }).then((r) => r.data.data);

export const getMessages = (id) =>
  api.get(`/requests/${id}/messages`).then((r) => r.data.data);
