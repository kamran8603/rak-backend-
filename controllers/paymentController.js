const Razorpay = require('razorpay');
const crypto = require('crypto');
const Plot = require('../models/Plot');
const User = require('../models/User');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a new Razorpay order
exports.createOrder = async (req, res) => {
    const { amount, currency = 'INR' } = req.body;
    console.log(req.body);

    const options = {
        amount: amount , // amount in paisa
        currency,
        receipt: crypto.randomBytes(10).toString('hex'),
    };

    try {
        const order = await razorpay.orders.create(options);
        if (!order) {
            return res.status(500).send('Some error occurred');
        }
        res.json(order);
    } catch (error) {
        res.status(500).send('Server error');
    }
};

// Verify the payment signature
exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plotIds, agentId } = req.body;
    const userId = req.user.user.id;
    console.log(req.body);
    console.log(userId);

    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');
    console.log(digest);


    console.log(`Order ID: ${razorpay_order_id}`);
console.log(`Payment ID: ${razorpay_payment_id}`);
console.log(`Secret: ${process.env.RAZORPAY_KEY_SECRET}`);
console.log(`Signature: ${razorpay_signature}`);
console.log(`Digest: ${digest}`);

    if (digest === razorpay_signature) {
        try {
            // Update the database for the booked plots
            
            

            const plots = await Plot.find({ _id: { $in: plotIds } });
            const alreadyBooked = plots.some((plot) => plot.status === "booked");

            if (alreadyBooked) {
                return res.status(400).json({ message: "One or more plots are already booked" });
            }

            let agentReferenceId = null;
            if (agentId) {
                const agent = await User.findOne({ agentRef: agentId });
                if (!agent) {
                    return res.status(404).json({ message: "Agent not found" });
                }
                agentReferenceId = agent._id;
            }

            const bookingId = razorpay_order_id;

            await Plot.updateMany(
                { _id: { $in: plotIds } },
                { $set: { status: "booked", bookedBy: userId, agentId: agentReferenceId || null, bookingId } }
            );

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.bookedPlots.push(...plotIds);
            await user.save();

            res.status(200).json({ message: "Payment verified and plots booked successfully" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    } else {
        res.status(400).json({ message: 'Invalid payment signature' });
    }
};
