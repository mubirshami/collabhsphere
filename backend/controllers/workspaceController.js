import Workspace from '../models/Workspace.js';
import User from '../models/User.js';

export const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user._id,
      members: [{
        user: req.user._id,
        role: 'Admin'
      }]
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { workspaces: workspace._id }
    });

    const populatedWorkspace = await Workspace.findById(workspace._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email avatar');

    res.status(201).json(populatedWorkspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      'members.user': req.user._id
    })
      .populate('owner', 'name email')
      .populate('members.user', 'name email avatar')
      .populate('projects');

    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email avatar')
      .populate('projects');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Only owner or admin member can update
    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const memberEntry = workspace.members.find(m => m.user.toString() === req.user._id.toString());
    const isAdminMember = memberEntry && memberEntry.role === 'Admin';
    if (!isOwner && !isAdminMember) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }

    workspace.name = name || workspace.name;
    workspace.description = description || workspace.description;

    const updatedWorkspace = await workspace.save();
    await updatedWorkspace.populate('owner', 'name email');
    await updatedWorkspace.populate('members.user', 'name email avatar');

    res.json(updatedWorkspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Only owner can delete
    const isOwner = workspace.owner.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ message: 'Forbidden: only owner can delete workspace' });
    }

    await workspace.deleteOne();
    res.json({ message: 'Workspace deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Only owner or admin member can add members
    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const actorEntry = workspace.members.find(m => m.user.toString() === req.user._id.toString());
    const isAdminMember = actorEntry && actorEntry.role === 'Admin';
    if (!isOwner && !isAdminMember) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMember = workspace.members.some(
      member => member.user.toString() === user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    workspace.members.push({
      user: user._id,
      role: 'Member'
    });

    await workspace.save();
    await User.findByIdAndUpdate(user._id, {
      $push: { workspaces: workspace._id }
    });

    await workspace.populate('members.user', 'name email avatar');

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

