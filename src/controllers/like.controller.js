const devModel = require('../models/dev.model');

module.exports = {
    async store(req, res) {
        try {
            const { devId } = req.params;
            const { user } = req.headers;
            
            const loggedDev = await devModel.findById(user)
                .then(data => data)
                .catch(err => console.error(err));

            const targetDev = await devModel.findById(devId)
                .then(data => data)
                .catch(err => console.error(err));

            if (!targetDev) {
                return res.status(400).json({ error: 'Dev not exists' });
            }

            if (!loggedDev) {
                return res.status(400).json({ error: 'User not exists' });
            }

            if (targetDev.likes.includes(loggedDev._id)) {
                const loggedSocket = req.connectedUsers[user];
                const targetSocket = req.connectedUsers[devId];

                if (loggedSocket) {
                    req.io.to(loggedSocket).emit('match', targetDev);
                }

                if (targetSocket) {
                    req.io.to(targetSocket).emit('match', loggedDev);
                }
            }

            if (!loggedDev.likes.includes(targetDev._id)) {
                loggedDev.likes.push(targetDev._id);

                await loggedDev.save();
            }

            return res.json(loggedDev);
        } catch (err) {
            console.error(err);
        }
    }
}