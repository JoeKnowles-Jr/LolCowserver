
const helper = require('../helper');
const { sequelize, User, Profile } = require('../models');
const path = require('path');
const fs = require('fs');
const allowedMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

async function getAllUsers() {
    try {
        // ensure DB connection (optional if you already connect on startup)
        await sequelize.authenticate();

        const users = await User.findAll({
            attributes: { exclude: ['pwHash'] } // hide sensitive fields
        });

        return helper.emptyOrData(users);
    } catch (err) {
        console.error(err);
        return ({ message: 'Failed to fetch users' });
    } finally {
        // await sequelize.close();
    }
}

async function getSingleById(uid) {
    try {
        await sequelize.authenticate();
        const user = await User.findByPk(uid, {
            attributes: { exclude: ['pwHash'] }
        });
        return helper.emptyOrData(user);
    } catch (err) {
        console.error(err);
        return { message: 'Failed to fetch user' };
    }
}


async function getSingleByUsername(username) {
    try {
        await sequelize.authenticate();
        const user = await User.findOne({
            where: { email: username },
            attributes: { exclude: ['pwHash'] }
        });
        return helper.emptyOrData(user);
    } catch (err) {
        console.error(err);
        return { message: 'Failed to fetch user by username' };
    }
}

async function getProfileById(uid) {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        const profile = await Profile.findOne({
            where: { userId: uid }
        });
        return profile;
    } catch (err) {
        console.error(err);
        return { message: 'Failed to fetch profile by userId' };
    }
}

async function insertUser(u) {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // use { alter: true } or migrations in production
        const user = await User.create({
            email: u.email,
            pwHash: u.pwHash,
            avatarUrl: u.avatarUrl,
            balance: u.balance
        });
        return ({ 'Created user:': user.toJSON() });
    } catch (err) {
        console.error(err);
        return ({ type: "Error", message: err });
    } finally {
        await sequelize.close();
    }
}

async function insertProfile(p) {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // use { alter: true } or migrations in production
        const user = await Profile.create({
            userId: p.userId,
            firstName: u.firstName,
            lastName: u.lastName,
            avatarUrl: p.avatarUrl,
            displayName: p.displayName,
            userBio: p.userBio
        });
        return ({ 'Created profile:': user.toJSON() });
    } catch (err) {
        console.error(err);
        return ({ type: "Error", message: err });
    } finally {
        await sequelize.close();
    }
}

async function uploadAvatar(userId, file) {
    if (!file || !file.mimetype) throw new Error('invalid file');

    if (!allowedMime.includes(file.mimetype)) {
        throw new Error('unsupported file type');
    }

    // create directory uploads/avatars
    const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars');
    fs.mkdirSync(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || '';
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const destPath = path.join(uploadDir, fileName);

    // file.mv is provided by express-fileupload
    await new Promise((resolve, reject) => {
        file.mv(destPath, (err) => (err ? reject(err) : resolve()));
    });

    // url stored in DB (adjust prefix if you serve uploads differently)
    const avatarUrl = `/uploads/avatars/${fileName}`;

    // update user record using findByPk so it works regardless of primary key name
    const user = await User.findByPk(userId);
    if (!user) {
        // optional: delete file on failure
        try { fs.unlinkSync(destPath); } catch (e) { }
        throw new Error('user not found');
    }

    await user.update({ avatarUrl });

    return avatarUrl;
}

async function updateUser(uid, changes) {
    try {
        await sequelize.authenticate();

        const user = await User.findByPk(uid);
        if (!user) return { message: 'User not found' };

        // Only allow updating these fields
        const allowed = ['email', 'pwHash', 'needsPwUpdate', 'profileId', 'balance'];
        const toUpdate = {};
        for (const key of allowed) {
            if (Object.prototype.hasOwnProperty.call(changes, key)) {
                toUpdate[key] = changes[key];
            }
        }

        if (Object.keys(toUpdate).length === 0) {
            return { message: 'No valid fields to update' };
        }

        await user.update(toUpdate);

        const plain = user.get({ plain: true });
        // hide sensitive fields
        delete plain.pwHash;

        return helper.emptyOrData(plain);
    } catch (err) {
        console.error(err);
        return { message: 'Failed to update user' };
    }
}

async function updateProfile(pid, changes) {
    try {
        await sequelize.authenticate();

        const profile = await Profile.findByPk(pid);
        if (!profile) return { message: 'Profile not found' };

        // Only allow updating these fields
        const allowed = ['firstName', 'lastName', 'avatarUrl', 'displayName', 'userBio'];
        const toUpdate = {};
        for (const key of allowed) {
            if (Object.prototype.hasOwnProperty.call(changes, key)) {
                toUpdate[key] = changes[key];
            }
        }

        if (Object.keys(toUpdate).length === 0) {
            return { message: 'No valid fields to update' };
        }

        await profile.update(toUpdate);

        const plain = profile.get({ plain: true });

        return helper.emptyOrData(plain);
    } catch (err) {
        console.error(err);
        return { message: 'Failed to update profile' };
    }
}

async function deleteUser(uid) {
    try {
        await sequelize.authenticate();

        const user = await User.findByPk(uid);
        if (!user) return { message: 'User not found' };

        // remove profile if present
        if (user.profileId) {
            try {
                await deleteProfile(user.profileId);
            } catch (e) {
                console.error('Failed to remove profile:', e);
            }
        }

        await user.destroy();
        return { message: 'User deleted' };
    } catch (err) {
        console.error(err);
        return { message: 'Failed to delete user' };
    }
}

async function deleteProfile(pid) {
    try {
        await sequelize.authenticate();

        const profile = await Profile.findByPk(pid);
        if (!profile) return { message: 'Profile not found' };

        // remove avatar file if present (avatarUrl like "/uploads/avatars/filename")
        if (profile.avatarUrl) {
            try {
                const rel = profile.avatarUrl.replace(/^\//, ''); // remove leading slash
                const avatarPath = path.join(__dirname, '..', rel);
                if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
            } catch (e) {
                console.error('Failed to remove avatar file:', e);
            }
        }

        await profile.destroy();
        return { message: 'Profile deleted' };
    } catch (err) {
        console.error(err);
        return { message: 'Failed to delete profile' };
    }
}

module.exports = {
    getAllUsers,
    getSingleById,
    getSingleByUsername,
    getProfileById,
    insertUser,
    insertProfile,
    uploadAvatar,
    updateUser,
    updateProfile,
    deleteUser,
    deleteProfile
};
