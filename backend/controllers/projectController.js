import Project from '../models/Project.js';
import Workspace from '../models/Workspace.js';

export const createProject = async (req, res) => {
  try {
    const { name, description, workspaceId } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Include all current workspace members in the new project by default
    const allMemberIds = workspace.members.map(m => m.user);

    const project = await Project.create({
      name,
      description,
      workspace: workspaceId,
      members: Array.from(new Set([req.user._id.toString(), ...allMemberIds.map(id => id.toString())]))
    });

    workspace.projects.push(project._id);
    await workspace.save();

    const populatedProject = await Project.findById(project._id)
      .populate('workspace', 'name')
      .populate('members', 'name email avatar');

    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const { workspaceId } = req.query;

    let query;
    if (workspaceId) {
      // If user is member of the workspace, return all projects in that workspace
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      const isWorkspaceMember = workspace.members.some(m => m.user.toString() === req.user._id.toString());
      if (!isWorkspaceMember) {
        return res.status(403).json({ message: 'Forbidden: not a workspace member' });
      }
      query = { workspace: workspaceId };
    } else {
      // Otherwise return projects the user is a member of across all workspaces
      query = { members: req.user._id };
    }

    const projects = await Project.find(query)
      .populate('workspace', 'name')
      .populate('members', 'name email avatar')
      .populate('tasks');

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('workspace', 'name')
      .populate('members', 'name email avatar')
      .populate({
        path: 'tasks',
        populate: { path: 'assignedTo', select: 'name email avatar' }
      });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project member can update
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'Forbidden: only project members can update' });
    }

    project.name = name || project.name;
    project.description = description || project.description;

    const updatedProject = await project.save();
    await updatedProject.populate('workspace', 'name');
    await updatedProject.populate('members', 'name email avatar');

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only workspace owner or an admin member of the workspace can delete
    const workspace = await Workspace.findById(project.workspace);
    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const memberEntry = workspace.members.find(m => m.user.toString() === req.user._id.toString());
    const isAdminMember = memberEntry && memberEntry.role === 'Admin';
    if (!isOwner && !isAdminMember) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }

    await Workspace.findByIdAndUpdate(project.workspace, {
      $pull: { projects: project._id }
    });

    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

