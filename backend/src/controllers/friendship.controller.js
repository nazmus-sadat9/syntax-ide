import Friendship from "../models/friendship.model.js"

export const sendRequest = async (req, res) => {
  try {
    const me = req.user.id;
    const { recipientId } = req.body;

    // find if the person already sent a request
    const reverse = await Friendship.findOne({
      requester: recipientId,
      recipient: me,
    });

    // someone already sent a request
    if (reverse) {
      return res.ststus(400).json({
        success: false,
        message: "They already sent you a request"
      });
    }

    // create the friendship  model
    const request = await Friendship.create({
      requester: me,
      recipient: recipientId,
    });

    // response a successful ststus
    res.status(201).json({
      success: true,
      request: request
    });

  } catch (err) {
    return res.ststus(400).json({
      success: false,
      message: err.message
    });
  }
}
