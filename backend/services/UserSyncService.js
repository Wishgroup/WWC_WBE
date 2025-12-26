/**
 * User Sync Service
 * Syncs Auth0 users with MongoDB collections (members, admin_users, vendors)
 */

import { getCollection } from '../database/mongodb-connection.js';
import { ObjectId } from 'mongodb';
import { logAudit } from './AuditService.js';

/**
 * Sync Auth0 user with MongoDB database
 * Creates or updates user record based on user_type from Auth0 metadata
 * 
 * @param {Object} auth0User - Auth0 user object from token
 * @param {Object} req - Express request object (for audit logging)
 * @returns {Object} - Synced user object from database
 */
export const syncAuth0User = async (auth0User, req = null) => {
  try {
    const { auth0_id, email, email_verified, name, nickname, picture, role, membership_type, user_type } = auth0User;

    if (!auth0_id || !email) {
      throw new Error('Auth0 user must have auth0_id and email');
    }

    // Determine which collection to use based on user_type
    const collectionName = user_type === 'admin' 
      ? 'admin_users' 
      : user_type === 'vendor' 
      ? 'vendors' 
      : 'members';

    const collection = await getCollection(collectionName);

    // Try to find user by auth0_id first
    let user = await collection.findOne({ auth0_id });

    // If not found, try to find by email (for migration purposes)
    if (!user) {
      user = await collection.findOne({ email: email.toLowerCase() });
      
      // If found by email, update with auth0_id
      if (user) {
        await collection.updateOne(
          { _id: user._id },
          { 
            $set: { 
              auth0_id,
              auth0_metadata: {
                email_verified,
                name,
                nickname,
                picture,
                last_synced: new Date(),
              },
              updated_at: new Date(),
            }
          }
        );
        user = await collection.findOne({ _id: user._id });
      }
    }

    // If user still doesn't exist, create new user
    if (!user) {
      const newUser = {
        auth0_id,
        email: email.toLowerCase(),
        email_verified: email_verified || false,
        auth0_metadata: {
          email_verified,
          name,
          nickname,
          picture,
          last_synced: new Date(),
        },
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Add user-type specific fields
      if (user_type === 'admin') {
        newUser.full_name = name || nickname || email.split('@')[0];
        newUser.role = 'admin';
        newUser.is_active = true;
      } else if (user_type === 'vendor') {
        newUser.vendor_name = name || nickname || email.split('@')[0];
        newUser.email = email.toLowerCase();
        newUser.is_active = true;
      } else {
        // Member
        newUser.full_name = name || nickname || email.split('@')[0];
        newUser.membership_type = membership_type || 'annual';
        newUser.membership_status = 'active';
        newUser.fraud_status = 'clean';
        newUser.fraud_score = 0;
        newUser.role = 'member';
        newUser.subscription_start_date = new Date();
      }

      const result = await collection.insertOne(newUser);
      user = await collection.findOne({ _id: result.insertedId });
    } else {
      // Update existing user with latest Auth0 metadata
      const updateData = {
        auth0_metadata: {
          email_verified,
          name,
          nickname,
          picture,
          last_synced: new Date(),
        },
        updated_at: new Date(),
      };

      // Update email if it changed
      if (user.email !== email.toLowerCase()) {
        updateData.email = email.toLowerCase();
      }

      // Update name if available and different
      if (name && user.full_name !== name && user.vendor_name !== name) {
        if (user_type === 'vendor') {
          updateData.vendor_name = name;
        } else {
          updateData.full_name = name;
        }
      }

      await collection.updateOne(
        { _id: user._id },
        { $set: updateData }
      );

      user = await collection.findOne({ _id: user._id });
    }

    // Log audit event
    if (req) {
      await logAudit({
        userType: user_type || 'member',
        action: 'user_synced',
        resourceType: user_type || 'member',
        resourceId: user._id,
        details: { 
          auth0_id,
          email,
          synced_at: new Date(),
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    return user;
  } catch (error) {
    console.error('Error syncing Auth0 user:', error);
    throw error;
  }
};

/**
 * Get user from database by Auth0 ID
 * 
 * @param {string} auth0Id - Auth0 user ID
 * @param {string} userType - Type of user (member, admin, vendor)
 * @returns {Object|null} - User object or null if not found
 */
export const getUserByAuth0Id = async (auth0Id, userType = 'member') => {
  try {
    const collectionName = userType === 'admin' 
      ? 'admin_users' 
      : userType === 'vendor' 
      ? 'vendors' 
      : 'members';

    const collection = await getCollection(collectionName);
    return await collection.findOne({ auth0_id: auth0Id });
  } catch (error) {
    console.error('Error getting user by Auth0 ID:', error);
    throw error;
  }
};

/**
 * Get user from database by email
 * 
 * @param {string} email - User email
 * @param {string} userType - Type of user (member, admin, vendor)
 * @returns {Object|null} - User object or null if not found
 */
export const getUserByEmail = async (email, userType = 'member') => {
  try {
    const collectionName = userType === 'admin' 
      ? 'admin_users' 
      : userType === 'vendor' 
      ? 'vendors' 
      : 'members';

    const collection = await getCollection(collectionName);
    return await collection.findOne({ email: email.toLowerCase() });
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
};

/**
 * Link existing database user with Auth0 ID
 * Useful for migration scenarios
 * 
 * @param {string} userId - MongoDB user ID
 * @param {string} auth0Id - Auth0 user ID
 * @param {string} userType - Type of user (member, admin, vendor)
 * @returns {Object} - Updated user object
 */
export const linkUserWithAuth0 = async (userId, auth0Id, userType = 'member') => {
  try {
    const collectionName = userType === 'admin' 
      ? 'admin_users' 
      : userType === 'vendor' 
      ? 'vendors' 
      : 'members';

    const collection = await getCollection(collectionName);
    
    // Check if auth0_id is already linked to another user
    const existingUser = await collection.findOne({ auth0_id: auth0Id });
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new Error('Auth0 ID is already linked to another user');
    }

    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          auth0_id: auth0Id,
          updated_at: new Date(),
        }
      }
    );

    return await collection.findOne({ _id: new ObjectId(userId) });
  } catch (error) {
    console.error('Error linking user with Auth0:', error);
    throw error;
  }
};

