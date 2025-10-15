let ratelimitInstance = null;
try {
    // Only initialize if Upstash env vars are present
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const { default: ratelimit } = await import("../config/upstash.js");
        ratelimitInstance = ratelimit;
    }
} catch (error) {
    console.log("Upstash ratelimit not configured, continuing without rate limit.");
}

const ratelimiter = async (req, res, next) => {
    if (!ratelimitInstance) {
        return next();
    }
    try {
        const { success } = await ratelimitInstance.limit("my-limit-key");
        if (!success) {
            return res.status(429).json({
                message: "Too many requests,please try again later",
            });
        }
        next();
    } catch (error) {
        console.log("Rate limit error", error);
        next(); // don't block in dev on rate limit errors
    }
};

export default ratelimiter;