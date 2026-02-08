
const ImportLog = require("../models/logSchema");

const getImportLog = async (req, res) => {
    try {
        const logs = await ImportLog.find().sort({ timestamp: -1 }).limit(50);
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports={getImportLog}