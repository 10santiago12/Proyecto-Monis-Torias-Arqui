class NotificationsService {
  async notifyUser(uid, type, payload) {
    console.log(`[NotificationService] uid=${uid}, type=${type}`, payload);
    return true;
  }
}

module.exports = { NotificationsService };