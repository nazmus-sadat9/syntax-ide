import Friendship from "../models/friendship.model.js";

// POST /api/friends/request 
export const sendRequest = async (req, res) => {
  try {
    const me = req.user._id;
    const { recipientId } = req.body;

    // if recipientId is missing 
    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: "recipientId required"
      });
    }

    // if someone send request itself
    if (String(me) === String(recipientId)) {
      return res.status(400).json({
        success: false,
        message: "You can't add yourself"
      });
    }
    // already exists in either direction?
    const existing = await Friendship.findOne({
      $or: [
        { requester: me, recipient: recipientId },
        { requester: recipientId, recipient: me },
      ],
    });

    // if they are already friend or already sent the request
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Request already exists or you are already friends"
      });
    }

    // create the friend model
    await Friendship.create({
      requester: me,
      recipient: recipientId
    });

    // success status
    res.status(201).json({
      success: true,
      message: "Request sent"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
};

// POST /api/friends/accept
export const acceptRequest = async (req, res) => {
  try {
    // find the requester and update the model
    const fr = await Friendship.findOneAndUpdate(
      { requester: req.body.requesterId, recipient: req.user._id, status: "pending" },
      { status: "accepted" },
      { new: true }
    );

    // if the requester not available
    if (!fr) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    // success status
    res.status(200).json({
      success: true,
      message: "Accepted"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
};

// POST /api/friends/reject
export const rejectRequest = async (req, res) => {
  try {
    // find the requester and delete the model
    const fr = await Friendship.findOneAndDelete({
      requester: req.body.requesterId,
      recipient: req.user._id,
      status: "pending",
    });

    // if the requester not available
    if (!fr) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    // success status
    res.status(200).json({
      success: true,
      message: "Rejected"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
};
