import Message from '../models/Message.js';

export const getMessages = async (req, res) => {
  try {
    const { projectId } = req.params;

    const messages = await Message.find({ project: projectId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMessage = async (req, res) => {
  try {
    const { content, projectId } = req.body;

    const message = await Message.create({
      content,
      sender: req.user._id,
      project: projectId
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email avatar');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

