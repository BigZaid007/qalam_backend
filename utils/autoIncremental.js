
const Counter = require("../models/counter");
async function getNextCategoryId() {
    const counter = await Counter.findOneAndUpdate(
        { name: "categoryId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return counter.seq;
}

module.exports = getNextCategoryId;
