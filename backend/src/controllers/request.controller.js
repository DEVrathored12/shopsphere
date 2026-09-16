import ItemRequest from "../models/ItemRequest.js";
import Shop from "../models/Shop.js";
import { ApiResponse, ApiError } from "../utils/apiResponse.js";

// POST /api/requests — customer creates a request
export const createRequest = async (req, res, next) => {
  try {
    const { description, photo, shopId } = req.body;
    if (!description) throw new ApiError(400, "Description is required");

    const request = await ItemRequest.create({
      customerId: req.user._id,
      description,
      photo: photo || "",
      shopId: shopId || null,
    });

    res.status(201).json(new ApiResponse(201, "Request posted", { request }));
  } catch (err) {
    next(err);
  }
};

// GET /api/requests/owner — shop owner sees all open requests (broadcast + targeted to their shop)
export const getRequestsForOwner = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user._id, isActive: true });
    if (!shop) throw new ApiError(404, "No active shop found");

    const requests = await ItemRequest.find({
      isActive: true,
      $or: [{ shopId: null }, { shopId: shop._id }],
    })
      .populate("customerId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(100);

    // Attach this owner's response status to each request
    const data = requests.map((r) => {
      const myResponse = r.responses.find(
        (resp) => resp.shopId.toString() === shop._id.toString()
      );
      return {
        ...r.toObject(),
        myResponse: myResponse || null,
        shopId: shop._id,
      };
    });

    res.json(new ApiResponse(200, "OK", { requests: data, shop }));
  } catch (err) {
    next(err);
  }
};

// GET /api/requests/customer — customer sees their own requests + responses
export const getMyRequests = async (req, res, next) => {
  try {
    const requests = await ItemRequest.find({ customerId: req.user._id })
      .populate("responses.shopId", "shopName coverImage city")
      .populate("responses.ownerId", "name phone")
      .sort({ createdAt: -1 });

    res.json(new ApiResponse(200, "OK", { requests }));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/requests/:id/respond — owner responds yes or no
export const respondToRequest = async (req, res, next) => {
  try {
    const { status } = req.body; // "yes" | "no"
    if (!["yes", "no"].includes(status)) throw new ApiError(400, "status must be yes or no");

    const shop = await Shop.findOne({ ownerId: req.user._id, isActive: true });
    if (!shop) throw new ApiError(404, "No active shop found");

    const request = await ItemRequest.findById(req.params.id);
    if (!request || !request.isActive) throw new ApiError(404, "Request not found");

    // Remove existing response from this shop if any, then push new one
    request.responses = request.responses.filter(
      (r) => r.shopId.toString() !== shop._id.toString()
    );
    request.responses.push({ shopId: shop._id, ownerId: req.user._id, status });
    await request.save();

    res.json(new ApiResponse(200, "Response saved", { status }));
  } catch (err) {
    next(err);
  }
};

// POST /api/requests/:id/messages — send a chat message (customer or owner)
export const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) throw new ApiError(400, "Message text required");

    const request = await ItemRequest.findById(req.params.id);
    if (!request || !request.isActive) throw new ApiError(404, "Request not found");

    // Auth: must be the customer OR an owner who responded "yes"
    const isCustomer = request.customerId.toString() === req.user._id.toString();
    const isRespondingOwner = request.responses.some(
      (r) => r.ownerId.toString() === req.user._id.toString() && r.status === "yes"
    );
    if (!isCustomer && !isRespondingOwner) {
      throw new ApiError(403, "Not authorized to chat on this request");
    }

    request.messages.push({ sender: req.user._id, text: text.trim() });
    await request.save();

    const msg = request.messages[request.messages.length - 1];
    res.status(201).json(new ApiResponse(201, "Sent", { message: msg }));
  } catch (err) {
    next(err);
  }
};

// GET /api/requests/:id/messages — get chat messages
export const getMessages = async (req, res, next) => {
  try {
    const request = await ItemRequest.findById(req.params.id)
      .populate("messages.sender", "name avatar role");
    if (!request) throw new ApiError(404, "Request not found");

    const isCustomer = request.customerId.toString() === req.user._id.toString();
    const isRespondingOwner = request.responses.some(
      (r) => r.ownerId.toString() === req.user._id.toString()
    );
    if (!isCustomer && !isRespondingOwner && req.user.role !== "admin") {
      throw new ApiError(403, "Not authorized");
    }

    res.json(new ApiResponse(200, "OK", { messages: request.messages }));
  } catch (err) {
    next(err);
  }
};
