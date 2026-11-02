import {ApiResponse} from "../utils/apiResponse.js";
import {ansyncHandler} from "../utils/asyncHandler.js";

const healthCheck = ansyncHandler(async (req, res) => {
    res
        .status(200)
        .json(new ApiResponse(200, {message: "Server is running fine!"}));
})

export { healthCheck };