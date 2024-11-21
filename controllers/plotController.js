const Plot = require("../models/Plot");
const User = require('../models/User');

// Get plots for user
exports.getUserPlots = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const plots = await Plot.find({ 
      bookedBy: userId,  // Ensure this matches the userId
      status: "booked"   // Ensure the status is "booked"
    })
    .populate('agentId', 'fname lname profilePicture mnumber')  // Populate agent details
    .exec();

    res.json(plots);
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ message: "Server error" });
  }
};


// Get plots for agent
exports.getAgentPlots = async (req, res) => {
  try {
    const plots = await Plot.find({ agentId: req.user.user.id }).populate('bookedBy', 'fname lname profilePicture mnumber') // Populate customer data
    .exec();
    res.json(plots);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all plots for owner
exports.getAllPlots = async (req, res) => {
  const plots = await Plot.find({ status: 'booked' }).populate('bookedBy', 'fname lname email profilePicture mnumber').populate('agentId', 'fname lname profilePicture mnumber')  // Populate agent details
  .exec();
  res.json(plots);
};

// Get all plots
exports.getPlots = async (req, res) => {
  try {
    const plots = await Plot.find();
    res.json(plots);
  } catch (error) { 
    res.status(500).json({ message: "Server error" });
  }
};

exports.plotDetails = async(req, res) => {
  try {
    const { plotIds } = req.body;
    const plots = await Plot.find({ _id: { $in: plotIds } });
    res.json(plots);
  } catch (error) {
    console.error('Error fetching plot details:', error);
    res.status(500).json({ error: 'Failed to fetch plot details' });
  }
};

exports.updatePlotStatus = async (req, res) => {
  const { id, status } = req.body;
  try {
    const plot = await Plot.findById(id);
    if (!plot) {
      return res.status(404).json({ message: "Plot not found" });
    }

    if (plot.status === "booked") {
      return res
        .status(400)
        .json({ message: "Cannot change status of booked plot" });
    }

    plot.status = status;
    if (status === "booked") {
      plot.bookedBy = req.user.id;
    } else if (status === "available") {
      plot.bookedBy = null;
    }

    await plot.save();
    res.json(plot);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

//Plot booking
exports.bookPlots = async (req, res) => {
  const { plotIds, agentReferenceId } = req.body;
  const userId = req.user.user.id;
  try {
    const plots = await Plot.find({ _id: { $in: plotIds } });
    
    
    // Check if any plot is already booked
    const alreadyBooked = plots.some((plot) => plot.status === "booked");
    if (alreadyBooked) {
      return res
        .status(400)
        .json({ message: "One or more plots are already booked" });
    }

    let agentId = null;

    if (agentReferenceId) {
      const agent = await User.findOne({ agentRef: agentReferenceId });
      if (!agent) {
        return res.status(404).json({ msg: "Agent not found." });
      }
      agentId = agent._id; // Retrieve the agent's ID
    }

    // Update the plots to booked status
    await Plot.updateMany(
      { _id: { $in: plotIds } },
      { $set: { status: "booked", bookedBy: userId , agentId: agentId || null  } }
    );

        // Update the user's bookedPlots array
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ msg: 'User not found' });
        }
          // Add the booked plot IDs to the user's bookedPlots array
    user.bookedPlots.push(...plotIds);
    await user.save();

    res.status(200).json({ message: "Plots successfully booked" });
  } catch (error) {
    console.error("Error booking plots:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};
