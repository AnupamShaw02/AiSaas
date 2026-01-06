import { clerkClient } from "@clerk/express";

//middleware to check if user is authenticated
export const auth = async (req, res, next) => {
    try {
        const { userId } = await req.auth();

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        req.userId = userId;
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//middleware to check userId and has Premium plan

export const requirePremiumPlan = async (req, res, next) => {
    try {
        const { userId, has } = req.auth();
        const hasPremiumPlan = await has({plan: 'premium'});

        const user = await clerkClient.users.getUser(userId);

        if (!hasPremiumPlan) {
            // Check if free_usage exists and is a number, otherwise default to 0
            const currentFreeUsage = typeof user.privateMetadata?.free_usage === 'number'
                ? user.privateMetadata.free_usage
                : 0;
            req.free_usage = currentFreeUsage;
        } else {
            // Premium users don't track free usage
            req.free_usage = 0;
        }

        req.plan = hasPremiumPlan ? 'premium' : 'free';
        next();

    }catch (error) {
        console.error('requirePremiumPlan error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}
